import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface purchaseOrderDetail {
  id: number
  price: number
  qty: number
  vendor: string
  total_price: number
  username: string | null
  branch: string | null
  product_name_type: string | null
  product_name: string | null
}


export const usepurchaseStore = defineStore('purchase', () => {
  const purchaseList = ref<purchaseOrderDetail[]>([])
  const isLoading = ref(false)

  // State untuk pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const paginatedpurchase = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return purchaseList.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(purchaseList.value.length / itemsPerPage.value)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const fetchpurchase = async () => {
    isLoading.value = true
    try {
      const token = useCookie('token')

      const data = await $fetch<purchaseOrderDetail[]>('http://app.udpadijaya.com/api/purchase-order-detail', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      purchaseList.value = data.sort((a, b) => b.id - a.id)

    } catch (error) {
      console.error('❌ Gagal mengambil data:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    purchaseList,
    isLoading,
    fetchpurchase,
    paginatedpurchase,
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
  }
})

