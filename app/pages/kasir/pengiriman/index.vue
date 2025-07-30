<!-- pages/pengiriman/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Pengiriman</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ deliveryStore.deliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-package" class="w-8 h-8 text-blue-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Status Pending</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ deliveryStore.pendingDeliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-clock" class="w-8 h-8 text-yellow-600" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Selesai</p>
            <p class="text-2xl font-bold text-green-600">
              {{ deliveryStore.completedDeliveries.length }}
            </p>
          </div>
          <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-600" />
        </div>
      </UCard>
    </div>

    <!-- Form Pengiriman Baru -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Buat Pengiriman Baru</h2>
          <!-- Auto-fill indicator -->
          <div v-if="isAutoFill" class="flex items-center gap-2 text-sm text-blue-600">
            <UIcon name="i-lucide-zap" class="w-4 h-4" />
            <span>Auto-filled dari Sales Order</span>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Loading State untuk Form -->
        <div v-if="deliveryStore.loading && (!salesOrderOptions.length || !customerOptions.length)" class="flex justify-center py-8">
          <div class="text-center">
            <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto mb-2" />
            <p class="text-sm text-gray-500">Memuat data...</p>
          </div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <UFormGroup label="Sales Order" required class="flex-1">
              <!-- Custom Select yang mirip USelect tapi pakai native -->
              <div class="relative">
                <select
                  v-model="form.id_sales_order"
                  class="block w-full pl-10 py-2 pr-8 text-sm leading-5 bg-elevated border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  :class="{
                    'bg-gray-100 dark:bg-gray-700 cursor-not-allowed': isAutoFill,
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600': isAutoFill
                  }"
                  :disabled="!!isAutoFill"
                  required
                >
                  <option value="">Pilih Sales Order</option>
                  <option
                    v-for="option in salesOrderOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <!-- Icon -->
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UIcon
                    name="i-lucide-shopping-cart"
                    class="w-4 h-4"
                    :class="isAutoFill ? 'text-blue-500' : 'text-gray-400'"
                  />
                </div>
                <!-- Dropdown arrow or lock icon -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <UIcon
                    :name="isAutoFill ? 'i-lucide-lock' : 'i-lucide-chevron-down'"
                    class="w-4 h-4"
                    :class="isAutoFill ? 'text-blue-500' : 'text-gray-400'"
                  />
                </div>
                <!-- Auto-fill overlay -->
                <div v-if="isAutoFill" class="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 rounded-md pointer-events-none"></div>
              </div>

              <template #hint>
                <span class="text-xs" :class="isAutoFill ? 'text-blue-600' : 'text-gray-500'">
                  {{ isAutoFill
                    ? 'Sales Order dipilih otomatis dari detail transaksi'
                    : (salesOrderOptions.length ? 'Sales Order terbaru akan diprioritaskan' : 'Tidak ada Sales Order tersedia')
                  }}
                </span>
              </template>
            </UFormGroup>

            <UFormGroup label="Customer" required class="flex-1">
              <!-- Custom Select yang mirip USelect tapi pakai native -->
              <div class="relative">
                <select
                  v-model="form.id_customer"
                  class="block w-full pl-10 py-2 pr-8 text-sm leading-5 bg-elevated border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  required
                >
                  <option value="">Pilih Customer</option>
                  <option
                    v-for="option in customerOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <!-- Icon -->
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-400" />
                </div>
                <!-- Dropdown arrow -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <template #hint>
                <span class="text-xs text-gray-500">
                  {{ customerOptions.length ? 'Pilih customer untuk pengiriman' : 'Tidak ada Customer tersedia' }}
                </span>
              </template>
            </UFormGroup>
          </div>

          <!-- Status Info -->
          <UFormGroup label="Status Pengiriman">
            <UInput
              value="Pending"
              readonly
              icon="i-lucide-clock"
              class="text-yellow-600"
            />
            <template #hint>
              <span class="text-xs text-gray-500">Status akan otomatis diset ke "Pending"</span>
            </template>
          </UFormGroup>

          <!-- Auto-fill info banner -->
          <div v-if="isAutoFill" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm">
                <p class="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Pengiriman untuk Sales Order #{{ form.id_sales_order }}
                </p>
                <p class="text-blue-700 dark:text-blue-300">
                  Sales Order telah dipilih otomatis. Anda hanya perlu memilih customer untuk melanjutkan.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-center mt-6">
            <UButton
              type="submit"
              icon="i-lucide-send"
              label="Buat Pengiriman"
              :loading="deliveryStore.loading"
              color="primary"
              size="lg"
              :disabled="!form.id_sales_order || !form.id_customer || !salesOrderOptions.length || !customerOptions.length"
            />
          </div>
        </form>
      </div>
    </UCard>

    <!-- Pengiriman Terbaru -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Pengiriman Terbaru</h2>
         <NuxtLink to="/kasir/pengiriman/riwayat">
           <UButton
            v-if="deliveryStore.deliveries.length > 5"
            variant="outline"
            label="Lihat Semua"
            icon="i-lucide-arrow-right"
            trailing
          />
         </NuxtLink>
        </div>
      </template>

      <div v-if="deliveryStore.loading && deliveryStore.deliveries.length === 0" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
      </div>

      <div v-else-if="deliveryStore.deliveries.length === 0" class="text-center py-8">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">Belum ada pengiriman</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="delivery in recentDeliveries"
          :key="delivery.id"
          class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'"
            >
              <UIcon
                :name="delivery.status === 'pending' ? 'i-lucide-clock' : 'i-lucide-check-circle'"
                class="w-5 h-5"
              />
            </div>
            <div>
              <p class="font-medium">SO-{{ delivery.id_sales_order }}</p>
              <p class="text-sm text-gray-500">{{ getCustomerName(delivery.id_customer) }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center space-x-2">
              <UBadge
                :color="delivery.status === 'pending' ? 'warning' : 'success'"
                variant="subtle"
                :label="delivery.status === 'pending' ? 'Pending' : 'Selesai'"
              />
              <UButton
                v-if="delivery.status === 'pending'"
                @click="updateStatus(delivery.id, 'completed')"
                icon="i-lucide-check"
                size="lg"
                color="success"
                variant="outline"
                :loading="updatingStatus === delivery.id"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatDate(delivery.date) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Toast Notifications -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDeliveryStore } from '~/store/delivery'

const deliveryStore = useDeliveryStore()
const toast = useToast()
const route = useRoute()
const updatingStatus = ref<number | null>(null)
const showDebug = ref(process.env.NODE_ENV === 'development')

const form = ref({
  id_sales_order: null as number | null,
  id_customer: null as number | null
})

// Check if this is auto-fill from sales order detail - explicitly convert to boolean
const isAutoFill = computed(() => {
  return Boolean(route.query.auto_fill === 'true' && route.query.sales_order_id)
})

// Auto-fill sales order ID from URL
const autoFillSalesOrderId = computed(() => {
  if (isAutoFill.value && route.query.sales_order_id) {
    return Number(route.query.sales_order_id)
  }
  return null
})

// Computed options untuk USelect dengan format yang berbeda
const salesOrderOptions = computed(() => {
  console.log('Computing salesOrderOptions:', deliveryStore.salesOrders)

  if (!deliveryStore.salesOrders || !Array.isArray(deliveryStore.salesOrders)) {
    console.log('salesOrders is not an array or is null')
    return []
  }

  const sorted = [...deliveryStore.salesOrders].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const options = sorted.map(order => ({
    value: order.id,
    label: `SO-${order.id} | ${formatDate(order.date)}`,
  }))

  console.log('Generated salesOrderOptions:', options)
  return options
})

const customerOptions = computed(() => {
  console.log('Computing customerOptions:', deliveryStore.customers)

  if (!deliveryStore.customers || !Array.isArray(deliveryStore.customers)) {
    console.log('customers is not an array or is null')
    return []
  }

  const options = deliveryStore.customers.map(customer => ({
    value: customer.id,
    label: `${customer.name} | ${customer.phone || 'No phone'}`,
  }))

  console.log('Generated customerOptions:', options)
  return options
})

const recentDeliveries = computed(() => {
  if (!deliveryStore.deliveries || !Array.isArray(deliveryStore.deliveries)) {
    return []
  }

  return deliveryStore.deliveries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
})

// Methods
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const getCustomerName = (customerId: number) => {
  if (!deliveryStore.customers || !Array.isArray(deliveryStore.customers)) {
    return 'Customer tidak ditemukan'
  }

  const customer = deliveryStore.customers.find(c => c.id === customerId)
  return customer ? customer.name : 'Customer tidak ditemukan'
}

const resetForm = () => {
  // If auto-fill mode, set the sales order from URL
  if (isAutoFill.value && autoFillSalesOrderId.value) {
    form.value = {
      id_sales_order: autoFillSalesOrderId.value,
      id_customer: null
    }
  } else {
    const latestSalesOrder = [...deliveryStore.salesOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    form.value = {
      id_sales_order: latestSalesOrder?.id ?? null,
      id_customer: null
    }
  }
}

const handleSubmit = async () => {
  try {
    // Validation
    if (!form.value.id_sales_order || !form.value.id_customer) {
      toast.add({
        title: 'Error!',
        description: 'Mohon lengkapi semua field yang required',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
      return
    }

    await deliveryStore.createDelivery({
      id_sales_order: Number(form.value.id_sales_order),
      id_customer: Number(form.value.id_customer)
    })

    // Reset form
    resetForm()

    // Show success notification
    toast.add({
      title: 'Berhasil!',
      description: 'Pengiriman baru berhasil dibuat',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })

    // If auto-fill mode, redirect back to sales order detail
    if (isAutoFill.value) {
      const router = useRouter()
      setTimeout(() => {
        router.push(`/kasir/transaksi/riwayat-show/${autoFillSalesOrderId.value}`)
      }, 1500)
    }

  } catch (error) {
    console.error('Error creating delivery:', error)
    toast.add({
      title: 'Error!',
      // description: error?.message || 'Gagal membuat pengiriman baru',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const updateStatus = async (id: number, status: 'completed') => {
  updatingStatus.value = id
  try {
    await deliveryStore.updateDeliveryStatus(id, status)
    toast.add({
      title: 'Status Updated!',
      description: 'Status pengiriman berhasil diupdate',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    toast.add({
      title: 'Error!',
      // description: error?.message || 'Gagal mengupdate status pengiriman',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    updatingStatus.value = null
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await deliveryStore.initializeData()

    // Set form after data is loaded
    resetForm()

    // Show auto-fill notification if applicable
    if (isAutoFill.value) {
      toast.add({
        title: 'Auto-filled!',
        description: `Sales Order #${autoFillSalesOrderId.value} telah dipilih otomatis`,
        icon: 'i-lucide-zap',
        color: 'primary'
      })
    }
  } catch (error) {
    console.error('Error initializing data:', error)
    toast.add({
      title: 'Error!',
      description: 'Gagal memuat data awal',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
})
</script>
