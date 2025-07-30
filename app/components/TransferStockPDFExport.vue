<template>
  <div>
    <!-- Tombol Export PDF -->
    <button
      @click="exportToPDF"
      :disabled="isExporting"
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors duration-200 gap-2"
    >
      <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      {{ isExporting ? 'Exporting...' : 'Export PDF' }}
    </button>

    <!-- Hidden content untuk PDF -->
    <div
      ref="pdfContent"
      class="hidden print-content"
      style="width: 210mm; background: white; color: black; font-family: Arial, sans-serif;"
    >
      <!-- Header PDF -->
      <div class="text-center mb-8" style="padding: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">
          LAPORAN RIWAYAT TRANSFER STOCK
        </h1>
        <h2 style="font-size: 16px; margin-bottom: 15px; color: #374151; font-weight: 600;">
          {{ getBranchName()  }}
        </h2>
        <h2 style="font-size: 18px; margin-bottom: 5px; color: #374151;">
          {{ formatMonthYear(selectedMonth, selectedYear) }}
        </h2>
        <p style="font-size: 12px; color: #6b7280;">
          Dicetak pada: {{ new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) }}
        </p>
      </div>

      <!-- Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; padding: 0 20px;">
        <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center;">
          <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Total Transfer</h3>
          <p style="font-size: 28px; font-weight: bold; color: #1f2937;">{{ totalTransfers }}</p>
        </div>
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center;">
          <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Transfer Berhasil</h3>
          <p style="font-size: 28px; font-weight: bold; color: #059669;">{{ successTransfers }}</p>
        </div>
        <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center;">
          <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Transfer Ditolak</h3>
          <p style="font-size: 28px; font-weight: bold; color: #dc2626;">{{ rejectedTransfers }}</p>
        </div>
      </div>

      <!-- Tabel Transfer Stock -->
      <div style="padding: 0 20px; margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
          Detail Transfer Stock
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Tipe</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Pemohon</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Pemberi</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Produk</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: center; font-weight: bold;">Jumlah</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: center; font-weight: bold;">Status</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pdfData" :key="item.id" :style="{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }">
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">{{ index + 1 }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">
                <span :style="{
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  backgroundColor: item.transferType === 'my_requests' ? '#dbeafe' : '#f3e8ff',
                  color: item.transferType === 'my_requests' ? '#1e40af' : '#7c3aed'
                }">
                  {{ getTransferType(item) }}
                </span>
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">{{ item.user.username }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">{{ item.user2.username }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">
                {{ item.unit_request.product_type.product_name_type }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; font-weight: bold;">
                {{ item.qty_product_request }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center;">
                <span :style="{
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  backgroundColor: getStatusBgColor(item.status),
                  color: getStatusTextColor(item.status)
                }">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">
                {{ new Date(item.created_at).toLocaleDateString('id-ID') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary by Status -->
      <div style="padding: 0 20px; margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
          Ringkasan Berdasarkan Status
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; text-align: center;">
            <h4 style="font-size: 12px; color: #92400e; margin-bottom: 5px;">PENDING</h4>
            <p style="font-size: 20px; font-weight: bold; color: #d97706;">{{ pendingTransfers }}</p>
          </div>
          <div style="background-color: #d1fae5; border-radius: 8px; padding: 15px; text-align: center;">
            <h4 style="font-size: 12px; color: #065f46; margin-bottom: 5px;">SUCCESS</h4>
            <p style="font-size: 20px; font-weight: bold; color: #059669;">{{ successTransfers }}</p>
          </div>
          <div style="background-color: #fee2e2; border-radius: 8px; padding: 15px; text-align: center;">
            <h4 style="font-size: 12px; color: #991b1b; margin-bottom: 5px;">REJECTED</h4>
            <p style="font-size: 20px; font-weight: bold; color: #dc2626;">{{ rejectedTransfers }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #d1d5db; padding-top: 20px; padding-bottom: 10px;">
        <p>Laporan ini dibuat secara otomatis oleh sistem Transfer Stock</p>
        <p>© {{ new Date().getFullYear() }} - Semua hak dilindungi</p>
      </div>
    </div>

    <!-- Modal untuk pilih bulan/tahun -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-700/20 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Export Laporan Transfer Stock</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pilih Bulan</label>
            <select v-model="selectedMonth" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pilih Tahun</label>
            <select v-model="selectedYear" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter Status</label>
            <select v-model="selectedStatus" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter Tipe Transfer</label>
            <select v-model="selectedType" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Semua Tipe</option>
              <option value="my_requests">Permintaan Saya</option>
              <option value="incoming_requests">Permintaan Masuk</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            @click="generatePDF"
            :disabled="isExporting"
            class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
          >
            {{ isExporting ? 'Generating...' : 'Generate PDF' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getYear, getMonth, parseISO, format } from 'date-fns'

// Props
interface Props {
  transferData: any[]
  availableYears: number[]
}

const props = defineProps<Props>()

// State
const isExporting = ref(false)
const showModal = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const selectedStatus = ref('')
const selectedType = ref('')
const pdfContent = ref<HTMLElement>()

// Daftar bulan
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Computed untuk data yang akan di-export
const pdfData = computed(() => {
  let filtered = props.transferData.filter(item => {
    const itemDate = parseISO(item.created_at)
    const itemMonth = getMonth(itemDate) + 1
    const itemYear = getYear(itemDate)

    return itemMonth === selectedMonth.value && itemYear === selectedYear.value
  })

  // Filter berdasarkan status
  if (selectedStatus.value) {
    filtered = filtered.filter(item => item.status === selectedStatus.value)
  }

  // Filter berdasarkan tipe
  if (selectedType.value) {
    filtered = filtered.filter(item => item.transferType === selectedType.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const getBranchName = () => {
  if (pdfData.value.length > 0 && pdfData.value[0]?.user?.branch.branch_name) {
    return pdfData.value[0]?.user?.branch.branch_name
  }
  return 'Nama Toko Tidak Tersedia'
}

// Computed untuk statistik
const totalTransfers = computed(() => pdfData.value.length)

const successTransfers = computed(() =>
  pdfData.value.filter(item => item.status === 'success').length
)

const rejectedTransfers = computed(() =>
  pdfData.value.filter(item => item.status === 'rejected').length
)

const pendingTransfers = computed(() =>
  pdfData.value.filter(item => item.status === 'pending').length
)

// Helper functions
const getTransferType = (transfer: any) => {
  return transfer.transferType === 'my_requests' ? 'Permintaan Saya' : 'Permintaan Masuk'
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'PENDING'
    case 'success': return 'SUCCESS'
    case 'rejected': return 'REJECTED'
    default: return status.toUpperCase()
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'pending': return '#fef3c7'
    case 'success': return '#d1fae5'
    case 'rejected': return '#fee2e2'
    default: return '#f3f4f6'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'pending': return '#d97706'
    case 'success': return '#059669'
    case 'rejected': return '#dc2626'
    default: return '#374151'
  }
}

// Format month year
const formatMonthYear = (month: number, year: number) => {
  return `${months[month - 1]} ${year}`
}

// Show modal untuk pilih periode
const exportToPDF = () => {
  showModal.value = true
}

// Generate PDF
const generatePDF = async () => {
  if (pdfData.value.length === 0) {
    alert('Tidak ada data transfer stock untuk periode yang dipilih')
    return
  }

  isExporting.value = true

  try {
    // Import jsPDF dan html2canvas
    const jsPDF = (await import('jspdf')).default
    const html2canvas = (await import('html2canvas')).default

    // Show content temporarily
    if (pdfContent.value) {
      pdfContent.value.style.display = 'block'
      pdfContent.value.style.position = 'absolute'
      pdfContent.value.style.left = '-9999px'
      pdfContent.value.style.top = '0'
    }

    // Wait a bit for content to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Convert to canvas
    const canvas = await html2canvas(pdfContent.value!, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: pdfContent.value!.scrollHeight
    })

    // Hide content again
    if (pdfContent.value) {
      pdfContent.value.style.display = 'none'
    }

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save PDF
    const statusFilter = selectedStatus.value ? `-${selectedStatus.value}` : ''
    const typeFilter = selectedType.value ? `-${selectedType.value.replace('_', '-')}` : ''
    const fileName = `Laporan-Transfer-Stock-${formatMonthYear(selectedMonth.value, selectedYear.value).replace(' ', '-')}${statusFilter}${typeFilter}.pdf`
    pdf.save(fileName)

    showModal.value = false

  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Terjadi kesalahan saat membuat PDF. Pastikan browser mendukung html2canvas dan jsPDF.')
  } finally {
    isExporting.value = false
  }
}

// Watch untuk hide content initially
watch(() => pdfContent.value, (newVal) => {
  if (newVal) {
    newVal.style.display = 'none'
  }
}, { immediate: true })
</script>

<style scoped>
.print-content {
  font-family: Arial, sans-serif !important;
}

@media print {
  .print-content {
    display: block !important;
  }
}
</style>
