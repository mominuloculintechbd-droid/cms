<template>
  <div class="billing-profile-view">
    <h1>Billing Profile</h1>
    <p>Upload Excel, then search by Meter No (single or bulk). Highlight shows months with readings since last bill date.</p>

    <div class="grid">
      <div class="card">
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
          <div class="mt-2" v-if="auth.canDeleteData">
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
      <div class="card-header">Result: {{ singleResult.meter_no || singleResult.customer?.METER_NO || singleMeter }}
        <button class="btn btn-sm btn-primary float-end" @click="downloadSingleCSV">Download CSV</button>
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

        <div class="table-wrap mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Reading Date</th>
                <th>Value (kWh)</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in singleResult.readings" :key="r.id" :class="rowHighlightClass(r.reading_date, singleResult.analysis?.coveredMonths)">
                <td>{{ formatDate(r.reading_date) }}</td>
                <td>{{ r.value_kwh }}</td>
                <td>{{ monthLabel(r.reading_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="bulkResults.length" class="mt-3">
      <button class="btn btn-primary mb-2" @click="downloadBulkCSV">Download All as CSV</button>
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
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, idx) in (res.readings || []).slice().sort((a:any,b:any)=> new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())" :key="(r.id || idx)"
                    :class="rowHighlightClass(r.reading_date, res.analysis?.coveredMonths)">
                  <td>{{ formatDate(r.reading_date) }}</td>
                  <td>{{ r.value_kwh }}</td>
                  <td>{{ monthLabel(r.reading_date) }}</td>
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
import apiClient, { uploadBillingProfileFiles, getMeterReadingsByMeterNo, getMeterReadingsInBulk, deleteAllBillingProfileData } from '../api';
import { useAuthStore } from '../stores/auth';

const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const uploadStatus = ref<{ success: boolean; message: string } | null>(null);
const singleMeter = ref('');
const bulkMetersText = ref('');
const loadingSingle = ref(false);
const loadingBulk = ref(false);
const singleResult = ref<any | null>(null);
const bulkResults = ref<any[]>([]);
const auth = useAuthStore();

const uomMap = {
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

function getMeterPhase(meterNumber) {
    const secondDigit = meterNumber.charAt(1);
    return secondDigit === '0' ? '1P' : '3P';
}

function getMeterBrand(meterNumber) {
    const prefix = meterNumber.charAt(0);
    return prefix === '7' ? 'SHENZHEN' : 
           prefix === '8' ? 'WASION' : 'L&G';
}

function getUOM(meterNumber, type = 'total') {
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
  let csvContent = "METERNO,UOM,readdttm,read\n";

  singleResult.value.readings.forEach(reading => {
    const uom = getUOM(meterNo);
    const date = formatDate(reading.reading_date);
    const value = reading.value_kwh;
    csvContent += `${meterNo},${uom},${date},${value}\n`;
  });

  downloadCSV(csvContent, `billing-profile-${meterNo}.csv`);
};

const downloadBulkCSV = () => {
  if (bulkResults.value.length === 0) return;

  let csvContent = "METERNO,UOM,readdttm,read\n";

  bulkResults.value.forEach(result => {
    const meterNo = result.meter_no || result.customer?.METER_NO;
    if (meterNo && result.readings) {
      result.readings.forEach(reading => {
        const uom = getUOM(meterNo);
        const date = formatDate(reading.reading_date);
        const value = reading.value_kwh;
        csvContent += `${meterNo},${uom},${date},${value}\n`;
      });
    }
  });

  downloadCSV(csvContent, `billing-profile-bulk.csv`);
};

const downloadCSV = (content, fileName) => {
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
</style>