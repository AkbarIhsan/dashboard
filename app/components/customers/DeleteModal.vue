<script setup lang="ts">
import type { Customer } from '~/store/customer'
import { useCustomerStore } from '~/store/customer'

interface Props {
  customers?: Customer[]
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  customers: () => [],
  count: 0
})

const emit = defineEmits<{
  deleted: []
}>()

const { deleteCustomer } = useCustomerStore()
const open = ref(false)
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    // Delete multiple customers
    if (props.customers.length > 0) {
      await Promise.all(props.customers.map(customer => deleteCustomer(customer.id)))
    }

    // Emit event to parent component
    emit('deleted')
    open.value = false
  } catch (error) {
    console.error('Error deleting customers:', error)
    // Handle error (you might want to show a toast notification)
  } finally {
    loading.value = false
  }
}

// Expose open state for parent component
defineExpose({
  open
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Delete ${count} customer${count > 1 ? 's' : ''}`"
    :description="`Are you sure you want to delete ${count > 1 ? 'these customers' : 'this customer'}? This action cannot be undone.`"
  >
    <slot />

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          :disabled="loading"
          @click="open = false"
        />
        <UButton
          label="Delete"
          color="error"
          variant="solid"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
