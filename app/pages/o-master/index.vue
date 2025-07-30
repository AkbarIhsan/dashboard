<script setup lang="ts">
import { useDashboardStore } from '~/store/dashboard'

  definePageMeta({
    layout: 'custom-1',
  })
  
const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/o-master/',
  exact: true
}]]

const dashboardStore = useDashboardStore()

// Reactive properties
const {
  salesData,
  loading,
  error,
  topProducts,
  stats,
  lowStockUnits
} = storeToRefs(dashboardStore)

// Methods (functions) - ambil langsung dari store
const { formatCurrency, formatNumber } = dashboardStore

const refreshData = async () => {
  await Promise.all([
    dashboardStore.fetchSalesData(),
    dashboardStore.fetchLowStockUnits()
  ])
}

// Fetch data saat component di-mount
onMounted(() => {
  refreshData()
})
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Kas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-7xl mx-auto">
         <!-- Dashboard Content untuk NuxtPage -->
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Penjualan</h1>
        <p class="text-gray-600 dark:text-gray-400">Ringkasan data penjualan dan produk terlaris</p>
      </div>
      <UButton
        @click="refreshData"
        :loading="loading"
        icon="i-lucide-refresh-cw"
        size="sm"
        variant="outline"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !salesData.length" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Memuat data...</span>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      :color="error"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link' }"
      @close="dashboardStore.error = null"
    />

    <!-- Dashboard Content -->
    <div v-if="!loading || salesData.length" class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pesanan</h3>
              <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 text-blue-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(stats.totalOrders) }}
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</h3>
              <UIcon name="i-lucide-banknote" class="w-5 h-5 text-green-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(stats.totalRevenue) }}
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Produk Terjual</h3>
              <UIcon name="i-lucide-package" class="w-5 h-5 text-purple-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(stats.totalProducts) }}
          </div>
        </UCard>

        <!-- <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Pesanan</h3>
              <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-orange-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(stats.averageOrderValue) }}
          </div>
        </UCard> -->
      </div>

      <!-- Top Products & Low Stock Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top Products -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  5 Produk Terlaris
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Berdasarkan jumlah quantity terjual
                </p>
              </div>
              <UIcon name="i-lucide-award" class="w-6 h-6 text-yellow-500" />
            </div>
          </template>

          <div v-if="topProducts.length === 0" class="text-center py-8">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">Belum ada data penjualan</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.productName"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">{{ index + 1 }}</span>
                  </div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ product.productName }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ product.productNameType }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatNumber(product.totalQty) }} unit
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatCurrency(product.totalRevenue) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-500">
                  {{ product.orderCount }} pesanan
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Low Stock Units -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  5 Stok Menipis
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Unit yang mendekati atau di bawah minimum stok
                </p>
              </div>
              <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-500" />
            </div>
          </template>

          <div v-if="lowStockUnits.length === 0" class="text-center py-8">
            <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">Semua stok dalam kondisi aman</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(unit, index) in lowStockUnits"
              :key="unit.id"
              class="flex items-center justify-between p-4 rounded-lg"
              :class="unit.stock_status === 'LOW' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :class="unit.stock_status === 'LOW' ? 'bg-yellow-500' : 'bg-red-500'"
                  >
                    <UIcon
                      :name="unit.stock_status === 'LOW' ? 'i-lucide-alert-circle' : 'i-lucide-alert-triangle'"
                      class="w-5 h-5 text-white"
                    />
                  </div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ unit.product_name }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ unit.product_name_type }} - {{ unit.unit_name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">
                    Min: {{ formatNumber(unit.min_stock) }} unit
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="text-lg font-semibold"
                  :class="unit.stock_status === 'LOW' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatNumber(unit.stock) }} unit
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatCurrency(unit.price) }}
                </div>
                <div
                  class="text-xs px-2 py-1 rounded-full inline-block"
                  :class="unit.stock_status === 'LOW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'"
                >
                  {{ unit.stock_status === 'LOW' ? 'Stok Menipis' : 'Stok Habis' }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
