<template>
  <UDashboardPanel id="prediksi-stock" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Prediksi Penjualan">
        <template #leading>
          <UDashboardSidebarCollapse/>
        </template>
        <template #trailing>
          <UButton
            class="absolute right-20"
            @click="refreshData"
            :loading="isLoading"
            color="primary"
            variant="solid"
            icon="i-heroicons-arrow-path"
          >
            Refresh
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <template #body>
          <div class="p-6 h-auto overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary-500" />
        <span class="ml-2 text-gray-600">Menganalisis data prediksi...</span>
      </div>

      <!-- No Low Stock Items -->
      <div v-else-if="safetyStockData.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-check-circle" class="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-primary-900 mb-2">Semua Stock Aman</h3>
        <p class="text-primary-600">Tidak ada produk yang memerlukan penambahan stock saat ini.</p>
      </div>

      <!-- Safety Stock Cards -->
      <div v-else class="space-y-6">
        <!-- Summary -->
        <div class="bg-elevated/25 border border-error-600 rounded-lg p-4">
          <div class="flex items-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-error-600 mr-3" />
            <div>
              <h3 class="text-lg font-medium text-error-600">
                {{ safetyStockData.length }} Produk Memerlukan Perhatian
              </h3>
              <p class="text-sm text-error-600">
                Stock berada di batas minimal atau di bawahnya
              </p>
            </div>
          </div>
        </div>

        <!-- Product Cards -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="item in safetyStockData"
            :key="item.id"
            class="relative"
            :class="{
              'border border-error-700 bg-elevated/20': item.prediction?.recommendation?.priority === 'HIGH',
              'border border-warning-700 bg-elevated': item.prediction?.recommendation?.priority === 'MEDIUM'
            }"
          >
            <!-- Priority Badge -->
            <div class="absolute top-4 right-4">
              <UBadge
                :color="item.prediction?.recommendation?.priority === 'HIGH' ? 'red' : 'yellow'"
                variant="solid"
                size="sm"
              >
                {{ item.prediction?.recommendation?.priority || 'UNKNOWN' }}
              </UBadge>
            </div>

            <template #header>
              <div class="pr-12">
                <h3 class="text-lg font-semibold text-primary truncate">
                  {{ item.product_name_type }}
                </h3>
                <!-- <p class="text-sm text-gray-600">{{ item.product_name_type }}</p> -->
              </div>
            </template>

            <div class="space-y-4">
              <!-- Current Stock Info -->
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="">Stock Saat Ini</p>
                  <p class="font-medium text-lg">{{ item.current_stock }}</p>
                </div>
                <div>
                  <p class="">Stock Minimal</p>
                  <p class="font-medium text-lg">{{ item.min_stock }}</p>
                </div>
              </div>

              <!-- Prediction Results -->
              <div v-if="item.prediction && !item.prediction.note" class="border-t pt-4">
                <h4 class="font-medium text-primary-500 mb-3">📈 Prediksi </h4>

                <!-- Weekly Forecast -->
                <div class="mb-3">
                  <p class="text-xs mb-1">Prediksi Penjualan 4 Minggu:</p>
                  <div class="grid grid-cols-4 gap-1 text-lg">
                    <div
                      v-for="(week, index) in item.prediction.predicted_sales?.weekly_forecast || []"
                      :key="index"
                      class="bg-elevated text-primary-800 px-2 py-1 rounded text-center"
                    >
                      {{ Math.round(week) }}
                    </div>
                  </div>
                </div>

                <!-- Total Prediction -->
                <div class="mb-3">
                  <p class="text-lg">
                    Total Prediksi:
                    <span class="font-lg">
                      {{ item.prediction.predicted_sales?.total_4_weeks || 0 }} unit
                    </span>
                  </p>
                </div>

                <!-- Recommendation -->
                <!-- <div class="bg-elevated rounded-lg p-3">
                  <p class="text-sm font-medium mb-1">Rekomendasi Penambahan:</p>
                  <div class="space-y-1 text-sm">
                    <p>
                      <span class="">Minimal:</span>
                      <span class="font-medium text-green-600 ml-1">
                        +{{ Math.round(item.prediction.recommendation?.stock_to_add || 0) }} unit
                      </span>
                    </p>
                    <p>
                      <span class="">Disarankan:</span>
                      <span class="font-medium text-blue-600 ml-1">
                        +{{ Math.round(item.prediction.recommendation?.suggested_order || 0) }} unit
                      </span>
                    </p>
                  </div>
                </div> -->

                <!-- Accuracy Info -->
                <!-- <div v-if="item.prediction.forecast_accuracy" class="text-xs text-elevated mt-2">
                  <p>Model Accuracy: AIC {{ item.prediction.forecast_accuracy.model_aic }}</p>
                </div> -->
              </div>

              <!-- Fallback Info -->
              <div v-else-if="item.prediction?.note" class="border-t pt-4">
                <div class="bg-elevated border border-yellow-200 rounded-lg p-3">
                  <p class="text-sm text-yellow-800 mb-2">⚠️ Prediksi Tidak Tersedia</p>
                  <p class="text-xs text-yellow-700">{{ item.prediction.note }}</p>
                  <div class="mt-2 text-sm">
                    <p class="text-yellow-800">
                      Rekomendasi dasar:
                      <span class="font-medium">
                        +{{ Math.round(item.prediction.recommendation?.suggested_order || 0) }} unit
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- No Prediction -->
              <div v-else class="border-t pt-4">
                <div class="bg-elevated rounded-lg p-3">
                  <p class="text-sm ">🤖 Menganalisis data...</p>
                </div>
              </div>

              <!-- Price Info -->
              <div class="text-xs text-elevated border-t pt-2">
                <p>Harga: Rp {{ formatPrice(item.price) }} | Cabang: {{ item.branch }}</p>
                <!-- <p>Update: {{ formatDateTime(item.last_updated) }}</p> -->
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <div class="flex">
          <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    </template>
  </UDashboardPanel>
</template>

<script setup >
import { useSafetyStockStore } from '@/store/safety'

  definePageMeta({
    layout: 'custom-2',
  })

const safetyStockStore = useSafetyStockStore()

onMounted(() => {
  safetyStockStore.fetchSafetyStockData()
})

const safetyStockData = computed(() => safetyStockStore.safetyStockData)
const isLoading = computed(() => safetyStockStore.isLoading)
const error = computed(() => safetyStockStore.error)

const refreshData = () => {
  safetyStockStore.refreshData()
}
const links = [[
  {
    label: 'Prediksi Penjualan',
    icon: 'i-lucide-boxes',
    to: '/o-cabang/prediksi-stok'
  }
]]

const formatPrice = safetyStockStore.formatPrice
const formatDateTime = safetyStockStore.formatDateTime
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
