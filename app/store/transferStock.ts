// stores/transferStockStore.ts
import { defineStore } from 'pinia'

interface Branch {
  id: number
  branch_name: string
}

interface Unit {
  id: number
  unit_name: string
  stock: number
  min_stock: number
  id_product_type: number
  product_name: string | null
  product_name_type: string | null
}

interface TransferStock {
  id: number
  id_user: number
  id_user_2: number
  id_unit_request: number
  id_unit_gives: number
  qty_product_request: number
  status: 'pending' | 'success' | 'rejected'
  created_at: string
  user: {
    id: number
    username: string
    branchs: Branch
  }
  user2: {
    id: number
    username: string
  }
  unit_request: {
    id: number
    unit_name: string
    id_product_type: number
    product_type: {
      id: number
      product_name_type: string
    }
  }
  unit_gives: {
    id: number
    unit_name: string
    id_product_type: number
    product_type: {
      id: number
      product_name_type: string
    }
  }
}

interface TransferStockState {
  transferStocks: TransferStock[]
  myTransfers: TransferStock[]
  incomingRequests: TransferStock[]
  branches: Branch[]
  units: Unit[]
  loading: boolean
  error: string | null
}

export const useTransferStockStore = defineStore('transferStock', {
  state: (): TransferStockState => ({
    transferStocks: [],
    myTransfers: [],
    incomingRequests: [],
    branches: [],
    units: [],
    loading: false,
    error: null
  }),

  getters: {
    requestedTransfers: (state): TransferStock[] => {
      return state.transferStocks.filter(transfer => transfer.status === 'pending')
    },

    // myTransfers: (state): TransferStock[] => {
    //   return state.transferStocks
    // },

    // incomingRequests: (state): TransferStock[] => {
    //   return state.transferStocks.filter(transfer => transfer.status === 'pending')
    // }
  },

  actions: {
    async fetchBranches(): Promise<void> {
      try {
        const token = useCookie('token')
        const { data, error } = await useFetch<{ message: string; data: Branch[] }>('http://app.udpadijaya.com/api/branch', {
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

        this.branches = data.value?.data || []
      } catch (error: any) {
        this.error = 'Gagal memuat data cabang'
        console.error('Error fetching branches:', error)
      }
    },

    async fetchUnits(): Promise<void> {
      try {
        const token = useCookie('token')
        const { data, error } = await useFetch<Unit[]>('http://app.udpadijaya.com/api/unit', {
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
      } catch (error: any) {
        this.error = 'Gagal memuat data unit'
        console.error('Error fetching units:', error)
      }
    },

async fetchTransferStocks(): Promise<void> {
  this.loading = true
  this.error = null

  try {
    const token = useCookie('token')
    const { data, error } = await useFetch<{
      message: string
      data: {
        my_requests: TransferStock[]
        incoming_requests: TransferStock[]
      }
    }>('http://app.udpadijaya.com/api/transfer-stock', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      server: false,
    })

    if (error.value) throw error.value

    this.myTransfers = data.value?.data.my_requests || []
    this.incomingRequests = data.value?.data.incoming_requests || []

  } catch (error: any) {
    this.error = 'Gagal memuat data transfer stock'
    console.error('Error fetching transfer stocks:', error)
  } finally {
    this.loading = false
  }
},

    async createTransferStock(requestData: {
      id_branch: number
      id_unit_request: number
      qty_product_request: number
    }): Promise<{ success: boolean; message: string }> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await fetch('http://app.udpadijaya.com/api/transfer-stock', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify(requestData)
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Gagal membuat transfer stock')
        }

        // Refresh data setelah berhasil
        await this.fetchTransferStocks()

        return { success: true, message: responseData.message || 'Transfer stock berhasil dibuat' }

      } catch (error: any) {
        this.error = error.message || 'Gagal membuat transfer stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTransferStock(id: number, status: 'pending' | 'success' | 'rejected'): Promise<{ success: boolean; message: string }> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await fetch(`http://app.udpadijaya.com/api/transfer-stock/${id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify({ status })
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Gagal mengupdate transfer stock')
        }

        // Refresh data setelah berhasil
        await this.fetchTransferStocks()

        return { success: true, message: responseData.message || 'Status transfer stock berhasil diperbarui' }

      } catch (error: any) {
        this.error = error.message || 'Gagal mengupdate transfer stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTransferStock(id: number): Promise<{ success: boolean; message: string }> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await fetch(`http://app.udpadijaya.com/api/transfer-stock/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          }
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Gagal menghapus transfer stock')
        }

        // Refresh data setelah berhasil
        await this.fetchTransferStocks()

        return { success: true, message: responseData.message || 'Transfer stock berhasil dihapus' }

      } catch (error: any) {
        this.error = error.message || 'Gagal menghapus transfer stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getTransferStockDetail(id: number): Promise<TransferStock> {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await fetch(`http://app.udpadijaya.com/api/transfer-stock/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          }
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Gagal mengambil detail transfer stock')
        }

        return responseData.data

      } catch (error: any) {
        this.error = error.message || 'Gagal mengambil detail transfer stock'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
