<script setup lang="ts">
  definePageMeta({
    layout: 'custom-2',
  })
const links = [[{
  label: 'Catatan Pembelian',
  icon: 'i-lucide-shopping-basket',
  to: '/o-cabang/catatan-pembelian',
  exact: true
}, {
  label: 'Riwayat',
  icon: 'i-lucide-clock',
  to: '/o-cabang/catatan-pembelian/riwayat'
}]]
</script>

<template>
  <UDashboardPanel id="transaksi" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Kelola Catatan Pembelian">
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
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-5xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
