// stores/transaction.ts
import { defineStore } from 'pinia'

interface Unit {
  id: number
  unit_name: string
  price: number
  stock: number
  min_stock: number
  branch: string | null
  product_name_type: string | null
  product_name: string | null
}

interface CartItem {
  id: number
  unit_name: string
  product_name: string | null
  product_name_type: string | null
  price: number
  stock: number
  qty: number
}

interface TransactionState {
  units: Unit[]
  cart: CartItem[]
  loading: boolean
  error: string | null
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    units: [],
    cart: [],
    loading: false,
    error: null
  }),

  getters: {
    totalAmount: (state): number => {
      return state.cart.reduce((total, item) => {
        return total + (item.price * item.qty)
      }, 0)
    },

    totalItems: (state): number => {
      return state.cart.reduce((total, item) => total + item.qty, 0)
    }
  },

  actions: {
    async fetchUnits(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        // Opsi 1: Menggunakan useFetch (untuk Nuxt)
        const { data, error } = await useFetch<Unit[]>('http://app.udpadijaya.com/api/unit', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          server: false, // Hanya di client side
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

    // Alternative method menggunakan fetch API biasa
    async fetchUnitsWithFetch(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://app.udpadijaya.com/api/unit', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        this.units = data || []
        console.log('Units loaded with fetch:', this.units.length)

      } catch (error: any) {
        this.error = 'Gagal memuat data unit'
        console.error('Error fetching units with fetch:', error)
      } finally {
        this.loading = false
      }
    },

    addToCart(unit: Unit, qty: number = 1): void {
      const existingItem = this.cart.find(item => item.id === unit.id)

      if (existingItem) {
        if (existingItem.qty + qty <= unit.stock) {
          existingItem.qty += qty
        } else {
          throw new Error(`Stok tidak mencukupi. Sisa stok: ${unit.stock}`)
        }
      } else {
        if (qty <= unit.stock) {
          this.cart.push({
            id: unit.id,
            unit_name: unit.unit_name,
            product_name: unit.product_name,
            product_name_type: unit.product_name_type,
            price: unit.price,
            stock: unit.stock,
            qty: qty
          })
        } else {
          throw new Error(`Stok tidak mencukupi. Sisa stok: ${unit.stock}`)
        }
      }
    },

    updateCartItemQty(unitId: number, newQty: number): void {
      const item = this.cart.find(item => item.id === unitId)
      const unit = this.units.find(unit => unit.id === unitId)

      if (item && unit) {
        if (newQty <= 0) {
          this.removeFromCart(unitId)
        } else if (newQty <= unit.stock) {
          item.qty = newQty
        } else {
          throw new Error(`Stok tidak mencukupi. Sisa stok: ${unit.stock}`)
        }
      }
    },

    removeFromCart(unitId: number): void {
      const index = this.cart.findIndex(item => item.id === unitId)
      if (index > -1) {
        this.cart.splice(index, 1)
      }
    },

    clearCart(): void {
      this.cart = []
    },

async processPayment(): Promise<{ success: boolean; message: string }> {
  if (this.cart.length === 0) {
    throw new Error('Keranjang kosong')
  }

  this.loading = true
  this.error = null

  try {
    const token = useCookie('token')

    for (const item of this.cart) {
      const response = await fetch('http://app.udpadijaya.com/api/sales-order-detail', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({
          id_unit: item.id,
          qty: item.qty
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Gagal memproses item')
      }
    }

    // ✅ Kirim permintaan untuk menyelesaikan transaksi
    const completeResponse = await fetch('http://app.udpadijaya.com/api/sales-order/complete', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!completeResponse.ok) {
      const err = await completeResponse.json()
      throw new Error(err.message || 'Gagal menyelesaikan transaksi')
    }

    // ✅ Jika berhasil, clear cart dan refresh units
    this.clearCart()
    await this.fetchUnits()

    return { success: true, message: 'Transaksi berhasil diproses' }

  } catch (error: any) {
    this.error = error.message || 'Gagal memproses pembayaran'
    throw error
  } finally {
    this.loading = false
  }
}

  }
})
