<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useCustomerStore } from '~/store/customer';

// Define the schema based on your Customer model
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(12, 'Phone must not exceed 12 digits')
})

const emit = defineEmits<{
  customerAdded: []
}>()

const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  customer_address: undefined,
  phone: undefined
})

const toast = useToast()
const customerStore = useCustomerStore()

// Loading state for submit button
const isSubmitting = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  try {
    const token = useCookie('token')

    // Create customer via API
    const newCustomer = await $fetch<any>('http://127.0.0.1:8000/api/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: event.data
    })

    toast.add({
      title: 'Success',
      description: `Customer ${event.data.name} has been added successfully`,
      color: 'primary'
    })

    // Reset form
    state.name = undefined
    state.customer_address = undefined
    state.phone = undefined

    // Close modal
    open.value = false

    // Refresh customer list in store
    await customerStore.fetchCustomers()

    // Emit event to parent component
    emit('customerAdded')

  } catch (error: any) {
    console.error('Error creating customer:', error)

    // Handle validation errors from Laravel
    if (error.data && error.data.errors) {
      const errors = error.data.errors
      let errorMessage = 'Validation failed:'

      Object.keys(errors).forEach(key => {
        errorMessage += `\n${key}: ${errors[key].join(', ')}`
      })

      toast.add({
        title: 'Validation Error',
        description: errorMessage,
        color: 'error'
      })
    } else {
      toast.add({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        color: 'error'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  state.name = undefined
  state.customer_address = undefined
  state.phone = undefined
}

function onCancel() {
  resetForm()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add New Customer"
    description="Create a new customer record in the database"
  >
    <UButton
      label="New Customer"
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
          label="Customer Name"
          placeholder="Enter customer name"
          name="name"
          required
        >
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="e.g. John Doe"
          />
        </UFormField>

        <UFormField
          label="Phone Number"
          placeholder="Enter phone number"
          name="phone"
          required
        >
          <UInput
            v-model="state.phone"
            class="w-full"
            placeholder="e.g. 081234567890"
            type="tel"
          />
        </UFormField>

        <UFormField
          label="Address"
          placeholder="Enter customer address"
          name="customer_address"
          required
        >
          <UTextarea
            v-model="state.customer_address"
            class="w-full"
            placeholder="e.g. Jl. Contoh No. 123, Surabaya"
            :rows="3"
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
            label="Create Customer"
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
