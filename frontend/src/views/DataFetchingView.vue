<template>
  <div class="data-fetching-view">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          Data Fetching
        </h1>
        <p class="page-subtitle">Retrieve and manage system data from various sources</p>
      </div>
    </div>

    <!-- Last Bill Date Section -->
    <div class="data-section">
      <div class="section-header">
        <div class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 2v4"/>
            <path d="M16 2v4"/>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <path d="M3 10h18"/>
          </svg>
          Last Bill Date Data
        </div>
        <p>Search and manage customer last bill date information</p>
      </div>
      
      <div class="search-section">
        <div class="search-group">
          <div class="input-with-icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by Customer Number(s)..." 
              v-model="customerNumSearch"
              @keyup.enter="searchLastBillDate"
            >
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" @click="searchLastBillDate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              Search
            </button>
            <button class="btn btn-success" @click="downloadLastBillDate" :disabled="lastBillDateResults.length === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            <button class="btn btn-danger" @click="deleteLastBillDate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
              </svg>
              Delete All
            </button>
          </div>
        </div>
      </div>

      <div class="results-section">
        <div class="results-header">
          <h3>Search Results</h3>
          <span class="results-count">{{ lastBillDateResults.length }} records found</span>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer Number</th>
                <th>Last Bill Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="lastBillDateResults.length === 0" class="no-data-row">
                <td colspan="2" class="text-center">
                  <svg class="no-data-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <p>No data found. Try searching for customer numbers.</p>
                </td>
              </tr>
              <tr v-else v-for="item in lastBillDateResults" :key="item.CUSTOMER_NUM" class="data-row">
                <td class="customer-num">{{ item.CUSTOMER_NUM }}</td>
                <td class="bill-date">{{ formatDate(item.LAST_BILL_DATE) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        Fetch Meter Replacement Data
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <input type="text" class="form-control" placeholder="Search by Customer Number(s)..." v-model="meterReplacementCustomerSearch">
          </div>
          <div class="col-md-6">
            <input type="text" class="form-control" placeholder="Search by Meter Number(s)..." v-model="meterReplacementMeterSearch">
          </div>
        </div>
        <button class="btn btn-primary mb-3" @click="searchMeterReplacementData">Search</button>
        <button class="btn btn-info mb-3 ms-2" @click="downloadMeterReplacementData">Download</button>
        <button class="btn btn-danger mb-3 ms-2" @click="deleteMeterReplacementData">Delete All</button>
        <div class="table-responsive">
          <table class="table table-striped table-hover table-bordered table-sm">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Old Meter Number</th>
                <th>Replace Meter Number</th>
                <th>Install Date</th>
                <th>Replace Date</th>
                <th>Last Bill Date</th>
                <th>Old Meter Last Reads</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in meterReplacementData" :key="item.id">
                <td>{{ item.customerId }}</td>
                <td>{{ item.oldMeterNumber }}</td>
                <td>{{ item.replaceMeterNumber }}</td>
                <td>{{ formatDate(item.installDate) }}</td>
                <td>{{ formatDate(item.replaceDate) }}</td>
                <td>{{ formatDate(item.lastBillDate) }}</td>
                <td>{{ item.oldMeterLastReads }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        Fetch MDM Reads
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <input type="text" class="form-control" placeholder="Search by Customer ID..." v-model="mdmCustomerSearch">
          </div>
          <div class="col-md-6">
            <input type="text" class="form-control" placeholder="Search by Meter Number..." v-model="mdmMeterSearch">
          </div>
        </div>
        <button class="btn btn-primary mb-3" @click="searchMdmReads">Search</button>
        <button class="btn btn-info mb-3 ms-2" @click="downloadMdmReads">Download</button>
        <button class="btn btn-danger mb-3 ms-2" @click="deleteMdmReads">Delete All</button>
        <div class="table-responsive">
          <table class="table table-striped table-hover table-bordered table-sm">
            <thead>
              <tr>
                <th>CUSTOMER_ID</th>
                <th>METER_NO</th>
                <th>MSRMT_DTTM</th>
                <th>DATE_TYPE</th>
                <th>READING_TYPE</th>
                <th>READING_VAL</th>
                <th>REMARKS</th>
                <th>LAST_BILL_DT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mdmReadsData" :key="item.id">
                <td>{{ item.CUSTOMER_ID }}</td>
                <td>{{ item.METER_NO }}</td>
                <td>{{ formatDate(item.MSRMT_DTTM) }}</td>
                <td>{{ item.DATE_TYPE }}</td>
                <td>{{ item.READING_TYPE }}</td>
                <td>{{ item.READING_VAL }}</td>
                <td>{{ item.REMARKS }}</td>
                <td>{{ formatDate(item.LAST_BILL_DT) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';
import * as XLSX from 'xlsx';

interface LastBillDate {
  CUSTOMER_NUM: string;
  LAST_BILL_DATE: string;
}

interface MeterReplacement {
  id: number;
  customerId: string;
  oldMeterNumber: string;
  replaceMeterNumber: string;
  installDate: string;
  replaceDate: string;
  lastBillDate: string;
  oldMeterLastReads: string;
}

interface MdmRead {
  id: number;
  CUSTOMER_ID: string;
  METER_NO: string;
  MSRMT_DTTM: string;
  DATE_TYPE: string;
  READING_TYPE: string;
  READING_VAL: string;
  REMARKS: string;
  LAST_BILL_DT: string;
}

const customerNumSearch = ref('');
const lastBillDateResults = ref<LastBillDate[]>([]);
const meterReplacementData = ref<MeterReplacement[]>([]);
const meterReplacementCustomerSearch = ref('');
const meterReplacementMeterSearch = ref('');
const mdmReadsData = ref<MdmRead[]>([]);
const mdmCustomerSearch = ref('');
const mdmMeterSearch = ref('');

const searchLastBillDate = async () => {
  try {
    const response = await apiClient.get('/last-bill-date/search', {
      params: {
        CUSTOMER_NUM: customerNumSearch.value,
      }
    });
    lastBillDateResults.value = response.data;
  } catch (error) {
    console.error('Error searching last bill date:', error);
  }
};

const deleteLastBillDate = async () => {
  try {
    await apiClient.delete('/last-bill-date/delete-all');
    lastBillDateResults.value = [];
    alert('All last bill date data deleted successfully!');
  } catch (error) {
    console.error('Error deleting last bill date data:', error);
    alert('Error deleting last bill date data.');
  }
};

const downloadLastBillDate = () => {
  const worksheet = XLSX.utils.json_to_sheet(lastBillDateResults.value.map(item => ({
    CUSTOMER_NUM: item.CUSTOMER_NUM,
    LAST_BILL_DATE: formatDate(item.LAST_BILL_DATE)
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LastBillDates');
  XLSX.writeFile(workbook, 'last_bill_dates.xlsx');
};

const searchMeterReplacementData = async () => {
  try {
    const response = await apiClient.get('/meter-replacement/search', {
      params: {
        customerNumbers: meterReplacementCustomerSearch.value,
        meterNumbers: meterReplacementMeterSearch.value
      }
    });
    meterReplacementData.value = response.data;
  } catch (error) {
    console.error('Error fetching meter replacement data:', error);
  }
};

const deleteMeterReplacementData = async () => {
  try {
    await apiClient.delete('/meter-replacement/delete-all');
    meterReplacementData.value = [];
    alert('All meter replacement data deleted successfully!');
  } catch (error) {
    console.error('Error deleting meter replacement data:', error);
    alert('Error deleting meter replacement data.');
  }
};

const downloadMeterReplacementData = () => {
  const worksheet = XLSX.utils.json_to_sheet(meterReplacementData.value.map(item => ({
    'Customer ID': item.customerId,
    'Old Meter Number': item.oldMeterNumber,
    'Replace Meter Number': item.replaceMeterNumber,
    'Install Date': formatDate(item.installDate),
    'Replace Date': formatDate(item.replaceDate),
    'Last Bill Date': formatDate(item.lastBillDate),
    'Old Meter Last Reads': item.oldMeterLastReads,
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MeterReplacementData');
  XLSX.writeFile(workbook, 'meter_replacement_data.xlsx');
};

const searchMdmReads = async () => {
  try {
    const response = await apiClient.get('/mdm-reads', {
      params: {
        customerId: mdmCustomerSearch.value,
        meterNo: mdmMeterSearch.value
      }
    });
    mdmReadsData.value = response.data;
  } catch (error) {
    console.error('Error fetching MDM reads data:', error);
  }
};

const deleteMdmReads = async () => {
  try {
    await apiClient.delete('/mdm-reads');
    mdmReadsData.value = [];
    alert('All MDM reads data deleted successfully!');
  } catch (error) {
    console.error('Error deleting MDM reads data:', error);
    alert('Error deleting MDM reads data.');
  }
};

const downloadMdmReads = async () => {
  try {
    const response = await apiClient.get('/mdm-reads/download', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mdm_reads.csv');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error downloading MDM reads data:', error);
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-GB', options);
};
</script>

<style scoped>
/* Main Container */
.data-fetching-view {
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
}

/* Header Section */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.page-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #4f46e5;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Data Section */
.data-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.section-title svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #4f46e5;
}

.section-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

/* Search Section */
.search-section {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.search-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.input-with-icon {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.input-with-icon .form-control {
  padding-left: 2.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Results Section */
.results-section {
  padding: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.results-count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table thead {
  background: #f8fafc;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-row:hover {
  background: #f8fafc;
}

.customer-num {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #4f46e5;
}

.bill-date {
  color: var(--color-text-secondary);
}

.no-data-row {
  height: 200px;
}

.text-center {
  text-align: center;
}

.no-data-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.no-data-row p {
  margin: 0;
  color: var(--color-text-secondary);
}

/* Form Controls */
.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #15803d;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .data-fetching-view {
    padding: 1rem;
  }
  
  .search-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-with-icon {
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .results-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .section-header,
  .search-section,
  .results-section {
    padding: 1.5rem 1rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 1rem;
  }
}
</style>