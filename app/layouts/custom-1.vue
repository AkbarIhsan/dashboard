<script setup lang="ts">
const route = useRoute()
const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/o-master',
  onSelect: () => {
    open.value = false
  }
}, {
    label: 'Kelola Akun',
    to: '/o-master/kelola-akun',
    icon: 'i-lucide-user-plus',
    defaultOpen: true,
    children: [{
      label: 'Buat Akun',
      to: '/o-master/kelola-akun',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Riwayat',
      to: '/o-master/kelola-akun/riwayat',
      onSelect: () => {
        open.value = false
      }
  }]
}, {
  label: 'Kelola Barang',
  to: '/o-master/kelola-barang',
  icon: 'i-lucide-list-plus',
  defaultOpen: true,
  children: [{
    label: 'Kelola Barang',
    to: '/o-master/kelola-barang',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }]
},
{
    label: 'Kelola Toko',
    to: '/o-master/kelola-toko',
    icon: 'i-lucide-store',
    defaultOpen: true,
    children: [{
      label: 'Buat Toko',
      to: '/o-master/kelola-toko',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Riwayat',
      to: '/o-master/kelola-toko/riwayat',
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
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
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
