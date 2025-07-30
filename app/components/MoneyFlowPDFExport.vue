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
          LAPORAN KAS
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
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; padding: 0 20px;">
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Total Pemasukan</h3>
          <p style="font-size: 20px; font-weight: bold; color: #10b981;">{{ formatCurrency(totalIncome) }}</p>
          <p style="font-size: 10px; color: #6b7280;">{{ totalIncomeCount }} transaksi</p>
        </div>
        <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Total Pengeluaran</h3>
          <p style="font-size: 20px; font-weight: bold; color: #ef4444;">{{ formatCurrency(totalExpense) }}</p>
          <p style="font-size: 10px; color: #6b7280;">{{ totalExpenseCount }} transaksi</p>
        </div>
        <!-- <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Saldo Bersih</h3>
          <p
            style="font-size: 20px; font-weight: bold;"
            :style="{ color: netBalance >= 0 ? '#10b981' : '#ef4444' }"
          >
            {{ formatCurrency(Math.abs(netBalance)) }}
          </p>
          <p style="font-size: 10px; color: #6b7280;">
            {{ netBalance >= 0 ? 'Surplus' : 'Defisit' }}
          </p>
        </div> -->
      </div>

      <!-- Tabel Transaksi -->
      <div style="padding: 0 20px; margin-bottom: 30px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
          Detail Transaksi Kas
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: left; font-weight: bold; width: 5%;">No</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: left; font-weight: bold; width: 15%;">Tanggal</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: left; font-weight: bold; width: 10%;">Tipe</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: left; font-weight: bold; width: 45%;">Deskripsi</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: right; font-weight: bold; width: 15%;">Nominal</th>
              <th style="border: 1px solid #d1d5db; padding: 10px 8px; text-align: right; font-weight: bold; width: 10%;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pdfData" :key="item.id" :style="{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }">
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">{{ index + 1 }}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">
                {{ formatDate(item.date) }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">
                {{ item.id_flow_type == 1 ? 'Masuk' : 'Keluar' }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">
                {{ item.description }}
              </td>
              <td
                style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;"
                :style="{ color: item.id_flow_type == 1 ? '#10b981' : '#ef4444' }"
              >
                {{ item.id_flow_type == 1 ? '+' : '-' }}{{ formatCurrency(item.qty_money) }}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">
                {{ formatCurrency(calculateRunningBalance(index)) }}
              </td>
            </tr>
          </tbody>
          <!-- <tfoot>
            <tr style="background-color: #e5e7eb; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #d1d5db; padding: 12px 8px; text-align: right;">
                <strong>TOTAL SALDO BERSIH:</strong>
              </td>
              <td colspan="2"
                style="border: 1px solid #d1d5db; padding: 12px 8px; text-align: right; font-size: 14px;"
                :style="{ color: netBalance >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ formatCurrency(Math.abs(netBalance)) }} {{ netBalance >= 0 ? '(Surplus)' : '(Defisit)' }}
              </td>
            </tr>
          </tfoot> -->
        </table>
      </div>

      <!-- Summary Bulanan -->
      <!-- <div style="padding: 0 20px; margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">
          Ringkasan Periode
        </h3>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px;">
            <div>
              <p><strong>Periode:</strong> {{ formatMonthYear(selectedMonth, selectedYear) }}</p>
              <p><strong>Total Transaksi:</strong> {{ pdfData.length }} transaksi</p>
              <p><strong>Rata-rata per Transaksi:</strong> {{ formatCurrency(pdfData.length > 0 ? Math.abs(netBalance) / pdfData.length : 0) }}</p>
            </div>
            <div>
              <p><strong>Transaksi Pemasukan:</strong> {{ totalIncomeCount }} ({{ ((totalIncomeCount / pdfData.length) * 100).toFixed(1) }}%)</p>
              <p><strong>Transaksi Pengeluaran:</strong> {{ totalExpenseCount }} ({{ ((totalExpenseCount / pdfData.length) * 100).toFixed(1) }}%)</p>
              <p><strong>Status Kas:</strong>
                <span :style="{ color: netBalance >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }">
                  {{ netBalance >= 0 ? 'Surplus' : 'Defisit' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Footer -->
      <div style="padding: 0 20px; text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #d1d5db; padding-top: 20px; padding-bottom: 10px;">
        <p>Laporan ini dibuat secara otomatis oleh sistem manajemen kas</p>
        <p>© {{ new Date().getFullYear() }} - Semua hak dilindungi</p>
      </div>
    </div>

    <!-- Modal untuk pilih bulan/tahun -->
    <div v-if="showModal" class="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Export Laporan Kas PDF</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Pilih Bulan</label>
            <select v-model="selectedMonth" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Pilih Tahun</label>
            <select v-model="selectedYear" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
import { getYear, getMonth, parseISO } from 'date-fns'

// Props
interface Props {
  moneyFlows: any[]
  availableYears?: number[]
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

// Options untuk select
const monthOptions = computed(() =>
  months.map((month, index) => ({
    label: month,
    value: index + 1
  }))
)

// Get available years from data
const availableYears = computed(() => {
  if (props.availableYears) return props.availableYears

  const years = new Set<number>()
  props.moneyFlows.forEach((item) => {
    const year = getYear(parseISO(item.date || item.created_at))
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

// Computed untuk data yang akan di-export
const pdfData = computed(() => {
  return props.moneyFlows.filter(item => {
    const itemDate = parseISO(item.date || item.created_at)
    const itemMonth = getMonth(itemDate) + 1
    const itemYear = getYear(itemDate)

    return itemMonth === selectedMonth.value && itemYear === selectedYear.value
  }).sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
})

const getBranchName = () => {
  if (pdfData.value.length > 0 && pdfData.value[0]?.users?.branch.branch_name) {
    return pdfData.value[0]?.users?.branch.branch_name
  }
  return 'Nama Toko Tidak Tersedia'
}

// Computed untuk statistics
const totalIncome = computed(() => {
  return pdfData.value
    .filter(item => item.id_flow_type == 1)
    .reduce((sum, item) => sum + item.qty_money, 0)
})

const totalExpense = computed(() => {
  return pdfData.value
    .filter(item => item.id_flow_type == 2)
    .reduce((sum, item) => sum + item.qty_money, 0)
})

const totalIncomeCount = computed(() => {
  return pdfData.value.filter(item => item.id_flow_type == 1).length
})

const totalExpenseCount = computed(() => {
  return pdfData.value.filter(item => item.id_flow_type == 2).length
})

const netBalance = computed(() => {
  return totalIncome.value - totalExpense.value
})

// Calculate running balance
const calculateRunningBalance = (index: number) => {
  let balance = 0
  for (let i = 0; i <= index; i++) {
    const item = pdfData.value[i]
    if (item.id_flow_type == 1) {
      balance += item.qty_money
    } else {
      balance -= item.qty_money
    }
  }
  return balance
}

// Format functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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
    alert('Tidak ada data untuk periode yang dipilih')
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
    await new Promise(resolve => setTimeout(resolve, 200))

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
    const fileName = `Laporan-Kas-${formatMonthYear(selectedMonth.value, selectedYear.value).replace(' ', '-')}.pdf`
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
