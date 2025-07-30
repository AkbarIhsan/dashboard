<template>
  <div class="container mx-auto">
    <!-- Header -->
    <div class="mb-3">
      <div class="flex items-center justify-end">
        <!-- <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Riwayat Kasir</h1>
          <p class="text-gray-600 dark:text-gray-400">Daftar lengkap semua kasir yang terdaftar</p>
        </div> -->
        <div class="flex gap-3">
          <!-- <NuxtLink
            to="/"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Kembali
          </NuxtLink> -->
          <button
            @click="refreshData"
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

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cari Kasir</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nama, email, atau username..."
              class="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urutkan</label>
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama (A-Z)</option>
            <option value="name_desc">Nama (Z-A)</option>
          </select>
        </div>

        <!-- Items per page -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data per halaman</label>
          <select
            v-model="itemsPerPage"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Stats -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total: <span class="font-semibold text-gray-900 dark:text-white">{{ filteredKasirList.length }}</span> kasir
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="kasirStore.loading && kasirStore.kasirList.length === 0" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredKasirList.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada data</h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery ? 'Tidak ada kasir yang sesuai dengan pencarian' : 'Belum ada kasir yang terdaftar' }}
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
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Toko Cabang</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Dibuat</th>
              <!-- <th class="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th> -->
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(kasir, index) in paginatedKasirList"
              :key="kasir.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': index % 2 === 0 }"
            >
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ getRowNumber(index) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ kasir.name?.charAt(0).toUpperCase() || 'K' }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ kasir.name }}</div>
                    <!-- <div v-if="isRecentlyCreated(kasir.created_at)" class="text-xs text-green-600 dark:text-green-400">
                      Baru ditambahkan
                    </div> -->
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                <div class="max-w-xs truncate" :title="kasir.email">
                  {{ kasir.email }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                  {{ kasir.username }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                {{ kasir.branch?.branch_name || `Branch ${kasir.branch?.id}` }}
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                <div>{{ kasir.created_at ? new Date(kasir.created_at).toLocaleDateString('id-ID') : '-' }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ kasir.created_at ? new Date(kasir.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '' }}
                </div>
              </td>
              <!-- <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                  Aktif
                </span>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredKasirList.length) }} dari {{ filteredKasirList.length }} data
          </div>

          <div class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Sebelumnya
            </button>

            <!-- Page Numbers -->
            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(Number(page))"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  page === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next Button -->
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              Selanjutnya
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
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
import { useKasirAkunStore } from '~/store/kasirakun'

// Store
const kasirStore = useKasirAkunStore()

// Reactive data
const searchQuery = ref('')
const sortBy = ref('newest')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Computed properties
const filteredKasirList = computed(() => {
  let filtered = [...kasirStore.kasirOnly]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(kasir =>
      kasir.name?.toLowerCase().includes(query) ||
      kasir.email?.toLowerCase().includes(query) ||
      kasir.username?.toLowerCase().includes(query)
    )
  }

  // Sort data
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      break
    case 'name':
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      break
    case 'name_desc':
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      break
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredKasirList.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedKasirList = computed(() => {
  return filteredKasirList.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages.filter(page => page !== '...' || true)
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getRowNumber = (index: number) => {
  return startIndex.value + index + 1
}

const isRecentlyCreated = (createdAt: string) => {
  if (!createdAt) return false
  const now = new Date()
  const created = new Date(createdAt)
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24 // Within 24 hours
}

const refreshData = async () => {
  await kasirStore.fetchUsers()
}

// Watchers
watch([searchQuery, sortBy, itemsPerPage], () => {
  currentPage.value = 1
})

// Initialize
onMounted(async () => {
  if (kasirStore.kasirList.length === 0) {
    await kasirStore.fetchUsers()
  }
})
</script>
