<!-- transaksi-penjualan.vue -->
<template>
  <div class="px-6">
    <!-- Header -->
    <!-- <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Transaksi Baru</h1>
    </div> -->

    <div class="flex flex-col-reverse md:flex-row justify-between gap-5 mb-5">
      <!-- Cart Section (Left) -->
      <div class="flex-col flex gap-3 w-full">
        <!-- Cart Items -->
        <div class="w-full h-[460px]">
        <UCard class="w-full h-full flex flex-col overflow-y-hidden">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Keranjang Belanja</h3>
              <UBadge :label="transactionStore.totalItems.toString()" variant="solid" color="primary" />
              <UButton
              color="gray"
              variant="outline"
              size="lg"
              :disabled="transactionStore.cart.length === 0"
              @click="transactionStore.clearCart()"
            >
              Clear
            </UButton>
            </div>
          </template>

          <div class="max-h-[330px] overflow-y-auto pr-2">
            <div v-if="transactionStore.cart.length === 0" class="flex items-center justify-center h-full text-gray-500">
              <div class="text-center">
                <UIcon name="i-heroicons-shopping-cart" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Keranjang kosong</p>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div v-for="item in transactionStore.cart" :key="item.id"
                  class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex-1">
                  <h4 class="font-medium text-sm">{{ item.product_name }} - {{ item.product_name_type }}</h4>
                  <p class="text-xs text-gray-500">{{ item.unit_name }}</p>
                  <p class="text-sm font-semibold text-primary">{{ formatCurrency(item.price) }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-minus"
                    size="xs"
                    variant="outline"
                    :disabled="item.qty <= 1"
                    @click="updateQuantity(item.id, item.qty - 1)"
                  />
                  <span class="w-8 text-center text-sm font-medium">{{ item.qty }}</span>
                  <UButton
                    icon="i-heroicons-plus"
                    size="xs"
                    variant="outline"
                    :disabled="item.qty >= item.stock"
                    @click="updateQuantity(item.id, item.qty + 1)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    color="red"
                    variant="outline"
                    @click="transactionStore.removeFromCart(item.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>
        </div>
      </div>
<div class="w-full h-[460px]">
      <!-- Product Selection (Right) -->
      <UCard class="w-full h-full flex flex-col overflow-hidden">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Pilih Produk</h3>
            <UButton
              icon="i-heroicons-arrow-path"
              variant="outline"
              size="sm"
              :loading="transactionStore.loading"
              @click="transactionStore.fetchUnits()"
            >
              Refresh
            </UButton>
          </div>
        </template>

        <!-- Search Input -->
        <div class="mb-4 px-4">
          <UInput
            v-model="searchQuery"
            placeholder="Cari produk..."
            icon="i-heroicons-magnifying-glass"
            size="sm"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>

        <div class="max-h-[290px] overflow-y-scroll pr-2">
          <div v-if="transactionStore.loading && transactionStore.units.length === 0"
              class="flex items-center justify-center h-full">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
          </div>

          <div v-else-if="transactionStore.error"
              class="flex items-center justify-center h-full text-red-500">
            <div class="text-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-2" />
              <p>{{ transactionStore.error }}</p>
            </div>
          </div>

          <div v-else-if="transactionStore.units.length === 0"
              class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada produk tersedia</p>
            </div>
          </div>

          <div v-else-if="filteredUnits.length === 0 && searchQuery"
              class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada produk yang cocok dengan pencarian "{{ searchQuery }}"</p>
            </div>
          </div>

          <div v-else class="space-y-2">
            <div v-for="unit in filteredUnits" :key="unit.id"
                class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <h4 class="font-medium text-sm">
                    <span v-html="highlightSearchTerm(unit.product_name + ' - ' + unit.product_name_type)"></span>
                  </h4>
                  <p class="text-xs text-gray-500">
                    <span v-html="highlightSearchTerm(unit.unit_name)"></span>
                  </p>
                  <div class="flex justify-between items-center mt-1">
                    <p class="text-sm font-semibold text-primary">{{ formatCurrency(unit.price) }}</p>
                    <p class="text-xs" :class="unit.stock <= unit.min_stock ? 'text-red-500' : 'text-gray-600'">
                      Stok: {{ unit.stock }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <UInput
                  v-model.number="quantities[unit.id]"
                  type="number"
                  :min="1"
                  :max="unit.stock"
                  placeholder="Qty"
                  size="sm"
                  class="w-20"
                />
                <UButton
                  size="sm"
                  :disabled="unit.stock === 0 || !quantities[unit.id] || quantities[unit.id] <= 0"
                  @click="addToCart(unit)"
                >
                  <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
                  Tambah
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>
  </div>
    </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
              Pilih Metode Pembayaran
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Total Amount Display -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Belanja:</span>
              <span class="text-lg font-bold text-primary">{{ formatCurrency(transactionStore.totalAmount) }}</span>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Metode Pembayaran
            </label>

            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    :class="paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'">
                <input
                  type="radio"
                  value="transfer"
                  v-model="paymentMethod"
                  class="text-primary"
                />
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-primary" />
                  <span class="font-medium">Transfer Bank</span>
                </div>
              </label>

              <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    :class="paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'">
                <input
                  type="radio"
                  value="cash"
                  v-model="paymentMethod"
                  class="text-primary"
                />
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-primary-600" />
                  <span class="font-medium">Tunai</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Cash Payment Details -->
          <div v-if="paymentMethod === 'cash'" class="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jumlah Uang Diterima
              </label>
              <UInput
                v-model.number="cashReceived"
                type="number"
                :min="transactionStore.totalAmount"
                placeholder="0"
                size="lg"
                :ui="{
                  base: 'text-right font-mono text-lg',
                  color: { white: { outline: 'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400' } }
                }"
              />
              <p class="text-xs text-gray-500 mt-1">
                Minimal: {{ formatCurrency(transactionStore.totalAmount) }}
              </p>
            </div>

            <!-- Change Calculation -->
            <div v-if="cashReceived && cashReceived >= transactionStore.totalAmount"
                class="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Kembalian:</span>
                <span class="text-lg font-bold text-green-600">
                  {{ formatCurrency(cashReceived - transactionStore.totalAmount) }}
                </span>
              </div>
            </div>

            <!-- Insufficient Cash Warning -->
            <div v-if="cashReceived && cashReceived < transactionStore.totalAmount"
                class="flex items-center space-x-2 text-red-600 text-sm">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
              <span>Jumlah uang tidak mencukupi</span>
            </div>
          </div>

          <!-- Quick Cash Buttons for Cash Payment -->
          <div v-if="paymentMethod === 'cash'" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nominal Cepat
            </label>
            <div class="grid grid-cols-3 gap-2">
              <UButton
                v-for="amount in quickCashAmounts"
                :key="amount"
                variant="outline"
                size="sm"
                @click="cashReceived = amount"
                :class="cashReceived === amount ? 'ring-2 ring-primary' : ''"
              >
                {{ formatCurrency(amount) }}
              </UButton>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="primary"
              :loading="transactionStore.loading"
              :disabled="!canProcessPayment"
              @click="processPayment"
            >
              {{ paymentMethod === 'cash' ? 'Proses Tunai' : 'Proses Transfer' }}
            </UButton>
          </div>
        </template>
      </UCard>

    <!-- Payment Success Modal -->
    <PaymentSuccessModal
    v-if="showSuccessModal"
      v-model="showSuccessModal"
      :sales-order-id="lastTransactionId"
      :payment-method="paymentMethod"
      :total-amount="transactionStore.totalAmount"
      :change-amount="calculateChange()"
      @shipment-created="handleShipmentCreated"
      @transaction-finished="handleTransactionFinished"
    />

    <!-- Success/Error Notifications -->
    <UNotifications />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useTransactionStore } from '~/store/transaction'
import { useSalesOrderStore } from '~/store/sales' // Import sales order store
import PaymentSuccessModal from '~/components/product/DeliveryModal.vue' // Import modal component

const transactionStore = useTransactionStore()
const salesOrderStore = useSalesOrderStore() // Initialize sales order store
const toast = useToast()

// Reactive object untuk menyimpan quantity input untuk setiap unit
const quantities = reactive({})

// Search functionality
const searchQuery = ref('')

const paymentMethod = ref('transfer') // 'transfer' or 'cash'
const cashReceived = ref(0)

// Modal state
const showSuccessModal = ref(false)
const lastTransactionId = ref(null)
const handleSuccess = () => {
  showSuccessModal.value = true
}

// Computed property untuk filter produk berdasarkan search query
const filteredUnits = computed(() => {
  if (!searchQuery.value) {
    return transactionStore.units
  }

  const query = searchQuery.value.toLowerCase().trim()
  return transactionStore.units.filter(unit => {
    const productName = (unit.product_name || '').toLowerCase()
    const productType = (unit.product_name_type || '').toLowerCase()
    const unitName = (unit.unit_name || '').toLowerCase()

    return productName.includes(query) ||
          productType.includes(query) ||
          unitName.includes(query) ||
          `${productName} ${productType}`.includes(query)
  })
})

// Quick cash amounts based on total
const quickCashAmounts = computed(() => {
  const total = transactionStore.totalAmount
  const amounts = []

  // Exact amount
  amounts.push(total)

  // Round up to nearest 5000, 10000, 20000, 50000, 100000
  const roundUpOptions = [5000, 10000, 20000, 50000, 100000]

  for (const option of roundUpOptions) {
    const roundedUp = Math.ceil(total / option) * option
    if (roundedUp > total && !amounts.includes(roundedUp)) {
      amounts.push(roundedUp)
    }
  }

  // Limit to 6 options and sort
  return amounts.slice(0, 6).sort((a, b) => a - b)
})

// Check if payment can be processed
const canProcessPayment = computed(() => {
  if (transactionStore.cart.length === 0) {
    return false
  }

  if (paymentMethod.value === 'transfer') {
    return true
  }

  if (paymentMethod.value === 'cash') {
    return cashReceived.value >= transactionStore.totalAmount
  }

  return false
})

// Calculate change amount
const calculateChange = () => {
  if (paymentMethod.value === 'cash' && cashReceived.value > transactionStore.totalAmount) {
    return cashReceived.value - transactionStore.totalAmount
  }
  return 0
}

// Function untuk highlight search term
const highlightSearchTerm = (text) => {
  if (!searchQuery.value || !text) return text

  const query = searchQuery.value.trim()
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>')
}

// Initialize quantities when units are loaded
watch(() => transactionStore.units, (newUnits) => {
  newUnits.forEach(unit => {
    if (!quantities[unit.id]) {
      quantities[unit.id] = 1
    }
  })
}, { immediate: true })

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const addToCart = (unit) => {
  try {
    const qty = quantities[unit.id] || 1
    transactionStore.addToCart(unit, qty)

    // Reset quantity input
    quantities[unit.id] = 1
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    })
  }
}

const updateQuantity = (unitId, newQty) => {
  try {
    transactionStore.updateCartItemQty(unitId, newQty)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  }
}

const processPayment = async () => {
  try {
    const paymentData = {
      method: paymentMethod.value,
      total: transactionStore.totalAmount
    }

    if (paymentMethod.value === 'cash') {
      paymentData.cashReceived = cashReceived.value
      paymentData.change = cashReceived.value - transactionStore.totalAmount
    }

    // Call store method with payment data
    const result = await transactionStore.processPayment(paymentData)

    // Get the latest sales order ID
    try {
      await salesOrderStore.fetchLatestSalesOrderId()
      lastTransactionId.value = salesOrderStore.latestSalesOrderId
    } catch (error) {
      console.warn('Could not fetch latest sales order ID:', error)
      // Fallback to result ID if available
      lastTransactionId.value = result.salesOrderId || result.id || null
    }

    // Show success modal instead of toast
    showSuccessModal.value = true

    // Reset form
    resetForm()

  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.data?.message || error.message || 'Gagal memproses pembayaran',
      color: 'red'
    })
  }
}

// Reset form after successful payment
const resetForm = () => {
  paymentMethod.value = 'transfer'
  cashReceived.value = 0
  // Clear cart akan dipanggil dari store setelah payment success
}

// Handle modal events
const handleShipmentCreated = (salesOrderId) => {
  console.log('Shipment created for sales order:', salesOrderId)
  // You can add additional logic here if needed
}

const handleTransactionFinished = (data) => {
  console.log('Transaction finished:', data)

  // Show final success toast
  toast.add({
    title: 'Transaksi Selesai',
    description: `Transaksi #${data.salesOrderId} telah selesai`,
    color: 'green'
  })

  // Refresh sales order data
  salesOrderStore.fetchSalesOrders()
  handleSuccess()
}

onMounted(() => {
  transactionStore.fetchUnits()
})
</script>
