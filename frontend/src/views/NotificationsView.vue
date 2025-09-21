<template>
  <div class="container py-3">
    <h3>Notifications</h3>
    <div v-if="loading" class="text-muted">Loading...</div>
    <div v-else>
      <div v-if="notifications.length === 0" class="text-muted">No notifications</div>
      <ul class="list-group">
        <li v-for="n in notifications" :key="n.id" class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">{{ n.title }}</div>
            <div class="small">{{ n.message }}</div>
          </div>
          <button v-if="!n.isRead" class="btn btn-sm btn-outline-primary" @click="markRead(n.id)">Mark as read</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';

const notifications = ref<any[]>([]);
const loading = ref<boolean>(false);
const auth = useAuthStore();

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await api.get('/notifications', { headers: { Authorization: `Bearer ${auth.token}` } });
    notifications.value = res.data;
  } finally {
    loading.value = false;
  }
};

const markRead = async (id: number) => {
  await api.put(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${auth.token}` } });
  const n = notifications.value.find(x => x.id === id);
  if (n) n.isRead = true;
};

onMounted(fetchNotifications);
</script>

<style scoped>
</style>


