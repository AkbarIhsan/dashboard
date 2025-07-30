[media pointer="file-service://file-8LTbog9LphJm7gnZSwFSjy"]
<script setup lang="ts">
import { useMoneyFlowStore } from '~/store/moneyFlow'

// Store
const moneyFlowStore = useMoneyFlowStore()

// State
const isLoading = ref(false)
const selectedTab = ref(0)

// Form data
const formData = ref({
  id_flow_type: '',
  qty_money: '',
  description: ''
})

// Flow types sesuai dengan database
const flowTypes = ref([
  { id: 1, name_flow: 'Masuk' },
  { id: 2, name_flow: 'Keluar' }
])

// Computed
const currentFlowType = computed(() => {
  return flowTypes.value[selectedTab.value] // index langsung
})

const tabLabel = computed(() => selectedTab.value == 0 ? 'Pemasukan' : 'Pengeluaran')
const tabIcon = computed(() => selectedTab.value == 0 ? 'i-lucide-arrow-down-circle' : 'i-lucide-arrow-up-circle')
const tabColor = computed(() => selectedTab.value == 0 ? 'primary' : 'error')

// Methods
const resetForm = () => {
  formData.value = {
    id_flow_type: currentFlowType.value?.id.toString() || '',
    qty_money: '',
    description: ''
  }
}

const submitForm = async () => {
  // Validasi form
  if (!formData.value.id_flow_type || !formData.value.qty_money || !formData.value.description) {
    console.error('Semua field harus diisi')
    // Show validation error - bisa tambahkan notifikasi di sini
    return
  }

  isLoading.value = true

  try {
    const payload = {
      id_flow_type: formData.value.id_flow_type, // Kirim sebagai string
      qty_money: parseInt(formData.value.qty_money),
      description: formData.value.description
    }

    // console.log('Payload yang dikirim:', payload) // Debug log

    await moneyFlowStore.createMoneyFlow(payload)
    resetForm()

    // Show success notification
    console.log('Kas berhasil ditambahkan!')
  } catch (error) {
    console.error('Error creating money flow:', error)
    // Show error notification
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Watch tab changes - perbaiki logika ini
watch(selectedTab, () => {
  const flowType = currentFlowType.value
  if (flowType) {
    formData.value.id_flow_type = flowType.id.toString()
  }
  formData.value.qty_money = ''
  formData.value.description = ''
}, { immediate: true })


// Lifecycle
onMounted(() => {
  resetForm()
  moneyFlowStore.fetchMoneyFlows()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Pemasukan</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(moneyFlowStore.totalIncome) }}
            </p>
          </div>
          <UIcon name="i-lucide-trending-up" class="w-8 h-8 text-green-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
            <p class="text-2xl font-bold text-red-600">
              {{ formatCurrency(moneyFlowStore.totalExpense) }}
            </p>
          </div>
          <UIcon name="i-lucide-trending-down" class="w-8 h-8 text-red-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
            <p class="text-2xl font-bold" :class="moneyFlowStore.balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(moneyFlowStore.balance) }}
            </p>
          </div>
          <UIcon name="i-lucide-wallet" class="w-8 h-8 text-blue-600" />
        </div>
      </UCard> -->
    </div>

    <!-- Form Input Transaksi -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Tambah Kas</h2>
      </template>

      <div class="space-y-6">
        <!-- Tabs - pastikan v-model bekerja dengan benar -->
        <UTabs
          v-model="selectedTab"
          :color="tabColor"
          :items="[
            { label: 'Pemasukan', icon: 'i-lucide-arrow-down-circle' },
            { label: 'Pengeluaran', icon: 'i-lucide-arrow-up-circle' }
          ]"
        />

        <!-- Debug info - hapus setelah berhasil -->
        <!-- <div class="text-xs text-gray-500">
          Debug: Tab aktif = {{ selectedTab }}, Flow Type ID = {{ formData.id_flow_type }}
        </div> -->

        <!-- Form -->
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="flex justify-between">
            <UFormGroup label="Jenis Kas">
              <UInput
                :value="tabLabel"
                readonly
                :icon="tabIcon"
                :class="`text-${tabColor}`"
              />
            </UFormGroup>

            <UFormGroup label="Jumlah" required>
              <UInput
                class=""
                v-model="formData.qty_money"
                type="number"
                placeholder="Masukkan jumlah"
                min="1"
                required
              >
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">Rp</span>
                </template>
              </UInput>
            </UFormGroup>
          </div>

          <UFormGroup label="Deskripsi" required>
            <UTextarea
              v-model="formData.description"
              class="w-full"
              placeholder="Masukkan deskripsi kas"
              :rows="3"
              required
            />
          </UFormGroup>

          <!-- Debug form data -->
          <!-- <div class="text-xs text-gray-400 bg-gray-100 p-2 rounded">
            Debug Form: {{ JSON.stringify(formData, null, 2) }}
          </div> -->

          <div class="flex justify-center mt-4">
            <UButton
              type="submit"
              :icon="tabIcon"
              :label="`Tambah ${tabLabel}`"
              :loading="isLoading"
              :color="tabColor"
              size="lg"
            />
          </div>
        </form>
      </div>
    </UCard>

    <!-- Transaksi Terbaru (5 terakhir) -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Kas Terbaru</h2>
          <NuxtLink to="/kasir/kas/riwayat">
            <UButton variant="outline" label="Lihat Semua" icon="i-lucide-arrow-right" trailing />
          </NuxtLink>
        </div>
      </template>

      <div v-if="moneyFlowStore.isLoading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
      </div>

      <div v-else-if="moneyFlowStore.recentFlows.length === 0" class="text-center py-8">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">Belum ada kas</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="flow in moneyFlowStore.recentFlows"
          :key="flow.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="flow.id_flow_type == 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              <UIcon
                :name="flow.id_flow_type == 1 ? 'i-lucide-arrow-down-circle' : 'i-lucide-arrow-up-circle'"
                class="w-5 h-5"
              />
            </div>
            <div>
              <p class="font-medium">{{ flow.description }}</p>
              <p class="text-sm text-gray-500">{{ flow.id_flow_type == 1 ? 'Pemasukan' : 'Pengeluaran' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p
              class="font-semibold"
              :class="flow.id_flow_type == 1 ? 'text-green-600' : 'text-red-600'"
            >
              {{ flow.id_flow_type == 1 ? '+' : '-' }}{{ formatCurrency(flow.qty_money) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ new Date(flow.date).toLocaleDateString('id-ID') }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

