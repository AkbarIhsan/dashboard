<script setup lang="ts">
  definePageMeta({
    layout: 'custom-2',
  })
const links = [[{
  label: 'Riwayat',
  icon: 'i-lucide-clock',
  to: '/o-cabang/riwayat-pengiriman'
}]]
import { ref, computed, onMounted, watch } from 'vue'
import { useDeliveryStore } from '~/store/delivery'
import { sub, isWithinInterval, getYear,parseISO, startOfDay, endOfDay } from 'date-fns'
import type { Range } from '~/types'

const deliveryStore = useDeliveryStore()
const toast = useToast()
const router = useRouter()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const selectedDeliveries = ref<number[]>([])
const updatingStatus = ref<number | null>(null)
const bulkUpdating = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Date range filter - menggunakan format yang sama dengan transaksi/riwayat.vue
const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

// Computed properties
const hasActiveFilters = computed(() => {
  return Boolean(searchQuery.value || statusFilter.value || (range.value.start && range.value.end))
})

const availableYears = computed(() => {
  const years = new Set<number>()
  deliveryStore.deliveries.forEach((item) => {
    const year = getYear(parseISO(item.created_at))
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Urutkan dari tahun terbaru
})

const monthlyDeliveries = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  return deliveryStore.deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.created_at)
    return deliveryDate.getMonth() === thisMonth && deliveryDate.getFullYear() === thisYear
  })
})

const filteredDeliveries = computed(() => {
  let filtered = [...deliveryStore.deliveries]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(delivery => {
      const customer = getCustomerName(delivery.id_customer).toLowerCase()
      const salesOrder = `so-${delivery.id_sales_order}`.toLowerCase()
      return customer.includes(query) || salesOrder.includes(query)
    })
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(delivery => delivery.status === statusFilter.value)
  }

  // Date range filter - menggunakan logika yang sama dengan transaksi/riwayat.vue
  if (range.value.start && range.value.end) {
    filtered = filtered.filter(delivery => {
      const deliveryDate = parseISO(delivery.created_at)
      return isWithinInterval(deliveryDate, {
        start: startOfDay(range.value.start),
        end: endOfDay(range.value.end)
      })
    })
  }



  // Sort by newest first
  return filtered.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredDeliveries.value.length / itemsPerPage.value)
})

const paginatedDeliveries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDeliveries.value.slice(start, end)
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

// const paginatedDeliveries = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage
//   const end = start + itemsPerPage
//   return filteredDeliveries.value.slice(start, end)
// })

const canBulkComplete = computed(() => {
  return selectedDeliveries.value.every(id => {
    const delivery = deliveryStore.deliveries.find(d => d.id === id)
    return delivery?.status === 'pending'
  })
})

// Methods
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Time'
  }
}

const getCustomerName = (customerId: number) => {
  if (!deliveryStore.customers || !Array.isArray(deliveryStore.customers)) {
    return 'Customer tidak ditemukan'
  }
  const customer = deliveryStore.customers.find(c => c.id === customerId)
  return customer ? customer.name : 'Customer tidak ditemukan'
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return 'i-lucide-clock'
    case 'completed':
      return 'i-lucide-check-circle'
    default:
      return 'i-lucide-help-circle'
  }
}

const getStatusIconClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'completed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'completed':
      return 'success'
    default:
      return 'neutral'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Selesai'
    default:
      return 'Unknown'
  }
}

const getDeliveryActions = (delivery: any) => {
  const actions = []

  if (delivery.status === 'pending') {
    actions.push([{
      label: 'Selesaikan',
      icon: 'i-lucide-check',
      click: () => updateSingleStatus(delivery.id, 'completed')
    }])
  }

  actions.push([{
    label: 'Lihat Detail',
    icon: 'i-lucide-eye',
    click: () => viewDetail(delivery.id)
  }])

  return actions
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  range.value = {
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  }
  currentPage.value = 1
}

const clearSelection = () => {
  selectedDeliveries.value = []
}

const navigateToCreate = () => {
  router.push('/kasir/pengiriman')
}

const refreshData = async () => {
  try {
    await deliveryStore.initializeData()
    toast.add({
      title: 'Data Diperbarui',
      description: 'Data pengiriman berhasil diperbarui',
      icon: 'i-lucide-refresh-cw',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error!',
      description: 'Gagal memperbarui data',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const updateSingleStatus = async (id: number, status: 'completed') => {
  updatingStatus.value = id
  try {
    await deliveryStore.updateDeliveryStatus(id, status)
    toast.add({
      title: 'Status Diperbarui',
      description: 'Status pengiriman berhasil diubah',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })

    // Remove from selection if it was selected
    selectedDeliveries.value = selectedDeliveries.value.filter(deliveryId => deliveryId !== id)
  } catch (error) {
    console.error('Error updating status:', error)
    toast.add({
      title: 'Error!',
      description: 'Gagal mengubah status pengiriman',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    updatingStatus.value = null
  }
}

const bulkUpdateStatus = async (status: 'completed') => {
  if (selectedDeliveries.value.length === 0) return

  bulkUpdating.value = true
  try {
    const promises = selectedDeliveries.value.map(id =>
      deliveryStore.updateDeliveryStatus(id, status)
    )

    await Promise.all(promises)

    toast.add({
      title: 'Berhasil!',
      description: `${selectedDeliveries.value.length} pengiriman berhasil diselesaikan`,
      icon: 'i-lucide-check-circle',
      color: 'success'
    })

    clearSelection()
  } catch (error) {
    console.error('Error bulk updating:', error)
    toast.add({
      title: 'Error!',
      description: 'Gagal memperbarui status pengiriman',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    bulkUpdating.value = false
  }
}

const viewDetail = (id: number) => {
  // Implement detail view navigation
  console.log('View detail for delivery:', id)
}

// Watch for filter changes to reset pagination
watch([searchQuery, statusFilter, range], () => {
  currentPage.value = 1
}, { deep: true })

// Lifecycle
onMounted(async () => {
  try {
    await deliveryStore.initializeData()
  } catch (error) {
    console.error('Error initializing data:', error)
    toast.add({
      title: 'Error!',
      description: 'Gagal memuat data pengiriman',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
})
</script>

<template>
  <UDashboardPanel id="akunkasir" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Riwayat Pengiriman">
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
          Riwayat Pengiriman
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan pantau semua pengiriman
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- <UButton
          @click="navigateToCreate"
          icon="i-lucide-plus"
          label="Buat Pengiriman"
          color="primary"
        /> -->
        <UButton
          @click="refreshData"
          icon="i-lucide-refresh-cw"
          variant="outline"
          :loading="deliveryStore.loading"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Pengiriman</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ deliveryStore.deliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-package" class="w-8 h-8 text-blue-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ deliveryStore.pendingDeliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-clock" class="w-8 h-8 text-yellow-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Selesai</p>
            <p class="text-2xl font-bold text-green-600">
              {{ deliveryStore.completedDeliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Bulan Ini</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ monthlyDeliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-calendar" class="w-8 h-8 text-purple-600" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cari Pengiriman
          </label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan Sales Order, Customer..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500"
            >
          </div>
        </div>

        <!-- Status Filter -->
        <div class="w-full lg:w-48">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter Status
          </label>
          <select
            v-model="statusFilter"
            class="w-full pl-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500">
            <option class="bg-elevated" value="">Semua Status</option>
            <option class="bg-elevated" value="pending">Pending</option>
            <option class="bg-elevated" value="completed">Selesai</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="w-full lg:w-64">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rentang Tanggal
          </label>
          <HomeDateRangePicker v-model="range" class="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500" />
        </div>

        <div class="w-full lg:w-48">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items per Page
          </label>
          <select
            v-model="itemsPerPage"
            class="w-full pl-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-info-500">
            <option class="bg-elevated" value="10">10</option>
            <!-- <option class="bg-elevated" value="12">12</option> -->
            <option class="bg-elevated" value="24">24</option>
            <option class="bg-elevated" value="50">50</option>
          </select>
        </div>

        <!-- Clear Filters -->
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
        <span>Menampilkan {{ filteredDeliveries.length }} pengiriman</span>
        <span v-if="searchQuery || statusFilter || (range.start && range.end)">
          Hasil filter: {{ filteredDeliveries.length }} dari {{ deliveryStore.deliveries.length }}
        </span>
      </div>
    </UCard>

    <div class="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Export Laporan</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Download laporan riwayat pengiriman dalam format PDF per bulan
          </p>
        </div>

        <!-- Komponen PDF Export -->
        <DeliveryPDFExport
          :deliveries="deliveryStore.deliveries"
          :customers="deliveryStore.customers"
          :available-years="availableYears"
        />
      </div>
    </div>

    <!-- Delivery List -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            Daftar Pengiriman
            <span v-if="filteredDeliveries.length !== deliveryStore.deliveries.length" class="text-sm font-normal text-gray-500">
              ({{ filteredDeliveries.length }} dari {{ deliveryStore.deliveries.length }})
            </span>
          </h2>

          <div class="flex items-center gap-2">
            <!-- Bulk Actions -->
            <div v-if="selectedDeliveries.length > 0" class="flex items-center gap-2">
              <span class="text-sm text-gray-600">
                {{ selectedDeliveries.length }} dipilih
              </span>
              <UButton
                @click="bulkUpdateStatus('completed')"
                icon="i-lucide-check"
                size="sm"
                color="success"
                variant="outline"
                :loading="bulkUpdating"
                :disabled="!canBulkComplete"
              >
                Selesaikan
              </UButton>
              <UButton
                @click="clearSelection"
                icon="i-lucide-x"
                size="sm"
                variant="outline"
              />
            </div>

            <!-- View Toggle -->
            <div class="flex items-center">
              <UButton
                @click="viewMode = 'list'"
                :variant="viewMode === 'list' ? 'solid' : 'outline'"
                icon="i-lucide-list"
                size="sm"
              />
              <UButton
                @click="viewMode = 'grid'"
                :variant="viewMode === 'grid' ? 'solid' : 'outline'"
                icon="i-lucide-grid-3x3"
                size="sm"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="deliveryStore.loading && deliveryStore.deliveries.length === 0" class="flex justify-center py-12">
        <div class="text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto mb-3" />
          <p class="text-gray-500">Memuat data pengiriman...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDeliveries.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ searchQuery || statusFilter || (range.start && range.end) ? 'Tidak ada hasil' : 'Belum ada pengiriman' }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ searchQuery || statusFilter || (range.start && range.end)
            ? 'Coba ubah filter pencarian Anda'
            : 'Mulai buat pengiriman pertama Anda'
          }}
        </p>
        <UButton
          v-if="!searchQuery && !statusFilter && !(range.start && range.end)"
          @click="navigateToCreate"
          icon="i-lucide-plus"
          label="Buat Pengiriman"
          color="primary"
        />
      </div>

      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="delivery in paginatedDeliveries"
          :key="delivery.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <!-- Checkbox -->
            <UCheckbox
              v-if="delivery.status === 'pending'"
              :value="delivery.id"
            />

            <!-- Status Icon -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getStatusIconClass(delivery.status)"
            >
              <UIcon
                :name="getStatusIcon(delivery.status)"
                class="w-5 h-5"
              />
            </div>

            <!-- Delivery Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  SO-{{ delivery.id_sales_order }}
                </p>
                <UBadge
                  :color="getStatusColor(delivery.status)"
                  variant="subtle"
                  :label="getStatusLabel(delivery.status)"
                />
              </div>

              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getCustomerName(delivery.id_customer) }}
              </p>

              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                  {{ formatDate(delivery.date) }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-clock" class="w-3 h-3" />
                  {{ formatTime(delivery.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <UButton
              v-if="delivery.status === 'pending'"
              @click="updateSingleStatus(delivery.id, 'completed')"
              icon="i-lucide-check"
              size="sm"
              color="success"
              variant="outline"
              :loading="updatingStatus === delivery.id"
            />

            <UDropdown :items="getDeliveryActions(delivery)">
              <UButton
                icon="i-lucide-more-vertical"
                size="sm"
                variant="outline"
              />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="delivery in paginatedDeliveries"
          :key="delivery.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <UCheckbox
                v-if="delivery.status === 'pending'"
                :value="delivery.id"
              />
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="getStatusIconClass(delivery.status)"
              >
                <UIcon
                  :name="getStatusIcon(delivery.status)"
                  class="w-4 h-4"
                />
              </div>
            </div>

            <UDropdown :items="getDeliveryActions(delivery)">
              <UButton
                icon="i-lucide-more-vertical"
                size="xs"
                variant="ghost"
              />
            </UDropdown>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 dark:text-white">
                SO-{{ delivery.id_sales_order }}
              </h3>
              <UBadge
                :color="getStatusColor(delivery.status)"
                variant="subtle"
                :label="getStatusLabel(delivery.status)"
                size="xs"
              />
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ getCustomerName(delivery.id_customer) }}
            </p>

            <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>{{ formatDate(delivery.date) }}</span>
              <span>{{ formatTime(delivery.created_at) }}</span>
            </div>
          </div>

          <div v-if="delivery.status === 'pending'" class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <UButton
              @click="updateSingleStatus(delivery.id, 'completed')"
              icon="i-lucide-check"
              label="Selesaikan"
              size="sm"
              color="success"
              variant="outline"
              block
              :loading="updatingStatus === delivery.id"
            />
          </div>
        </div>
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
    </UCard>

    <!-- Toast Notifications -->
    <UNotifications />
  </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
