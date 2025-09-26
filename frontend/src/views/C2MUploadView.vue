<template>
  <div class="c2m-upload-view">
    <h1 class="c2m-title">Prepare C2M Upload File</h1>
    <p>Enter meter readings manually or upload Billing Profile PDFs to extract data.</p>

    <div class="c2m-card mb-4">
      <div class="card-header c2m-card-header">
        <h5>Upload Billing Profile PDFs</h5>
      </div>
      <div class="card-body c2m-card-body">
        <div class="input-group c2m-input-group">
          <input type="file" class="form-control c2m-input" multiple @change="handlePDFFileSelection" accept=".pdf">
        </div>
        <div v-if="selectedPDFs.length" class="mt-2 small text-muted">
          {{ selectedPDFs.length }} file(s) selected.
        </div>
        <button class="btn btn-primary mt-3 c2m-btn c2m-btn-primary" @click="extractDataFromPDFs" :disabled="selectedPDFs.length === 0 || isExtracting">
          <span v-if="isExtracting" class="c2m-upload-processing">Extracting...</span>
          <span v-else>Extract Data from PDFs</span>
        </button>
      </div>
      <ul v-if="uploadedPDFs.length" class="list-group list-group-flush">
        <li v-for="(file, index) in uploadedPDFs" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
          {{ file.name }}
          <a :href="file.url" :download="file.name" class="btn btn-sm btn-outline-secondary">Download</a>
        </li>
      </ul>
    </div>

    <div v-for="(meter, meterIndex) in meters" :key="meterIndex" class="c2m-card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center c2m-card-header">
        <h5 class="mb-0">{{ meter.meterNo ? 'Meter ' + meter.meterNo : 'Meter #' + (meterIndex + 1) }}</h5>
        <div>
          <button class="btn btn-success btn-sm me-2 c2m-btn c2m-btn-success" @click="generateSingleMeterCSV(meterIndex)">Download CSV</button>
          <button class="btn btn-danger btn-sm c2m-btn" @click="removeMeter(meterIndex)">Remove Meter</button>
        </div>
      </div>
      <div class="card-body c2m-card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">Meter Number</label>
            <input type="text" class="form-control c2m-input" v-model="meter.meterNo" placeholder="Enter meter number" @change="fetchCustomerDetails(meterIndex)">
          </div>
          <div class="col-md-6">
            <label class="form-label">Meter Type</label>
            <select class="form-select" v-model="meter.type" disabled>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">Customer Number</label>
            <input type="text" class="form-control" v-model="meter.customerNumber" disabled>
          </div>
          <div class="col-md-4">
            <label class="form-label">Tariff</label>
            <input type="text" class="form-control" v-model="meter.tariff" disabled>
          </div>
          <div class="col-md-4">
            <label class="form-label">Connection Date</label>
            <input type="text" class="form-control" v-model="meter.connectionDate" disabled>
          </div>
        </div>

        <hr>

        <h6>Readings</h6>
        <div v-for="(reading, readingIndex) in meter.readings" :key="readingIndex" class="row g-3 mb-3 align-items-center">
          <template v-if="meter.type === 'Residential'">
            <div class="col-md-4">
              <label class="form-label">Reading Value (kWh)</label>
              <input type="number" class="form-control" v-model.number="reading.value" placeholder="Enter kWh value">
            </div>
            <div class="col-md-4">
              <label class="form-label">Reading Date</label>
              <input type="date" class="form-control" v-model="reading.date">
            </div>
          </template>
          <template v-if="meter.type === 'Commercial'">
            <div class="col-md-3">
              <label class="form-label">Reading Value (kWh)</label>
              <input type="number" class="form-control" v-model.number="reading.value" placeholder="Total kWh value">
            </div>
            <div class="col-md-3">
              <label class="form-label">TOD1 (Off-Peak)</label>
              <input type="number" class="form-control" v-model.number="reading.tod1" placeholder="TOD1 value">
            </div>
            <div class="col-md-3">
              <label class="form-label">TOD2 (On-Peak)</label>
              <input type="number" class="form-control" v-model.number="reading.tod2" placeholder="TOD2 value">
            </div>
            <div class="col-md-3">
              <label class="form-label">Reading Date</label>
              <input type="date" class="form-control" v-model="reading.date">
            </div>
          </template>
          <div class="col-md-2">
            <button class="btn btn-danger btn-sm" @click="removeReading(meterIndex, readingIndex)">Remove</button>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm c2m-btn" @click="addReading(meterIndex)">Add Reading</button>
      </div>
    </div>

    <button class="btn btn-secondary c2m-btn" @click="addMeter">Add Another Meter</button>
    <button class="btn btn-primary ms-2 c2m-btn c2m-btn-primary" @click="generateAllMetersCSV" :disabled="meters.length === 0">Generate C2M CSV</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { getCustomerDetails } from '../api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface Reading {
  value: number | null;
  tod1: number | null;
  tod2: number | null;
  date: string;
}

interface Meter {
  meterNo: string;
  type: 'Residential' | 'Commercial';
  readings: Reading[];
  customerNumber?: string;
  tariff?: string;
  connectionDate?: string;
  // To store pre-filtered readings from the PDF
  _rawReadings?: Reading[];
}

const meters = ref<Meter[]>([
  {
    meterNo: '',
    type: 'Residential',
    readings: [{ value: null, tod1: null, tod2: null, date: '' }],
    customerNumber: '',
    tariff: '',
    connectionDate: '',
    _rawReadings: [],
  },
]);

const selectedPDFs = ref<File[]>([]);
const uploadedPDFs = ref<{name: string, url: string}[]>([]);
const isExtracting = ref(false);

const handlePDFFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedPDFs.value = Array.from(target.files);
    uploadedPDFs.value = Array.from(target.files).map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
  }
};

const fetchCustomerDetails = async (meterIndex: number) => {
  const meter = meters.value[meterIndex];
  if (!meter.meterNo) return;

  try {
    const response = await getCustomerDetails(meter.meterNo);
    const customer = response.data;

    meter.customerNumber = customer.CUSTOMER_NUM;
    meter.tariff = customer.TARIFF;
    meter.connectionDate = customer.CONN_DATE ? new Date(customer.CONN_DATE).toLocaleDateString() : 'N/A';

    // Set meter type based on tariff
    meter.type = customer.TARIFF === 'LT-A' ? 'Residential' : 'Commercial';

    // Filter readings based on the fetched connection date
    filterReadingsByConnectionDate(meterIndex);

  } catch (error) {
    console.error('Failed to fetch customer details:', error);
    // Reset fields if customer not found
    meter.customerNumber = 'Not Found';
    meter.tariff = 'N/A';
    meter.connectionDate = 'N/A';
  }
};

const filterReadingsByConnectionDate = (meterIndex: number) => {
  const meter = meters.value[meterIndex];
  if (!meter.connectionDate || meter.connectionDate === 'N/A' || !meter._rawReadings) {
    meter.readings = meter._rawReadings || [];
    return;
  }

  const connDate = new Date(meter.connectionDate);

  meter.readings = meter._rawReadings.filter(reading => {
    const readingDate = new Date(reading.date);
    return readingDate > connDate;
  });
};

const extractDataFromPDFs = async () => {
  isExtracting.value = true;
  meters.value = []; // Clear existing meters

  for (const file of selectedPDFs.value) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
      }

      const meterMatch = fullText.match(/Meter #\s+(\d+)/);
      if (meterMatch) {
        const meterNo = meterMatch[1];
        
        const newMeter: Meter = {
          meterNo: meterNo,
          type: 'Residential', // Default, will be updated by fetchCustomerDetails
          readings: [],
          _rawReadings: [],
          customerNumber: '',
          tariff: '',
          connectionDate: '',
        };

        const billingDateMatches = [...fullText.matchAll(/Billing Date\s+(\d{2}\/\d{2}\/\d{4})/g)];
        const energyMatches = [...fullText.matchAll(/Total active forwarded energy reg \(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];
        const tod1Matches = [...fullText.matchAll(/Total tod 1 active forwarded energy reg\.\(reg\.1\) \(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];
        const tod2Matches = [...fullText.matchAll(/Total tod 2 active forwarded energy reg\.\(reg\.2\) \(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];

        billingDateMatches.forEach((dateMatch, index) => {
          const energyMatch = energyMatches[index];
          const tod1Match = tod1Matches[index];
          const tod2Match = tod2Matches[index];

          if (energyMatch && tod1Match && tod2Match) {
            const dateParts = dateMatch[1].split('/'); // MM/DD/YYYY
            const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
            (newMeter._rawReadings as Reading[]).push({
              value: parseFloat(energyMatch[1]),
              tod1: parseFloat(tod1Match[1]),
              tod2: parseFloat(tod2Match[1]),
              date: formattedDate,
            });
          }
        });
        
        meters.value.push(newMeter);
        // Fetch details which will also trigger filtering
        await fetchCustomerDetails(meters.value.length - 1);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  isExtracting.value = false;
};

const addMeter = () => {
  meters.value.push({
    meterNo: '',
    type: 'Residential',
    readings: [{ value: null, tod1: null, tod2: null, date: '' }],
    customerNumber: '',
    tariff: '',
    connectionDate: '',
    _rawReadings: [],
  });
};

const removeMeter = (meterIndex: number) => {
  meters.value.splice(meterIndex, 1);
};

const addReading = (meterIndex: number) => {
  meters.value[meterIndex].readings.push({ value: null, tod1: null, tod2: null, date: '' });
};

const removeReading = (meterIndex: number, readingIndex: number) => {
  meters.value[meterIndex].readings.splice(readingIndex, 1);
};

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

const generateCSV = (meter?: Meter) => {
  let csvContent = "METERNO,UOM,readdttm,read\n";
  const metersToProcess = meter ? [meter] : meters.value;

  metersToProcess.forEach(m => {
    if (!m.meterNo) return;

    if (m.type === 'Residential') {
      m.readings.forEach(reading => {
        if (reading.value !== null && reading.date) {
          const uom = getUOM(m.meterNo);
          csvContent += `${m.meterNo},${uom},${reading.date},${reading.value}\n`;
        }
      });
    } else { // Commercial
      m.readings.forEach(reading => {
        if (reading.value !== null && reading.tod1 !== null && reading.tod2 !== null && reading.date) {
          csvContent += `${m.meterNo},${getUOM(m.meterNo, 'total')},${reading.date},${reading.value}\n`;
          csvContent += `${m.meterNo},${getUOM(m.meterNo, 'tod1')},${reading.date},${reading.tod1}\n`;
          csvContent += `${m.meterNo},${getUOM(m.meterNo, 'tod2')},${reading.date},${reading.tod2}\n`;
        }
      });
    }
  });

  return csvContent;
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

const generateSingleMeterCSV = (meterIndex: number) => {
  const meter = meters.value[meterIndex];
  if (!meter || !meter.meterNo) return;
  const csvContent = generateCSV(meter);
  downloadCSV(csvContent, `c2m-upload-${meter.meterNo}.csv`);
};

const generateAllMetersCSV = () => {
  const csvContent = generateCSV();
  downloadCSV(csvContent, `c2m-upload-all-${new Date().toISOString().split('T')[0]}.csv`);
};

</script>

<style scoped>
/* Modern C2M Upload Styles */
.c2m-upload-view {
  max-width: auto;
  margin: 0 auto;
  padding: 32px 16px;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.c2m-title {
  font-size: 2rem;
  font-weight: 800;
  color: #4338ca;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: -1px;
}

.c2m-card {
  background: linear-gradient(120deg, #fff 60%, #e0e7ff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  padding: 32px 28px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}

.c2m-card-header {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.c2m-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.c2m-card-body {
  margin-top: 0;
}

.c2m-input-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.c2m-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #c7d2fe;
  background: #f3f4f6;
  font-size: 1rem;
  transition: border 0.2s;
  min-width: 220px;
}

.c2m-input:focus {
  border-color: #6366f1;
  outline: none;
  background: #eef2ff;
}

.c2m-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.c2m-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
}

.c2m-btn-primary:hover {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.c2m-btn-success {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: #fff;
}

.c2m-btn-success:hover {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.c2m-btn-info {
  background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%);
  color: #fff;
}

.c2m-btn-info:hover {
  background: linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%);
}

.c2m-upload-processing {
  margin-top: 12px;
  font-size: 0.95rem;
  color: #6366f1;
  animation: pulse 1.2s infinite;
}

.c2m-table-wrapper {
  overflow-x: auto;
  margin-top: 12px;
}

.c2m-table {
  min-width: 600px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  overflow: hidden;
}

.c2m-table th {
  background: #6366f1;
  color: #fff;
  padding: 12px;
  font-weight: 700;
  text-align: left;
  font-size: 1rem;
}

.c2m-table td {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.98rem;
  color: #374151;
  background: #fff;
}

.c2m-table tr:hover td {
  background: #f3f4f6;
}

.c2m-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .c2m-upload-view {
    padding: 16px 4px;
  }
  .c2m-card {
    padding: 18px 8px;
  }
  .c2m-table {
    min-width: 320px;
  }
  .c2m-input-group {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .c2m-title { font-size: 1.3rem; }
  .c2m-card-header { font-size: 1rem; }
}
</style>