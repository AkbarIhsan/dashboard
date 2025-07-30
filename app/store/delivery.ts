// stores/delivery.ts
import { defineStore } from 'pinia'

interface Customer {
  id: number
  name: string
  customer_address: string
  phone: string
  created_at?: string
  updated_at?: string
}

interface Branch {
  branch_name: string
}

interface User {
  id: number
  username: string
  branch: Branch
}

interface SalesOrder {
  id: number
  id_user: number
  username: string
  branch_name: string
  date: string
  created_at: string
  updated_at: string
  status: string
  users?: User
}

interface Delivery {
  id: number
  id_sales_order: number
  id_customer: number
  date: string
  created_at: string
  updated_at: string
  status: 'pending' | 'completed'
  sales_order?: SalesOrder
  customer?: Customer
}

interface DeliveryState {
  deliveries: Delivery[]
  customers: Customer[]
  salesOrders: SalesOrder[]
  loading: boolean
  error: string | null
}

export const useDeliveryStore = defineStore('delivery', {
  state: (): DeliveryState => ({
    deliveries: [],
    customers: [],
    salesOrders: [],
    loading: false,
    error: null
  }),

  getters: {
    latestSalesOrder: (state) => {
      return state.salesOrders.length > 0
        ? state.salesOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null
    },

    pendingDeliveries: (state) => {
      return state.deliveries.filter(delivery => delivery.status === 'pending')
    },

    completedDeliveries: (state) => {
      return state.deliveries.filter(delivery => delivery.status === 'completed')
    }
  },

  actions: {
    async fetchDeliveries() {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const response = await $fetch<Delivery[]>('http://127.0.0.1:8000/api/delivery',{
        // method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        }
    })
        this.deliveries = response

        // Debug log untuk melihat struktur data
        console.log('Deliveries received:', response)
        if (response.length > 0) {
          console.log('First delivery structure:', response[0])
          // console.log('Sales order structure:', response[0].sales_order)
        }
      } catch (error) {
        this.error = 'Gagal mengambil data pengiriman'
        console.error('Error fetching deliveries:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCustomers() {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const response = await $fetch<Customer[]>('http://127.0.0.1:8000/api/customer',{
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        }
    })
        this.customers = response
      } catch (error) {
        this.error = 'Gagal mengambil data customer'
        console.error('Error fetching customers:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSalesOrders() {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const response = await $fetch<SalesOrder[]>('http://127.0.0.1:8000/api/sales-order',{
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        }
    })
        this.salesOrders = response
      } catch (error) {
        this.error = 'Gagal mengambil data sales order'
        console.error('Error fetching sales orders:', error)
      } finally {
        this.loading = false
      }
    },

    async createDelivery(deliveryData: { id_sales_order: number; id_customer: number }) {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const response = await $fetch<Delivery>('http://127.0.0.1:8000/api/delivery', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
          body: deliveryData
        })

        this.deliveries.push(response)
        return response
      } catch (error) {
        this.error = 'Gagal membuat pengiriman baru'
        console.error('Error creating delivery:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateDeliveryStatus(id: number, status: 'pending' | 'completed') {
      this.loading = true
      this.error = null

      try {
        const token = useCookie('token')
        const response = await $fetch<Delivery>(`http://127.0.0.1:8000/api/delivery/${id}`, {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
          body: { status }
        })

        const index = this.deliveries.findIndex(d => d.id === id)
        if (index !== -1) {
          this.deliveries[index] = response
        }

        return response
      } catch (error) {
        this.error = 'Gagal mengupdate status pengiriman'
        console.error('Error updating delivery status:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async initializeData() {
      await Promise.all([
        this.fetchDeliveries(),
        this.fetchCustomers(),
        this.fetchSalesOrders()
      ])
        console.log('Sales Orders:', this.salesOrders)
        console.log('Customers:', this.customers)
    }
  }
})
