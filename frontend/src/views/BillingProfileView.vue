<template>
  <div class="billing-profile-view">
    <h1>Billing Profile</h1>
    <p>Upload Excel, then search by Meter No (single or bulk). Highlight shows months with readings since last bill date.</p>

    <div class="grid">
      <div class="card" v-if="auth.canDeleteData">
        <div class="card-header">Upload Excel (Meter No, Value kWh, Reading Date)</div>
        <div class="card-body">
          <div class="input-group">
            <input type="file" class="form-control" multiple @change="handleFileSelection">
          </div>
          <div v-if="selectedFiles.length" class="mt-2 small text-muted">
            {{ selectedFiles.length }} file(s) selected
          </div>
          <button class="btn btn-primary mt-3" @click="uploadFiles" :disabled="uploading">
            <span v-if="uploading">Uploading...</span>
            <span v-else>Upload</span>
          </button>
          <div v-if="uploadStatus" class="mt-3">
            <div class="alert" :class="uploadStatus.success ? 'alert-success' : 'alert-danger'">{{ uploadStatus.message }}</div>
          </div>
          <div class="mt-2">
            <button class="btn btn-danger" @click="deleteAll">Delete All Billing Profile Data</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Search Readings</div>
        <div class="card-body">
          <div class="input-group">
            <input v-model="singleMeter" type="text" placeholder="Meter No" class="form-control">
            <button class="btn btn-secondary" @click="searchSingle" :disabled="loadingSingle || !singleMeter">Search</button>
          </div>
          <div class="mt-3">
            <textarea v-model="bulkMetersText" class="form-control" rows="4" placeholder="Paste multiple meter numbers separated by comma, space or new line"></textarea>
            <button class="btn btn-secondary mt-2" @click="searchBulk" :disabled="loadingBulk || !bulkMetersText.trim()">Search Bulk</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="singleResult" class="card mt-3">
      <div class="card-header">
        Result: {{ singleResult.meter_no || singleResult.customer?.METER_NO || singleMeter }}
        <div class="float-end button-group">
          <!-- Estimation button - visible to Admin and Super Admin only -->
          <button
            v-if="auth.canDeleteData"
            class="btn btn-sm btn-success"
            @click="handleCalculateEstimation"
            :disabled="isCalculatingEstimates"
          >
            {{ isCalculatingEstimates ? 'Calculating...' : 'Estimation' }}
          </button>
          <!-- Covered Months button - visible when estimation is shown and user is Admin/Super Admin -->
          <button
            v-if="showEstimation && auth.canDeleteData"
            class="btn btn-sm btn-info"
            @click="toggleCoveredMonths"
          >
            {{ showCoveredOnly ? 'Show All' : 'Covered Months' }}
          </button>
          <!-- Download CSV - visible to everyone -->
          <button class="btn btn-sm btn-primary" @click="downloadSingleCSV">
            Download CSV
          </button>
          <!-- Save Estimates - visible when estimates exist and user is Admin/Super Admin -->
          <button
            v-if="estimatedResults.length && auth.canDeleteData"
            class="btn btn-sm btn-warning"
            @click="handleSaveEstimates"
            :disabled="savingEstimates"
          >
            {{ savingEstimates ? 'Saving...' : 'Save Estimates' }}
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="result-meta">
          <div>
            <div class="label">NOCS Name</div>
            <div class="value">{{ singleResult.customer?.NOCS_NAME || '-' }}</div>
          </div>
          <div>
            <div class="label">Customer Number</div>
            <div class="value">{{ singleResult.customer?.CUSTOMER_NUM || '-' }}</div>
          </div>
          <div>
            <div class="label">Meter Number</div>
            <div class="value">{{ singleResult.customer?.METER_NO || '-' }}</div>
          </div>
          <div>
            <div class="label">Tariff</div>
            <div class="value">{{ singleResult.customer?.TARIFF || '-' }}</div>
          </div>
        </div>

        <div class="result-meta mt-2">
          <div>
            <div class="label">Install Date</div>
            <div class="value">{{ formatDate(singleResult.customer?.CONN_DATE) }}</div>
          </div>
          <div>
            <div class="label">Last Bill Date</div>
            <div class="value">{{ formatDate(singleResult.analysis?.LAST_BILL_DATE) }}</div>
          </div>
          <div>
            <div class="label">Bill Status</div>
            <div class="value"><span :class="['chip', statusClass(singleResult.analysis?.BILL_STATUS)]">{{ mapStatus(singleResult.analysis?.BILL_STATUS) }}</span></div>
          </div>
          <div></div>
        </div>

        <div class="mt-2">
          <div class="label">Missing Months</div>
          <div class="chips">
            <span v-if="!singleResult.analysis || singleResult.analysis.missingMonths?.length === 0" class="chip">None</span>
            <span v-for="m in singleResult.analysis?.missingMonths || []" :key="m" class="chip chip-warn">{{ m }}</span>
          </div>
        </div>

        <div class="mt-2">
          <div class="label">Covered Months</div>
          <div class="chips">
            <span v-if="!singleResult.analysis || singleResult.analysis.coveredMonths?.length === 0" class="chip">None</span>
            <span v-for="m in singleResult.analysis?.coveredMonths || []" :key="m" class="chip chip-ok">{{ m }}</span>
          </div>
        </div>

        <!-- Estimation Summary -->
        <div v-if="showEstimation && estimatedResults.length" class="estimation-summary mt-3">
          <h6>📊 Estimation Summary</h6>
          <div class="summary-grid">
            <div>
              <strong>Estimated Months:</strong> {{ estimatedResults.length }}
            </div>
            <div>
              <strong>Total Estimated kWh:</strong> {{ estimatedResults.reduce((sum, r) => sum + r.estimated_kwh, 0).toFixed(2) }}
            </div>
            <div>
              <strong>Methods Used:</strong> {{ [...new Set(estimatedResults.map(r => r.method))].join(', ') }}
            </div>
          </div>
        </div>

        <div class="table-wrap mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Reading Date</th>
                <th>Value (kWh)</th>
                <th>Month</th>
                <th v-if="showEstimation">Type</th>
                <th v-if="showEstimation">Method</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in (showCoveredOnly ? singleResult.filteredReadings : (singleResult.allReadings || singleResult.readings))"
                  :key="r.id"
                  :class="getRowClass(r)">
                <td>{{ formatDate(r.reading_date) }}</td>
                <td>{{ r.value_kwh }}</td>
                <td>{{ monthLabel(r.reading_date) }}</td>
                <td v-if="showEstimation">
                  <span v-if="r.is_estimated" class="chip chip-estimated">📊 Estimated</span>
                  <span v-else class="chip chip-actual">✅ Actual</span>
                </td>
                <td v-if="showEstimation">
                  <span v-if="r.estimation_method">{{ r.estimation_method }}</span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="bulkResults.length" class="mt-3">
      <div class="bulk-actions mb-2">
        <button v-if="auth.canDeleteData" class="btn btn-success" @click="calculateBulkEstimation" :disabled="isCalculatingEstimates">
          {{ isCalculatingEstimates ? 'Calculating...' : 'Estimate All' }}
        </button>
        <button class="btn btn-primary" @click="downloadBulkCSV">Download All as CSV</button>
      </div>
      <div v-for="res in bulkResults" :key="res.meter_no" class="card mb-2">
        <div class="card-header">Meter: {{ res.meter_no }}</div>
        <div class="card-body">
          <div class="result-meta">
            <div>
              <div class="label">NOCS Name</div>
              <div class="value">{{ res.customer?.NOCS_NAME || '-' }}</div>
            </div>
            <div>
              <div class="label">Customer Number</div>
              <div class="value">{{ res.customer?.CUSTOMER_NUM || '-' }}</div>
            </div>
            <div>
              <div class="label">Meter Number</div>
              <div class="value">{{ res.customer?.METER_NO || '-' }}</div>
            </div>
            <div>
              <div class="label">Tariff</div>
              <div class="value">{{ res.customer?.TARIFF || '-' }}</div>
            </div>
          </div>
          <div class="result-meta mt-2">
            <div>
              <div class="label">Install Date</div>
              <div class="value">{{ formatDate(res.customer?.CONN_DATE) }}</div>
            </div>
            <div>
              <div class="label">Last Bill Date</div>
              <div class="value">{{ formatDate(res.analysis?.LAST_BILL_DATE) }}</div>
            </div>
            <div>
              <div class="label">Bill Status</div>
              <div class="value"><span :class="['chip', statusClass(res.analysis?.BILL_STATUS)]">{{ mapStatus(res.analysis?.BILL_STATUS) }}</span></div>
            </div>
            <div></div>
          </div>
          <div class="chips mt-2">
            <span v-for="m in res.analysis?.missingMonths || []" :key="m" class="chip chip-warn">{{ m }}</span>
            <span v-if="!res.analysis || res.analysis.missingMonths?.length === 0" class="chip">No missing</span>
          </div>

          <div class="table-wrap mt-3">
            <table class="table">
              <thead>
                <tr>
                  <th>Reading Date</th>
                  <th>Value (kWh)</th>
                  <th>Month</th>
                  <th v-if="res.allReadings">Type</th>
                  <th v-if="res.allReadings">Method</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, idx) in ((res.allReadings || res.readings) || []).slice().sort((a:any,b:any)=> new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())" :key="(r.id || idx)"
                    :class="getRowClassBulk(r, res.analysis?.coveredMonths)">
                  <td>{{ formatDate(r.reading_date) }}</td>
                  <td>{{ r.value_kwh }}</td>
                  <td>{{ monthLabel(r.reading_date) }}</td>
                  <td v-if="res.allReadings">
                    <span v-if="r.is_estimated" class="chip chip-estimated">📊 Estimated</span>
                    <span v-else class="chip chip-actual">✅ Actual</span>
                  </td>
                  <td v-if="res.allReadings">
                    <span v-if="r.estimation_method">{{ r.estimation_method }}</span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient, { uploadBillingProfileFiles, getMeterReadingsByMeterNo, getMeterReadingsInBulk, deleteAllBillingProfileData, calculateEstimates, saveEstimates, getCoveredMonths } from '../api';
import { useAuthStore } from '../stores/auth';

const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const uploadStatus = ref<{ success: boolean; message: string } | null>(null);
const singleMeter = ref('');
const bulkMetersText = ref('');
const loadingSingle = ref(false);
const loadingBulk = ref(false);

interface Reading {
  id: number | string;
  reading_date: string;
  value_kwh: number;
  is_estimated?: boolean;
  estimation_method?: string;
  confidence?: number;
  details?: any;
}

interface Result {
  meter_no: string;
  customer?: any;
  analysis?: any;
  readings: Reading[];
  allReadings?: Reading[];
  filteredReadings?: Reading[];
}

const singleResult = ref<Result | null>(null);
const bulkResults = ref<Result[]>([]);
const auth = useAuthStore();

// Estimation state
const estimatedResults = ref<any[]>([]);
const showEstimation = ref(false);
const showCoveredOnly = ref(false);
const savingEstimates = ref(false);
const isCalculatingEstimates = ref(false);

const uomMap: { [key: string]: { [key: string]: { [key: string]: string } } } = {
    'L&G': {
        '1P': { total: 'ES-KWH-TOT-1P-DAILY', tod1: 'ES-KWH-TOD1-1P-DAILY', tod2: 'ES-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'ES-KWH-TOT-FWD-3P-DAILY', tod1: 'ES-KWH-TOD1-FWD-3P-DAILY', tod2: 'ES-KWH-TOD2-FWD-3P-DAILY' }
    },
    'WASION': {
        '1P': { total: 'WS-KWH-TOT-1P-DAILY', tod1: 'WS-KWH-TOD1-1P-DAILY', tod2: 'WS-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'WS-KWH-TOT-FWD-3P-DAILY', tod1: 'WS-KWH-TOD1-FWD-3P-DAILY', tod2: 'WS-KWH-TOD2-FWD-3P-DAILY' }
    },
    'SHENZHEN': {
        '1P': { total: 'ST-KWH-TOT-1P-DAILY', tod1: 'ST-KWH-TOD1-1P-DAILY', tod2: 'ST-KWH-TOD2-1P-DAILY' },
        '3P': { total: 'ST-KWH-TOT-FWD-3P-DAILY', tod1: 'ST-KWH-TOD1-FWD-3P-DAILY', tod2: 'ST-KWH-TOD2-FWD-3P-DAILY' }
    }
};

function getMeterPhase(meterNumber: string) {
    const secondDigit = meterNumber.charAt(1);
    return secondDigit === '0' ? '1P' : '3P';
}

function getMeterBrand(meterNumber: string) {
    const prefix = meterNumber.charAt(0);
    return prefix === '7' ? 'SHENZHEN' : 
           prefix === '8' ? 'WASION' : 'L&G';
}

function getUOM(meterNumber: string, type = 'total') {
    const brand = getMeterBrand(meterNumber);
    const phase = getMeterPhase(meterNumber);
    return uomMap[brand][phase][type] || 'Unknown';
}

const handleFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files);
  }
};

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    alert('Please select files to upload.');
    return;
  }

  uploading.value = true;
  uploadStatus.value = null;

  const formData = new FormData();
  for (const file of selectedFiles.value) {
    formData.append('files', file);
  }

  try {
    const response = await uploadBillingProfileFiles(formData);
    uploadStatus.value = { success: true, message: response.data.message || 'Files uploaded successfully!' };
    selectedFiles.value = [];
  } catch (error: any) {
    console.error('Error uploading files:', error);
    uploadStatus.value = { success: false, message: error.response?.data?.message || 'Error uploading files.' };
  } finally {
    uploading.value = false;
  }
};

const parseBulkMeters = (text: string) => {
  return text
    .split(/[\s,\n\r]+/)
    .map(s => s.trim())
    .filter(Boolean);
};

const searchSingle = async () => {
  singleResult.value = null;
  loadingSingle.value = true;
  try {
    const { data } = await getMeterReadingsByMeterNo(singleMeter.value.trim());
    singleResult.value = data;
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || 'Failed to fetch meter readings');
  } finally {
    loadingSingle.value = false;
  }
};

const searchBulk = async () => {
  bulkResults.value = [];
  loadingBulk.value = true;
  try {
    const meters = parseBulkMeters(bulkMetersText.value);
    const { data } = await getMeterReadingsInBulk(meters);
    bulkResults.value = data;
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || 'Failed to fetch bulk readings');
  } finally {
    loadingBulk.value = false;
  }
};

const deleteAll = async () => {
  if (!confirm('This will delete ALL billing profile data. Continue?')) return;
  try {
    await deleteAllBillingProfileData();
    uploadStatus.value = { success: true, message: 'All billing profile data deleted.' };
    singleResult.value = null;
    bulkResults.value = [];
  } catch (e: any) {
    console.error(e);
    uploadStatus.value = { success: false, message: e.response?.data || 'Delete failed' };
  }
};

const formatDate = (d: any) => {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const monthLabel = (d: any) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const statusClass = (status?: string) => {
  if (status === 'Bill Start') return 'chip-ok';
  if (status === 'Bill Stop') return 'chip-warn';
  if (status === 'Bill Not Generated') return 'chip-neutral';
  return 'chip-neutral';
};

const mapStatus = (status?: string) => {
  if (status === 'Bill Not Generated') return 'Bill Not Generated';
  return status || '-';
};

const rowHighlightClass = (readingDate: any, coveredMonths?: string[]) => {
  if (!coveredMonths || coveredMonths.length === 0) return '';
  const label = monthLabel(readingDate);
  return coveredMonths.includes(label) ? 'row-covered' : '';
};

const downloadSingleCSV = () => {
  if (!singleResult.value) return;

  const meterNo = singleResult.value.meter_no || singleResult.value.customer?.METER_NO || singleMeter.value;
  let csvContent = "METERNO,UOM,readdttm,read,is_estimated,estimation_method\n";

  // Use allReadings if available (includes estimates), otherwise use readings
  const readingsToExport = singleResult.value.allReadings || singleResult.value.readings;

  readingsToExport.forEach((reading: Reading) => {
    const uom = getUOM(meterNo);
    const date = formatDate(reading.reading_date);
    const value = reading.value_kwh;
    const isEstimated = reading.is_estimated ? 'Yes' : 'No';
    const method = reading.estimation_method || 'Actual';
    csvContent += `${meterNo},${uom},${date},${value},${isEstimated},${method}\n`;
  });

  downloadCSV(csvContent, `billing-profile-${meterNo}.csv`);
};

const downloadBulkCSV = () => {
  if (bulkResults.value.length === 0) return;

  let csvContent = "METERNO,UOM,readdttm,read,is_estimated,estimation_method\n";

  bulkResults.value.forEach(result => {
    const meterNo = result.meter_no || result.customer?.METER_NO;
    if (meterNo && result.readings) {
      // Use allReadings if available (includes estimates), otherwise use readings
      const readingsToExport = result.allReadings || result.readings;

      readingsToExport.forEach((reading: Reading) => {
        const uom = getUOM(meterNo);
        const date = formatDate(reading.reading_date);
        const value = reading.value_kwh;
        const isEstimated = reading.is_estimated ? 'Yes' : 'No';
        const method = reading.estimation_method || 'Actual';
        csvContent += `${meterNo},${uom},${date},${value},${isEstimated},${method}\n`;
      });
    }
  });

  downloadCSV(csvContent, `billing-profile-bulk.csv`);
};

// Calculate Estimates
const handleCalculateEstimation = async () => {
  if (!singleResult.value) {
    alert('Please search for a meter first');
    return;
  }

  isCalculatingEstimates.value = true;
  try {
    const meterNo = singleResult.value.meter_no || singleMeter.value;
    const { data } = await calculateEstimates(meterNo);

    estimatedResults.value = data.estimates;
    showEstimation.value = true;

    // Merge estimated with actual readings for display
    if (!singleResult.value.allReadings) {
      singleResult.value.allReadings = [...singleResult.value.readings];
    }

    // Add estimated readings
    const estimatedReadings = data.estimates.map((est: any) => ({
      id: `est-${est.month}`,
      reading_date: est.reading_date,
      value_kwh: est.estimated_kwh,
      is_estimated: true,
      estimation_method: est.method,
      confidence: est.confidence,
      details: est.details
    }));

    singleResult.value.allReadings = [
      ...singleResult.value.readings,
      ...estimatedReadings
    ].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());

    alert(`Estimation complete! ${data.estimates.length} months estimated.`);

  } catch (e: any) {
    console.error(e);
    alert(e.response?.data?.error || 'Failed to calculate estimation');
  } finally {
    isCalculatingEstimates.value = false;
  }
};

// Show Covered Months Only
const toggleCoveredMonths = () => {
  showCoveredOnly.value = !showCoveredOnly.value;

  if (showCoveredOnly.value && singleResult.value) {
    // Filter to show only covered months (actual + estimated)
    const coveredMonths = singleResult.value.analysis?.coveredMonths || [];
    const estimatedMonths = estimatedResults.value.map(est => est.month_label);

    const allCovered = [...coveredMonths, ...estimatedMonths];

    const readingsToShow = singleResult.value.allReadings || singleResult.value.readings;
    singleResult.value.filteredReadings = readingsToShow.filter(r =>
      allCovered.includes(monthLabel(r.reading_date))
    );
  } else if (singleResult.value) {
    singleResult.value.filteredReadings = singleResult.value.allReadings || singleResult.value.readings;
  }
};

// Save Estimates to Database
const handleSaveEstimates = async () => {
  if (!estimatedResults.value.length) {
    alert('No estimates to save');
    return;
  }

  if (!confirm(`Save ${estimatedResults.value.length} estimated readings to database?`)) return;

  savingEstimates.value = true;

  try {
    const meterNo = singleResult.value?.meter_no || singleMeter.value;

    await saveEstimates(meterNo, estimatedResults.value);

    alert('Estimated readings saved successfully!');

    // Refresh the search to show saved estimates
    await searchSingle();

    // Reset estimation state
    estimatedResults.value = [];
    showEstimation.value = false;
    showCoveredOnly.value = false;

  } catch (e: any) {
    console.error(e);
    alert(e.response?.data?.error || 'Failed to save estimates');
  } finally {
    savingEstimates.value = false;
  }
};

// Get row class for display
const getRowClass = (reading: any) => {
  const baseClass = rowHighlightClass(reading.reading_date, singleResult.value?.analysis?.coveredMonths);
  if (reading.is_estimated) {
    return `${baseClass} row-estimated`.trim();
  }
  return baseClass;
};

// Get row class for bulk display
const getRowClassBulk = (reading: any, coveredMonths?: string[]) => {
  const baseClass = rowHighlightClass(reading.reading_date, coveredMonths);
  if (reading.is_estimated) {
    return `${baseClass} row-estimated`.trim();
  }
  return baseClass;
};

// Calculate estimates for all bulk results
const calculateBulkEstimation = async () => {
  if (bulkResults.value.length === 0) {
    alert('No bulk results to estimate');
    return;
  }

  isCalculatingEstimates.value = true;

  try {
    let totalEstimated = 0;

    for (const result of bulkResults.value) {
      const meterNo = result.meter_no;

      try {
        const { data } = await calculateEstimates(meterNo);

        if (data.estimates && data.estimates.length > 0) {
          // Add estimated readings to this result
          const estimatedReadings = data.estimates.map((est: any) => ({
            id: `est-${est.month}`,
            reading_date: est.reading_date,
            value_kwh: est.estimated_kwh,
            is_estimated: true,
            estimation_method: est.method,
            confidence: est.confidence,
            details: est.details
          }));

          result.allReadings = [
            ...result.readings,
            ...estimatedReadings
          ].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());

          totalEstimated += data.estimates.length;
        }
      } catch (e) {
        console.error(`Failed to estimate for meter ${meterNo}:`, e);
      }
    }

    alert(`Estimation complete! ${totalEstimated} months estimated across ${bulkResults.value.length} meters.`);

  } catch (e: any) {
    console.error(e);
    alert('Failed to calculate bulk estimation');
  } finally {
    isCalculatingEstimates.value = false;
  }
};

const downloadCSV = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.billing-profile-view {
  padding: 20px;
}
.card {
  margin-top: 20px;
}
/* Simple responsive grid */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
.input-group { display: flex; gap: 8px; }
.result-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.label { font-size: 12px; color: #666; }
.value { font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 2px 8px; border-radius: 999px; background: #eee; font-size: 12px; }
.chip-ok { background: #e6ffed; color: #0a7a1f; border: 1px solid #b7f5c8; }
.chip-warn { background: #fff7e6; color: #8a5a00; border: 1px solid #ffe0a3; }
.chip-neutral { background: #eef2ff; color: #253b8a; border: 1px solid #cdd6ff; }
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
.row-covered { background: #f0fff4; }
.row-estimated { background: #fffbeb; font-style: italic; }
.row-covered.row-estimated { background: #fef3c7; }
.chip-estimated { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
.chip-actual { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.button-group { display: flex; gap: 8px; flex-wrap: wrap; }
.estimation-summary { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; }
.estimation-summary h6 { margin: 0 0 12px 0; color: #0c4a6e; font-weight: 600; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.mt-3 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.bulk-actions { display: flex; gap: 8px; flex-wrap: wrap; }
</style>