<script setup lang="ts">
import { useProductStore } from '~/store/product'
import AddProductModal from '~/components/product/AddProductModal.vue'
import AddProductTypeModal from '~/components/product/AddProductTypeModal.vue'
import AddUnitModal from '~/components/product/AddUnitModal.vue'

const productStore = useProductStore()
const toast = useToast()

// Loading state
const loading = ref(false)

// Tab state
const selectedTab = ref('products')

// Dropdown states
const activeDropdown = ref<string | null>(null)

// Define tabs
const tabs = [
  { key: 'products', label: 'Tipe Produk' },
  { key: 'productTypes', label: 'Produk' },
  { key: 'units', label: 'Unit' }
]

// Computed properties
const products = computed(() => productStore.products)
const productTypes = computed(() => productStore.productTypes)
const units = computed(() => productStore.units)
const lowStockUnits = computed(() => productStore.lowStockUnits)

// Toggle dropdown
const toggleDropdown = (id: string) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  activeDropdown.value = null
}

// Fetch all data on component mount
onMounted(async () => {
  loading.value = true
  try {
    await productStore.fetchAllData()
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load data. Please refresh the page.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
})

// Handle refresh
const refreshData = async () => {
  loading.value = true
  try {
    await productStore.fetchAllData()
    toast.add({
      title: 'Success',
      description: 'Data refreshed successfully',
      color: 'primary'
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to refresh data',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Handle delete product
const deleteProduct = async (id: number, name: string) => {
  closeDropdown()
  try {
    await productStore.deleteProduct(id)
    toast.add({
      title: 'Success',
      description: `Product ${name} has been deleted successfully`,
      color: 'primary'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete product',
      color: 'error'
    })
  }
}

// Handle delete product type
const deleteProductType = async (id: number, name: string) => {
  closeDropdown()
  try {
    await productStore.deleteProductType(id)
    toast.add({
      title: 'Success',
      description: `Product type ${name} has been deleted successfully`,
      color: 'primary'
    })
  } catch (error) {
    console.error('Error deleting product type:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete product type',
      color: 'error'
    })
  }
}

// Handle delete unit
const deleteUnit = async (id: number, name: string) => {
  closeDropdown()
  try {
    await productStore.deleteUnit(id)
    toast.add({
      title: 'Success',
      description: `Unit ${name} has been deleted successfully`,
      color: 'primary'
    })
  } catch (error) {
    console.error('Error deleting unit:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete unit',
      color: 'error'
    })
  }
}

// Handle data added events
const onProductAdded = () => {
  // Data will be automatically updated through the store
}

const onProductTypeAdded = () => {
  // Data will be automatically updated through the store
}

const onUnitAdded = () => {
  // Data will be automatically updated through the store
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

// Get stock status color
const getStockStatusColor = (unit: any) => {
  if (unit.is_low_stock) return 'error'
  if (unit.stock <= unit.min_stock * 1.5) return 'warning'
  return 'success'
}
</script>

<template>
  <div class="space-y-6" @click="closeDropdown">
    <!-- Header -->
    <div class="flex justify-end items-center">
      <div class="flex gap-2">
        <UButton
          label="Refresh"
          icon="i-lucide-refresh-cw"
          color="primary"
          variant="outline"
          :loading="loading"
          @click="refreshData"
        />
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="lowStockUnits.length > 0" class="bg-elevated border border-warning-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <Icon name="i-lucide-alert-triangle" class="w-5 h-5 text-warning" />
        <h3 class="font-semibold text-warning">Low Stock Alert</h3>
      </div>
      <p class="text-sm mb-2">
        {{ lowStockUnits.length }} unit(s) are running low on stock
      </p>
      <div class="space-y-1">
        <div v-for="unit in lowStockUnits" :key="unit.id" class="text-sm">
          • {{ unit.product_name }} - {{ unit.product_name_type }} ({{ unit.unit_name }}): {{ unit.stock }} left
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="selectedTab = tab.key"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            selectedTab === tab.key
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-800'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Products Tab -->
    <div v-if="selectedTab === 'products'" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Tipe Produk</h2>
        <AddProductModal @product-added="onProductAdded" />
      </div>

      <div v-if="loading" class="text-center py-8">
        <Icon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto" />
        <p class="mt-2 text-gray-600">Loading products...</p>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-8">
        <Icon name="i-lucide-package" class="w-12 h-12 mx-auto" />
        <p class="mt-2 text-gray-600">No products found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-primary-600">{{ product.product_name }}</h3>
            <div class="relative">
              <button
                @click.stop="toggleDropdown(`product-${product.id}`)"
                class="p-1 rounded hover:bg-primary-700/20 transition-colors"
              >
                <Icon name="i-lucide-more-vertical" class="w-4 h-4" />
              </button>

              <!-- Custom Dropdown Menu -->
              <div
                v-if="activeDropdown === `product-${product.id}`"
                class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              >
                <!-- <button
                  @click.stop="() => {}"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon name="i-lucide-edit" class="w-3 h-3" />
                  Edit
                </button> -->
                <button
                  @click.stop="deleteProduct(product.id, product.product_name)"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Icon name="i-lucide-trash-2" class="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div class="text-sm space-y-1">
            <p>Created: {{ new Date(product.created_at || '').toLocaleDateString() }}</p>
            <p>Types: {{ productStore.getProductTypesByProductId(product.id).length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Types Tab -->
    <div v-if="selectedTab === 'productTypes'" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Produk</h2>
        <AddProductTypeModal @product-type-added="onProductTypeAdded" />
      </div>

      <div v-if="loading" class="text-center py-8">
        <Icon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto" />
        <p class="mt-2">Loading product types...</p>
      </div>

      <div v-else-if="productTypes.length === 0" class="text-center py-8">
        <Icon name="i-lucide-tag" class="w-12 h-12 mx-auto" />
        <p class="mt-2">No product types found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="productType in productTypes"
          :key="productType.id"
          class="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-primary-600">{{ productType.product_name_type }}</h3>
            <div class="relative">
              <button
                @click.stop="toggleDropdown(`productType-${productType.id}`)"
                class="p-1 rounded hover:bg-primary-700/20 transition-colors"
              >
                <Icon name="i-lucide-more-vertical" class="w-4 h-4" />
              </button>

              <!-- Custom Dropdown Menu -->
              <div
                v-if="activeDropdown === `productType-${productType.id}`"
                class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              >
                <!-- <button
                  @click.stop="() => {}"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon name="i-lucide-edit" class="w-3 h-3" />
                  Edit
                </button> -->
                <button
                  @click.stop="deleteProductType(productType.id, productType.product_name_type)"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Icon name="i-lucide-trash-2" class="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div class="text-sm space-y-1">
            <p>Product: {{ productStore.getProductById(productType.id_product)?.product_name || 'Unknown' }}</p>
            <p>Created: {{ new Date(productType.created_at || '').toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Units Tab -->
    <div v-if="selectedTab === 'units'" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Units</h2>
        <AddUnitModal @unit-added="onUnitAdded" />
      </div>

      <div v-if="loading" class="text-center py-8">
        <Icon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto" />
        <p class="mt-2">Loading units...</p>
      </div>

      <div v-else-if="units.length === 0" class="text-center py-8">
        <Icon name="i-lucide-box" class="w-12 h-12 mx-auto" />
        <p class="mt-2">No units found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="unit in units"
          :key="unit.id"
          class="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-primary-600">{{ unit.unit_name }}</h3>
            <div class="relative">
              <button
                @click.stop="toggleDropdown(`unit-${unit.id}`)"
                class="p-1 rounded hover:bg-primary-700/20 transition-colors"
              >
                <Icon name="i-lucide-more-vertical" class="w-4 h-4" />
              </button>

              <!-- Custom Dropdown Menu -->
              <div
                v-if="activeDropdown === `unit-${unit.id}`"
                class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              >
                <!-- <button
                  @click.stop="() => {}"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon name="i-lucide-edit" class="w-3 h-3" />
                  Edit
                </button> -->
                <button
                  @click.stop="deleteUnit(unit.id, unit.unit_name)"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Icon name="i-lucide-trash-2" class="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div class="text-sm space-y-1">
            <p>Tipe: {{ unit.product_name || 'Unknown' }}</p>
            <p>Produk: {{ unit.product_name_type || 'Unknown' }}</p>
            <p>Harga: {{ formatCurrency(unit.price) }}</p>
            <p>Kulak: {{ formatCurrency(unit.cost_price) }}</p>
            <div class="flex items-center gap-2">
              <span>Stok: {{ unit.stock }}</span>
              <UBadge
                :color="getStockStatusColor(unit)"
                size="xs"
              >
                {{ unit.is_low_stock ? 'Low' : 'Good' }}
              </UBadge>
            </div>
            <p>Min Stok: {{ unit.min_stock }}</p>
            <p>Cabang: {{ unit.branch || 'Unknown' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
