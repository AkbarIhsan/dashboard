// stores/product.ts
import { defineStore } from 'pinia'

interface Product {
  id: number
  product_name: string
  created_at?: string
  updated_at?: string
}

interface ProductType {
  id: number
  id_product: number
  product_name_type: string
  product?: Product
  created_at?: string
  updated_at?: string
}

interface Unit {
  id: number
  id_product_type: number
  id_branch: number
  unit_name: string
  price: number
  cost_price: number
  stock: number
  min_stock: number
  branch?: string
  product_name_type?: string
  product_name?: string
  is_low_stock?: boolean
  stock_status?: string
}

interface ProductState {
  products: Product[]
  productTypes: ProductType[]
  units: Unit[]
  loading: boolean
  error: string | null
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    productTypes: [],
    units: [],
    loading: false,
    error: null
  }),

  getters: {
    getProductById: (state) => (id: number) => {
      return state.products.find(product => product.id === id)
    },

    getProductTypeById: (state) => (id: number) => {
      return state.productTypes.find(type => type.id === id)
    },

    getProductTypesByProductId: (state) => (productId: number) => {
      return state.productTypes.filter(type => type.id_product === productId)
    },

    getUnitById: (state) => (id: number) => {
      return state.units.find(unit => unit.id === id)
    },

    lowStockUnits: (state) => {
      return state.units.filter(unit => unit.is_low_stock)
    }
  },

  actions: {
    // Helper method untuk mendapatkan token
    getAuthHeaders() {
      const token = useCookie('token')
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      }
    },

    // ===== PRODUCT ACTIONS =====
    async fetchProducts(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Product[]>('http://127.0.0.1:8000/api/product', {
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.products = data.value || []
      } catch (error: any) {
        this.error = 'Gagal memuat data produk'
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async createProduct(productData: { product_name: string }): Promise<Product> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Product>('http://127.0.0.1:8000/api/product', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: productData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const newProduct = data.value!
        this.products.push(newProduct)

        return newProduct
      } catch (error: any) {
        this.error = 'Gagal membuat produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: number, productData: { product_name: string }): Promise<Product> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Product>(`http://127.0.0.1:8000/api/product/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: productData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const updatedProduct = data.value!
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }

        return updatedProduct
      } catch (error: any) {
        this.error = 'Gagal mengupdate produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: number): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { error } = await useFetch(`http://127.0.0.1:8000/api/product/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.products = this.products.filter(p => p.id !== id)
      } catch (error: any) {
        this.error = 'Gagal menghapus produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ===== PRODUCT TYPE ACTIONS =====
    async fetchProductTypes(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<ProductType[]>('http://127.0.0.1:8000/api/product-types', {
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.productTypes = data.value || []
      } catch (error: any) {
        this.error = 'Gagal memuat data tipe produk'
        console.error('Error fetching product types:', error)
      } finally {
        this.loading = false
      }
    },

    async createProductType(productTypeData: { id_product: number, product_name_type: string }): Promise<ProductType> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<ProductType>('http://127.0.0.1:8000/api/product-types', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: productTypeData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const newProductType = data.value!
        this.productTypes.push(newProductType)

        return newProductType
      } catch (error: any) {
        this.error = 'Gagal membuat tipe produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProductType(id: number, productTypeData: Partial<{ id_product: number, product_name_type: string }>): Promise<ProductType> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<{ data: ProductType }>(`http://127.0.0.1:8000/api/product-types/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: productTypeData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const updatedProductType = data.value!.data
        const index = this.productTypes.findIndex(pt => pt.id === id)
        if (index !== -1) {
          this.productTypes[index] = updatedProductType
        }

        return updatedProductType
      } catch (error: any) {
        this.error = 'Gagal mengupdate tipe produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProductType(id: number): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { error } = await useFetch(`http://127.0.0.1:8000/api/product-types/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.productTypes = this.productTypes.filter(pt => pt.id !== id)
      } catch (error: any) {
        this.error = 'Gagal menghapus tipe produk'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ===== UNIT ACTIONS =====
    async fetchUnits(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Unit[]>('http://127.0.0.1:8000/api/unit', {
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.units = data.value || []
      } catch (error: any) {
        this.error = 'Gagal memuat data unit'
        console.error('Error fetching units:', error)
      } finally {
        this.loading = false
      }
    },

    async createUnit(unitData: {
      id_product_type: number
      id_branch: number
      unit_name: string
      price: number
      cost_price: number
      stock: number
      min_stock: number
    }): Promise<Unit> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Unit>('http://127.0.0.1:8000/api/unit', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: unitData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const newUnit = data.value!
        this.units.push(newUnit)

        return newUnit
      } catch (error: any) {
        this.error = 'Gagal membuat unit'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUnit(id: number, unitData: Partial<{
      id_product_type: number
      id_branch: number
      unit_name: string
      price: number
      cost_price: number
      stock: number
      min_stock: number
    }>): Promise<Unit> {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch<Unit>(`http://127.0.0.1:8000/api/unit/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: unitData,
          server: false
        })

        if (error.value) {
          throw error.value
        }

        const updatedUnit = data.value!
        const index = this.units.findIndex(u => u.id === id)
        if (index !== -1) {
          this.units[index] = updatedUnit
        }

        return updatedUnit
      } catch (error: any) {
        this.error = 'Gagal mengupdate unit'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUnit(id: number): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { error } = await useFetch(`http://127.0.0.1:8000/api/unit/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
          server: false
        })

        if (error.value) {
          throw error.value
        }

        this.units = this.units.filter(u => u.id !== id)
      } catch (error: any) {
        this.error = 'Gagal menghapus unit'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ===== UTILITY ACTIONS =====
    async fetchAllData(): Promise<void> {
      await Promise.all([
        this.fetchProducts(),
        this.fetchProductTypes(),
        this.fetchUnits()
      ])
    },

    clearError(): void {
      this.error = null
    }
  }
})
