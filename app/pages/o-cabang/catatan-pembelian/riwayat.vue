<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { usepurchaseOrderStore, type purchaseOrder } from '~/store/purchase'
import { usepurchaseStore } from '~/store/purchase-detail'
import { sub, isWithinInterval, parseISO, startOfDay, endOfDay, getYear } from 'date-fns'
import type { Period, Range } from '~/types'

const purchaseOrderStore = usepurchaseOrderStore()
const salesDetailStore = usepurchaseStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

// State untuk filter dan pencarian
const currentPage = ref(1)
const searchQuery = ref('')
const selectedDateRange = ref('')
const selectedYear = ref(new Date().getFullYear()) // Filter tahun untuk total harga pembelian
const itemsPerPage = ref(10)

// Inisialisasi range dengan nilai default
const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')

const paginatedFilteredPurchaseOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPurchaseOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPurchaseOrders.value.length / itemsPerPage.value)
})

// Computed untuk filter data
const filteredPurchaseOrders = computed(() => {
  let filtered = [...(purchaseOrderStore.purchaseOrderList || [])]

  // Urutkan dari ID terbesar (terbaru) ke terkecil
  filtered.sort((a, b) => b.id - a.id)

  // Filter berdasarkan pencarian
  if (searchQuery.value) {
    filtered = filtered.filter((item: purchaseOrder) =>
      (item.id.toString().includes(searchQuery.value)) ||
      (item.vendor?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false) ||
      (item.date?.includes(searchQuery.value) ?? false)
    )
  }

  // Filter berdasarkan date range
  if (range.value.start && range.value.end) {
    filtered = filtered.filter((item: purchaseOrder) => {
      const itemDate = parseISO(item.created_at || item.date || new Date().toISOString())
      return isWithinInterval(itemDate, {
        start: startOfDay(range.value.start),
        end: endOfDay(range.value.end)
      })
    })
  }

  return filtered
})

// Computed untuk total orders
const totalOrders = computed(() => {
  return filteredPurchaseOrders.value.length
})

// Computed untuk total amount berdasarkan tahun yang dipilih
const totalAmount = computed(() => {
  return (purchaseOrderStore.purchaseOrderList || [])
    .filter((item) => {
      const itemYear = getYear(parseISO(item.created_at || item.date || new Date().toISOString()))
      return itemYear === selectedYear.value
    })
    .reduce((sum, item) => {
      return sum + Number(item.total_amount || 0)
    }, 0)
})

// Computed untuk filtered amount
const filteredAmount = computed(() => {
  return filteredPurchaseOrders.value.reduce((sum, item) => {
    return sum + Number(item.total_amount || 0)
  }, 0)
})

// Computed untuk mendapatkan daftar tahun yang tersedia
const availableYears = computed(() => {
  const years = new Set<number>()
  purchaseOrderStore.purchaseOrderList.forEach((item) => {
    const year = getYear(parseISO(item.created_at || item.date || new Date().toISOString()))
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Urutkan dari tahun terbaru
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Format date
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Clear filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedDateRange.value = ''
  selectedYear.value = new Date().getFullYear() // Reset ke tahun sekarang
  range.value = {
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  }
  period.value = 'daily'
  currentPage.value = 1
}

// Navigate to detail page
const showDetail = (purchaseOrderId: number) => {
  router.push(`/o-cabang/transaksi-pembelian/riwayat-show/${purchaseOrderId}`)
}

// Function untuk fetch data
const fetchPurchaseOrders = async () => {
  try {
    loading.value = true
    error.value = null
    await purchaseOrderStore.fetchpurchaseOrders()
  } catch (err) {
    error.value = 'Gagal memuat data catatan pembelian'
    console.error('Error fetching purchase orders:', err)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery, range], () => {
  currentPage.value = 1
}, { deep: true })

onMounted(() => {
  fetchPurchaseOrders()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header dengan Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-r from-info-500 to-info-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm font-medium">Total Pembelian</p>
            <p class="text-3xl font-bold">{{ totalOrders }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <p class="text-green-100 text-sm font-medium">Total Harga Pembelian</p>
              <select
                v-model="selectedYear"
                class="text-xs bg-white/20 text-white border-0 rounded px-2 py-1 focus:ring-1 focus:ring-white/50"
              >
                <option v-for="year in availableYears" :key="year" :value="year" class="text-gray-800">
                  {{ year }}
                </option>
              </select>
            </div>
            <p class="text-lg font-bold">{{ formatCurrency(totalAmount) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter dan Search -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col lg:flex-row gap-4 mb-6">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cari Catatan Pembelian
          </label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan ID, Vendor, Status"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
          </div>
        </div>

        <div class="w-full lg:w-64">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rentang Tanggal
          </label>
          <HomeDateRangePicker v-model="range" class="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500" />
        </div>

        <div class="w-full lg:w-48">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items per halaman
          </label>
          <select
            v-model="itemsPerPage"
            class="w-full pl-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option class="bg-white dark:bg-gray-700" value="10">10</option>
            <option class="bg-white dark:bg-gray-700" value="25">25</option>
            <option class="bg-white dark:bg-gray-700" value="50">50</option>
            <option class="bg-white dark:bg-gray-700" value="100">100</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <!-- Summary info -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Menampilkan {{ filteredPurchaseOrders.length }} Catatan Pembelian</span>
        <span v-if="searchQuery || (range.start && range.end)">
          Total filtered: {{ formatCurrency(filteredAmount) }}
        </span>
      </div>
    </div>

        <!-- Export Laporan Section - TAMBAHKAN INI -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export Laporan</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Download laporan pembelian dalam format PDF per bulan
          </p>
        </div>

        <!-- Komponen PDF Export -->
        <PurchasePDFExport
          :purchase-orders="purchaseOrderStore.purchaseOrderList || []"
          :available-years="availableYears"
        />
      </div>
    </div>

    <!-- Tabel Purchase Order -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Riwayat Pembelian
        </h2>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Error</h3>
        <p class="text-red-500 dark:text-red-400">{{ error }}</p>
        <button
          @click="fetchPurchaseOrders"
          class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          Coba Lagi
        </button>
      </div>

      <div v-else-if="filteredPurchaseOrders.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada catatan pembelian</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery || (range.start && range.end) ? 'Tidak ada purchase order yang sesuai dengan filter' : 'Belum ada purchase order yang tercatat' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">ID</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Vendor</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Tanggal</th>
              <th class="text-right px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(item, index) in paginatedFilteredPurchaseOrders"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': index % 2 === 0 }"
            >
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                  PO-{{ item.id }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ item.vendor?.charAt(0).toUpperCase() || 'V' }}
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ item.vendor || 'Unknown Vendor' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                {{ new Date(item.created_at || item.date || new Date()).toLocaleDateString('id-ID') }}
                <br>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(item.created_at || item.date || new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {{ formatCurrency(item.total_amount || 0) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex gap-1">
              <button
                v-for="page in Math.min(totalPages, 5)"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
