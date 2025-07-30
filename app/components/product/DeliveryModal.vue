<!-- PaymentSuccessModal.vue -->
<template>
  <UModal
    v-model:open="isOpen"
    :prevent-close="true"
    :ui="{
      width: 'sm:max-w-md',
      padding: 'p-0'
    }"
  >
  <template #body>
    <div class="p-6">
      <!-- Success Icon and Title -->
      <div class="flex flex-col items-center text-center mb-6">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Pembayaran Berhasil!
        </h3>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Transaksi telah berhasil diproses
        </p>

        <!-- Sales Order ID Display -->
        <div class="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Transaksi ID: SO-{{ displaySalesOrderId }}
          </p>
        </div>
      </div>

      <!-- Payment Details -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">Metode Pembayaran:</span>
          <span class="font-medium text-gray-900 dark:text-white capitalize">
            {{ paymentMethod === 'cash' ? 'Tunai' : 'Transfer Bank' }}
          </span>
        </div>

        <div class="flex justify-between items-center text-sm">
          <!-- <span class="text-gray-600 dark:text-gray-400">Total:</span>
          <span class="font-bold text-green-600 dark:text-green-400">
            {{ formatCurrency(totalAmount) }}
          </span> -->
        </div>

        <!-- Kembalian for cash payment -->
        <div v-if="paymentMethod === 'cash' && changeAmount > 0"
             class="flex justify-between items-center text-sm border-t pt-2">
          <span class="text-gray-600 dark:text-gray-400">Kembalian:</span>
          <span class="font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(changeAmount) }}
          </span>
        </div>
      </div>

      <!-- Pengiriman Option -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Apakah perlu pengiriman untuk pesanan ini?
        </label>

        <div class="space-y-2">
          <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :class="needsShipping ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'">
            <input
              type="radio"
              :value="true"
              v-model="needsShipping"
              class="text-primary focus:ring-primary"
            />
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-primary" />
              <span class="font-medium">Ya, perlu pengiriman</span>
            </div>
          </label>

          <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :class="!needsShipping ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'">
            <input
              type="radio"
              :value="false"
              v-model="needsShipping"
              class="text-primary focus:ring-primary"
            />
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-hand-raised" class="w-5 h-5 text-gray-500" />
              <span class="font-medium">Tidak, ambil sendiri</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <UButton
          v-if="needsShipping"
          color="primary"
          size="lg"
          block
          :loading="isProcessing"
          @click="createShipment"
        >
          <UIcon name="i-heroicons-truck" class="w-4 h-4 mr-2" />
          Buat Pengiriman
        </UButton>

        <UButton
          color="gray"
          variant="outline"
          size="lg"
          block
          :disabled="isProcessing"
          @click="finishTransaction"
        >
          <UIcon name="i-heroicons-check" class="w-4 h-4 mr-2" />
          {{ needsShipping ? 'Lewati Pengiriman' : 'Selesai' }}
        </UButton>
      </div>

      <!-- Additional Info -->
      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
        <p class="text-xs text-blue-600 dark:text-blue-400 text-center">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
          Anda dapat membuat pengiriman nanti melalui menu Riwayat Transaksi
        </p>
      </div>
    </div>
  </template>

  </UModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSalesOrderStore } from '~/store/sales' // Adjust path as needed

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  salesOrderId: {
    type: Number,
    required: false, // Make it optional since we'll get from store
    default: null
  },
  paymentMethod: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  changeAmount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'shipment-created', 'transaction-finished'])

// Store
const salesOrderStore = useSalesOrderStore()

// Reactive data
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const needsShipping = ref(true) // Default to true (perlu pengiriman)
const isProcessing = ref(false)
const actualSalesOrderId = ref(null)

// Computed property untuk menampilkan sales order ID
const displaySalesOrderId = computed(() => {
  return props.salesOrderId || actualSalesOrderId.value || salesOrderStore.latestSalesOrderId
})

const router = useRouter()
const toast = useToast()

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Method untuk mengambil ID sales order terbaru
const getLatestSalesOrderId = async () => {
  try {
    if (!props.salesOrderId) {
      // Fetch ulang biar data paling baru
      await salesOrderStore.fetchSalesOrders()
      actualSalesOrderId.value = salesOrderStore.getLatestSalesOrderIdFromCache()
    } else {
      actualSalesOrderId.value = props.salesOrderId
    }
  } catch (error) {
    console.error('Error getting latest sales order ID:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal mengambil ID sales order terbaru',
      color: 'red'
    })
  }
}


// Create shipment and navigate to pengiriman page
const createShipment = async () => {
  try {
    isProcessing.value = true

    const salesOrderId = displaySalesOrderId.value

    if (!salesOrderId) {
      throw new Error('Sales Order ID tidak ditemukan')
    }

    // Navigate to pengiriman page with auto-fill data
    await router.push({
      path: '/kasir/pengiriman',
      query: {
        sales_order_id: salesOrderId,
        auto_fill: 'true'
      }
    })

    // Close modal
    isOpen.value = false

    // Emit shipment created event
    emit('shipment-created', salesOrderId)

    toast.add({
      title: 'Berhasil',
      description: 'Mengarahkan ke halaman pengiriman...',
      color: 'green'
    })

  } catch (error) {
    console.error('Error navigating to shipment:', error)

    toast.add({
      title: 'Error',
      description: error.message || 'Gagal mengarahkan ke halaman pengiriman',
      color: 'red'
    })
  } finally {
    isProcessing.value = false
  }
}

// Finish transaction without shipping
const finishTransaction = () => {
  const salesOrderId = displaySalesOrderId.value

  // Close modal
  isOpen.value = false

  // Emit transaction finished event
  emit('transaction-finished', {
    salesOrderId: salesOrderId,
    needsShipping: needsShipping.value
  })

  toast.add({
    title: 'Selesai',
    description: `Transaksi SO-${salesOrderId} telah selesai`,
    color: 'green'
  })
}

// Reset form when modal is opened
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    needsShipping.value = true // Reset to default
    isProcessing.value = false

    // Get latest sales order ID when modal opens
    await getLatestSalesOrderId()
  }
})

// Initialize when component is mounted
onMounted(async () => {
  if (props.modelValue) {
    await getLatestSalesOrderId()
  }
})
</script>
