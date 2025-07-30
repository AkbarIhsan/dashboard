// stores/kasirakun.ts
import { defineStore } from 'pinia'

interface KasirForm {
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

export const useKasirAkunStore = defineStore('kasirAkun', {
  state: () => ({
    kasirList: [] as User[],
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

        const response = await $fetch<UserResponse>('http://127.0.0.1:8000/api/user', {
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

        this.kasirList = users

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

    async createKasir(formData: Omit<KasirForm, 'id_role' | 'id_branch'>) {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')

        // Pastikan current user tersedia
        if (!this.currentUser || !this.currentUser.branch?.id) {
          await this.fetchUsers()
        }

        const kasirData: KasirForm = {
          ...formData,
          id_role: 3, // Role kasir
          id_branch: this.currentUser?.branch?.id || 1 // Ambil dari user yang sedang login
        }

        const response = await $fetch<RegisterResponse>('http://127.0.0.1:8000/api/register', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          },
          body: kasirData
        })

        // Refresh user list setelah berhasil membuat akun
        await this.fetchUsers()

        return response

      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Gagal membuat akun kasir'
        console.error('Error creating kasir:', err)
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
    kasirOnly: (state) => {
      return state.kasirList.filter(user => user.id_role === 3)
    },

    getCurrentBranchName: (state) => {
      return state.currentUser?.branch?.branch_name || 'Unknown Branch'
    },

    getCurrentBranchId: (state) => {
      return state.currentUser?.branch?.id || 1
    }
  }
})
