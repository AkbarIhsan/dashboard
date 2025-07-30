<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useProductStore } from '~/store/product'

// Define the schema for unit
const schema = z.object({
  id_product_type: z.number().min(1, 'Please select a product type'),
  id_branch: z.number().min(1, 'Please select a branch'),
  unit_name: z.string().min(2, 'Unit name must be at least 2 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  cost_price: z.number().min(0, 'Cost price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  min_stock: z.number().min(0, 'Minimum stock must be a positive number')
})

const emit = defineEmits<{
  unitAdded: []
}>()

const open = ref(false)
const productStore = useProductStore()

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  id_product_type: undefined,
  id_branch: undefined,
  unit_name: undefined,
  price: undefined,
  cost_price: undefined,
  stock: undefined,
  min_stock: undefined
})

const toast = useToast()

// Loading state for submit button
const isSubmitting = ref(false)

// Get product types for dropdown
const productTypes = computed(() => productStore.productTypes)

// Options for product type dropdown
const productTypeOptions = computed(() =>
  productTypes.value.map(type => ({
    value: type.id,
    label: `${type.product_name_type} (${productStore.getProductById(type.id_product)?.product_name || 'Unknown Product'})`
  }))
)

// Mock branch options - you might want to fetch this from a branch store
const branchOptions = [
  { value: 1, label: 'Main Branch' },
  { value: 2, label: 'Branch 2' },
  { value: 3, label: 'Branch 3' }
]

// Fetch product types on mount
onMounted(async () => {
  if (productTypes.value.length === 0) {
    await productStore.fetchProductTypes()
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  try {
    await productStore.createUnit(event.data)

    toast.add({
      title: 'Success',
      description: `Unit ${event.data.unit_name} has been added successfully`,
      color: 'primary'
    })

    // Reset form
    Object.keys(state).forEach(key => {
      state[key as keyof typeof state] = undefined
    })

    // Close modal
    open.value = false

    // Emit event to parent component
    emit('unitAdded')

  } catch (error: any) {
    console.error('Error creating unit:', error)

    toast.add({
      title: 'Error',
      description: 'Failed to create unit. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  Object.keys(state).forEach(key => {
    state[key as keyof typeof state] = undefined
  })
}

function onCancel() {
  resetForm()
  open.value = false
}

// Format currency input
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(value)
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add New Unit"
    description="Create a new unit for a product type"
  >
    <UButton
      label="New Unit"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Produk"
            placeholder="Select a product type"
            name="id_product_type"
            required
          >
            <select
              v-model="state.id_product_type"
              name="id_product_type"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Select product type...</option>
              <option
                v-for="option in productTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </UFormField>

          <UFormField
            label="Toko Cabang"
            placeholder="Select a branch"
            name="id_branch"
            required
          >
            <select
              v-model="state.id_branch"
              name="id_branch"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Select branch...</option>
              <option
                v-for="option in branchOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </UFormField>
        </div>

        <UFormField
          label="Unit"
          placeholder="Enter unit name"
          name="unit_name"
          required
        >
          <UInput
            v-model="state.unit_name"
            class="w-full"
            placeholder="satuan, kiloan, gram"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Harga Jual"
            placeholder="Enter selling price"
            name="price"
            required
          >
            <UInput
              v-model="state.price"
              type="number"
              class="w-full"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </UFormField>

          <UFormField
            label="Harga Beli"
            placeholder="Enter cost price"
            name="cost_price"
            required
          >
            <UInput
              v-model="state.cost_price"
              type="number"
              class="w-full"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Stok ditambahkan"
            placeholder="Enter initial stock"
            name="stock"
            required
          >
            <UInput
              v-model="state.stock"
              type="number"
              class="w-full"
              placeholder="0"
              min="0"
            />
          </UFormField>

          <UFormField
            label="Minimal Stok"
            placeholder="Enter minimum stock"
            name="min_stock"
            required
          >
            <UInput
              v-model="state.min_stock"
              type="number"
              class="w-full"
              placeholder="0"
              min="0"
            />
          </UFormField>
        </div>

        <!-- Price Preview -->
        <div v-if="state.price && state.cost_price" class="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 class="font-medium text-gray-900">Price Summary</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Selling Price:</span>
              <span class="font-medium ml-2">{{ formatCurrency(state.price) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Cost Price:</span>
              <span class="font-medium ml-2">{{ formatCurrency(state.cost_price) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Profit:</span>
              <span class="font-medium ml-2" :class="(state.price - state.cost_price) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(state.price - state.cost_price) }}
              </span>
            </div>
            <div>
              <span class="text-gray-600">Margin:</span>
              <span class="font-medium ml-2" :class="(state.price - state.cost_price) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ ((state.price - state.cost_price) / state.price * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Stock Warning -->
        <div v-if="state.stock && state.min_stock && state.stock <= state.min_stock" class="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <Icon name="i-lucide-alert-triangle" class="w-4 h-4 text-orange-600" />
            <span class="text-sm text-orange-800">
              Warning: Initial stock is at or below minimum stock level
            </span>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            :disabled="isSubmitting"
            @click="onCancel"
          />
          <UButton
            label="Create Unit"
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
