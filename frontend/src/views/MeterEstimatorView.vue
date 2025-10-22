<template>
  <div class="main-container">
    <ul class="nav nav-tabs mb-4" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="single-tab" data-bs-toggle="tab" data-bs-target="#single" type="button" role="tab">Single Meter</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="bulk-tab" data-bs-toggle="tab" data-bs-target="#bulk" type="button" role="tab">Bulk Upload</button>
      </li>
    </ul>

    <div class="tab-content">
      <!-- Single Meter Tab -->
      <div class="tab-pane fade show active" id="single" role="tabpanel">
        <div class="card p-4 mb-4">
          <h2 class="text-center mb-4 text-primary">Meter Reading Estimator</h2>
          <form id="consumptionForm" class="needs-validation" novalidate @submit.prevent="handleCalculate">
            <div class="row g-4">
              <div class="col-md-6">
                <label for="customerId" class="form-label">Customer ID</label>
                <input type="text" class="form-control" id="customerId" v-model="single.customerId" required>
                <div class="invalid-feedback">Please provide a valid Customer ID</div>
              </div>
              
              <div class="col-md-6">
                <label for="tariffType" class="form-label">Tariff Type</label>
                <select class="form-select" id="tariffType" v-model="single.tariffType" required>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div class="col-md-6">
                <label for="meterNumber" class="form-label">Meter Number</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="meterNumber" pattern="[789]\d{7}" v-model="single.meterNumber" @input="updateMeterTypeBadge" required>
                  <span class="input-group-text" id="meterTypeBadge">{{ single.meterType }}</span>
                </div>
                <div class="invalid-feedback">Valid meter number required (8 digits starting with 7,8,9)</div>
              </div>

              <div class="col-md-6">
                <label for="dateRange" class="form-label">Billing Period</label>
                <div class="input-group">
                  <input type="date" class="form-control" id="startDate" v-model="single.startDate" required>
                  <span class="input-group-text">to</span>
                  <input type="date" class="form-control" id="endDate" v-model="single.endDate" required>
                </div>
              </div>

              <div class="col-md-6">
                <label for="lastReads" class="form-label">Previous Reading (kWh)</label>
                <input type="number" class="form-control" id="lastReads" step="0.01" v-model.number="single.lastReads" required>
                <div class="invalid-feedback">Please enter previous reading</div>
              </div>
              
              <!-- Residential Consumption -->
              <div class="col-md-6" v-if="single.tariffType === 'residential'">
                <label for="totalConsumption" class="form-label">Total Consumption (kWh)</label>
                <input type="number" class="form-control" id="totalConsumption" step="0.01" v-model.number="single.totalConsumption">
                <div class="invalid-feedback">Please enter valid consumption value</div>
              </div>
              
              <!-- Commercial TOD Fields -->
              <div v-if="single.tariffType === 'commercial'" class="commercial-section">
                <h5 class="tod-heading">Time-of-Day (TOD) Readings</h5>
                <div class="row g-4">
                  <div class="col-md-6">
                    <label for="tod1Consumption" class="form-label">TOD1 (Off-Peak) Consumption</label>
                    <input type="number" class="form-control" id="tod1Consumption" min="0" step="0.01" v-model.number="single.tod1Consumption">
                    <div class="invalid-feedback">Please enter valid consumption</div>
                  </div>
                  <div class="col-md-6">
                    <label for="tod2Consumption" class="form-label">TOD2 (On-Peak) Consumption</label>
                    <input type="number" class="form-control" id="tod2Consumption" min="0" step="0.01" v-model.number="single.tod2Consumption">
                    <div class="invalid-feedback">Please enter valid consumption</div>
                  </div>
                  <div class="col-md-6">
                    <label for="lastReadsTOD1" class="form-label">Previous TOD1 Reading</label>
                    <input type="number" class="form-control" id="lastReadsTOD1" step="0.01" v-model.number="single.lastReadsTOD1">
                  </div>
                  <div class="col-md-6">
                    <label for="lastReadsTOD2" class="form-label">Previous TOD2 Reading</label>
                    <input type="number" class="form-control" id="lastReadsTOD2" step="0.01" v-model.number="single.lastReadsTOD2">
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" class="btn btn-outline-secondary" @click="resetSingleForm">Reset</button>
              <button type="submit" class="btn btn-primary">Calculate</button>
              <button type="button" class="btn btn-success" @click="exportSingleCSV">Export CSV</button>
              <button type="button" class="btn btn-danger" @click="exportSinglePDF">Export PDF</button>
            </div>
          </form>
        </div>

        <div class="card p-4 mb-4" v-if="single.results.length > 0">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="mb-0">Estimation Results</h3>
            <span class="badge fs-6" :class="single.tariffType === 'commercial' ? 'bg-success' : 'bg-primary'">{{ single.tariffType === 'commercial' ? 'Commercial' : 'Residential' }}</span>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Estimated Reading</th>
                  <th>Consumption</th>
                  <th v-if="single.tariffType === 'commercial'">TOD1 (Off-Peak)</th>
                  <th v-if="single.tariffType === 'commercial'">TOD2 (On-Peak)</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in single.results" :key="result.month">
                  <td>{{ result.month }}</td>
                  <td>{{ result.cumulative.toFixed(2) }}</td>
                  <td>{{ result.consumption.toFixed(2) }}</td>
                  <td v-if="single.tariffType === 'commercial'">{{ result.cumulativeTOD1.toFixed(2) }}<br><small>({{ result.tod1Consumption.toFixed(2) }} kWh)</small></td>
                  <td v-if="single.tariffType === 'commercial'">{{ result.cumulativeTOD2.toFixed(2) }}<br><small>({{ result.tod2Consumption.toFixed(2) }} kWh)</small></td>
                  <td>{{ result.days }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bulk Upload Tab -->
      <div class="tab-pane fade" id="bulk" role="tabpanel">
        <div class="card p-4 mb-4">
          <h2 class="text-center mb-4 text-primary">Bulk Meter Reading Estimation</h2>
          <div class="row g-4">
            <div class="col-md-12">
              <label for="bulkFile" class="form-label">Upload CSV File</label>
              <input type="file" class="form-control" id="bulkFile" accept=".csv" @change="handleBulkFile">
              <div class="form-text">CSV format: CustomerID,TariffType,MeterNumber,StartDate(YYYY-MM-DD),EndDate(YYYY-MM-DD),LastReading[,TotalConsumption,TOD1Consumption,TOD2Consumption,LastTOD1,LastTOD2]</div>
              <div class="form-text"><strong>Note:</strong> For commercial meters, provide TOD1Consumption and TOD2Consumption instead of TotalConsumption</div>
            </div>
            
            <div class="col-md-12 d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" class="btn btn-secondary" @click="resetBulkForm">Reset</button>
              <button type="button" class="btn btn-primary" @click="processBulk">Process Bulk</button>
              <button type="button" class="btn btn-success" @click="exportBulkCSV">Export All CSV</button>
              <button type="button" class="btn btn-danger" @click="exportBulkPDF">Export All PDF</button>
            </div>
          </div>
        </div>

        <div class="card p-4 mb-4" v-if="bulk.results.length > 0">
          <h3 class="mb-4">Bulk Estimation Results</h3>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Meter Number</th>
                  <th>Tariff</th>
                  <th>Total Consumption</th>
                  <th>Months</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(result, index) in bulk.results" :key="index">
                  <tr class="bulk-results-row">
                    <td>{{ result.customerId }}</td>
                    <td>{{ result.meterNumber }}</td>
                    <td><span class="badge" :class="result.tariff === 'commercial' ? 'bg-success' : 'bg-primary'">{{ result.tariff }}</span></td>
                    <td>{{ result.totalConsumption.toFixed(2) }}</td>
                    <td>{{ result.monthlyResults.length }}</td>
                    <td><button class="btn btn-sm btn-outline-primary" @click="toggleBulkDetail(index)">View</button></td>
                  </tr>
                  <tr class="detail-row" v-if="bulk.detailsVisible[index]">
                    <td colspan="6">
                      <div class="p-3">
                        <table class="detail-table table table-sm">
                          <thead>
                            <tr>
                              <th>Month</th>
                              <th>Total</th>
                              <th>Consumption</th>
                              <th v-if="result.tariff === 'commercial'">TOD1 (Off-Peak)</th>
                              <th v-if="result.tariff === 'commercial'">TOD2 (On-Peak)</th>
                              <th>Days</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="month in result.monthlyResults" :key="month.month">
                              <td>{{ month.month }}</td>
                              <td>{{ month.cumulative.toFixed(2) }}</td>
                              <td>{{ month.consumption.toFixed(2) }}</td>
                              <td v-if="result.tariff === 'commercial'">{{ month.cumulativeTOD1.toFixed(2) }}</td>
                              <td v-if="result.tariff === 'commercial'">{{ month.cumulativeTOD2.toFixed(2) }}</td>
                              <td>{{ month.days }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const toast = useToast();

// --- TYPE DEFINITIONS ---
interface MonthlyResult {
  month: string;
  consumption: number;
  cumulative: number;
  days: number;
  tod1Consumption: number;
  tod2Consumption: number;
  cumulativeTOD1: number;
  cumulativeTOD2: number;
}

interface SingleResultData {
  customerId: string;
  tariffType: 'residential' | 'commercial';
  meterNumber: string;
  meterType: string;
  startDate: string;
  endDate: string;
  lastReads: number;
  totalConsumption: number;
  tod1Consumption: number;
  tod2Consumption: number;
  lastReadsTOD1: number;
  lastReadsTOD2: number;
  results: MonthlyResult[];
}

interface BulkResult {
  customerId: string;
  meterNumber: string;
  tariff: 'residential' | 'commercial';
  totalConsumption: number;
  monthlyResults: MonthlyResult[];
}

const single = reactive<SingleResultData>({
  customerId: '',
  tariffType: 'residential',
  meterNumber: '',
  meterType: '?',
  startDate: '',
  endDate: '',
  lastReads: 0,
  totalConsumption: 0,
  tod1Consumption: 0,
  tod2Consumption: 0,
  lastReadsTOD1: 0,
  lastReadsTOD2: 0,
  results: [],
});

const bulk = reactive({
  file: null as File | null,
  results: [] as BulkResult[],
  detailsVisible: {} as { [key: number]: boolean },
});

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

function updateMeterTypeBadge() {
  const prefix = single.meterNumber.charAt(0);
  const types: { [key: string]: string } = {
      '7': 'SHENZHEN',
      '8': 'WASION',
      '9': 'L&G'
  };
  single.meterType = types[prefix] || '?';
}

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

function calculateConsumption(data: Partial<SingleResultData>): MonthlyResult[] {
    const {tariffType, startDate, endDate, lastReads, totalConsumption, tod1Consumption, tod2Consumption, lastReadsTOD1, lastReadsTOD2} = data;
    if (!startDate || !endDate) throw new Error('Start and End date are required');
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime()) throw new Error('End date must be after start date');

    let totalCons = 0;
    let tod1Cons = 0;
    let tod2Cons = 0;

    if (tariffType === 'commercial') {
        tod1Cons = tod1Consumption || 0;
        tod2Cons = tod2Consumption || 0;
        totalCons = tod1Cons + tod2Cons;
        if (totalCons <= 0) throw new Error('Total consumption must be positive');
    } else {
        totalCons = totalConsumption || 0;
        if (isNaN(totalCons)) throw new Error('Invalid consumption value');
    }

    let currentDate = new Date(start);
    const results: MonthlyResult[] = [];
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    let dailyConsumption = totalCons / totalDays;
    let dailyTod1 = tariffType === 'commercial' ? tod1Cons / totalDays : 0;
    let dailyTod2 = tariffType === 'commercial' ? tod2Cons / totalDays : 0;
    
    let cumulativeConsumption = lastReads || 0;
    let cumulativeTOD1 = lastReadsTOD1 || 0;
    let cumulativeTOD2 = lastReadsTOD2 || 0;

    while (currentDate <= end) {
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const periodEnd = end < monthEnd ? end : monthEnd;
        
        const daysInPeriod = Math.ceil((periodEnd.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const monthlyConsumption = daysInPeriod * dailyConsumption;
        cumulativeConsumption += monthlyConsumption;
        
        const result: MonthlyResult = {
            month: `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`,
            consumption: monthlyConsumption,
            cumulative: cumulativeConsumption,
            days: daysInPeriod,
            tod1Consumption: 0,
            tod2Consumption: 0,
            cumulativeTOD1: 0,
            cumulativeTOD2: 0,
        };
        
        if (tariffType === 'commercial') {
            const monthlyTod1 = daysInPeriod * dailyTod1;
            const monthlyTod2 = daysInPeriod * dailyTod2;
            
            cumulativeTOD1 += monthlyTod1;
            cumulativeTOD2 += monthlyTod2;
            
            result.tod1Consumption = monthlyTod1;
            result.tod2Consumption = monthlyTod2;
            result.cumulativeTOD1 = cumulativeTOD1;
            result.cumulativeTOD2 = cumulativeTOD2;
        }

        results.push(result);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return results;
}

function handleCalculate() {
  try {
    single.results = calculateConsumption(single);
    toast.success('Calculation successful!');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function exportSingleCSV() {
  try {
    const results = calculateConsumption(single);
    let csvContent = "METERNO,UOM,readdttm,read\n";
    
    if (single.tariffType === 'commercial') {
        results.forEach(result => {
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'total')},${result.month},${result.cumulative.toFixed(2)}\n`;
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'tod1')},${result.month},${result.cumulativeTOD1.toFixed(2)}\n`;
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber, 'tod2')},${result.month},${result.cumulativeTOD2.toFixed(2)}\n`;
        });
    } else {
        results.forEach(result => {
            csvContent += `${single.meterNumber},${getUOM(single.meterNumber)},${result.month},${result.cumulative.toFixed(2)}\n`;
        });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meter-readings-${Date.now()}.csv`;
    link.click();
    toast.success('CSV exported successfully');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function exportSinglePDF() {
  try {
    const results = calculateConsumption(single);
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Estimation Report', 15, 15);
    
    doc.setFontSize(12);
    doc.text(`Customer ID: ${single.customerId}`, 15, 25);
    doc.text(`Meter Number: ${single.meterNumber}`, 15, 30);
    doc.text(`Tariff: ${single.tariffType.charAt(0).toUpperCase() + single.tariffType.slice(1)}`, 15, 35);
    doc.text(`Previous Reading: ${single.lastReads} kWh`, 15, 40);
    
    let startY = 50;
    if (single.tariffType === 'commercial') {
        doc.text(`TOD1 Consumption: ${single.tod1Consumption.toFixed(2)} kWh`, 15, 45);
        doc.text(`TOD2 Consumption: ${single.tod2Consumption.toFixed(2)} kWh`, 15, 50);
        startY = 60;
    }
    doc.text(`Period: ${single.startDate} to ${single.endDate}`, 15, startY - 5);

    const headers = single.tariffType === 'commercial' ? 
        [["Month", "Total", "Consumption", "TOD1 (Off-Peak)", "TOD2 (On-Peak)", "Days"]] :
        [["Month", "Estimated Reading", "Consumption", "Days"]];
        
    const rows = results.map(r => {
        if (single.tariffType === 'commercial') {
            return [r.month, r.cumulative.toFixed(2), r.consumption.toFixed(2), r.cumulativeTOD1.toFixed(2), r.cumulativeTOD2.toFixed(2), r.days];
        } else {
            return [r.month, r.cumulative.toFixed(2), r.consumption.toFixed(2), r.days];
        }
    });
    
    (doc as any).autoTable({
        startY: startY,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: {fontSize: 10},
        headStyles: {fillColor: [41, 128, 185]}
    });

    doc.save(`estimation-report-${single.meterNumber}.pdf`);
    toast.success('PDF exported successfully');
  } catch (error: any) {
    toast.error(error.message);
  }
}

function resetSingleForm() {
  single.customerId = '';
  single.tariffType = 'residential';
  single.meterNumber = '';
  single.meterType = '?';
  single.startDate = '';
  single.endDate = '';
  single.lastReads = 0;
  single.totalConsumption = 0;
  single.tod1Consumption = 0;
  single.tod2Consumption = 0;
  single.lastReadsTOD1 = 0;
  single.lastReadsTOD2 = 0;
  single.results = [];
}

function handleBulkFile(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    bulk.file = target.files[0];
  }
}

function processBulk() {
  if (!bulk.file) {
    toast.error('Please select a CSV file');
    return;
  }

  Papa.parse(bulk.file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      bulk.results = results.data.map((row: any) => {
        try {
          const monthlyResults = calculateConsumption({
            tariffType: row.TariffType || 'residential',
            startDate: row.StartDate,
            endDate: row.EndDate,
            lastReads: parseFloat(row.LastReading) || 0,
            totalConsumption: parseFloat(row.TotalConsumption) || 0,
            tod1Consumption: parseFloat(row.TOD1Consumption) || 0,
            tod2Consumption: parseFloat(row.TOD2Consumption) || 0,
            lastReadsTOD1: parseFloat(row.LastTOD1) || 0,
            lastReadsTOD2: parseFloat(row.LastTOD2) || 0,
          });

          let totalConsumption = 0;
          if(row.TariffType === 'commercial') {
            totalConsumption = (parseFloat(row.TOD1Consumption) || 0) + (parseFloat(row.TOD2Consumption) || 0);
          } else {
            totalConsumption = parseFloat(row.TotalConsumption) || 0;
          }

          return {
            customerId: row.CustomerID,
            meterNumber: row.MeterNumber,
            tariff: row.TariffType || 'residential',
            totalConsumption: totalConsumption,
            monthlyResults: monthlyResults,
          };
        } catch (e: any) {
          toast.warning(`Skipping row for meter ${row.MeterNumber}: ${e.message}`);
          return null;
        }
      }).filter((r): r is BulkResult => r !== null);
      toast.success(`Processed ${bulk.results.length} meters successfully`);
    },
    error: (error: any) => {
      toast.error(`Error parsing CSV: ${error.message}`);
    }
  });
}

function toggleBulkDetail(index: number) {
  bulk.detailsVisible[index] = !bulk.detailsVisible[index];
}

function exportBulkCSV() {
  if (bulk.results.length === 0) {
    toast.warning('No data to export');
    return;
  }

  let csvContent = "METERNO,UOM,readdttm,read\n";
  
  bulk.results.forEach(result => {
      if (result.tariff === 'commercial') {
          result.monthlyResults.forEach(month => {
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'total')},${month.month},${month.cumulative.toFixed(2)}\n`;
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'tod1')},${month.month},${month.cumulativeTOD1.toFixed(2)}\n`;
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber, 'tod2')},${month.month},${month.cumulativeTOD2.toFixed(2)}\n`;
          });
      } else {
          result.monthlyResults.forEach(month => {
              csvContent += `${result.meterNumber},${getUOM(result.meterNumber)},${month.month},${month.cumulative.toFixed(2)}\n`;
          });
      }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bulk-meter-readings-${Date.now()}.csv`;
  link.click();
  toast.success('Bulk CSV exported successfully');
}

function exportBulkPDF() {
  if (bulk.results.length === 0) {
    toast.warning('No data to export');
    return;
  }

  const doc = new jsPDF();
  
  bulk.results.forEach((result, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFontSize(16);
      doc.text(`Meter Report: ${result.meterNumber}`, 15, 15);
      doc.setFontSize(12);
      doc.text(`Customer ID: ${result.customerId}`, 15, 25);
      doc.text(`Tariff: ${result.tariff.charAt(0).toUpperCase() + result.tariff.slice(1)}`, 15, 30);
      
      let startY = 40;
      if (result.tariff === 'commercial') {
          doc.text(`TOD1 Consumption: ${result.monthlyResults.reduce((acc: number, m: MonthlyResult) => acc + m.tod1Consumption, 0).toFixed(2)} kWh`, 15, 35);
          doc.text(`TOD2 Consumption: ${result.monthlyResults.reduce((acc: number, m: MonthlyResult) => acc + m.tod2Consumption, 0).toFixed(2)} kWh`, 15, 40);
          startY = 50;
      }
      doc.text(`Period: ${result.monthlyResults[0].month} to ${result.monthlyResults.slice(-1)[0].month}`, 15, startY - 5);

      const headers = result.tariff === 'commercial' ? 
          [["Month", "Total", "Consumption", "TOD1", "TOD2", "Days"]] :
          [["Month", "Reading", "Consumption", "Days"]];
          
      const rows = result.monthlyResults.map((month: MonthlyResult) => {
          if (result.tariff === 'commercial') {
              return [month.month, month.cumulative.toFixed(2), month.consumption.toFixed(2), month.cumulativeTOD1.toFixed(2), month.cumulativeTOD2.toFixed(2), month.days];
          } else {
              return [month.month, month.cumulative.toFixed(2), month.consumption.toFixed(2), month.days];
          }
      });

      (doc as any).autoTable({
          startY: startY,
          head: headers,
          body: rows,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }
      });
  });

  doc.save('bulk-meter-reports.pdf');
  toast.success('Bulk PDF exported successfully');
}

function resetBulkForm() {
  bulk.file = null;
  bulk.results = [];
  bulk.detailsVisible = {};
  const bulkFileInput = document.getElementById('bulkFile') as HTMLInputElement;
  if(bulkFileInput) bulkFileInput.value = '';
}
</script>

<style scoped>
/* Modern Meter Estimator Styles */
.main-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}

.card {
  background: linear-gradient(120deg, #fff 60%, #e0e7ff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  padding: 32px 28px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}

.text-primary {
  color: #6366f1 !important;
}

.nav-tabs {
  display: flex;
  gap: 12px;
  border-bottom: none;
  background: none;
  justify-content: center;
  margin-bottom: 32px;
}

.nav-tabs .nav-link {
  background: transparent;
  border: none;
  font-weight: 700;
  color: #6366f1;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 12px 12px 0 0;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  box-shadow: none;
  position: relative;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  color: #fff !important;
  box-shadow: 0 4px 15px rgba(99,102,241,0.15);
  z-index: 2;
}

.nav-tabs .nav-link:hover:not(.active) {
  background: #eef2ff;
  color: #6366f1 !important;
  opacity: 0.9;
}

.tab-content {
  animation: fadeIn 0.5s;
}

.form-label {
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 6px;
}

.form-control, .form-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #c7d2fe;
  background: #f3f4f6;
  font-size: 1rem;
  transition: border 0.2s;
}

.form-control:focus, .form-select:focus {
  border-color: #6366f1;
  outline: none;
  background: #eef2ff;
}

.input-group-text {
  background: #eef2ff;
  color: #6366f1;
  border-radius: 0 8px 8px 0;
  font-weight: 600;
  border: none;
  padding: 0 14px;
}

.btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
  margin-right: 8px;
}

.btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.btn-success {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: #fff;
}

.btn-success:hover {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.btn-danger {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
  color: #fff;
}

.btn-danger:hover {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
}

.btn-outline-secondary {
  background: transparent;
  color: #6366f1;
  border: 2px solid #c7d2fe;
}

.btn-outline-secondary:hover {
  background: #eef2ff;
  color: #6366f1;
}

.btn-outline-primary {
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.btn-outline-primary:hover {
  background: #eef2ff;
  color: #6366f1;
}

.badge {
  border-radius: 999px;
  padding: 6px 18px;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: #6366f1;
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.bg-success {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%) !important;
  color: #fff !important;
}

.bg-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%) !important;
  color: #fff !important;
}

.table {
  min-width: 900px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  overflow: hidden;
}

.table th {
  background: #6366f1;
  color: #fff;
  padding: 12px;
  font-weight: 700;
  text-align: left;
  font-size: 1rem;
}

.table td {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.98rem;
  color: #374151;
  background: #fff;
}

.table tr:hover td {
  background: #f3f4f6;
}

.table-responsive {
  overflow-x: auto;
  margin-top: 12px;
}

.commercial-section {
  background: linear-gradient(90deg, #f3f4f6 0%, #e0e7ff 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #6366f1;
  box-shadow: 0 2px 8px rgba(99,102,241,0.06);
}

.tod-heading {
  font-weight: 700;
  color: #6366f1;
  border-bottom: 2px solid #818cf8;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.detail-table {
  background: rgba(241,243,244,0.5);
  border-radius: 12px;
}

.bulk-results-row {
  background: #f3f4f6;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.05);
  transition: transform 0.3s ease;
}

.bulk-results-row:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(99,102,241,0.1);
}

.detail-row {
  background: #fff;
}

.invalid-feedback {
  color: #ef4444;
  font-weight: 500;
  padding-left: 0.5rem;
}

#meterTypeBadge {
  border-radius: 0 10px 10px 0;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  background: #eef2ff;
  color: #6366f1;
  padding: 0 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .main-container {
    padding: 16px 4px;
  }
  .card {
    padding: 18px 8px;
  }
  .table {
    min-width: 600px;
  }
}

@media (max-width: 600px) {
  .main-container { padding: 8px 2px; }
  .card { padding: 10px 2px; }
  .table { min-width: 320px; }
  .nav-tabs .nav-link { font-size: 0.95rem; padding: 0.7rem 1.2rem; }
}
</style>
