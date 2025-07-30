<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useSalesOrderStore, type SalesOrder } from '~/store/sales'
import { useSalesStore, type SalesOrderDetail } from '~/store/sales-detail'

const route = useRoute()
const router = useRouter()

const salesOrderStore = useSalesOrderStore()
const salesDetailStore = useSalesStore()

const salesOrderId = ref(Number(route.params.id))
const salesOrder = ref<SalesOrder | null>(null)
const salesDetails = ref<SalesOrderDetail[]>([])
const isLoading = ref(true)
const error = ref('')

// Computed untuk total items
const totalItems = computed(() => {
  return salesDetails.value.reduce((sum, item) => sum + item.qty, 0)
})

// Computed untuk total amount
const totalAmount = computed(() => {
  return salesDetails.value.reduce((sum, item) => sum + item.total_price, 0)
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
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Define interface for API response
interface SalesOrderResponse {
  id: number
  id_user: number
  username: string
  date: string
  details: SalesOrderDetail[]
}

// Fetch sales order detail
const fetchSalesOrderDetail = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const token = useCookie('token')

    // Fetch sales order detail by ID
    const detailData = await $fetch<SalesOrderResponse>(`http://127.0.0.1:8000/api/sales-order/${salesOrderId.value}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })

    // ✅ Correctly assign the sales order data
    salesOrder.value = {
      id: detailData.id,
      id_user: detailData.id_user,
      username: detailData.username,
      date: detailData.date,
      total_amount: detailData.details.reduce((sum, item) => sum + item.total_price, 0),
      total_items: detailData.details.reduce((sum, item) => sum + item.qty, 0)
    }

    // ✅ Correctly assign the details array
    salesDetails.value = detailData.details

  } catch (err: any) {
    error.value = err.message || 'Gagal mengambil detail sales order'
    console.error('❌ Error fetching sales order detail:', err)
  } finally {
    isLoading.value = false
  }
}

// Back to list
const goBack = () => {
  router.push('/kasir/transaksi/riwayat')
}

// Navigate to pengiriman with pre-filled sales order
const createPengiriman = () => {
  router.push({
    path: '/kasir/pengiriman',
    query: {
      sales_order_id: salesOrderId.value,
      auto_fill: 'true'
    }
  })
}

onMounted(() => {
  fetchSalesOrderDetail()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        @click="goBack"
        class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Riwayat
      </button>

      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Detail Sales Order #{{ salesOrderId }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Informasi lengkap tentang sales order dan item yang dibeli
        </p>
      </div>

      <!-- Tombol Buat Pengiriman -->
      <button
        v-if="!isLoading && !error && salesOrder"
        @click="createPengiriman"
        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Buat Pengiriman
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Error</h3>
      <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      <button
        @click="fetchSalesOrderDetail"
        class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Sales Order Info -->
      <div class="xl:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Sales Order
          </h2>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">ID Sales Order</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                #{{ salesOrderId }}
              </span>
            </div>

            <div v-if="salesOrder" class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ salesOrder.id_user }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Username</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ salesOrder.username || 'Unknown User' }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ new Date(salesOrder.date).toLocaleDateString('id-ID') }}
                {{ formatDateTime(salesOrder.date).split(' ').slice(-1)[0] }}
              </span>
              </div>
            </div>

            <hr class="border-gray-200 dark:border-gray-700">

            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</span>
              <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ totalItems }} items</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</span>
              <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div class="text-blue-100 text-sm font-medium">Total Items</div>
            <div class="text-2xl font-bold">{{ totalItems }}</div>
          </div>
          <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div class="text-green-100 text-sm font-medium">Unique Products</div>
            <div class="text-2xl font-bold">{{ salesDetails.length }}</div>
          </div>
        </div>

        <!-- Action Button untuk Mobile -->
        <div class="mt-6 xl:hidden">
          <button
            @click="createPengiriman"
            class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Buat Pengiriman
          </button>
        </div>
      </div>

      <!-- Sales Order Details -->
      <div class="xl:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Detail Items ({{ salesDetails.length }} produk)
            </h2>
          </div>

          <div v-if="salesDetails.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada detail item</h3>
            <p class="text-gray-500 dark:text-gray-400">Sales order ini tidak memiliki detail item</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Produk</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Branch</th>
                  <th class="text-right px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Harga</th>
                  <th class="text-center px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Qty</th>
                  <th class="text-right px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(item, index) in salesDetails"
                  :key="item.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': index % 2 === 0 }"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {{ item.product_name?.charAt(0).toUpperCase() || 'P' }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ item.product_name || 'Unknown Product' }}</div>
                        <div v-if="item.product_name_type" class="text-sm text-gray-500 dark:text-gray-400">{{ item.product_name_type }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span v-if="item.branch" class="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {{ item.branch }}
                    </span>
                    <span v-else class="text-gray-400 dark:text-gray-500 text-sm">-</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(item.price) }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      {{ item.qty }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ formatCurrency(item.total_price) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer Summary -->
          <div v-if="salesDetails.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div class="flex justify-between items-center">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total: {{ salesDetails.length }} produk, {{ totalItems }} items
              </div>
              <div class="text-xl font-bold text-green-600 dark:text-green-400">
                {{ formatCurrency(totalAmount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
