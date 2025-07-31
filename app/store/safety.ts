import { defineStore } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ✅ Interfaces (define tipe respons dari API)
interface SafetyStockItem {
  id: number
  product_name_type: string
  current_stock: number
  min_stock: number
  price: number
  branch: string
  last_updated: string
  prediction?: {
    predicted_sales?: {
      total_4_weeks: number
      weekly_forecast: number[]
    }
    recommendation?: {
      stock_to_add: number
      suggested_order: number
      priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    }
    note?: string
    forecast_accuracy?: {
      model_aic: number
    }
  }
}

interface SafetyStockResponse {
  success: boolean
  data: SafetyStockItem[]
  message?: string
}

export const useSafetyStockStore = defineStore('safetyStock', () => {
  // ✅ State
  const safetyStockData = ref<SafetyStockItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const token = useCookie('token')

  // ✅ Fetch function
  const fetchSafetyStockData = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<SafetyStockResponse>('http://app.udpadijaya.com/api/safety-stock', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success) {
        safetyStockData.value = response.data
      } else {
        throw new Error(response.message || 'Gagal mengambil data safety stock')
      }
    } catch (err: any) {
      console.error('Error fetching safety stock data:', err)
      error.value = err.message || 'Terjadi kesalahan saat mengambil data'
    } finally {
      isLoading.value = false
    }
  }

  // ✅ Refresh manual
  const refreshData = () => {
    fetchSafetyStockData()
  }

  // ✅ Utility functions
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  const formatDateTime = (dateTime: string | null | undefined): string => {
    if (!dateTime) return 'Unknown'
    return new Date(dateTime).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ✅ Auto refresh setiap 5 menit
  let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

  const initAutoRefresh = () => {
    fetchSafetyStockData()
    autoRefreshInterval = setInterval(() => {
      if (!isLoading.value) {
        fetchSafetyStockData()
      }
    }, 5 * 60 * 1000)
  }

  onMounted(initAutoRefresh)
  onUnmounted(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }
  })

  return {
    // State
    safetyStockData,
    isLoading,
    error,

    // Methods
    fetchSafetyStockData,
    refreshData,
    formatPrice,
    formatDateTime,

    // Derived/computed
  totalSafetyItems: computed(() =>
    safetyStockData.value.filter(item => !!item.id).length
  )

  }
})
