<template>
  <div class="batch-report-page">
    <header class="page-header">
      <h1>Batch Operational Daily Report</h1>
      <p>Upload and view daily batch operational reports.</p>
    </header>

    <div class="grid-container">
      <!-- Left Column: Controls and Main Reports -->
      <div class="main-column">
        <!-- Controls -->
        <div class="card control-card">
          <div class="card-header">
            <h2>Controls</h2>
          </div>
          <div class="card-body">
            <div class="control-group">
              <label for="file-upload">Upload Batch Data (.xlsx, .xls)</label>
              <div class="file-upload-wrapper">
                <input type="file" id="file-upload" @change="handleFileUpload" accept=".xlsx, .xls" />
                <button @click="submitFile" class="btn btn-primary">Upload</button>
              </div>
            </div>
            <div class="control-group">
              <label for="report-date">Select Batch Business Date</label>
              <div class="date-selector-wrapper">
                <input type="date" id="report-date" v-model="selectedDate" />
                <button @click="fetchReports" class="btn btn-secondary">Get Reports</button>
                <button @click="deleteReports" class="btn btn-danger">Delete Reports</button>
              </div>
            </div>
            <div class="control-group">
              <label for="batch-cd-filter">Filter by Batch Code</label>
              <select id="batch-cd-filter" v-model="selectedBatchCd">
                <option v-for="cd in uniqueBatchCds" :key="cd" :value="cd">{{ cd }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Daily Batch Summary Report -->
        <div class="card report-card" v-if="filteredReports.length > 0">
          <div class="card-header">
            <h3>Daily Batch Summary</h3>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Batch Code</th>
                    <th>Status</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Total Records</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in filteredReports" :key="report.id">
                    <td>{{ report.batch_cd }}</td>
                    <td><span :class="`status-badge status-${report.batch_job_stat_flg.toLowerCase()}`">{{ report.batch_job_stat_flg }}</span></td>
                    <td>{{ new Date(report.start_dttm).toLocaleString() }}</td>
                    <td>{{ new Date(report.end_dttm).toLocaleString() }}</td>
                    <td>{{ report.total_records }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Batch Performance Report -->
        <div class="card report-card" v-if="filteredReports.length > 0">
          <div class="card-header">
            <h3>Batch Performance Report</h3>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Batch Code</th>
                    <th>Duration (H:M:S)</th>
                    <th>RPS</th>
                    <th>Avg. Time/Record (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in filteredReports" :key="report.id">
                    <td>{{ report.batch_cd }}</td>
                    <td>{{ formatDuration(report.total_duration) }}</td>
                    <td>{{ report.rps }}</td>
                    <td>{{ (report.total_duration * 1000 / report.total_records).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Aggregated Reports -->
      <div class="side-column" v-if="filteredReports.length > 0">
        <!-- Daily Aggregated Report -->
        <div class="card report-card">
          <div class="card-header">
            <h3>Daily Aggregated Report</h3>
          </div>
          <div class="card-body">
            <ul class="aggregated-list">
              <li><strong>Total Batches:</strong> {{ aggregatedReport.totalBatches }}</li>
              <li><strong>Success:</strong> <span class="text-success">{{ aggregatedReport.successBatches }}</span></li>
              <li><strong>Failed:</strong> <span class="text-danger">{{ aggregatedReport.failedBatches }}</span></li>
              <li><strong>Total Records:</strong> {{ aggregatedReport.totalRecords }}</li>
              <li><strong>Avg. Duration:</strong> {{ formatDuration(aggregatedReport.avgDuration) }}</li>
              <li><strong>Longest Batch:</strong> {{ aggregatedReport.longestBatch.batch_cd }} ({{ formatDuration(aggregatedReport.longestBatch.total_duration) }})</li>
              <li><strong>Shortest Batch:</strong> {{ aggregatedReport.shortestBatch.batch_cd }} ({{ formatDuration(aggregatedReport.shortestBatch.total_duration) }})</li>
            </ul>
          </div>
        </div>

        <!-- Batch Efficiency Report -->
        <div class="card report-card">
          <div class="card-header">
            <h3>Batch Efficiency Report</h3>
          </div>
          <div class="card-body">
            <h4>Top 3 Fastest Batches (by RPS)</h4>
            <ul class="efficiency-list">
              <li v-for="batch in fastestBatches" :key="batch.id">{{ batch.batch_cd }} (RPS: {{ batch.rps }})</li>
            </ul>
            <h4>Top 3 Slowest Batches (by RPS)</h4>
            <ul class="efficiency-list">
              <li v-for="batch in slowestBatches" :key="batch.id">{{ batch.batch_cd }} (RPS: {{ batch.rps }})</li>
            </ul>
          </div>
        </div>

        <!-- Thread Utilization Report -->
        <div class="card report-card">
          <div class="card-header">
            <h3>Thread Utilization Report</h3>
          </div>
          <div class="card-body">
            <p><strong>Average Thread Count:</strong> {{ threadUtilizationReport.avgThreads.toFixed(2) }}</p>
            <h4>High Thread Usage ( > avg)</h4>
            <ul class="thread-list">
              <li v-for="batch in threadUtilizationReport.highUsage" :key="batch.id">{{ batch.batch_cd }} (Threads: {{ batch.batch_thread_cnt }})</li>
            </ul>
            <h4>Low Thread Usage ( &lt;= avg)</h4>
            <ul class="thread-list">
              <li v-for="batch in threadUtilizationReport.lowUsage" :key="batch.id">{{ batch.batch_cd }} (Threads: {{ batch.batch_thread_cnt }})</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- No Reports Message -->
      <div class="no-reports" v-else-if="searched">
        <p>No reports found for the selected date.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const selectedFile = ref(null);
const selectedDate = ref(new Date().toISOString().substr(0, 10));
const reports = ref([]);
const searched = ref(false);
const selectedBatchCd = ref('all');

const uniqueBatchCds = computed(() => {
  if (reports.value.length === 0) return [];
  const cds = new Set(reports.value.map(r => r.batch_cd));
  return ['all', ...Array.from(cds)];
});

const filteredReports = computed(() => {
  if (selectedBatchCd.value === 'all') {
    return reports.value;
  }
  return reports.value.filter(r => r.batch_cd === selectedBatchCd.value);
});

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const submitFile = async () => {
  if (!selectedFile.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    await axios.post('http://localhost:3000/api/batch-operational-report/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('File uploaded successfully.');
    fetchReports(); // Refresh reports after upload
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file.');
  }
};

const fetchReports = async () => {
  searched.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/batch-operational-report', {
      params: {
        batch_bus_dt: selectedDate.value
      }
    });
    reports.value = response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    reports.value = [];
  }
};

const deleteReports = async () => {
  if (!selectedDate.value) {
    alert('Please select a date to delete reports.');
    return;
  }

  if (confirm(`Are you sure you want to delete all reports for ${selectedDate.value}?`)) {
    try {
      await axios.delete('http://localhost:3000/api/batch-operational-report', {
        params: {
          batch_bus_dt: selectedDate.value
        }
      });
      alert('Reports deleted successfully.');
      fetchReports(); // Refresh reports after deletion
    } catch (error) {
      console.error('Error deleting reports:', error);
      alert('Error deleting reports.');
    }
  }
};

const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const aggregatedReport = computed(() => {
  if (filteredReports.value.length === 0) {
    return {
      totalBatches: 0,
      successBatches: 0,
      failedBatches: 0,
      totalRecords: 0,
      avgDuration: 0,
      longestBatch: { batch_cd: 'N/A', total_duration: 0 },
      shortestBatch: { batch_cd: 'N/A', total_duration: 0 }
    };
  }

  const totalBatches = filteredReports.value.length;
  const successBatches = filteredReports.value.filter(r => r.batch_job_stat_flg === 'COMPLETED').length;
  const failedBatches = totalBatches - successBatches;
  const totalRecords = filteredReports.value.reduce((sum, r) => sum + r.total_records, 0);
  const totalDuration = filteredReports.value.reduce((sum, r) => sum + r.total_duration, 0);
  const avgDuration = totalDuration / totalBatches;
  const longestBatch = filteredReports.value.reduce((max, r) => r.total_duration > max.total_duration ? r : max, filteredReports.value[0]);
  const shortestBatch = filteredReports.value.reduce((min, r) => r.total_duration < min.total_duration ? r : min, filteredReports.value[0]);

  return {
    totalBatches,
    successBatches,
    failedBatches,
    totalRecords,
    avgDuration,
    longestBatch,
    shortestBatch
  };
});

const fastestBatches = computed(() => {
  return [...filteredReports.value].sort((a, b) => b.rps - a.rps).slice(0, 3);
});

const slowestBatches = computed(() => {
  return [...filteredReports.value].sort((a, b) => a.rps - b.rps).slice(0, 3);
});

const threadUtilizationReport = computed(() => {
  if (filteredReports.value.length === 0) {
    return { avgThreads: 0, highUsage: [], lowUsage: [] };
  }
  const avgThreads = filteredReports.value.reduce((sum, r) => sum + r.batch_thread_cnt, 0) / filteredReports.value.length;
  const highUsage = filteredReports.value.filter(r => r.batch_thread_cnt > avgThreads);
  const lowUsage = filteredReports.value.filter(r => r.batch_thread_cnt <= avgThreads);
  return { avgThreads, highUsage, lowUsage };
});

</script>

<style scoped>
.batch-report-page {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.page-header p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
}

.grid-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.card-header h2, .card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.file-upload-wrapper, .date-selector-wrapper {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

thead th {
  background-color: var(--color-background-soft);
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.status-completed {
  background-color: #10b981;
  color: white;
}

.status-error {
  background-color: #ef4444;
  color: white;
}

.aggregated-list, .efficiency-list, .thread-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aggregated-list li, .efficiency-list li, .thread-list li {
  margin-bottom: 0.5rem;
}

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.no-reports {
  text-align: center;
  padding: 4rem;
  background-color: var(--color-background-soft);
  border: 1px dashed var(--color-border);
  border-radius: 0.5rem;
}

@media (max-width: 992px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
