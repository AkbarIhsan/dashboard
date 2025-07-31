<script lang="ts" setup>
definePageMeta({
  layout: 'custom-login',
})

import { ref } from 'vue'
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const toast = useToast()

interface Role {
  id: number
  name_role: string
}

interface LoginResponse {
  token: string
  user: User
}


interface User {
  id: number
  username: string
  id_role: number
  role: Role
}

const handleLogin = async () => {
  isLoading.value = true

  try {
    const res = await $fetch<LoginResponse>('http://app.udpadijaya.com/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
      },
    })

    console.log('Login response:', res)

    if (!res.user.role) {
      toast.add({ title: 'Login Gagal', description: 'Akun tidak memiliki role.', color: 'error' })
      return
    }

    // ⬅️ Simpan token ke localStorage
    const token = useCookie('token')
    token.value = res.token

    const role = res.user.role.name_role

    // Redirect sesuai role
    if (role === 'Owner Master') {
      await navigateTo('/o-master')
    } else if (role === 'Owner Cabang') {
      await navigateTo('/o-cabang')
    } else if (role === 'Kasir') {
      await navigateTo('/kasir')
    } else {
      toast.add({ title: 'Error', description: 'Role tidak dikenali', color: 'error' })
    }

  } catch (err) {
    toast.add({ title: 'Login Gagal', description: 'Username atau password salah.', color: 'error' })
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center ">
    <div class="w-full max-w-md p-8 rounded-xl shadow-lg space-y-6">
      <h1 class="text-2xl font-semibold text-center">Login</h1>

      <form @submit.prevent="() => handleLogin()" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium text-gray-700">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary-300"
            placeholder="Masukkan username"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary-300"
            placeholder="Masukkan password"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>
