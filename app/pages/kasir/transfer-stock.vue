<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransferStockStore } from '~/store/transferStock'

const links = [[{
  label: 'Transfer Stock',
  icon: 'i-lucide-hand-coins',
  to: '/kasir/transfer-stock',
  exact: true
}]]

const transferStockStore = useTransferStockStore()

// Reactive data
const selectedStatus = ref('')
const selectedType = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showDetailModal = ref(false)
const selectedTransfer = ref(null)

// Computed properties
const allTransfers = computed(() => {
  const transfers: any[] = []

  // Add my transfers with type indicator
  transferStockStore.myTransfers.forEach(transfer => {
    transfers.push({ ...transfer, transferType: 'my_requests' })
  })

  // Add incoming requests with type indicator
  transferStockStore.incomingRequests.forEach(transfer => {
    transfers.push({ ...transfer, transferType: 'incoming_requests' })
  })

  // Sort by created_at descending
  return transfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const filteredTransfers = computed(() => {
  let filtered = allTransfers.value

  // Filter by status
  if (selectedStatus.value) {
    filtered = filtered.filter(transfer => transfer.status === selectedStatus.value)
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(transfer => transfer.transferType === selectedType.value)
  }

  // Filter by date range
  if (dateFrom.value) {
    filtered = filtered.filter(transfer =>
      new Date(transfer.created_at) >= new Date(dateFrom.value)
    )
  }

  if (dateTo.value) {
    filtered = filtered.filter(transfer =>
      new Date(transfer.created_at) <= new Date(dateTo.value + ' 23:59:59')
    )
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransfers.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage.value
})

const paginatedTransfers = computed(() => {
  return filteredTransfers.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Menunggu'
    case 'success':
      return 'Berhasil'
    case 'rejected':
      return 'Ditolak'
    default:
      return status
  }
}

const getTransferType = (transfer: any) => {
  return transfer.transferType === 'my_requests' ? 'Permintaan Saya' : 'Permintaan Masuk'
}

const getTransferTypeClass = (transfer: any) => {
  return transfer.transferType === 'my_requests'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-purple-100 text-purple-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const resetFilters = () => {
  selectedStatus.value = ''
  selectedType.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const viewDetail = (transfer: any) => {
  selectedTransfer.value = transfer
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTransfer.value = null
}

// Lifecycle
onMounted(async () => {
  await transferStockStore.fetchTransferStocks()
})

// Watch for filter changes to reset pagination
watch([selectedStatus, selectedType, dateFrom, dateTo], () => {
  currentPage.value = 1
})
</script>


<template>
  <UDashboardPanel id="transfer-stock" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Kelola Transfer Stock">
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
        <template>
  <div class="min-h-screen">
    <div class="">
      <!-- Header -->
      <!-- <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Riwayat Transfer Stock</h1>
        <p class="mt-2 text-gray-600">Lihat semua riwayat transfer stock yang telah dilakukan</p>
      </div> -->

      <!-- Filter Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="selectedStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Transfer</label>
            <select v-model="selectedType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Tipe</option>
              <option value="my_requests">Permintaan Saya</option>
              <option value="incoming_requests">Permintaan Masuk</option>
            </select>
          </div>
          <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Dari</label>
            <input
              type="date"
              v-model="dateFrom"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Sampai</label>
            <input
              type="date"
              v-model="dateTo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div> -->
        </div>
        <div class="mt-4 flex justify-between items-center">
          <div class="flex space-x-2">
            <button
              @click="resetFilters"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
          </div>
          <div class="text-sm text-gray-500">
            Total: {{ filteredTransfers.length }} transfer
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="transferStockStore.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="transferStockStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ transferStockStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th> -->
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemohon
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemberi
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th> -->
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transfer in paginatedTransfers" :key="transfer.id" class="hover:bg-gray-50">
                <!-- <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ transfer.id }}
                </td> -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getTransferTypeClass(transfer)">
                    {{ getTransferType(transfer) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transfer.user.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transfer.user2.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div class="font-medium">{{ transfer.unit_request.unit_name }}</div>
                    <div class="text-gray-500">{{ transfer.unit_request.product_type.product_name_type }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transfer.qty_product_request }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(transfer.status)">
                    {{ getStatusText(transfer.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(transfer.created_at) }}
                </td>
                <!-- <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewDetail(transfer)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Detail
                  </button>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredTransfers.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p class="mt-1 text-sm text-gray-500">Belum ada riwayat transfer stock yang ditemukan.</p>
        </div>

        <!-- Pagination -->
        <div v-if="filteredTransfers.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Menampilkan <span class="font-medium">{{ startIndex + 1 }}</span> sampai <span class="font-medium">{{ Math.min(endIndex, filteredTransfers.length) }}</span> dari <span class="font-medium">{{ filteredTransfers.length }}</span> hasil
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>

                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <!-- <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Detail Transfer Stock #{{ selectedTransfer?.id }}
            </h3>
            <button
              @click="closeDetailModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedTransfer" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(selectedTransfer.status)">
                  {{ getStatusText(selectedTransfer.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedTransfer.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Pemohon</label>
                <p class="text-sm text-gray-900">{{ selectedTransfer.user.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Pemberi</label>
                <p class="text-sm text-gray-900">{{ selectedTransfer.user2.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Unit yang Diminta</label>
                <p class="text-sm text-gray-900">{{ selectedTransfer.unit_request.unit_name }}</p>
                <p class="text-xs text-gray-500">{{ selectedTransfer.unit_request.product_type.product_name_type }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Unit yang Memberi</label>
                <p class="text-sm text-gray-900">{{ selectedTransfer.unit_gives.unit_name }}</p>
                <p class="text-xs text-gray-500">{{ selectedTransfer.unit_gives.product_type.product_name_type }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Jumlah yang Diminta</label>
                <p class="text-sm text-gray-900">{{ selectedTransfer.qty_product_request }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeDetailModal"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>
      </div>
    </template>
  </UDashboardPanel>
</template>


