<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kelola Toko</h1>
      <UButton @click="showCreateModal = true" color="primary">
        <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
        Tambah Toko
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Branches Table -->
    <UCard v-else>
      <template #header>
        <h3 class="text-lg font-semibold">Daftar Toko</h3>
      </template>

      <div v-if="branches.length === 0" class="text-center py-12">
        <Icon name="i-heroicons-building-storefront" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Belum ada toko yang terdaftar</p>
        <UButton @click="showCreateModal = true" color="primary" class="mt-4">
          Tambah Toko Pertama
        </UButton>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <!-- <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ID</th> -->
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nama Toko</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Alamat</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in branches" :key="branch.id" class="border-b border-gray-100 dark:border-gray-800">
              <!-- <td class="py-3 px-4 text-gray-900 dark:text-gray-100">{{ branch.id }}</td> -->
              <td class="py-3 px-4 text-gray-900 dark:text-gray-100">{{ branch.branch_name }}</td>
              <td class="py-3 px-4 text-gray-500 dark:text-gray-400">{{ branch.branch_address }}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <UButton
                    @click="editBranch(branch)"
                    color="info"
                    variant="ghost"
                    size="sm"
                  >
                    <Icon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </UButton>
                  <UButton
                    @click="confirmDelete(branch)"
                    color="error"
                    variant="ghost"
                    size="sm"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4" />
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit' : 'Tambah' }} Toko</h3>
        </template>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Toko
            </label>
            <UInput
              v-model="form.branch_name"
              placeholder="Masukkan nama toko"
              :error="errors.branch_name"
              required
            />
            <p v-if="errors.branch_name" class="mt-1 text-sm text-red-600">
              {{ errors.branch_name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alamat Toko
            </label>
            <UTextarea
              v-model="form.branch_address"
              placeholder="Masukkan alamat toko"
              :error="errors.branch_address"
              row="3"
              required
            />
            <p v-if="errors.branch_address" class="mt-1 text-sm text-red-600">
              {{ errors.branch_address }}
            </p>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <UButton @click="closeModal" color="neutral" variant="ghost">
              Batal
            </UButton>
            <UButton type="submit" color="primary" :loading="submitting">
              {{ isEditing ? 'Perbarui' : 'Simpan' }}
            </UButton>
          </div>
        </form>
      </UCard>

    <!-- Delete Confirmation Modal -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">Konfirmasi Hapus</h3>
        </template>

        <p class="text-gray-600 dark:text-gray-400">
          Apakah Anda yakin ingin menghapus toko <strong>{{ branchToDelete?.branch_name }}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div class="flex justify-end space-x-2 pt-4">
          <UButton @click="showDeleteModal = false" color="neutral" variant="ghost">
            Batal
          </UButton>
          <UButton @click="deleteBranchConfirm" color="error" :loading="deleting">
            Hapus
          </UButton>
        </div>
      </UCard>
  </div>
</template>

<script setup lang="ts">
import { useBranchStore, type Branch } from '~/store/branch'

const branchStore = useBranchStore()
const toast = useToast()

const { branches, loading } = storeToRefs(branchStore)

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const deleting = ref(false)

// Form data
const form = ref({
  branch_name: '',
  branch_address: ''
})

const errors = ref({
  branch_name: '',
  branch_address: ''
})

const branchToDelete = ref<Branch | null>(null)
const branchToEdit = ref<Branch | null>(null)

// Fetch branches on mount
onMounted(async () => {
  await branchStore.fetchBranches()
})

// Form methods
const resetForm = () => {
  form.value = {
    branch_name: '',
    branch_address: ''
  }
  errors.value = {
    branch_name: '',
    branch_address: ''
  }
  isEditing.value = false
  branchToEdit.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const editBranch = (branch: Branch) => {
  isEditing.value = true
  branchToEdit.value = branch
  form.value = {
    branch_name: branch.branch_name,
    branch_address: branch.branch_address
  }
  showCreateModal.value = true
}

const validateForm = () => {
  errors.value = {
    branch_name: '',
    branch_address: ''
  }

  if (!form.value.branch_name.trim()) {
    errors.value.branch_name = 'Nama toko harus diisi'
  }

  if (!form.value.branch_address.trim()) {
    errors.value.branch_address = 'Alamat toko harus diisi'
  }

  return !errors.value.branch_name && !errors.value.branch_address
}

const submitForm = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    if (isEditing.value && branchToEdit.value) {
      await branchStore.updateBranch(branchToEdit.value.id, form.value)
      toast.add({
        title: 'Berhasil',
        description: 'Toko berhasil diperbarui',
        color: 'success'
      })
    } else {
      await branchStore.createBranch(form.value)
      toast.add({
        title: 'Berhasil',
        description: 'Toko berhasil ditambahkan',
        color: 'success'
      })
    }
    closeModal()
  } catch (error: any) {
    console.error('Error saving branch:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Terjadi kesalahan saat menyimpan toko',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (branch: Branch) => {
  branchToDelete.value = branch
  showDeleteModal.value = true
}

const deleteBranchConfirm = async () => {
  if (!branchToDelete.value) return

  deleting.value = true
  try {
    await branchStore.deleteBranch(branchToDelete.value.id)
    toast.add({
      title: 'Berhasil',
      description: 'Toko berhasil dihapus',
      color: 'success'
    })
    showDeleteModal.value = false
    branchToDelete.value = null
  } catch (error: any) {
    console.error('Error deleting branch:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Terjadi kesalahan saat menghapus toko',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}
</script>
