<script setup lang="ts">
  definePageMeta({
    layout: 'custom-1',
  })
const links = [[{
  label: 'Kelola Barang',
  icon: 'i-lucide-list-plus',
  to: '/o-master/kelola-barang',
  exact: true
}]]
</script>

<template>
  <UDashboardPanel id="transaksi" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Kelola Barang">
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
