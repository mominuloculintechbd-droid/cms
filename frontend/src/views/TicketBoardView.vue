<template>
  <div class="board container-fluid">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2>Kanban Board</h2>
      <router-link to="/tickets" class="btn btn--outline">Back to list</router-link>
    </div>
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-3" v-for="col in columns" :key="col.key">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>{{ col.title }}</span>
            <span class="badge bg-secondary">{{ grouped[col.key]?.length || 0 }}</span>
          </div>
          <div class="card-body board-col">
            <div v-for="t in grouped[col.key] || []" :key="t.id" class="ticket-card" @dblclick="openTicket(t.id)">
              <div class="d-flex justify-content-between align-items-start">
                <div class="fw-semibold">#{{ t.id }} • {{ t.title }}</div>
                <span class="badge bg-light text-dark">{{ t.priority }}</span>
              </div>
              <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary" @click.stop="move(t, col.next)">Move → {{ col.next }}</button>
              </div>
            </div>
            <div v-if="(grouped[col.key] || []).length === 0" class="text-muted small">No tickets</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';

type StatusKey = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const router = useRouter();

const state = reactive({ tickets: [] as any[] });

const columns = [
  { key: 'Open', title: 'Open', next: 'In Progress' },
  { key: 'In Progress', title: 'In Progress', next: 'Resolved' },
  { key: 'Resolved', title: 'Resolved', next: 'Closed' },
  { key: 'Closed', title: 'Closed', next: 'Closed' },
] as { key: StatusKey, title: string, next: StatusKey }[];

const load = async () => {
  const res = await api.get('/tickets');
  state.tickets = res.data || [];
};

const grouped = computed<Record<StatusKey, any[]>>(() => {
  const g: any = { 'Open': [], 'In Progress': [], 'Resolved': [], 'Closed': [] };
  for (const t of state.tickets) {
    const s = (t.status as StatusKey) || 'Open';
    if (!g[s]) g['Open'].push(t); else g[s].push(t);
  }
  return g;
});

const move = async (ticket: any, toStatus: StatusKey) => {
  if (!ticket || ticket.status === toStatus) return;
  await api.put(`/tickets/${ticket.id}`, { ...ticket, status: toStatus });
  await load();
};

const openTicket = (id: number) => {
  router.push(`/tickets/${id}`);
};

onMounted(load);
</script>

<style scoped>
.board-col {
  min-height: 200px;
}
.ticket-card {
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background: var(--surface-0);
  cursor: pointer;
}
.ticket-card:hover { background: var(--surface-50); }
</style>


