// stores/branch.ts
export interface Branch {
  id: number
  branch_name: string
  branch_address: string
}

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([])
  const loading = ref(false)

  const fetchBranches = async () => {
    loading.value = true
    try {
      const token = useCookie('token')
      const response = await $fetch<{message: string, data: Branch[]}>('http://app.udpadijaya.com/api/branch', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      })

      branches.value = response.data
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      loading.value = false
    }
  }

  const createBranch = async (branchData: Omit<Branch, 'id'>) => {
    const token = useCookie('token')
    const response = await $fetch<{message: string, data: Branch}>('http://app.udpadijaya.com/api/branch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: branchData
    })

    // Add to local state or refresh
    await fetchBranches()
    return response.data
  }

  const updateBranch = async (id: number, branchData: Omit<Branch, 'id'>) => {
    const token = useCookie('token')
    const response = await $fetch<{message: string, data: Branch}>(`http://app.udpadijaya.com/api/branch/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: branchData
    })

    // Refresh list after update
    await fetchBranches()
    return response.data
  }

  const deleteBranch = async (id: number) => {
    const token = useCookie('token')

    await $fetch(`http://app.udpadijaya.com/api/branch/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      }
    })

    await fetchBranches() // Refresh list after deletion
  }

  const getBranchById = (id: number) => {
    return branches.value.find(branch => branch.id === id)
  }

  return {
    branches: readonly(branches),
    loading: readonly(loading),
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchById
  }
})
