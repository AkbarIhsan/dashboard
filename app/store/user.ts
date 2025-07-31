// stores/user.ts
import { defineStore } from 'pinia'

interface Role {
  id: number
  role_name: string
}

interface Branch {
  id: number
  branch_name: string
}

interface User {
  id: number
  username: string
  email?: string
  name?: string
  id_role: number
  id_branch: number
  role: Role
  branch: Branch
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed untuk display name
  const displayName = computed(() => {
    if (!user.value) return 'Unknown User'
    return user.value.name || user.value.username || 'User'
  })

  // Computed untuk avatar (menggunakan initial dari nama)
  const avatar = computed(() => {
    if (!user.value) return { src: '', alt: 'User' }

    const name = displayName.value
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()

    return {
      src: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`,
      alt: name,
      initials
    }
  })

  // Fetch user data dari API
  const fetchUser = async () => {
    loading.value = true
    error.value = null

    try {
      const token = useCookie('token')

      if (!token.value) {
        throw new Error('No token found')
      }

      const userData = await $fetch<User>('http://app.udpadijaya.com/api/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json'
        }
      })

      user.value = userData
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user data'
      console.error('Error fetching user:', err)

      // Jika token invalid, redirect ke login
      if (err.status === 401) {
        const token = useCookie('token')
        token.value = null
        await navigateTo('/')
      }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    const token = useCookie('token')

    try {
      await $fetch('http://app.udpadijaya.com/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json'
        }
      })
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      // Hapus token dan user data
      token.value = null
      user.value = null

      // Redirect ke halaman login
      await navigateTo('/')
    }
  }

  // Clear user data
  const clearUser = () => {
    user.value = null
    error.value = null
  }

  return {
    user,
    loading,
    error,
    displayName,
    avatar,
    fetchUser,
    logout,
    clearUser
  }
})
