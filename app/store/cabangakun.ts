// stores/ownercabang.ts
import { defineStore } from 'pinia'

interface OwnerCabangForm {
  name: string
  email: string
  username: string
  password: string
  id_role: number
  id_branch: number
}

interface User {
  id: number
  name: string
  email: string
  username: string
  id_role: number
  branch?:{
    id: number
    branch_name: string
    branch_address: string
  }
  role_name?: string
  created_at?: string
  updated_at?: string
}

interface UserResponse {
  data?: User[]
  users?: User[]  // Alternatif struktur response
  message?: string
}

interface RegisterResponse {
  message: string
  user?: User
}

interface Branch {
  id: number
  branch_name: string
  address?: string
  created_at?: string
  updated_at?: string
}

interface BranchResponse {
  data?: Branch[]
  branches?: Branch[]
  message?: string
}

export const useOwnerCabangStore = defineStore('ownerCabang', {
  state: () => ({
    ownerCabangList: [] as User[],
    branchList: [] as Branch[],
    loading: false,
    error: null as string | null,
    currentUser: null as User | null
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await $fetch<UserResponse>('http://app.udpadijaya.com/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          }
        })

        // Handle different response structures
        let users: User[] = []
        if (response.data && Array.isArray(response.data)) {
          users = response.data
        } else if (response.users && Array.isArray(response.users)) {
          users = response.users
        } else if (Array.isArray(response)) {
          users = response as User[]
        }

        this.ownerCabangList = users

        // Set current user (assume first user or find by some logic)
        if (users.length > 0 && users[0]) {
          this.currentUser = users[0]
        }

      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Gagal mengambil data pengguna'
        console.error('Error fetching users:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchBranches() {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const response = await $fetch<BranchResponse>('http://app.udpadijaya.com/api/branch', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          }
        })

        // Handle different response structures
        let branches: Branch[] = []
        if (response.data && Array.isArray(response.data)) {
          branches = response.data
        } else if (response.branches && Array.isArray(response.branches)) {
          branches = response.branches
        } else if (Array.isArray(response)) {
          branches = response as Branch[]
        }

        this.branchList = branches

      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Gagal mengambil data cabang'
        console.error('Error fetching branches:', err)
      } finally {
        this.loading = false
      }
    },

    async createOwnerCabang(formData: Omit<OwnerCabangForm, 'id_role'>) {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        const ownerCabangData: OwnerCabangForm = {
          ...formData,
          id_role: 2, // Role owner cabang (sesuaikan dengan database Anda)
        }

        const response = await $fetch<RegisterResponse>('http://app.udpadijaya.com/api/register', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          },
          body: ownerCabangData
        })

        // Refresh user list setelah berhasil membuat akun
        await this.fetchUsers()

        return response

      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Gagal membuat akun owner cabang'
        console.error('Error creating owner cabang:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    ownerCabangOnly: (state) => {
      return state.ownerCabangList.filter(user => user.id_role === 2)
    },

    availableBranches: (state) => {
      // Filter branches yang belum memiliki owner cabang
      const ownerCabangBranchIds = state.ownerCabangList
        .filter(user => user.id_role === 2)
        .map(user => user.branch?.id)
        .filter(id => id !== undefined)

      return state.branchList.filter(branch =>
        !ownerCabangBranchIds.includes(branch.id)
      )
    },

    getBranchById: (state) => (id: number) => {
      return state.branchList.find(branch => branch.id === id)
    }
  }
})
