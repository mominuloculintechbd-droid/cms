<template>
  <div class="data-upload-page">
    <h1 class="du-title">Data Upload</h1>
    <div class="du-card">
      <div class="du-card-header">
        <span class="du-card-icon">
          <svg width="22" height="22" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <path d="M12 8v8M8 12l4 4 4-4"/>
          </svg>
        </span>
        Upload Last Bill Date
      </div>
      <div class="du-card-body">
        <div class="du-input-group">
          <input type="file" class="du-input" @change="handleFileUpload" accept=".csv">
          <button class="du-btn du-btn-primary" @click="uploadFile">Upload</button>
        </div>
      </div>
    </div>

    <div class="du-card">
      <MeterReplacementDataUpload />
    </div>

    <div class="du-card">
      <div class="du-card-header">
        <span class="du-card-icon">
          <svg width="22" height="22" fill="none" stroke="#14b8a6" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <path d="M12 8v8M8 12l4 4 4-4"/>
          </svg>
        </span>
        Upload MDM Reads
      </div>
      <div class="du-card-body">
        <div class="du-input-group">
          <input type="file" class="du-input" @change="handleMdmFileUpload" accept=".csv">
          <button class="du-btn du-btn-info" @click="uploadMdmFile">Upload</button>
        </div>
      </div>
    </div>

    <div class="du-card">
      <div class="du-card-header">
        <span class="du-card-icon">
          <svg width="22" height="22" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <path d="M12 8v8M8 12l4 4 4-4"/>
          </svg>
        </span>
        Upload Daily Billing Report
      </div>
      <div class="du-card-body">
        <div class="du-input-group">
          <input type="file" class="du-input" @change="handleBillingFileUpload" accept=".xlsx, .xls">
          <button class="du-btn du-btn-danger" @click="uploadBillingFile">Upload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';
import MeterReplacementDataUpload from '@/components/MeterReplacementDataUpload.vue';

const file = ref<File | null>(null);
const mdmFile = ref<File | null>(null);
const billingFile = ref<File | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

const uploadFile = async () => {
  if (!file.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    await apiClient.post('/last-bill-date/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Last bill date data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading last bill date data:', error);
    alert('Error uploading last bill date data.');
  }
};

const handleMdmFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    mdmFile.value = target.files[0];
  }
};

const uploadMdmFile = async () => {
  if (!mdmFile.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', mdmFile.value);

  try {
    await apiClient.post('/mdm-reads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('MDM reads data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading MDM reads data:', error);
    alert('Error uploading MDM reads data.');
  }
};

const handleBillingFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    billingFile.value = target.files[0];
  }
};

const uploadBillingFile = async () => {
  if (!billingFile.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', billingFile.value);

  try {
    await apiClient.post('/daily-billing-report/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Daily billing report data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading daily billing report data:', error);
    alert('Error uploading daily billing report data.');
  }
};
</script>

<style scoped>
.data-upload-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 16px;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.du-title {
  font-size: 2rem;
  font-weight: 800;
  color: #4338ca;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: -1px;
}

.du-card {
  background: linear-gradient(120deg, #fff 60%, #e0e7ff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(54,162,235,0.08), 0 1px 2px rgba(0,0,0,0.04);
  padding: 32px 28px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}

.du-card-header {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.du-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.du-card-body {
  margin-top: 0;
}

.du-input-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.du-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #c7d2fe;
  background: #f3f4f6;
  font-size: 1rem;
  transition: border 0.2s;
  min-width: 220px;
}

.du-input:focus {
  border-color: #6366f1;
  outline: none;
  background: #eef2ff;
}

.du-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.du-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
}

.du-btn-primary:hover {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.du-btn-info {
  background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%);
  color: #fff;
}

.du-btn-info:hover {
  background: linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%);
}

.du-btn-danger {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
  color: #fff;
}

.du-btn-danger:hover {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
}

@media (max-width: 900px) {
  .data-upload-page {
    padding: 16px 4px;
  }
  .du-card {
    padding: 18px 8px;
  }
  .du-input-group {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .du-title { font-size: 1.3rem; }
  .du-card-header { font-size: 1rem; }
}
</style>