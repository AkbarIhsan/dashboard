<template>
  <div class="container ">
    <!-- Header -->
    <!-- Form Create Kasir -->
    <div class="rounded-lg border border-gray-800 shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold  mb-6">Buat Akun Kasir Baru</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Informasi Branch (Read-only) -->
        <div class="bg-elevated p-4 rounded-lg border border-gray-800">
          <h3 class="text-sm font-medium text-info-800 mb-2">Informasi </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-info-700 mb-1">Toko Cabang</label>
              <input
                type="text"
                :value="kasirStore.getCurrentBranchName"
                readonly
                class="w-full px-3 py-2 border border-info-300 rounded-md bg-info-100 text-info-800 cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-info-700 mb-1">Role</label>
              <input
                type="text"
                value="Kasir"
                readonly
                class="w-full px-3 py-2 border border-info-300 rounded-md bg-info-100 text-info-800 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="contoh@email.com"
            />
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="username_kasir"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Minimal 8 karakter"
                minlength="8"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m3.001 3.001L21 21M12 12l-3-3m0 0l-3-3m3 3l3-3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="kasirStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <p class="text-sm text-red-700 mt-1">{{ kasirStore.error }}</p>
            </div>
            <div class="ml-auto pl-3">
              <button
                @click="kasirStore.clearError()"
                class="inline-flex text-red-400 hover:text-red-600"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-2 border border-gray-300 rounded-md hover:bg-elevated focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="kasirStore.loading"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <svg v-if="kasirStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ kasirStore.loading ? 'Membuat...' : 'Buat Akun Kasir' }}
          </button>
        </div>
      </form>
    </div>

<div class=" rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        5 Kasir Terbaru
      </h2>
      <div class="flex gap-2">
        <NuxtLink
          to="/o-cabang/kelola-akun-kasir/riwayat"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Lihat Riwayat
        </NuxtLink>
        <button
          @click="kasirStore.fetchUsers()"
          :disabled="kasirStore.loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </div>
  </div>

  <div v-if="kasirStore.loading && kasirStore.kasirList.length === 0" class="flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>

  <div v-else-if="latestKasirList.length === 0" class="text-center py-12">
    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada kasir</h3>
    <p class="text-gray-500 dark:text-gray-400">Belum ada kasir yang terdaftar</p>
  </div>

  <div v-else class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class=" border-b border-gray-200 dark:border-gray-600">
          <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nama</th>
          <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
          <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Username</th>
          <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Toko Cabang</th>
          <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Dibuat</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="(kasir, index) in latestKasirList"
          :key="kasir.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': index % 2 === 0 }"
        >
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {{ kasir.name?.charAt(0).toUpperCase() || 'K' }}
              </div>
              <span class="font-medium text-gray-900 dark:text-white">{{ kasir.name }}</span>
              <span v-if="index === 0" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                Terbaru
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ kasir.email }}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              {{ kasir.username }}
            </span>
          </td>
          <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
            {{ kasir.branch?.branch_name || `Branch ${kasir.branch?.id}` }}
          </td>
          <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
            {{ kasir.created_at ? new Date(kasir.created_at).toLocaleDateString('id-ID') : '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Show total count if more than 5 -->
  <div v-if="kasirStore.kasirOnly.length > 5" class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
    <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
      Menampilkan 5 dari {{ kasirStore.kasirOnly.length }} kasir.
      <NuxtLink to="/riwayat" class="text-primary-600 hover:text-primary-700 font-medium">
        Lihat semua riwayat
      </NuxtLink>
    </p>
  </div>
</div>

    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-md shadow-lg z-50 transform transition-transform duration-300"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Akun kasir berhasil dibuat!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKasirAkunStore } from '~/store/kasirakun'

// Store
const kasirStore = useKasirAkunStore()

// Form data
const form = ref({
  name: '',
  email: '',
  username: '',
  password: ''
})

// UI state
const showPassword = ref(false)
const showSuccessToast = ref(false)

// Computed property untuk menampilkan 5 data terbaru
const latestKasirList = computed(() => {
  const sortedKasir = [...kasirStore.kasirOnly].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return dateB - dateA // Sort descending (terbaru dulu)
  })
  return sortedKasir.slice(0, 5) // Ambil 5 data teratas
})

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    username: '',
    password: ''
  }
  kasirStore.clearError()
}

const handleSubmit = async () => {
  try {
    await kasirStore.createKasir(form.value)

    // Show success toast
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)

    // Reset form
    resetForm()

  } catch (error) {
    // Error handled by store
    console.error('Failed to create kasir account:', error)
  }
}

// Initialize
onMounted(async () => {
  console.log('Initializing kasir page...')
  try {
    await kasirStore.fetchUsers()
    console.log('Users loaded:', kasirStore.kasirList)
    console.log('Current user:', kasirStore.currentUser)
  } catch (error) {
    console.error('Error initializing:', error)
  }
})
</script>
