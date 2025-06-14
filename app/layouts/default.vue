<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/kasir',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Safety Stok',
  icon: 'i-lucide-boxes',
  to: '/kasir/safety-stok',
  badge: '4',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Transfer Stok',
  icon: 'i-lucide-hand-coins',
  to: '/kasir/transfer-stok',
  onSelect: () => {
    open.value = false
  }
}, {
    label: 'Transaksi',
    to: '/kasir/transaksi',
    icon: 'i-lucide-shopping-cart',
    defaultOpen: true,
    children: [{
      label: 'Transaksi Baru',
      to: '/kasir/transaksi',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Riwayat',
      to: '/kasir/transaksi/riwayat',
      onSelect: () => {
        open.value = false
      }
  }]
}, {
  label: 'Pengiriman',
  to: '/kasir/pengiriman',
  icon: 'i-lucide-car-front',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: 'Pengiriman Baru',
    to: '/kasir/pengiriman',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Riwayat',
    to: '/kasir/pengiriman/riwayat',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Kas',
  to: '/kasir/kas',
  icon: 'i-lucide-book-open',
  defaultOpen: true,
  children: [{
    label: 'Kas',
    to: '/kasir/kas',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Riwayat',
    to: '/kasir/kas/riwayat',
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
    to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
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
