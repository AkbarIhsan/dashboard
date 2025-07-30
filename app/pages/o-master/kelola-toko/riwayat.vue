<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Toko</h1>
      <div class="flex space-x-2">
        <UInput
          v-model="searchQuery"
          placeholder="Cari toko..."
          icon="i-heroicons-magnifying-glass"
          class="w-64"
        />
        <UButton @click="refreshData" color="secondary" variant="outline">
          <Icon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Branches Table -->
    <UCard v-else>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Riwayat Semua Toko</h3>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Total: {{ filteredBranches.length }} toko
          </div>
        </div>
      </template>

      <div v-if="filteredBranches.length === 0" class="text-center py-12">
        <Icon name="i-heroicons-building-storefront" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Belum ada toko yang terdaftar</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <!-- <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ID</th> -->
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nama Toko</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Alamat</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in paginatedBranches" :key="branch.id" class="border-b border-gray-100 dark:border-gray-800">
              <!-- <td class="py-3 px-4 text-gray-900 dark:text-gray-100">{{ branch.id }}</td> -->
              <td class="py-3 px-4 text-gray-900 dark:text-gray-100">{{ branch.branch_name }}</td>
              <td class="py-3 px-4 text-gray-500 dark:text-gray-400">{{ branch.branch_address }}</td>
              <td class="py-3 px-4">
                <UBadge color="success" variant="solid">
                  Aktif
                </UBadge>
              </td>
              <td class="py-3 px-4">
                <UButton
                  @click="viewDetails(branch)"
                  color="info"
                  variant="ghost"
                  size="sm"
                >
                  <Icon name="i-heroicons-eye" class="w-4 h-4" />
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredBranches.length > itemsPerPage" class="flex justify-center mt-6">
        <UPagination
          v-model="currentPage"
          :page-count="itemsPerPage"
          :total="filteredBranches.length"
        />
      </div>
    </UCard>

    <!-- Detail Modal -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Detail Toko</h3>
        </template>

        <div v-if="selectedBranch" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Toko
              </label>
              <p class="text-gray-900 dark:text-gray-100">
                {{ selectedBranch.id }}
              </p>
            </div> -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Toko
              </label>
              <p class="text-gray-900 dark:text-gray-100">
                {{ selectedBranch.branch_name }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alamat Toko
            </label>
            <p class="text-gray-900 dark:text-gray-100">
              {{ selectedBranch.branch_address }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <UBadge color="success" variant="solid">
              Aktif
            </UBadge>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <UButton @click="showDetailModal = false" color="primary" variant="ghost">
            Tutup
          </UButton>
        </div>
      </UCard>
  </div>
</template>

<script setup lang="ts">
import { useBranchStore, type Branch } from '~/store/branch'

const branchStore = useBranchStore()
const { branches, loading } = storeToRefs(branchStore)

// State
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showDetailModal = ref(false)
const selectedBranch = ref<Branch | null>(null)

// Computed
const filteredBranches = computed(() => {
  let filtered = branches.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(branch =>
      branch.branch_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      branch.branch_address.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const paginatedBranches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBranches.value.slice(start, end)
})

// Methods
const refreshData = async () => {
  await branchStore.fetchBranches()
}

const viewDetails = (branch: Branch) => {
  selectedBranch.value = branch
  showDetailModal.value = true
}

// Lifecycle
onMounted(async () => {
  await branchStore.fetchBranches()
})
</script>
