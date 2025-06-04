<script setup lang="ts">
const links = [[{
  label: 'Pengiriman Baru',
  icon: 'i-lucide-car-front',
  to: '/kasir/pengiriman',
  exact: true
}, {
  label: 'Riwayat',
  icon: 'i-lucide-clock',
  to: '/kasir/pengiriman/riwayat'
}]]
</script>

<template>
  <UDashboardPanel id="pengiriman" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Pengiriman">
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
