// stores/purchaseStore.ts
import { defineStore } from 'pinia'

interface Unit {
  id: number
  unit_name: string
  cost_price: number
  stock: number
  min_stock: number
  branch: string | null
  product_name_type: string | null
  product_name: string | null
}

interface PurchaseItem {
  id: number
  unit_name: string
  product_name: string | null
  product_name_type: string | null
  cost_price: number
  stock: number
  qty: number
}

interface PurchaseState {
  units: Unit[]
  purchaseItems: PurchaseItem[]
  loading: boolean
  error: string | null
}

export const usePurchaseStore = defineStore('purchase', {
  state: (): PurchaseState => ({
    units: [],
    purchaseItems: [],
    loading: false,
    error: null
  }),

  getters: {
    totalAmount: (state): number => {
      return state.purchaseItems.reduce((total, item) => {
        return total + (item.cost_price * item.qty)
      }, 0)
    },

    totalItems: (state): number => {
      return state.purchaseItems.reduce((total, item) => total + item.qty, 0)
    }
  },

  actions: {
    async fetchUnits(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const { data, error } = await useFetch<Unit[]>('http://127.0.0.1:8000/api/unit', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          server: false,
        })

        if (error.value) {
          throw error.value
        }

        this.units = data.value || []
        console.log('Units loaded:', this.units.length)

      } catch (error: any) {
        this.error = 'Gagal memuat data unit'
        console.error('Error fetching units:', error)
      } finally {
        this.loading = false
      }
    },

    addToPurchase(unit: Unit, qty: number = 1, costPrice?: number): void {
      const existingItem = this.purchaseItems.find(item => item.id === unit.id)
      const finalCostPrice = costPrice || unit.cost_price

      if (existingItem) {
        existingItem.qty += qty
        existingItem.cost_price = finalCostPrice
      } else {
        this.purchaseItems.push({
          id: unit.id,
          unit_name: unit.unit_name,
          product_name: unit.product_name,
          product_name_type: unit.product_name_type,
          cost_price: finalCostPrice,
          stock: unit.stock,
          qty: qty
        })
      }
    },

    updatePurchaseItemQty(unitId: number, newQty: number): void {
      const item = this.purchaseItems.find(item => item.id === unitId)

      if (item) {
        if (newQty <= 0) {
          this.removeFromPurchase(unitId)
        } else {
          item.qty = newQty
        }
      }
    },

    updatePurchaseItemCostPrice(unitId: number, newCostPrice: number): void {
      const item = this.purchaseItems.find(item => item.id === unitId)

      if (item) {
        item.cost_price = newCostPrice
      }
    },

    removeFromPurchase(unitId: number): void {
      const index = this.purchaseItems.findIndex(item => item.id === unitId)
      if (index > -1) {
        this.purchaseItems.splice(index, 1)
      }
    },

    clearPurchase(): void {
      this.purchaseItems = []
    },

    async processPurchase(vendorName: string): Promise<{ success: boolean; message: string }> {
      if (this.purchaseItems.length === 0) {
        throw new Error('Tidak ada item untuk dibeli')
      }

      if (!vendorName.trim()) {
        throw new Error('Nama vendor harus diisi')
      }

      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        // Step 1: Create purchase order
        const purchaseOrderResponse = await fetch('http://127.0.0.1:8000/api/purchase-order', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify({
            vendor: vendorName.trim(),
            status: 'pending' // atau status lain sesuai kebutuhan
          })
        })

        if (!purchaseOrderResponse.ok) {
          const errorData = await purchaseOrderResponse.json()
          throw new Error(errorData.message || 'Gagal membuat purchase order')
        }

        const purchaseOrderData = await purchaseOrderResponse.json()
        const purchaseOrderId = purchaseOrderData.id || purchaseOrderData.data?.id

        if (!purchaseOrderId) {
          throw new Error('Gagal mendapatkan ID purchase order')
        }

        // Step 2: Add all items to purchase order
        for (const item of this.purchaseItems) {
          const response = await fetch('http://127.0.0.1:8000/api/purchase-order-detail', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              id_purchase_order: purchaseOrderId,
              id_unit: item.id,
              vendor: vendorName.trim(),
              qty: item.qty,
              cost_price: item.cost_price
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `Gagal memproses item ${item.unit_name}`)
          }
        }

        // Step 3: Complete purchase order (jika diperlukan)
        const completeResponse = await fetch(`http://127.0.0.1:8000/api/purchase-order/complete`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
        })

        if (!completeResponse.ok) {
          const errorData = await completeResponse.json()
          console.warn('Warning completing purchase order:', errorData.message)
          // Tidak throw error karena mungkin endpoint belum ada
        }

        // Clear purchase items dan refresh data
        this.clearPurchase()
        await this.fetchUnits()

        return { success: true, message: 'Pembelian berhasil diproses' }

      } catch (error: any) {
        this.error = error.message || 'Gagal memproses pembelian'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Alternative method jika tidak ada purchase order endpoint
    async processPurchaseDirectly(vendorName: string): Promise<{ success: boolean; message: string }> {
      if (this.purchaseItems.length === 0) {
        throw new Error('Tidak ada item untuk dibeli')
      }

      if (!vendorName.trim()) {
        throw new Error('Nama vendor harus diisi')
      }

      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        // Langsung buat purchase order detail untuk setiap item
        for (const item of this.purchaseItems) {
          const response = await fetch('http://127.0.0.1:8000/api/purchase-order-detail', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              id_unit: item.id,
              vendor: vendorName.trim(),
              qty: item.qty,
              cost_price: item.cost_price
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `Gagal memproses item ${item.unit_name}`)
          }
        }

        // Clear purchase items dan refresh data
        this.clearPurchase()
        await this.fetchUnits()

        return { success: true, message: 'Pembelian berhasil diproses' }

      } catch (error: any) {
        this.error = error.message || 'Gagal memproses pembelian'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
