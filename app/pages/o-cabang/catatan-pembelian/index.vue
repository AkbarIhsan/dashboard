<!-- transaksi-pembelian.vue -->
<template>
  <div class="">
    <div class="flex flex-col-reverse md:flex-row justify-between gap-5 mb-5">
      <!-- Cart Section (Left) -->
      <div class="flex-col flex gap-3 w-full">
        <!-- Cart Items -->
        <div class="w-full h-[460px]">
          <UCard class="w-full h-full flex flex-col overflow-y-hidden">
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">Keranjang Pembelian</h3>
                <UBadge :label="store.totalItems.toString()" variant="solid" color="primary" />
                <UButton
                  color="gray"
                  variant="outline"
                  size="lg"
                  :disabled="store.purchaseItems.length === 0"
                  @click="store.clearPurchase()"
                >
                  Clear
                </UButton>
              </div>
            </template>

            <!-- Vendor Input Form -->
            <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Vendor
              </label>
              <UInput
                v-model="vendorName"
                placeholder="Masukkan nama vendor..."
                size="lg"
                :disabled="store.loading"
              />
            </div>

            <div class="max-h-[250px] overflow-y-auto pr-2">
              <div v-if="store.purchaseItems.length === 0" class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                  <UIcon name="i-heroicons-shopping-cart" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Keranjang kosong</p>
                </div>
              </div>

              <div v-else class="space-y-3">
                <div v-for="item in store.purchaseItems" :key="item.id"
                    class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex-1">
                    <h4 class="font-medium text-sm">{{ item.product_name }} - {{ item.product_name_type }}</h4>
                    <p class="text-xs text-gray-500">{{ item.unit_name }}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-1">
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
                        @click="updateQuantity(item.id, item.qty + 1)"
                      />
                    </div>

                    <!-- Cost Price Input -->
                    <UInput
                      v-model.number="item.cost_price"
                      type="number"
                      placeholder="Harga beli"
                      size="xs"
                      class="w-24"
                      @input="updateCostPrice(item.id, $event.target.value)"
                    />

                    <!-- Remove Button -->
                    <UButton
                      icon="i-heroicons-trash"
                      size="xs"
                      color="red"
                      variant="outline"
                      @click="store.removeFromPurchase(item.id)"
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
                :loading="store.loading"
                @click="store.fetchUnits()"
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
            <div v-if="store.loading && store.units.length === 0"
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

            <div v-else-if="store.units.length === 0"
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
                      <p class="text-sm font-semibold text-primary">{{ formatCurrency(unit.cost_price) }}</p>
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
                    placeholder="Qty"
                    size="sm"
                    class="w-20"
                  />
                  <UInput
                    v-model.number="costPrices[unit.id]"
                    type="number"
                    :placeholder="unit.cost_price"
                    size="sm"
                    class="w-24"
                    disabled=""
                  />
                  <UButton
                    size="sm"
                    :disabled="!quantities[unit.id] || quantities[unit.id] <= 0"
                    @click="addToPurchase(unit)"
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

    <!-- Total Section -->
    <UCard>
      <div class="w-full flex flex-row justify-between items-center">
        <div class="text-lg font-semibold">TOTAL</div>
        <div class="text-lg font-bold text-primary">{{ formatCurrency(store.totalAmount) }}</div>
      </div>

      <div class="mt-4 flex gap-2">
        <UButton
          color="primary"
          size="lg"
          class="flex-1"
          :loading="store.loading"
          :disabled="store.purchaseItems.length === 0 || !vendorName.trim()"
          @click="processPurchase"
        >
          Proses Pembelian
        </UButton>
        <UButton
          color="gray"
          variant="outline"
          size="lg"
          :disabled="store.purchaseItems.length === 0"
          @click="store.clearPurchase()"
        >
          Clear
        </UButton>
      </div>
    </UCard>

    <!-- Success/Error Notifications -->
    <UNotifications />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { usePurchaseStore } from '~/store/purchaseStore'

const store = usePurchaseStore()
const toast = useToast()

// Reactive object untuk menyimpan quantity dan cost price input untuk setiap unit
const quantities = reactive({})
const costPrices = reactive({})

// Search functionality
const searchQuery = ref('')

// Vendor name
const vendorName = ref('')

// Computed property untuk filter produk berdasarkan search query
const filteredUnits = computed(() => {
  if (!searchQuery.value) {
    return store.units
  }

  const query = searchQuery.value.toLowerCase().trim()
  return store.units.filter(unit => {
    const productName = (unit.product_name || '').toLowerCase()
    const productType = (unit.product_name_type || '').toLowerCase()
    const unitName = (unit.unit_name || '').toLowerCase()

    return productName.includes(query) ||
          productType.includes(query) ||
          unitName.includes(query) ||
          `${productName} ${productType}`.includes(query)
  })
})

// Function untuk highlight search term
const highlightSearchTerm = (text) => {
  if (!searchQuery.value || !text) return text

  const query = searchQuery.value.trim()
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>')
}

// Initialize quantities dan cost prices when units are loaded
watch(() => store.units, (newUnits) => {
  newUnits.forEach(unit => {
    if (!quantities[unit.id]) {
      quantities[unit.id] = 1
    }
    if (!costPrices[unit.id]) {
      costPrices[unit.id] = unit.cost_price
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

const addToPurchase = (unit) => {
  try {
    const qty = quantities[unit.id] || 1
    const costPrice = costPrices[unit.id] || unit.cost_price

    store.addToPurchase(unit, qty, costPrice)

    toast.add({
      title: 'Berhasil',
      description: `${qty} ${unit.unit_name} ditambahkan ke keranjang`,
      color: 'green'
    })

    // Reset quantity input
    quantities[unit.id] = 1
    costPrices[unit.id] = unit.cost_price
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  }
}

const updateQuantity = (unitId, newQty) => {
  try {
    store.updatePurchaseItemQty(unitId, newQty)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  }
}

const updateCostPrice = (unitId, newCostPrice) => {
  store.updatePurchaseItemCostPrice(unitId, parseFloat(newCostPrice) || 0)
}

const processPurchase = async () => {
  if (!vendorName.value.trim()) {
    toast.add({
      title: 'Error',
      description: 'Nama vendor harus diisi',
      color: 'red'
    })
    return
  }

  try {
    const result = await store.processPurchase(vendorName.value.trim())

    toast.add({
      title: 'Berhasil',
      description: result.message,
      color: 'green'
    })

    // Reset vendor name
    vendorName.value = ''

  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  }
}

onMounted(() => {
  store.fetchUnits()
})
</script>
