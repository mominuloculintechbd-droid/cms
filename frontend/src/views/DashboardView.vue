<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <span class="dashboard-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="2"/>
            <rect x="14" y="3" width="7" height="7" rx="2"/>
            <rect x="14" y="14" width="7" height="7" rx="2"/>
            <rect x="3" y="14" width="7" height="7" rx="2"/>
          </svg>
        </span>
        Dashboard
      </h1>
      <p class="dashboard-subtitle">Overview of your system performance and metrics</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">Loading dashboard data...</p>
    </div>

    <div v-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 class="error-title">Unable to load data</h3>
      <p class="error-message">{{ error }}</p>
      <button class="btn btn--primary" @click="retryLoad">Try Again</button>
    </div>

    <div v-if="!loading && !error" class="dashboard-content animate-fade-in">
      <div class="stats-grid">
        <div class="stat-card stat-card--success animate-fade-in" style="animation-delay: 0.3s">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--gradient">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
          </div>
          <div class="stat-card__content">
            <h3 class="stat-card__title">Total Tickets</h3>
            <div class="stat-card__value">{{ ticketCount }}</div>
            <p class="stat-card__description">All tickets, open and closed</p>
          </div>
        </div>

        <div class="stat-card stat-card--danger animate-fade-in" style="animation-delay: 0.4s">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--gradient">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div class="stat-card__content">
            <h3 class="stat-card__title">Total Customers</h3>
            <div class="stat-card__value">{{ customerCount }}</div>
            <p class="stat-card__description">All customers in the system</p>
          </div>
        </div>
      </div>

      <div class="card mb-4 animate-fade-in" style="animation-delay: 0.5s">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h3 class="mb-0">Monthly Meter Installations</h3>
              <p class="text-muted mb-0">Installations grouped by connection month for the selected year.</p>
            </div>
            <div class="d-flex gap-2 dashboard-actions">
              <select v-model="selectedYear" class="form-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <button class="btn btn--outline" @click="downloadInstallationsCsv">
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 17v-6"/>
                    <path d="M9 14l3 3 3-3"/>
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                  </svg>
                </span>
                Download CSV
              </button>
              <button class="btn btn--outline" @click="downloadInstallationsPdf">
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <path d="M8 4v16"/>
                    <path d="M16 4v16"/>
                  </svg>
                </span>
                Download PDF
              </button>
            </div>
          </div>
          <div class="chart-bg">
            <BarChart :chart-data="monthlyInstallationsChartData" />
          </div>
        </div>
      </div>

      <div class="card mb-4 animate-fade-in" style="animation-delay: 0.6s">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h3 class="mb-0">Customers by NOCS</h3>
              <p class="text-muted mb-0">Number of customers in each NOCS.</p>
            </div>
            <div class="d-flex gap-2 dashboard-actions">
              <button class="btn btn--outline" @click="downloadNocsReport">
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 17v-6"/>
                    <path d="M9 14l3 3 3-3"/>
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                  </svg>
                </span>
                Download CSV
              </button>
            </div>
          </div>
          <div class="chart-bg">
            <BarChart :chart-data="nocsChartData" />
          </div>
        </div>
      </div>

      <div class="card mb-4 animate-fade-in" style="animation-delay: 0.7s">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h3 class="mb-0">Monthly Batch Performance (CM_BSGGN)</h3>
              <p class="text-muted mb-0">Daily performance for the selected month.</p>
            </div>
            <div class="d-flex gap-2 dashboard-actions">
              <select v-model="selectedBatchMonth" class="form-select">
                <option v-for="month in 12" :key="month" :value="month">{{ month }}</option>
              </select>
              <select v-model="selectedBatchYear" class="form-select">
                <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">{{ year }}</option>
              </select>
              <button class="btn btn--outline" @click="loadData">
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </span>
                Reload
              </button>
            </div>
          </div>
          <div class="chart-bg">
            <BarChart :chart-data="monthlyBatchPerformanceChartData" :multi-axis="true" />
          </div>
        </div>
      </div>

      <div class="card mb-4 animate-fade-in" style="animation-delay: 0.8s">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h3 class="mb-0">Daily Billing Report</h3>
              <p class="text-muted mb-0">Billed vs. Unbilled Customers per day for the selected month.</p>
            </div>
            <div class="d-flex gap-2 dashboard-actions">
              <select v-model="selectedBillingMonth" class="form-select">
                <option v-for="month in 12" :key="month" :value="month">{{ month }}</option>
              </select>
              <select v-model="selectedBillingYear" class="form-select">
                <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">{{ year }}</option>
              </select>
              <button class="btn btn--outline" @click="loadData">
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </span>
                Reload
              </button>
            </div>
          </div>
          <div class="chart-bg">
            <BarChart :chart-data="dailyBillingChartData" :multi-axis="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import BarChart from '../components/BarChart.vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loading = ref(true);
const error = ref<string | null>(null);

const ticketCount = ref(0);
const customerCount = ref(0);
const installs = ref<Array<{ month: string, count: number }>>([]);
const nocsReportData = ref<Array<{ NOCS_NAME: string, customerCount: number }>>([]);
const selectedYear = ref(new Date().getFullYear());

interface MonthlyBatchPerformance {
  batch_bus_dt: string;
  total_records: number;
  avg_duration: number;
}
const monthlyBatchPerformanceData = ref<MonthlyBatchPerformance[]>([]);

const selectedBatchMonth = ref(new Date().getMonth() + 1);
const selectedBatchYear = ref(new Date().getFullYear());

interface DailyBillingReport {
  report_date: string;
  active_customers: number;
  billed_customers: number;
  unbilled_customers: number;
  kwh_reads_received: number;
  percent_unbilled: number;
  percent_reads_received: number;
  percent_billed: number;
}
const dailyBillingReportData = ref<DailyBillingReport[]>([]);
const selectedBillingMonth = ref(new Date().getMonth() + 1);
const selectedBillingYear = ref(new Date().getFullYear());

const availableYears = computed(() => {
  const years = new Set(installs.value.map(i => i.month.split('-')[0]));
  return Array.from(years).sort().reverse();
});

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [ticketResponse, customerResponse, installsResponse, nocsResponse, monthlyBatchResponse, dailyBillingResponse] = await Promise.all([
      apiClient.get('/tickets/count'),
      apiClient.get('/customers/count'),
      apiClient.get('/customers/installations/monthly'),
      apiClient.get('/customers/reports/nocs'),
      apiClient.get('/batch-operational-report/monthly-performance', {
        params: {
          month: selectedBatchMonth.value,
          year: selectedBatchYear.value,
          batch_cd: 'CM_BSGGN'
        }
      }),
      apiClient.get('/daily-billing-report', {
        params: {
          month: selectedBillingMonth.value,
          year: selectedBillingYear.value
        }
      })
    ]);
    ticketCount.value = ticketResponse.data.count;
    customerCount.value = customerResponse.data.count;
    installs.value = installsResponse.data.data || [];
    nocsReportData.value = nocsResponse.data || [];
    monthlyBatchPerformanceData.value = monthlyBatchResponse.data || [];
    dailyBillingReportData.value = dailyBillingResponse.data || [];
    
  } catch (err) {
    error.value = 'Failed to fetch dashboard data.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const retryLoad = () => {
  loadData();
};

onMounted(() => {
  loadData();
});

const monthlyInstallationsChartData = computed(() => {
  const yearData = installs.value.filter(i => i.month.startsWith(String(selectedYear.value)));
  const monthlyData = Array(12).fill(0);
  yearData.forEach(item => {
    const month = parseInt(item.month.split('-')[1], 10) - 1;
    monthlyData[month] = item.count;
  });

  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: `Meter Installations in ${selectedYear.value}`,
        backgroundColor: 'linear-gradient(90deg, #36A2EB 0%, #4BC0C0 100%)',
        borderColor: '#36A2EB',
        data: monthlyData,
      },
    ],
  };
});

const nocsChartData = computed(() => ({
  labels: nocsReportData.value.map(item => item.NOCS_NAME),
  datasets: [
    {
      label: 'Customers by NOCS',
      backgroundColor: '#FF6384',
      borderColor: '#FF6384',
      data: nocsReportData.value.map(item => item.customerCount),
    },
  ],
}));

const monthlyBatchPerformanceChartData = computed(() => {
  const labels = monthlyBatchPerformanceData.value.map(d => new Date(d.batch_bus_dt).toLocaleDateString());
  const totalRecordsData = monthlyBatchPerformanceData.value.map(d => d.total_records);
  const avgDurationData = monthlyBatchPerformanceData.value.map(d => d.avg_duration);

  return {
    labels,
    datasets: [
      {
        label: 'Total Records',
        backgroundColor: '#36A2EB',
        data: totalRecordsData,
        yAxisID: 'y',
      },
      {
        label: 'Avg. Duration (h)',
        backgroundColor: '#FF6384',
        data: avgDurationData.map(d => d / 3600),
        yAxisID: 'y1',
      },
    ],
  };
});

const dailyBillingChartData = computed(() => {
  const labels = dailyBillingReportData.value.map(d => new Date(d.report_date).toLocaleDateString());
  const activeCustomersData = dailyBillingReportData.value.map(d => d.active_customers);
  const billedCustomersData = dailyBillingReportData.value.map(d => d.billed_customers);
  const unbilledCustomersData = dailyBillingReportData.value.map(d => d.unbilled_customers);
  const kwhReadsReceivedData = dailyBillingReportData.value.map(d => d.kwh_reads_received);
  const percentUnbilledData = dailyBillingReportData.value.map(d => d.percent_unbilled);
  const percentReadsReceivedData = dailyBillingReportData.value.map(d => d.percent_reads_received);
  const percentBilledData = dailyBillingReportData.value.map(d => d.percent_billed);

  return {
    labels,
    datasets: [
      {
        label: 'Active Customers',
        backgroundColor: '#36A2EB',
        data: activeCustomersData,
        yAxisID: 'y',
      },
      {
        label: 'Billed Customers',
        backgroundColor: '#4BC0C0',
        data: billedCustomersData,
        yAxisID: 'y',
      },
      {
        label: 'Unbilled Customers',
        backgroundColor: '#FF6384',
        data: unbilledCustomersData,
        yAxisID: 'y',
      },
      {
        label: 'KWH Reads Received',
        backgroundColor: '#9966FF',
        data: kwhReadsReceivedData,
        yAxisID: 'y',
      },
      {
        label: 'Percent Unbilled',
        backgroundColor: '#FFCC00',
        data: percentUnbilledData,
        yAxisID: 'y1',
      },
      {
        label: 'Percent Reads Received',
        backgroundColor: '#66FF66',
        data: percentReadsReceivedData,
        yAxisID: 'y1',
      },
      {
        label: 'Percent Billed',
        backgroundColor: '#FF9900',
        data: percentBilledData,
        yAxisID: 'y1',
      },
    ],
  };
});

const downloadInstallationsCsv = () => {
  const yearData = installs.value.filter(i => i.month.startsWith(String(selectedYear.value)));
  const header = 'Month,Installations\n';
  const body = yearData.map(r => `${r.month},${r.count}`).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `monthly_installations_${selectedYear.value}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const downloadInstallationsPdf = () => {
  const yearData = installs.value.filter(i => i.month.startsWith(String(selectedYear.value)));
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['Month', 'Installations']],
    body: yearData.map(r => [r.month, String(r.count)])
  });
  doc.save(`monthly_installations_${selectedYear.value}.pdf`);
};

const downloadNocsReport = () => {
  const header = 'NOCS Name,Customer Count\n';
  const body = nocsReportData.value.map(r => `${r.NOCS_NAME},${r.customerCount}`).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nocs_report.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
  background: linear-gradient(120deg, #f8fafc 0%, #e3f0ff 100%);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 40px;
  text-align: center;
}

.dashboard-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--primary-700, #2563eb);
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.dashboard-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #36A2EB 0%, #4BC0C0 100%);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(54,162,235,0.12);
}

.dashboard-subtitle {
  color: var(--text-secondary, #64748b);
  font-size: 1.25rem;
  margin: 0;
  font-weight: 500;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 24px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--primary-500, #36A2EB);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.4s;
  border-top-color: var(--info-500, #4BC0C0);
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.8s;
  border-top-color: var(--success-500, #22c55e);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary, #64748b);
  font-size: 1.125rem;
  margin: 0;
}

.error-icon {
  color: var(--error-500, #ef4444);
  margin-bottom: 16px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-700, #2563eb);
  margin: 0 0 8px 0;
}

.error-message {
  color: var(--text-secondary, #64748b);
  font-size: 1rem;
  margin: 0 0 24px 0;
}

.dashboard-content {
  animation: fadeIn 0.8s cubic-bezier(.4,0,.2,1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(24px);}
  to { opacity: 1; transform: translateY(0);}
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(120deg, #fff 60%, #e3f0ff 100%);
  border: none;
  border-radius: 24px;
  padding: 32px 28px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  animation: fadeIn 0.8s cubic-bezier(.4,0,.2,1);
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 32px -8px rgba(54,162,235,0.18), 0 4px 12px -4px rgba(0,0,0,0.08);
}

.stat-card--success {
  border-left: 6px solid var(--success-500, #22c55e);
}

.stat-card--danger {
  border-left: 6px solid var(--error-500, #ef4444);
}

.stat-card__header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-100, #f1f5f9);
  color: var(--primary-700, #2563eb);
  box-shadow: 0 2px 8px rgba(54,162,235,0.10);
}

.stat-card__icon--gradient {
  background: linear-gradient(135deg, #36A2EB 0%, #4BC0C0 100%);
  color: #fff;
}

.stat-card__content {
  text-align: left;
}

.stat-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-700, #2563eb);
  margin: 0 0 8px 0;
}

.stat-card__value {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--primary-900, #1e293b);
  margin: 0 0 8px 0;
  line-height: 1;
  letter-spacing: -2px;
}

.stat-card__description {
  color: var(--text-secondary, #64748b);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

.card {
  background: linear-gradient(120deg, #fff 60%, #e3f0ff 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  border: none;
  margin-bottom: 32px;
}

.card-body {
  padding: 32px 28px;
}

.mb-4 {
  margin-bottom: 40px !important;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mb-2 {
  margin-bottom: 18px !important;
}

.text-muted {
  color: var(--text-secondary, #64748b);
}

.gap-2 {
  gap: 12px;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.form-select {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--surface-200, #e5e7eb);
  background: #f8fafc;
  font-size: 1rem;
  color: var(--primary-700, #2563eb);
  font-weight: 600;
  transition: border 0.2s;
  outline: none;
}

.form-select:focus {
  border-color: var(--primary-500, #36A2EB);
}

.btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn--outline {
  background: #fff;
  color: var(--primary-700, #2563eb);
  border: 2px solid var(--primary-200, #93c5fd);
  box-shadow: 0 2px 8px rgba(54,162,235,0.06);
}

.btn--outline:hover {
  background: var(--primary-50, #e3f0ff);
  color: var(--primary-900, #1e293b);
  border-color: var(--primary-500, #36A2EB);
}

.btn--primary {
  background: linear-gradient(90deg, #36A2EB 0%, #4BC0C0 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(54,162,235,0.12);
}

.btn--primary:hover {
  background: linear-gradient(90deg, #2563eb 0%, #36A2EB 100%);
  color: #fff;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chart-bg {
  background: linear-gradient(120deg, #e3f0ff 0%, #fff 100%);
  border-radius: 18px;
  padding: 24px 12px;
  box-shadow: 0 2px 8px rgba(54,162,235,0.06);
  margin-top: 18px;
}

@media (max-width: 900px) {
  .dashboard-title {
    font-size: 2.1rem;
  }
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .stat-card {
    padding: 22px 16px;
  }
  .stat-card__value {
    font-size: 2rem;
  }
  .dashboard-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .dashboard-actions .btn, .dashboard-actions .form-select {
    width: 100%;
    max-width: 320px;
  }
  .card-body {
    padding: 18px 10px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    margin-bottom: 24px;
  }
  .dashboard-title {
    font-size: 1.5rem;
  }
  .dashboard-subtitle {
    font-size: 1rem;
  }
  .stat-card {
    padding: 12px 8px;
  }
  .stat-card__value {
    font-size: 1.2rem;
  }
  .card-body {
    padding: 10px 2px;
  }
}
</style>