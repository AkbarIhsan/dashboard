import { defineStore } from 'pinia'

interface SalesOrderDetail {
  id: number
  id_sales_order: number
  price: number
  qty: number
  total_price: number
  username: string
  branch: string
  product_name_type: string // ← ini sebenarnya "name"
  product_name: string      // ← ini sebenarnya "type"
}

interface LowStockUnit {
  id: number
  unit_name: string
  price: number
  cost_price: number
  stock: number
  min_stock: number
  branch: string
  product_name_type: string
  product_name: string
  is_low_stock: boolean
  stock_status: 'LOW' | 'NORMAL' | 'OUT_OF_STOCK'
  stock_percentage?: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const salesData = ref<SalesOrderDetail[]>([])
  const lowStockUnits = ref<LowStockUnit[]>([])
  const loading = ref(false)
  const error = ref(null)

  // Computed untuk mendapatkan 5 barang terbanyak
  const topProducts = computed(() => {
    if (!salesData.value.length) return []

    // Agregasi data berdasarkan product_name_type (yang sebenarnya nama)
    const productMap = new Map()

    salesData.value.forEach(item => {
      const productName = item.product_name_type // ✅ PAKAI INI SEBAGAI NAMA PRODUK
      if (!productName) return

      if (productMap.has(productName)) {
        const existing = productMap.get(productName)
        existing.totalQty += item.qty
        existing.totalRevenue += item.total_price
        existing.orderCount += 1
      } else {
        productMap.set(productName, {
          productName,
          productNameType: item.product_name, // ✅ PAKAI INI SEBAGAI TIPE PRODUK
          totalQty: item.qty,
          totalRevenue: item.total_price,
          orderCount: 1
        })
      }
    })

    return Array.from(productMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5)
  })

  // Statistik umum
  const stats = computed(() => {
    if (!salesData.value.length) return {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      averageOrderValue: 0
    }

    const totalOrders = new Set(salesData.value.map(item => item.id_sales_order)).size
    const totalRevenue = salesData.value.reduce((sum, item) => sum + item.total_price, 0)
    const totalProducts = salesData.value.reduce((sum, item) => sum + item.qty, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      averageOrderValue
    }
  })

  const fetchSalesData = async () => {
    loading.value = true
    error.value = null

    try {
      const token = useCookie('token')

      const data = await $fetch<SalesOrderDetail[]>('http://127.0.0.1:8000/api/sales-order-detail', {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })

      salesData.value = data
    } catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat mengambil data'
      console.error('Error fetching sales data:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchLowStockUnits = async () => {
    try {
      const token = useCookie('token')

      // Ambil semua units
      const allUnits = await $fetch<LowStockUnit[]>('http://127.0.0.1:8000/api/unit', {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })

      // Filter dan sort units yang stocknya mendekati atau sudah di bawah min_stock
      const lowStock = allUnits
        .map(unit => {
          // Hitung persentase stock sisa
          const stockPercentage = unit.min_stock > 0 ? (unit.stock / unit.min_stock) * 100 : 100

          // Tentukan status stock
          let stockStatus: 'LOW' | 'NORMAL' | 'OUT_OF_STOCK' = 'NORMAL'
          if (unit.stock === 0) {
            stockStatus = 'OUT_OF_STOCK'
          } else if (stockPercentage <= 120) { // 120% dari min_stock dianggap mendekati
            stockStatus = 'LOW'
          }

          return {
            ...unit,
            stock_percentage: Math.round(stockPercentage),
            stock_status: stockStatus,
            is_low_stock: stockStatus === 'LOW' || stockStatus === 'OUT_OF_STOCK'
          }
        })
        .filter(unit => {
          // Filter unit yang stocknya mendekati atau sudah di bawah min_stock
          return unit.min_stock > 0 && unit.stock_percentage <= 120
        })
        .sort((a, b) => {
          // Prioritas sorting:
          // 1. Out of stock dulu
          // 2. Kemudian yang persentasenya paling rendah (paling kritis)
          if (a.stock_status === 'OUT_OF_STOCK' && b.stock_status !== 'OUT_OF_STOCK') return -1
          if (b.stock_status === 'OUT_OF_STOCK' && a.stock_status !== 'OUT_OF_STOCK') return 1

          return a.stock_percentage - b.stock_percentage
        })
        .slice(0, 5) // Ambil 5 teratas

      lowStockUnits.value = lowStock
    } catch (err: any) {
      console.error('Error fetching low stock units:', err)
      // Tidak set error di sini karena ini bukan critical error
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return {
    salesData,
    lowStockUnits,
    loading,
    error,
    topProducts,
    stats,
    fetchSalesData,
    fetchLowStockUnits,
    formatCurrency,
    formatNumber
  }
})
