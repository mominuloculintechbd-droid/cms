<template>
  <div class="content-list">
    <h1>Content</h1>
    <router-link v-if="auth.canCreateContent" to="/content/create" class="btn btn-primary mb-3">Create Content</router-link>

    <div v-if="deleteError" class="alert alert-danger">{{ deleteError }}</div>

    <div class="mb-3">
      <input type="text" class="form-control" placeholder="Search by title, type or ID..." v-model="searchTerm">
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover table-fixed-header">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredContent" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.type }}</td>
            <td>
              <router-link :to="`/content/${item.id}`" class="btn btn-sm btn-info">View</router-link>
              <button v-if="auth.canDeleteData" @click="handleDelete(item.id)" class="btn btn-sm btn-danger ms-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { deleteContent as apiDeleteContent } from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const content = ref<any[]>([]);
const searchTerm = ref('');
const deleteError = ref('');

onMounted(async () => {
  try {
    const response = await apiClient.get('/content');
    content.value = response.data;
  } catch (error) {
    console.error('Error getting content', error);
  }
});

const filteredContent = computed(() => {
  if (!searchTerm.value) {
    return content.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return content.value.filter(item =>
    item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    item.type.toLowerCase().includes(lowerCaseSearchTerm) ||
    item.id.toString().includes(lowerCaseSearchTerm)
  );
});

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this content?')) {
    return;
  }
  deleteError.value = '';
  try {
    await apiDeleteContent(id);
    // Remove content from the list locally
    content.value = content.value.filter(item => item.id !== id);
  } catch (error) {
    deleteError.value = 'Failed to delete content.';
    console.error('Error deleting content', error);
  }
};
</script>
