<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useProductStore } from '~/store/product'

// Define the schema for product
const schema = z.object({
  product_name: z.string().min(2, 'Product name must be at least 2 characters')
})

const emit = defineEmits<{
  productAdded: []
}>()

const open = ref(false)
const productStore = useProductStore()

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  product_name: undefined
})

const toast = useToast()

// Loading state for submit button
const isSubmitting = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  try {
    await productStore.createProduct(event.data)

    toast.add({
      title: 'Success',
      description: `Product ${event.data.product_name} has been added successfully`,
      color: 'primary'
    })

    // Reset form
    state.product_name = undefined

    // Close modal
    open.value = false

    // Emit event to parent component
    emit('productAdded')

  } catch (error: any) {
    console.error('Error creating product:', error)

    toast.add({
      title: 'Error',
      description: 'Failed to create product. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  state.product_name = undefined
}

function onCancel() {
  resetForm()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add New Product"
    description="Create a new product in the system"
  >
    <UButton
      label="New Product"
      icon="i-lucide-plus"
      color="primary"
      @click="open = true"
    />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Product Name"
          placeholder="Enter product name"
          name="product_name"
          required
        >
          <UInput
            v-model="state.product_name"
            class="w-full"
            placeholder="e.g. Laptop Gaming"
          />
        </UFormField>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            :disabled="isSubmitting"
            @click="onCancel"
          />
          <UButton
            label="Create Product"
            color="primary"
            variant="solid"
            type="submit"
            icon="i-lucide-plus"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
