// stores/customer.ts
export interface Customer {
  id: number
  name: string
  customer_address: string
  phone: string
}
export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)

  const fetchCustomers = async () => {
    loading.value = true
    try {
      const token = useCookie('token')
      const data  = await $fetch<Customer[]>('http://127.0.0.1:8000/api/customer', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      customers.value = data
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      loading.value = false
    }
  }

  // In your customer store
  const createCustomer = async (customerData: Omit<Customer, 'id'>) => {
    const token = useCookie('token')
    const newCustomer = await $fetch<Customer>('http://127.0.0.1:8000/api/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: customerData
    })

    // Add to local state or refresh
    await fetchCustomers()
    return newCustomer
  }

const deleteCustomer = async (id: number) => {
  const token = useCookie('token')

  await $fetch(`http://127.0.0.1:8000/api/customer/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.value}`,
    }
  })

  await fetchCustomers() // Refresh list after deletion
}

  return {
    customers: readonly(customers),
    loading: readonly(loading),
    fetchCustomers,
    deleteCustomer
  }
})
