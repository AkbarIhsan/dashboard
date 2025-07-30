<template>
  <div class="container">
    <!-- Header -->
    <!-- <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Owner Cabang</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Kelola semua akun owner cabang yang telah dibuat</p>
        </div>
        <NuxtLink
          to="/o-master/owner-cabang"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors duration-200 gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Buat Owner Baru
        </NuxtLink>
      </div>
    </div> -->

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Owner Cabang</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ ownerCabangStore.ownerCabangOnly.length }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Cabang Belum Terkelola</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ ownerCabangStore.availableBranches.length }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Ditambahkan Bulan Ini</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyCount }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan nama, email, atau username..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Branch Filter -->
        <div class="w-full md:w-64">
          <!-- <select
            v-model="selectedBranch"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Semua Cabang</option>
            <option
              v-for="branch in ownerCabangStore.branchList"
              :key="branch.id"
              :value="branch.id"
            >
              {{ branch.branch_name }}
            </option>
          </select> -->
        </div>

        <!-- Sort -->
        <div class="w-full md:w-48">
          <select
            v-model="sortOrder"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama A-Z</option>
            <option value="branch">Cabang A-Z</option>
          </select>
        </div>

        <!-- Refresh Button -->
        <button
          @click="refreshData"
          :disabled="ownerCabangStore.loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Daftar Owner Cabang
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ filteredOwnerCabang.length }} dari {{ ownerCabangStore.ownerCabangOnly.length }})
            </span>
          </h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredOwnerCabang.length) }} dari {{ filteredOwnerCabang.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="ownerCabangStore.loading && ownerCabangStore.ownerCabangList.length === 0" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOwnerCabang.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ searchQuery || selectedBranch ? 'Tidak ada hasil yang ditemukan' : 'Tidak ada owner cabang' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedBranch ? 'Coba ubah kata kunci pencarian atau filter' : 'Belum ada owner cabang yang terdaftar' }}
        </p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-600">
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">No</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nama</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Username</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Cabang</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Dibuat</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(owner, index) in paginatedOwnerCabang"
              :key="owner.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ owner.name?.charAt(0).toUpperCase() || 'O' }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ owner.name }}</p>
                    <!-- <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ owner.id }}</p> -->
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-700 dark:text-gray-300">{{ owner.email }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                  {{ owner.username }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <div>
                    <p class="text-gray-700 dark:text-gray-300">{{ owner.branch?.branch_name || `Cabang ${owner.branch?.id}` }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ owner.branch?.branch_address || '-' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-700 dark:text-gray-300">
                  {{ owner.created_at ? new Date(owner.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : '-' }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ owner.created_at ? new Date(owner.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                  <svg class="w-2 h-2 mr-1 fill-current" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Aktif
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Rows per page:
            </span>
            <select
              v-model="itemsPerPage"
              class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>

            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <span class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {{ currentPage }} of {{ totalPages }}
            </span>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useOwnerCabangStore } from '~/store/cabangakun'


  definePageMeta({
    layout: 'custom-1',
  })
// Store
const ownerCabangStore = useOwnerCabangStore()

// Search and filters
const searchQuery = ref('')
const selectedBranch = ref('')
const sortOrder = ref('newest')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const monthlyCount = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return ownerCabangStore.ownerCabangOnly.filter(owner => {
    if (!owner.created_at) return false
    const createdDate = new Date(owner.created_at)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length
})

const filteredOwnerCabang = computed(() => {
  let filtered = [...ownerCabangStore.ownerCabangOnly]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(owner =>
      owner.name?.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.username?.toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  // if (selectedBranch.value) {
  //   filtered = filtered.filter(owner => owner.id_branch === Number(selectedBranch.value))
  // }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case 'oldest':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'branch':
        return (a.branch?.branch_name || '').localeCompare(b.branch?.branch_name || '')
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredOwnerCabang.value.length / itemsPerPage.value)
})

const paginatedOwnerCabang = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOwnerCabang.value.slice(start, end)
})

// Methods
const refreshData = async () => {
  try {
    await Promise.all([
      ownerCabangStore.fetchUsers(),
      ownerCabangStore.fetchBranches()
    ])
  } catch (error) {
    console.error('Error refreshing data:', error)
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery, selectedBranch, sortOrder, itemsPerPage], () => {
  currentPage.value = 1
})

// Initialize
onMounted(async () => {
  console.log('Initializing owner cabang riwayat page...')
  try {
    await Promise.all([
      ownerCabangStore.fetchUsers(),
      ownerCabangStore.fetchBranches()
    ])
    console.log('Data loaded successfully')
  } catch (error) {
    console.error('Error initializing:', error)
  }
})
</script>
