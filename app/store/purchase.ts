import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { purchaseOrderDetail } from './purchase-detail'

export interface purchaseOrder {
  id: number
  id_user: number
  date: string
  username: string
  vendor: string
  branch_name: string
  total_amount: number
  total_items: number
  created_at: string
  updated_at?: string
}

export interface purchaseOrderWithDetails extends purchaseOrder {
  details: purchaseOrderDetail[]
}

export const usepurchaseOrderStore = defineStore('purchaseOrder', () => {
  const purchaseOrderList = ref<purchaseOrder[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // State untuk pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const paginatedpurchaseOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return purchaseOrderList.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(purchaseOrderList.value.length / itemsPerPage.value)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const fetchpurchaseOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      const token = useCookie('token')

      const data = await $fetch<purchaseOrder[]>('http://app.udpadijaya.com/api/purchase-order', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      purchaseOrderList.value = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    } catch (err: any) {
      console.error('❌ Gagal mengambil data purchase order:', err)
      error.value = err.message || 'Gagal mengambil data purchase order'
    } finally {
      isLoading.value = false
    }
  }

  // Reset pagination saat filter berubah
  const resetPagination = () => {
    currentPage.value = 1
  }

  return {
    purchaseOrderList,
    isLoading,
    error,
    fetchpurchaseOrders,
    paginatedpurchaseOrders,
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
    resetPagination,
  }
})
