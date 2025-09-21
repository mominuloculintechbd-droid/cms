<template>
  <div class="meter-replacement-page">
    <div class="mr-card">
      <h1 class="mr-title">Meter Replacement Data</h1>
      <!-- Drag & Drop Upload -->
      <div
        class="mr-upload"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="onDrop"
      >
        <div class="mr-upload-content">
          <div class="mr-upload-icon">
            <svg width="40" height="40" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 17V3M12 3l-4 4M12 3l4 4"/>
              <rect x="4" y="17" width="16" height="4" rx="2"/>
            </svg>
          </div>
          <p class="mr-upload-text">Drag and drop CSV here</p>
          <p class="mr-upload-or">or</p>
          <label class="mr-upload-btn">
            <input type="file" class="hidden" accept=".csv" @change="handleFileUpload" />
            <span>Choose CSV file</span>
          </label>
        </div>
        <div v-if="isProcessing" class="mr-upload-processing">Processing file, please wait...</div>
      </div>
    </div>

    <div class="mr-card">
      <!-- Manual Entry -->
      <h2 class="mr-section-title">Add New Record</h2>
      <form @submit.prevent="addManualRecord" class="mr-form">
        <input type="text" v-model="manualRecord.CUSTID" placeholder="Customer ID" class="mr-input" />
        <input type="text" v-model="manualRecord.OLDMETER" placeholder="Old Meter Number" class="mr-input" />
        <input type="text" v-model="manualRecord.NEWMETER" placeholder="New Meter Number" class="mr-input" />
        <input type="date" v-model="manualRecord.METERCNGDATE" class="mr-input" />
        <button type="submit" class="mr-btn mr-btn-primary">Add Record</button>
      </form>
      <div v-if="manualError" class="mr-error">{{ manualError }}</div>
    </div>

    <div v-if="processedData.length > 0" class="mr-card">
      <!-- Data Preview Table -->
      <h2 class="mr-section-title">Preview Data</h2>
      <div class="mr-panel">
        <div class="mr-panel-title">New Meter Numbers</div>
        <div class="mr-meter-list">
          <span
            v-for="(row, i) in processedData"
            :key="'nm-'+i"
            class="mr-meter-chip"
            :class="row.remarks && row.remarks.startsWith('Error') ? 'mr-chip-error' : 'mr-chip-success'"
            :title="row.remarks"
          >
            {{ row['New Meter Number'] || row['Replace Meter Number'] || '—' }}
          </span>
        </div>
      </div>
      <div class="mr-table-wrapper">
        <table class="mr-table">
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in processedData" :key="index">
              <td v-for="header in tableHeaders" :key="header">{{ formatCell(row, header) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mr-actions">
        <button @click="exportCSV" class="mr-btn mr-btn-success">Export CSV</button>
        <button @click="exportExcel" class="mr-btn mr-btn-info">Export Excel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import api from '../api';

const processedData = ref([]);
const manualRecord = ref({ CUSTID: '', OLDMETER: '', NEWMETER: '', METERCNGDATE: '' });
const manualError = ref('');
const tableHeaders = ref([]);
const isProcessing = ref(false);

const setHeadersFromData = (data) => {
  if (Array.isArray(data) && data.length > 0) {
    // Preview table headers (only these, in this order)
    tableHeaders.value = [
      'NOCS',
      'Customer ID',
      'Old Meter Number',
      'Replace Meter Number',
      'Install Date',
      'Replace Date',
      'Last Bill Date',
      'TARIFF',
      'SANCTION_LOAD',
      'Phase',
      'Remarks',
    ];
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) await uploadFile(file);
};

const onDrop = async (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) await uploadFile(file);
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  isProcessing.value = true;
  try {
    const response = await api.post('/meter-replacement/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    processedData.value = response.data || [];
    setHeadersFromData(processedData.value);
  } catch (error) {
    console.error('Error uploading file:', error);
    alert(error?.response?.data || 'Error uploading file.');
  } finally {
    isProcessing.value = false;
  }
};

const addManualRecord = async () => {
  manualError.value = '';
  const { CUSTID, OLDMETER, NEWMETER, METERCNGDATE } = manualRecord.value;
  if (!CUSTID || !OLDMETER || !NEWMETER || !METERCNGDATE) {
    manualError.value = 'Please fill all the fields for manual entry.';
    return;
  }

  try {
    const payload = {
      CUSTID,
      OLDMETER,
      NEWMETER,
      METERCNGDATE,
      'Customer ID': CUSTID,
      'Old Meter Number': OLDMETER,
      'New Meter Number': NEWMETER,
      'Replace Date': METERCNGDATE,
    };
    const response = await api.post('/meter-replacement/process-row', payload);
    const processed = response.data;
    processedData.value.push(processed);
    setHeadersFromData(processedData.value);
    manualRecord.value = { CUSTID: '', OLDMETER: '', NEWMETER: '', METERCNGDATE: '' };
  } catch (error) {
    console.error('Error processing manual row:', error);
    manualError.value = error?.response?.data || 'Error processing the row.';
  }
};

const exportCSV = () => {
  const data = processedData.value.map(row => ({
    CUSTID: row['Customer ID'],
    OLDMETER: row['Old Meter Number'],
    NEWMETER: row['New Meter Number'],
    HES: row.hes,
    NETMETER: row.netMeter,
    MANUFACTURER: row.manufacturer,
    MODEL: row.model,
    METERCNGDATE: row['Replace Date'],
    PHASE: row.phase,
    ADDRESS: row.address,
    OLDSANCTIONLOAD: row.sanctionLoad,
    NEWSANCTIONLOAD: row.sanctionLoad,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Meter Replacement');
  const csvOutput = XLSX.write(wb, { bookType: 'csv', type: 'string' });
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'meter_replacement.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportExcel = () => {
  // Excel headers and mapping per requirement
  const data = processedData.value.map(row => ({
    NOCS: row['nocs'] || '',
    'Customer ID': row['Customer ID'] || '',
    'Old Meter Number': row['Old Meter Number'] || '',
    'Replace Meter Number': row['New Meter Number'] || row['Replace Meter Number'] || '',
    'Install Date': row['installDate'] || '',
    'Replace Date': row['Replace Date'] || '',
    'Last Bill Date': row['lastBillDate'] || '',
    'TARIFF': row['tariff'] || '',
    'SANCTION_LOAD': row['sanctionLoad'] || '',
    'Phase': row['phase'] || '',
    'Address': row['address'] || '',
    'Remarks': row['remarks'] || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Meter Replacement');
  XLSX.writeFile(wb, 'meter_replacement.xlsx');
};

const formatCell = (row, header) => {
  switch (header) {
    case 'NOCS':
      return row.nocs || '';
    case 'Customer ID':
      return row['Customer ID'] || '';
    case 'Old Meter Number':
      return row['Old Meter Number'] || '';
    case 'Replace Meter Number':
      return row['New Meter Number'] || row['Replace Meter Number'] || '';
    case 'Install Date':
      return row.installDate || '';
    case 'Replace Date':
      return row['Replace Date'] || '';
    case 'Last Bill Date':
      return row.lastBillDate || '';
    case 'TARIFF':
      return row.tariff || '';
    case 'SANCTION_LOAD':
      return row.sanctionLoad || '';
    case 'Phase':
      return row.phase || '';
    case 'Remarks':
      return row.remarks || '';
    default:
      return row[header];
  }
};

</script>

<style scoped>
.meter-replacement-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.mr-card {
  background: linear-gradient(120deg, #fff 60%, #e0e7ff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  padding: 32px 28px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}

.mr-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #4338ca;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: -1px;
}

.mr-section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 18px;
}

.mr-upload {
  border: 2px dashed #a5b4fc;
  background: linear-gradient(90deg, #f3f4f6 0%, #ede9fe 100%);
  border-radius: 14px;
  padding: 32px 18px;
  transition: background 0.2s;
  cursor: pointer;
  text-align: center;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(99,102,241,0.07);
  position: relative;
}

.mr-upload:hover {
  background: linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%);
  border-color: #6366f1;
}

.mr-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mr-upload-icon {
  margin-bottom: 8px;
  background: #eef2ff;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.mr-upload-text {
  font-weight: 600;
  color: #6366f1;
  font-size: 1.1rem;
}

.mr-upload-or {
  color: #64748b;
  font-size: 0.95rem;
}

.mr-upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99,102,241,0.10);
  transition: background 0.2s;
  margin-top: 6px;
}

.mr-upload-btn:hover {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.mr-upload-processing {
  margin-top: 12px;
  font-size: 0.95rem;
  color: #6366f1;
  animation: pulse 1.2s infinite;
}

.mr-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 16px;
  margin-bottom: 0;
}

.mr-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #c7d2fe;
  background: #f3f4f6;
  font-size: 1rem;
  transition: border 0.2s;
}

.mr-input:focus {
  border-color: #6366f1;
  outline: none;
  background: #eef2ff;
}

.mr-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.mr-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
}

.mr-btn-primary:hover {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.mr-btn-success {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: #fff;
}

.mr-btn-success:hover {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.mr-btn-info {
  background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%);
  color: #fff;
}

.mr-btn-info:hover {
  background: linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%);
}

.mr-error {
  margin-top: 10px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 600;
}

.mr-panel {
  background: linear-gradient(90deg, #f3f4f6 0%, #e0e7ff 100%);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.06);
}

.mr-panel-title {
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 8px;
}

.mr-meter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mr-meter-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  background: #d1fae5;
  color: #059669;
  box-shadow: 0 1px 4px rgba(16,185,129,0.08);
  transition: background 0.2s, color 0.2s;
}

.mr-chip-success {
  background: #d1fae5;
  color: #059669;
}

.mr-chip-error {
  background: #fee2e2;
  color: #b91c1c;
}

.mr-table-wrapper {
  overflow-x: auto;
  margin-top: 12px;
}

.mr-table {
  min-width: 900px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  overflow: hidden;
}

.mr-table th {
  background: #6366f1;
  color: #fff;
  padding: 12px;
  font-weight: 700;
  text-align: left;
  font-size: 1rem;
}

.mr-table td {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.98rem;
  color: #374151;
  background: #fff;
}

.mr-table tr:hover td {
  background: #f3f4f6;
}

.mr-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .meter-replacement-page {
    padding: 16px 4px;
  }
  .mr-card {
    padding: 18px 8px;
  }
  .mr-form {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .mr-table {
    min-width: 600px;
  }
}

@media (max-width: 600px) {
  .mr-title { font-size: 1.3rem; }
  .mr-section-title { font-size: 1rem; }
  .mr-form { grid-template-columns: 1fr; }
  .mr-table { min-width: 320px; }
}
</style>