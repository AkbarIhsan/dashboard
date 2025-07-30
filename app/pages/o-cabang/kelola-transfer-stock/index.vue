<!-- kelola-transfer-stock.vue -->
<template>
  <div class="">
    <!-- Tab Navigation -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.id
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
        ]"
      >
        {{ tab.name }}
        <span v-if="tab.count" class="ml-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Request Barang Tab -->
    <div v-if="activeTab === 'request'" class="flex flex-col justify-between gap-5 mb-5">
      <!-- Request Form Section (Left) -->
      <div class="flex-col flex gap-3 w-full">
        <div class="w-full h-[460px]">
          <UCard class="w-full h-full flex flex-col overflow-y-hidden">
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">Form Permintaan Transfer Stock</h3>
              </div>
            </template>

            <div class="space-y-4 p-4">
              <!-- Branch Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Cabang Tujuan
                </label>
                <select
                  v-model="selectedBranch"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                  :disabled="store.loading"
                >
                  <option value="">Pilih cabang...</option>
                  <option v-for="branch in store.branches" :key="branch.id" :value="branch.id">
                    {{ branch.branch_name }}
                  </option>
                </select>
                <!-- <pre>{{ store.branches }}</pre> -->
              </div>

              <!-- Unit Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Barang yang Diminta
                </label>
  <div class="relative">
    <input
      v-model="search"
      @focus="open = true"
      @blur="closeDropdown"
      @input="filterUnits"
      placeholder="Pilih Barang..."
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
    <ul
      v-if="open && filteredUnits.length"
      class="absolute z-10 w-full dark:bg-gray-800 border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto"
    >
      <li
        v-for="unit in filteredUnits"
        :key="unit.id"
        @mousedown.prevent="selectUnit(unit)"
        class="px-3 py-2 dark:hover:bg-gray-700 cursor-pointer"
      >
        {{ unit.product_name_type }} (Stok: {{ unit.stock }})
      </li>
    </ul>
  </div>
              </div>

              <!-- Quantity Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah yang Diminta
                </label>
                <UInput
                  v-model.number="requestQuantity"
                  type="number"
                  min="1"
                  placeholder="Masukkan jumlah..."
                  size="lg"
                  :disabled="store.loading"
                />
              </div>

              <!-- Submit Button -->
              <UButton
                color="primary"
                size="lg"
                class="w-full"
                :loading="store.loading"
                :disabled="!selectedBranch || !selectedUnit || !requestQuantity || requestQuantity <= 0"
                @click="submitRequest"
              >
                Kirim Permintaan Transfer
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- My Requests Section (Right) -->
      <div class="w-full h-[460px]">
        <UCard class="w-full h-full flex flex-col overflow-hidden">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Permintaan Saya</h3>
              <UButton
                icon="i-heroicons-arrow-path"
                variant="outline"
                size="sm"
                :loading="store.loading"
                @click="store.fetchTransferStocks()"
              >
                Refresh
              </UButton>
            </div>
          </template>

          <div class="max-h-[350px] overflow-y-auto pr-2">
            <div v-if="store.loading && store.transferStocks.length === 0"
                class="flex items-center justify-center h-full">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
            </div>

            <div v-else-if="store.error"
                class="flex items-center justify-center h-full text-red-500">
              <div class="text-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-2" />
                <p>{{ store.error }}</p>
              </div>
            </div>

            <div v-else-if="store.myTransfers.length === 0"
                class="flex items-center justify-center h-full text-gray-500">
              <div class="text-center">
                <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada permintaan transfer</p>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div v-for="transfer in store.myTransfers" :key="transfer.id"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <h4 class="font-medium text-sm">{{ transfer.unit_request.product_type.product_name_type }}</h4>
                    <p class="text-xs text-gray-500">
                      {{ transfer.unit_request.unit_name }}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">
                      Ke: {{ transfer.user2.username }} | Qty: {{ transfer.qty_product_request }}
                    </p>
                  </div>
                  <UBadge
                    :label="transfer.status"
                    :color="getStatusColor(transfer.status)"
                    variant="subtle"
                  />
                </div>

                <div class="flex justify-between items-center mt-2">
                  <p class="text-xs text-gray-500">
                    {{ formatDate(transfer.created_at) }}
                  </p>
                  <div class="flex gap-2">
                    <UButton
                      v-if="transfer.status === 'pending'"
                      size="xs"
                      color="error"
                      variant="outline"
                      @click="deleteTransfer(transfer.id)"
                    >
                      Hapus
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Permintaan Masuk Tab -->
    <div v-if="activeTab === 'incoming'" class="mb-5">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Permintaan Masuk</h3>
            <UButton
              icon="i-heroicons-arrow-path"
              variant="outline"
              size="sm"
              :loading="store.loading"
              @click="store.fetchTransferStocks()"
            >
              Refresh
            </UButton>
          </div>
        </template>

        <div v-if="store.loading && store.transferStocks.length === 0"
            class="flex items-center justify-center h-32">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        </div>

        <div v-else-if="store.error"
            class="flex items-center justify-center h-32 text-red-500">
          <div class="text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-2" />
            <p>{{ store.error }}</p>
          </div>
        </div>

        <div
          v-else-if="store.incomingRequests.filter(t => t.status === 'pending').length === 0"
          class="flex items-center justify-center h-32 text-gray-500"
        >
          <div class="text-center">
            <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada permintaan masuk</p>
          </div>
        </div>


        <div v-else class="space-y-4">
          <div v-for="transfer in store.incomingRequests.filter(t => t.status === 'pending')" :key="transfer.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h4 class="font-medium text-base">{{ transfer.unit_request.product_type.product_name_type }}</h4>
                <p class="text-sm text-gray-600">
                  {{ transfer.unit_request.unit_name }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  Dari: {{ transfer.user.username }} | Jumlah: {{ transfer.qty_product_request }}
                </p>
              </div>
              <UBadge
                :label="transfer.status"
                :color="getStatusColor(transfer.status)"
                variant="subtle"
              />
            </div>

            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-500">
                {{ formatDate(transfer.created_at) }}
              </p>
              <div class="flex gap-2">
                <UButton
                  size="sm"
                  color="success"
                  @click="updateStatus(transfer.id, 'success')"
                  :loading="store.loading"
                >
                  Terima
                </UButton>
                <UButton
                  size="sm"
                  color="error"
                  variant="outline"
                  @click="updateStatus(transfer.id, 'rejected')"
                  :loading="store.loading"
                >
                  Tolak
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Success/Error Notifications -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { success } from 'zod/v4'
import { useTransferStockStore } from '~/store/transferStock'

const store = useTransferStockStore()
const toast = useToast()


const search = ref('')
const open = ref(false)
const filteredUnits = ref([...store.units])

function filterUnits() {
  filteredUnits.value = store.units.filter((unit) =>
    unit.product_name_type?.toLowerCase().includes(search.value.toLowerCase())
  )
}

function selectUnit(unit: any) {
  search.value = `${unit.product_name_type}`
  selectedUnit.value = unit.id
  open.value = false
}

function closeDropdown() {
  // delay agar bisa klik dulu sebelum blur
  setTimeout(() => {
    open.value = false
  }, 200)
}

// Tab management
const activeTab = ref('request')
const tabs = computed(() => [
  { id: 'request', name: 'Request Barang', count: null },
  {
    id: 'incoming',
    name: 'Permintaan Masuk',
    count: store.incomingRequests.filter(t => t.status === 'pending').length || null
  }
])


// Form data
const selectedBranch = ref<number | ''>('')
const selectedUnit = ref<number | ''>('')
const requestQuantity = ref<number>(1)

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'success': return 'success'
    case 'rejected': return 'error'
    default: return 'info'
  }
}

// Actions
const submitRequest = async () => {
  if (!selectedBranch.value || !selectedUnit.value || !requestQuantity.value) {
    toast.add({
      title: 'Error',
      description: 'Semua field harus diisi',
      color: 'error'
    })
    return
  }

  try {
    const result = await store.createTransferStock({
      id_branch: selectedBranch.value as number,
      id_unit_request: selectedUnit.value as number,
      qty_product_request: requestQuantity.value
    })

    toast.add({
      title: 'Berhasil',
      description: result.message,
      color: 'success'
    })

    // Reset form
    selectedBranch.value = ''
    selectedUnit.value = ''
    requestQuantity.value = 1

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    })
  }
}

const updateStatus = async (id: number, status: 'success' | 'rejected') => {
  try {
    const result = await store.updateTransferStock(id, status)

    toast.add({
      title: 'Berhasil',
      description: result.message,
      color: 'success'
    })

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    })
  }
}

const deleteTransfer = async (id: number) => {
  try {
    const result = await store.deleteTransferStock(id)

    toast.add({
      title: 'Berhasil',
      description: result.message,
      color: 'success'
    })

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    })
  }
}

// Lifecycle
  await store.fetchTransferStocks()
  await store.fetchBranches()
  await store.fetchUnits()
</script>
