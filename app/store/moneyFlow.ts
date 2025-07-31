// stores/moneyFlow.ts
import { defineStore } from 'pinia'

interface MoneyFlow {
  id: number
  id_user: number
  id_flow_type: number
  qty_money: number
  description: string
  date: string
  created_at: string
  updated_at?: string
  flow_type?: {
    id: number
    name_flow: 'masuk' | 'keluar'
  }
  users?: User
}

interface Branch{
  branch_name: string
}

interface User{
  id: number
  branch: Branch
}

interface MoneyFlowState {
  moneyFlows: MoneyFlow[]
  isLoading: boolean
  error: string | null
}

interface CreateMoneyFlowPayload {
  id_flow_type: string
  qty_money: number
  description: string
}

export const useMoneyFlowStore = defineStore('moneyFlow', {
  state: (): MoneyFlowState => ({
    moneyFlows: [],
    isLoading: false,
    error: null
  }),

  getters: {
    // Total pemasukan
    totalIncome: (state): number => {
      return state.moneyFlows
        .filter(flow => flow.flow_type?.name_flow === 'masuk')
        .reduce((sum, flow) => sum + flow.qty_money, 0)
    },

    // Total pengeluaran
    totalExpense: (state): number => {
      return state.moneyFlows
        .filter(flow => flow.flow_type?.name_flow === 'keluar')
        .reduce((sum, flow) => sum + flow.qty_money, 0)
    },

    // Saldo (pemasukan - pengeluaran)
    balance(): number {
      return this.totalIncome - this.totalExpense
    },

    // // Money flows berdasarkan tipe
    // incomeFlows: (state): MoneyFlow[] => {
    //   return state.moneyFlows.filter(flow => flow.flow_type?.id === '1')
    // },

    // expenseFlows: (state): MoneyFlow[] => {
    //   return state.moneyFlows.filter(flow => flow.flow_type?.id === '2')
    // },

    // Money flows terbaru (5 terakhir)
    recentFlows: (state): MoneyFlow[] => {
      return state.moneyFlows
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    }
  },

  actions: {
    // Fetch semua money flows
    async fetchMoneyFlows() {
      this.isLoading = true
      this.error = null

      try {
        const token = useCookie('token')
        const data = await $fetch<MoneyFlow[]>('http://app.udpadijaya.com/api/mny', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token.value}`,
          }
        })

        this.moneyFlows = data || []
      } catch (error: any) {
        this.error = error.message || 'Gagal mengambil data transaksi'
        console.error('Error fetching money flows:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Buat money flow baru
    async createMoneyFlow(payload: CreateMoneyFlowPayload) {
      this.isLoading = true
      this.error = null

      try {
        const token = useCookie('token')
        const data = await $fetch<MoneyFlow>('http://app.udpadijaya.com/api/mny', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: payload
        })

        // Tambahkan ke state
        this.moneyFlows.unshift(data)

        return data
      } catch (error: any) {
        this.error = error.message || 'Gagal menambahkan transaksi'
        console.error('Error creating money flow:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Update money flow
    async updateMoneyFlow(id: number, payload: Partial<CreateMoneyFlowPayload>) {
      this.isLoading = true
      this.error = null

      try {
        const token = useCookie('token')
        const data = await $fetch<MoneyFlow>(`http://app.udpadijaya.com/api/mny/${id}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: payload
        })

        // Update di state
        const index = this.moneyFlows.findIndex(flow => flow.id === id)
        if (index !== -1) {
          this.moneyFlows[index] = data
        }

        return data
      } catch (error: any) {
        this.error = error.message || 'Gagal mengupdate transaksi'
        console.error('Error updating money flow:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Hapus money flow
    async deleteMoneyFlow(id: number) {
      this.isLoading = true
      this.error = null

      try {
        await $fetch(`http://app.udpadijaya.com/api/mny/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${useCookie('auth-token').value}`,
            'Accept': 'application/json'
          }
        })

        // Hapus dari state
        this.moneyFlows = this.moneyFlows.filter(flow => flow.id !== id)
      } catch (error: any) {
        this.error = error.message || 'Gagal menghapus transaksi'
        console.error('Error deleting money flow:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Reset state
    resetState() {
      this.moneyFlows = []
      this.isLoading = false
      this.error = null
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})
