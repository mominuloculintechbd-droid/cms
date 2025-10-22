<template>
  <div class="ticket-board-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-header__title">Kanban Board</h1>
        <p class="page-header__subtitle">Visualize and manage tickets with drag-and-drop workflow</p>
      </div>
      <router-link to="/tickets" class="btn btn--outline-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to List
      </router-link>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <div class="kanban-column" v-for="col in columns" :key="col.key">
        <div class="column-header" :class="`column-header--${col.key.toLowerCase().replace(' ', '-')}`">
          <div class="column-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            {{ col.title }}
          </div>
          <div class="column-count">{{ grouped[col.key]?.length || 0 }}</div>
        </div>

        <div class="column-body">
          <div v-for="t in grouped[col.key] || []" :key="t.id" class="ticket-card" @click="openTicket(t.id)">
            <div class="ticket-card__header">
              <div class="ticket-id">#{{ t.id }}</div>
              <span class="priority-badge" :class="`priority-badge--${t.priority?.toLowerCase()}`">
                {{ t.priority }}
              </span>
            </div>

            <div class="ticket-card__title">{{ t.title }}</div>

            <div class="ticket-card__meta">
              <div class="ticket-type">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                {{ t.type || 'Task' }}
              </div>
              <div class="ticket-assignee" v-if="t.assigneeId">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                ID: {{ t.assigneeId }}
              </div>
            </div>

            <button
              v-if="col.next !== col.key"
              class="move-button"
              @click.stop="move(t, col.next)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Move to {{ col.next }}
            </button>
          </div>

          <div v-if="(grouped[col.key] || []).length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <p>No tickets</p>
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
/* General Styles */
.ticket-board-view {
  max-width: 1800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
  background-color: var(--color-background);
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-2xl) var(--spacing-3xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.3), 0 10px 10px -5px rgba(118, 75, 162, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.page-header__content {
  z-index: 1;
}

.page-header__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
}

.page-header__subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0;
}

.btn--outline-white {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(10px);
  z-index: 1;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn--outline-white:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  color: white;
  transform: translateY(-2px);
}

/* Kanban Board */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Kanban Column */
.kanban-column {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 280px);
}

.column-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.column-header--open {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.column-header--in-progress {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.column-header--resolved {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.column-header--closed {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.column-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.column-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  min-width: 32px;
  text-align: center;
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}

.column-body::-webkit-scrollbar {
  width: 8px;
}

.column-body::-webkit-scrollbar-track {
  background: transparent;
}

.column-body::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: var(--radius-full);
}

.column-body::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* Ticket Card */
.ticket-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.ticket-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.ticket-id {
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: var(--font-size-sm);
}

.priority-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.priority-badge--low {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.priority-badge--medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.priority-badge--high {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.ticket-card__title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-card__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.ticket-type,
.ticket-assignee {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.move-button {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  border-radius: var(--radius-lg);
  color: #667eea;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.move-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 768px) {
  .ticket-board-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .page-header__title {
    font-size: var(--font-size-2xl);
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }

  .kanban-column {
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .page-header__title {
    font-size: var(--font-size-xl);
  }

  .ticket-card {
    padding: var(--spacing-md);
  }
}
</style>
