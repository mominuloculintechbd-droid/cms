<template>
  <div class="content-detail">
    <h1>Content Details</h1>
    <div v-if="content">
      <h2>{{ content.title }}</h2>
      <p><strong>Type:</strong> {{ content.type }}</p>
      <hr>
      <div v-html="content.body"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import { useRoute } from 'vue-router';

interface Content {
  title: string;
  type: string;
  body: string;
}

const content = ref<Content | null>(null);
const route = useRoute();

onMounted(async () => {
  try {
    const response = await apiClient.get(`/content/${route.params.id}`);
    content.value = response.data;
  } catch (error) {
    console.error('Error getting content details', error);
  }
});
</script>