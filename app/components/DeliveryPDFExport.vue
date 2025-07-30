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
          LAPORAN RIWAYAT PENGIRIMAN
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
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; padding: 0 20px;">
        <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Total Pengiriman</h3>
          <p style="font-size: 20px; font-weight: bold; color: #1f2937;">{{ totalDeliveries }}</p>
        </div>
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Pending</h3>
          <p style="font-size: 20px; font-weight: bold; color: #1f2937;">{{ pendingDeliveries }}</p>
        </div>
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Selesai</h3>
          <p style="font-size: 20px; font-weight: bold; color: #1f2937;">{{ completedDeliveries }}</p>
        </div>
      </div>

      <!-- Tabel Pengiriman -->
      <div style="padding: 0 20px; margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
          Detail Pengiriman
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">ID Sales Order</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Customer</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Tanggal Pengiriman</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: center; font-weight: bold;">Status</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 6px; text-align: left; font-weight: bold;">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pdfData" :key="item.id" :style="{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }">
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">{{ index + 1 }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left; font-weight: bold;">SO-{{ item.id_sales_order }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">{{ getCustomerName(item.id_customer) }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">
                {{ formatDate(item.date) }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center;">
                <span :style="getStatusStyle(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: left;">
                {{ formatDateTime(item.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Status Summary -->
      <div style="padding: 0 20px; margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
          Ringkasan Status
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #f59e0b;">Pengiriman Pending ({{ pendingDeliveries }})</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li v-for="item in pendingList" :key="item.id" style="padding: 5px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
                SO-{{ item.id_sales_order }} - {{ getCustomerName(item.id_customer) }}
              </li>
            </ul>
          </div>
          <div>
            <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #10b981;">Pengiriman Selesai ({{ completedDeliveries }})</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li v-for="item in completedList.slice(0, 10)" :key="item.id" style="padding: 5px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
                SO-{{ item.id_sales_order }} - {{ getCustomerName(item.id_customer) }}
              </li>
              <li v-if="completedList.length > 10" style="padding: 5px 0; font-size: 12px; font-style: italic; color: #6b7280;">
                ... dan {{ completedList.length - 10 }} pengiriman lainnya
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #d1d5db; padding-top: 20px; padding-bottom: 10px;">
        <p>Laporan ini dibuat secara otomatis oleh sistem POS</p>
        <p>© {{ new Date().getFullYear() }} - Semua hak dilindungi</p>
      </div>
    </div>

    <!-- Modal untuk pilih bulan/tahun -->
    <div v-if="showModal" class="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Export Laporan Pengiriman PDF</h3>

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

          <div class="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="font-medium mb-1">Preview Data:</p>
            <p>{{ previewData.total }} pengiriman ditemukan</p>
            <p>{{ previewData.pending }} pending, {{ previewData.completed }} selesai</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            @click="generatePDF"
            :disabled="isExporting || previewData.total === 0"
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
import { getYear, getMonth, parseISO } from 'date-fns'

// Props
interface Props {
  deliveries: any[]
  customers: any[]
  availableYears: number[]
}

const props = defineProps<Props>()

// State
const isExporting = ref(false)
const showModal = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const pdfContent = ref<HTMLElement>()

// Daftar bulan
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Computed untuk data yang akan di-export
const pdfData = computed(() => {
  return props.deliveries.filter(item => {
    const itemDate = parseISO(item.created_at)
    const itemMonth = getMonth(itemDate) + 1
    const itemYear = getYear(itemDate)

    return itemMonth === selectedMonth.value && itemYear === selectedYear.value
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const getBranchName = () => {
  console.log('Getting branch name from pdfData:', pdfData.value)

  if (pdfData.value.length > 0) {
    const firstItem = pdfData.value[0]
    console.log('First item structure:', firstItem)

    // Cek berbagai kemungkinan struktur data
    if (firstItem.sales_order?.branch_name) {
      return firstItem.sales_order.branch_name
    }

    if (firstItem.salesOrder?.branch_name) {
      return firstItem.salesOrder.branch_name
    }

    if (firstItem.branch_name) {
      return firstItem.branch_name
    }

    // Fallback jika ada di level yang lebih dalam
    if (firstItem.sales_order?.users?.branch?.branch_name) {
      return firstItem.sales_order.users.branch.branch_name
    }

    if (firstItem.salesOrder?.users?.branch?.branch_name) {
      return firstItem.salesOrder.users.branch.branch_name
    }
  }

  return 'Nama Toko Tidak Tersedia'
}

// Computed untuk statistik
const totalDeliveries = computed(() => pdfData.value.length)
const pendingDeliveries = computed(() => pdfData.value.filter(item => item.status === 'pending').length)
const completedDeliveries = computed(() => pdfData.value.filter(item => item.status === 'completed').length)
const completionRate = computed(() => {
  if (totalDeliveries.value === 0) return 0
  return Math.round((completedDeliveries.value / totalDeliveries.value) * 100)
})

// Computed untuk daftar berdasarkan status
const pendingList = computed(() => pdfData.value.filter(item => item.status === 'pending'))
const completedList = computed(() => pdfData.value.filter(item => item.status === 'completed'))

// Computed untuk preview data
const previewData = computed(() => {
  const filtered = props.deliveries.filter(item => {
    const itemDate = parseISO(item.created_at)
    const itemMonth = getMonth(itemDate) + 1
    const itemYear = getYear(itemDate)
    return itemMonth === selectedMonth.value && itemYear === selectedYear.value
  })

  return {
    total: filtered.length,
    pending: filtered.filter(item => item.status === 'pending').length,
    completed: filtered.filter(item => item.status === 'completed').length
  }
})

// Helper functions
const getCustomerName = (customerId: number) => {
  if (!props.customers || !Array.isArray(props.customers)) {
    return 'Customer tidak ditemukan'
  }
  const customer = props.customers.find(c => c.id === customerId)
  return customer ? customer.name : 'Customer tidak ditemukan'
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid DateTime'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Selesai'
    default:
      return 'Unknown'
  }
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return 'background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;'
    case 'completed':
      return 'background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;'
    default:
      return 'background-color: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;'
  }
}

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
    alert('Tidak ada data pengiriman untuk periode yang dipilih')
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
    const fileName = `Laporan-Pengiriman-${formatMonthYear(selectedMonth.value, selectedYear.value).replace(' ', '-')}.pdf`
    pdf.save(fileName)

    showModal.value = false

  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Terjadi kesalahan saat membuat PDF')
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
