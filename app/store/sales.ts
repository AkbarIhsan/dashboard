// ~/store/sales.ts atau sales-order.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SalesOrderDetail } from './sales-detail'

export interface SalesOrder {
  id: number
  id_user: number
  date: string
  username: string
  branch_name: string
  total_amount: number
  total_items: number
  created_at?: string
  updated_at?: string
}

export interface SalesOrderWithDetails extends SalesOrder {
  details: SalesOrderDetail[]
}

export const useSalesOrderStore = defineStore('salesOrder', () => {
  const salesOrderList = ref<SalesOrder[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const paginatedSalesOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return salesOrderList.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(salesOrderList.value.length / itemsPerPage.value)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const fetchSalesOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      const token = useCookie('token')

      const data = await $fetch<SalesOrder[]>('http://127.0.0.1:8000/api/sales-order', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      // Urutkan berdasarkan tanggal terbaru
      salesOrderList.value = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (err: any) {
      console.error('❌ Gagal mengambil data sales order:', err)
      error.value = err.message || 'Gagal mengambil data sales order'
    } finally {
      isLoading.value = false
    }
  }

  // Mengambil ID sales order terbaru dari data yang sudah di-cache
  const getLatestSalesOrderIdFromCache = (): number | null => {
    if (salesOrderList.value.length === 0) return null
    const sorted = [...salesOrderList.value].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0]?.id ?? null
  }


  // Mengambil ID sales order terbaru dari API khusus
  const fetchLatestSalesOrderId = async (): Promise<number> => {
    const token = useCookie('token')

    const latest = await $fetch<SalesOrder>('http://127.0.0.1:8000/api/sales-order/latest', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })

    return latest.id
  }

  const resetPagination = () => {
    currentPage.value = 1
  }

  return {
    // state
    salesOrderList,
    isLoading,
    error,

    // actions
    fetchSalesOrders,
    getLatestSalesOrderIdFromCache,
    fetchLatestSalesOrderId,

    // pagination
    paginatedSalesOrders,
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
    resetPagination,
  }
})
