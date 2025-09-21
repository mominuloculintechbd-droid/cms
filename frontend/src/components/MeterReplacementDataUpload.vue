<template>
  <div class="card mt-4">
    <div class="card-header">
      Upload Meter Replacement Data
    </div>
    <div class="card-body">
      <div class="input-group">
        <input type="file" class="form-control" @change="handleFileUpload" accept=".csv">
        <button class="btn btn-primary" @click="uploadFile">Upload</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';

const file = ref<File | null>(null);

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
    await apiClient.post('/meter-replacement/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Meter replacement data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading meter replacement data:', error);
    alert('Error uploading meter replacement data.');
  }
};
</script>

<style scoped>
.card {
  margin-top: 20px;
}
</style>
