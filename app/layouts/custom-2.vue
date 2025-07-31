<script setup lang="ts">
import { useSafetyStockStore } from '@/store/safety'

const safetyStockStore = useSafetyStockStore()
onMounted(() => {
  safetyStockStore.fetchSafetyStockData()
})

const route = useRoute()
const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/o-cabang',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Riwayat Penjualan',
  icon: 'i-lucide-clock',
  to: '/o-cabang/riwayat-penjualan',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Riwayat Kas',
  icon: 'i-lucide-book-open',
  to: '/o-cabang/riwayat-kas',
  onSelect: () => {
    open.value = false
  }
},   {
    label: 'Prediksi Penjualan',
    icon: 'i-lucide-boxes',
    to: '/o-cabang/prediksi-stok',
    badge: safetyStockStore.totalSafetyItems || undefined,
    onSelect: () => { open.value = false }
  },
{
  label: 'Riwayat Pengiriman',
  icon: 'i-lucide-car-front',
  to: '/o-cabang/riwayat-pengiriman',
  onSelect: () => {
    open.value = false
  }
}, {
    label: 'Kelola Akun Kasir',
    to: '/o-cabang/kelola-akun-kasir',
    icon: 'i-lucide-user-plus',
    defaultOpen: true,
    children: [{
      label: 'Kelola Akun Kasir',
      to: '/o-cabang/kelola-akun-kasir',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Riwayat',
      to: '/o-cabang/kelola-akun-kasir/riwayat',
      onSelect: () => {
        open.value = false
      }
  }]
}, {
  label: 'Kelola Transfer Stock',
  to: '/o-cabang/kelola-transfer-stock',
  icon: 'i-lucide-hand-coins',
  defaultOpen: true,
  children: [{
    label: 'Kelola Transfer Stock',
    to: '/o-cabang/kelola-transfer-stock',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Riwayat',
    to: '/o-cabang/kelola-transfer-stock/riwayat',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Catatan Pembelian',
  to: '/o-cabang/catatan-pembelian',
  icon: 'i-lucide-shopping-basket',
  defaultOpen: true,
  children: [{
    label: 'Catatan Pembelian',
    to: '/o-cabang/catatan-pembelian',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Riwayat',
    to: '/o-cabang/catatan-pembelian/riwayat',
    onSelect: () => {
      open.value = false
    }
  }]
}]]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: ``,
    target: '_blank'
  }]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
