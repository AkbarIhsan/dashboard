import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SalesOrderDetail {
  id: number
  price: number
  qty: number
  total_price: number
  username: string | null
  branch: string | null
  product_name_type: string | null
  product_name: string | null
}


export const useSalesStore = defineStore('sales', () => {
  const salesList = ref<SalesOrderDetail[]>([])
  const isLoading = ref(false)

  // State untuk pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const paginatedSales = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return salesList.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(salesList.value.length / itemsPerPage.value)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const fetchSales = async () => {
    isLoading.value = true
    try {
      const token = useCookie('token')

      const data = await $fetch<SalesOrderDetail[]>('http://app.udpadijaya.com/api/sales-order-detail', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      salesList.value = data.sort((a, b) => b.id - a.id)

    } catch (error) {
      console.error('❌ Gagal mengambil data:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    salesList,
    isLoading,
    fetchSales,
    paginatedSales,
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
  }
})
