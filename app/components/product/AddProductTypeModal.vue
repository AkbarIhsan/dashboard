<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useProductStore } from '~/store/product'

// Define the schema for product type
const schema = z.object({
  id_product: z.number().min(1, 'Please select a product'),
  product_name_type: z.string().min(2, 'Product type name must be at least 2 characters')
})

const emit = defineEmits<{
  productTypeAdded: []
}>()

const open = ref(false)
const productStore = useProductStore()

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  id_product: undefined,
  product_name_type: undefined
})

const toast = useToast()

// Loading state for submit button
const isSubmitting = ref(false)

// Get products for dropdown
const products = computed(() => productStore.products)

// Options for product dropdown
const productOptions = computed(() =>
  products.value.map(product => ({
    value: product.id,
    label: product.product_name
  }))
)

// Fetch products on mount
onMounted(async () => {
  if (products.value.length === 0) {
    await productStore.fetchProducts()
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  try {
    await productStore.createProductType(event.data)

    toast.add({
      title: 'Success',
      description: `Product type ${event.data.product_name_type} has been added successfully`,
      color: 'primary'
    })

    // Reset form
    state.id_product = undefined
    state.product_name_type = undefined

    // Close modal
    open.value = false

    // Emit event to parent component
    emit('productTypeAdded')

  } catch (error: any) {
    console.error('Error creating product type:', error)

    toast.add({
      title: 'Error',
      description: 'Failed to create product type. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  state.id_product = undefined
  state.product_name_type = undefined
}

function onCancel() {
  resetForm()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add New Product Type"
    description="Create a new product type for an existing product"
  >
    <UButton
      label="New Product Type"
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
  label="Product"
  name="id_product"
  required
>
  <select
    v-model="state.id_product"
    placeholder="Select a product"
    name="id_product"
    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="" disabled>Select product...</option>
    <option
      v-for="option in productOptions"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</UFormField>

        <UFormField
          label="Product Type Name"
          placeholder="Enter product type name"
          name="product_name_type"
          required
        >
          <UInput
            v-model="state.product_name_type"
            class="w-full"
            placeholder="e.g. Gaming, Office, Budget"
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
            label="Create Product Type"
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
