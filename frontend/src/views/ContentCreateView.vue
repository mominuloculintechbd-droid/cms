<template>
  <div class="content-create">
    <h1>Create Content</h1>
    <form @submit.prevent="createContent">
      <div class="form-floating mb-3">
        <input type="text" class="form-control" :class="{ 'is-invalid': titleError }" id="title" placeholder="Title" v-model="title">
        <label for="title">Title</label>
        <div class="invalid-feedback">
          {{ titleError }}
        </div>
      </div>
      <div class="form-floating mb-3">
        <textarea class="form-control" :class="{ 'is-invalid': bodyError }" id="body" placeholder="Body" v-model="body" style="height: 100px"></textarea>
        <label for="body">Body</label>
        <div class="invalid-feedback">
          {{ bodyError }}
        </div>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="type" v-model="type">
          <option value="Announcement">Announcement</option>
          <option value="SOP">SOP</option>
          <option value="Project Document">Project Document</option>
        </select>
        <label for="type">Type</label>
      </div>
      <button type="submit" class="btn btn-primary">Create</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';

const title = ref('');
const body = ref('');
const type = ref('Announcement');
const titleError = ref('');
const bodyError = ref('');
const router = useRouter();

const validateForm = () => {
  titleError.value = '';
  bodyError.value = '';
  let isValid = true;

  if (!title.value) {
    titleError.value = 'Title is required.';
    isValid = false;
  }

  if (!body.value) {
    bodyError.value = 'Body is required.';
    isValid = false;
  }

  return isValid;
};

const createContent = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await apiClient.post('/content', {
      title: title.value,
      body: body.value,
      type: type.value,
    });
    router.push('/content');
  } catch (error: any) {
    console.error('Error creating content', error);
    // Display error message
    if (error.response && error.response.data && error.response.data.message) {
      // For simplicity, we'll just show a generic error for now
      titleError.value = 'Error creating content.';
    } else {
      titleError.value = 'An unexpected error occurred.';
    }
  }
};
</script>
