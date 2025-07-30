<script setup lang="ts">
  definePageMeta({
    layout: 'custom-2',
  })
const links = [[ {
  label: 'Riwayat',
  icon: 'i-lucide-clock',
  to: '/o-cabang/riwayat-kas'
}]]

import { useMoneyFlowStore } from '~/store/moneyFlow'
import type { Range } from '~/types'
import { sub, isWithinInterval, getYear,parseISO, startOfDay, endOfDay } from 'date-fns'

// Store
const moneyFlowStore = useMoneyFlowStore()

// State
const isLoading = ref(false)
const selectedFilter = ref('semua')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

// Flow types sesuai dengan database (sama seperti index.vue)
const flowTypes = ref([
  { id: 1, name_flow: 'Masuk' },
  { id: 2, name_flow: 'Keluar' }
])

const availableYears = computed(() => {
  if (!moneyFlowStore.moneyFlows) return [new Date().getFullYear()]

  const years = new Set<number>()
  moneyFlowStore.moneyFlows.forEach((item) => {
    const year = getYear(parseISO(item.date || item.created_at))
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

// Computed
const filteredMoneyFlows = computed(() => {
  if (!moneyFlowStore.moneyFlows) return []

  let filtered = moneyFlowStore.moneyFlows

  // Filter berdasarkan tipe flow
  if (selectedFilter.value !== 'semua') {
    const targetFlowType = selectedFilter.value === 'masuk' ? 1 : 2
    filtered = filtered.filter(flow => flow.id_flow_type == targetFlowType)
  }

  // Filter berdasarkan pencarian
  if (searchQuery.value) {
    filtered = filtered.filter(flow =>
      flow.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter berdasarkan date range
    if (range.value.start && range.value.end) {
    filtered = filtered.filter(moneyFlowStore => {
      const flowDate = parseISO(moneyFlowStore.created_at)
      return isWithinInterval(flowDate, {
        start: startOfDay(range.value.start),
        end: endOfDay(range.value.end)
      })
    })
  }

  // Sort by date desc
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Computed untuk pagination
const paginatedMoneyFlows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMoneyFlows.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMoneyFlows.value.length / itemsPerPage.value)
})

const totalFilteredAmount = computed(() => {
  return filteredMoneyFlows.value.reduce((sum, flow) => {
    return flow.id_flow_type == 1 ? sum + flow.qty_money : sum - flow.qty_money
  }, 0)
})

// Methods
const fetchMoneyFlows = async () => {
  isLoading.value = true
  try {
    await moneyFlowStore.fetchMoneyFlows()
  } catch (error) {
    console.error('Error fetching money flows:', error)
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  selectedFilter.value = 'semua'
  searchQuery.value = ''
  range.value = {
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  }
  currentPage.value = 1
}

const deleteTransaction = async (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    try {
      await moneyFlowStore.deleteMoneyFlow(id)
      // Sesuaikan dengan sistem notifikasi yang Anda gunakan
      console.log('Transaksi berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateShort = (date: Date | string | null) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatDate = (date: Date | string | null) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Computed untuk check apakah ada filter aktif
const hasActiveFilters = computed(() => {
  return selectedFilter.value !== 'semua' ||
         searchQuery.value !== '' ||
         range.value.start !== null ||
         range.value.end !== null
})

// Watch for filter changes to reset pagination
watch([searchQuery, selectedFilter, range], () => {
  currentPage.value = 1
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchMoneyFlows()
})
</script>

<template>
  <UDashboardPanel id="akunkasir" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Riwayat Kas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-5xl mx-auto">
          <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Riwayat Kas
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Kelola dan pantau semua transaksi kas
                </p>
              </div>

              <div class="flex items-center gap-3">
                <UButton
                  variant="outline"
                  icon="i-lucide-refresh-cw"
                  label="Refresh"
                  @click="fetchMoneyFlows"
                  :loading="isLoading"
                />
              </div>
            </div>

            <!-- Filters -->
            <UCard>
              <div class="flex flex-col lg:flex-row gap-4">
                <!-- Search -->
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cari Transaksi
                  </label>
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Cari berdasarkan deskripsi..."
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500"
                    >
                  </div>
                </div>

                <!-- Filter Tipe -->
                <div class="w-full lg:w-48">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter Tipe
                  </label>
                  <select
                    v-model="selectedFilter"
                    class="w-full pl-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500">
                    <option class="bg-elevated" value="semua">Semua Status</option>
                    <option class="bg-elevated" value="masuk">Pemasukan</option>
                    <option class="bg-elevated" value="keluar">Pengeluaran</option>
                  </select>
                </div>

                <!-- Date Range -->
                <div class="w-full lg:w-64">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rentang Tanggal
                  </label>
                  <HomeDateRangePicker
                    v-model="range"
                    class="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500"
                  />
                </div>

                <!-- Items per Page -->
                <div class="w-full lg:w-48">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Items per Page
                  </label>
                  <select
                    v-model="itemsPerPage"
                    class="w-full pl-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500">
                    <option class="bg-elevated" value="10">10</option>
                    <option class="bg-elevated" value="25">25</option>
                    <option class="bg-elevated" value="50">50</option>
                    <option class="bg-elevated" value="100">100</option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <div class="flex items-end">
                  <button
                    @click="clearFilters"
                    :disabled="!hasActiveFilters"
                    class="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>

              <!-- Summary info -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
                <span>
                  Menampilkan {{ filteredMoneyFlows.length }} transaksi
                  <span v-if="range.start || range.end" class="font-medium">
                    {{ range.start && range.end
                      ? `(${formatDateShort(range.start)} - ${formatDateShort(range.end)})`
                      : range.start
                        ? `(dari ${formatDateShort(range.start)})`
                        : `(sampai ${formatDateShort(range.end)})`
                    }}
                  </span>
                </span>
                <div class="text-right">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Total: </span>
                  <span
                    class="font-semibold"
                    :class="totalFilteredAmount >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ formatCurrency(Math.abs(totalFilteredAmount)) }}
                    {{ totalFilteredAmount >= 0 ? '(Surplus)' : '(Defisit)' }}
                  </span>
                </div>
              </div>
            </UCard>

            <UCard class="mb-6">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-lucide-file-text" class="w-5 h-5" />
                    <h3 class="text-lg font-semibold">Export Laporan</h3>
                  </div>
                </div>
              </template>

              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Download laporan kas dalam format PDF per bulan untuk keperluan arsip dan analisis keuangan
                  </p>
                </div>

                <MoneyFlowPDFExport
                  :money-flows="moneyFlowStore.moneyFlows || []"
                  :available-years="availableYears"
                />
              </div>
            </UCard>

            <!-- Transaction List -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-lucide-history" class="w-5 h-5" />
                    <h2 class="text-lg font-semibold">
                      Daftar Kas
                      <span v-if="filteredMoneyFlows.length !== (moneyFlowStore.moneyFlows?.length || 0)" class="text-sm font-normal text-gray-500">
                        ({{ filteredMoneyFlows.length }} dari {{ moneyFlowStore.moneyFlows?.length || 0 }})
                      </span>
                    </h2>
                  </div>
                </div>
              </template>

              <div v-if="isLoading" class="flex justify-center py-8">
                <div class="text-center">
                  <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto mb-3" />
                  <p class="text-gray-500">Memuat data transaksi...</p>
                </div>
              </div>

              <div v-else-if="filteredMoneyFlows.length === 0" class="text-center py-12">
                <UIcon name="i-lucide-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {{ hasActiveFilters ? 'Tidak ada hasil' : 'Tidak ada transaksi' }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">
                  {{ hasActiveFilters
                    ? 'Coba ubah filter pencarian Anda'
                    : 'Belum ada transaksi yang dicatat' }}
                </p>
                <UButton
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  icon="i-lucide-filter-x"
                  label="Clear Filter"
                  variant="outline"
                />
              </div>

              <div v-else>
                <div class="space-y-3">
                  <div
                    v-for="flow in paginatedMoneyFlows"
                    :key="flow.id"
                    class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex items-center space-x-4">
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center"
                        :class="flow.id_flow_type == 1
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'"
                      >
                        <UIcon
                          :name="flow.id_flow_type == 1
                            ? 'i-lucide-arrow-down-circle'
                            : 'i-lucide-arrow-up-circle'"
                          class="w-6 h-6"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                          <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {{ flow.description }}
                          </h4>
                          <UBadge
                            :label="flow.id_flow_type == 1 ? 'Pemasukan' : 'Pengeluaran'"
                            :color="flow.id_flow_type == 1 ? 'primary' : 'error'"
                            variant="soft"
                            size="xs"
                          />
                        </div>
                        <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span class="flex items-center">
                            <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
                            {{ formatDateShort(flow.date) }}
                          </span>
                          <span class="flex items-center">
                            <UIcon name="i-lucide-clock" class="w-4 h-4 mr-1" />
                            {{ formatDate(flow.created_at).split(' ').slice(-1)[0] }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center space-x-3">
                      <div class="text-right">
                        <p
                          class="font-semibold text-lg"
                          :class="flow.id_flow_type == 1 ? 'text-green-600' : 'text-red-600'"
                        >
                          {{ flow.id_flow_type == 1 ? '+' : '-' }}{{ formatCurrency(flow.qty_money) }}
                        </p>
                      </div>

                      <UDropdown :items="[[
                        {
                          label: 'Edit',
                          icon: 'i-lucide-edit',
                          click: () => {
                            // Navigate to edit page or open edit modal
                            console.log('Edit transaction:', flow.id)
                          }
                        },
                        {
                          label: 'Hapus',
                          icon: 'i-lucide-trash-2',
                          click: () => deleteTransaction(flow.id)
                        }
                      ]]">
                        <UButton color="secondary" variant="ghost" icon="i-lucide-more-horizontal" />
                      </UDropdown>
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-700 dark:text-gray-300">
                      Halaman {{ currentPage }} dari {{ totalPages }}
                      <span class="ml-2 text-gray-500">
                        ({{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredMoneyFlows.length) }} dari {{ filteredMoneyFlows.length }})
                      </span>
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
            </UCard>
          </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
