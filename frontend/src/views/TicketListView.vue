<template>
  <div class="ticket-list">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Tickets</h1>
        <p class="page-subtitle">Manage and track support tickets</p>
      </div>
      <div class="page-header__actions">
        <router-link to="/tickets/board" class="btn btn--outline me-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
          Board
        </router-link>
        <router-link to="/tickets/create" class="btn btn--primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Ticket
        </router-link>
      </div>
    </div>

    <div class="search-section">
      <div class="search-input-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          class="form-control search-input" 
          placeholder="Search by title or ID..." 
          v-model="searchTerm"
        >
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="table-row">
              <td class="ticket-id">#{{ ticket.id }}</td>
              <td class="ticket-title">{{ ticket.title }}</td>
              <td>
                <span class="status-badge" :class="`status-badge--${ticket.status.toLowerCase()}`">
                  {{ ticket.status }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-badge--${ticket.priority.toLowerCase()}`">
                  {{ ticket.priority }}
                </span>
              </td>
              <td>
                <span class="text-muted">{{ ticket.assigneeId || '-' }}</span>
              </td>
              <td>
                <router-link :to="`/tickets/${ticket.id}`" class="btn btn--outline btn--sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigneeId: number | null;
}

const tickets = ref<Ticket[]>([]);
const searchTerm = ref('');

onMounted(async () => {
  try {
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;
  } catch (error) {
    console.error('Error getting tickets', error);
  }
});

const filteredTickets = computed<Ticket[]>(() => {
  if (!searchTerm.value) {
    return tickets.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return tickets.value.filter(ticket =>
    ticket.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    ticket.id.toString().includes(lowerCaseSearchTerm)
  );
});
</script>

<style scoped>
.ticket-list {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.page-header__content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.page-header__actions {
  flex-shrink: 0;
}

.search-section {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  padding-left: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--surface-300);
  background: var(--surface-0);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.table-container {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: var(--surface-50);
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--surface-200);
  white-space: nowrap;
}

.modern-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--surface-100);
  color: var(--text-secondary);
  font-size: 0.875rem;
  vertical-align: middle;
}

.table-row:hover {
  background: var(--surface-50);
}

.table-row:last-child td {
  border-bottom: none;
}

.ticket-id {
  font-weight: 600;
  color: var(--primary-600);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.ticket-title {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge--open {
  background: var(--info-100);
  color: var(--info-700);
  border: 1px solid var(--info-200);
}

.status-badge--in-progress {
  background: var(--warning-100);
  color: var(--warning-700);
  border: 1px solid var(--warning-200);
}

.status-badge--resolved {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.status-badge--closed {
  background: var(--surface-200);
  color: var(--text-tertiary);
  border: 1px solid var(--surface-300);
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.priority-badge--low {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.priority-badge--medium {
  background: var(--warning-100);
  color: var(--warning-700);
  border: 1px solid var(--warning-200);
}

.priority-badge--high {
  background: var(--error-100);
  color: var(--error-700);
  border: 1px solid var(--error-200);
}

.priority-badge--urgent {
  background: var(--error-200);
  color: var(--error-800);
  border: 1px solid var(--error-300);
  animation: pulse 2s infinite;
}

.btn--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 0.75rem;
  gap: 6px;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 12px 16px;
  }
  
  .ticket-title {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  
  .ticket-title {
    max-width: 150px;
  }
  
  .btn--sm {
    height: 28px;
    padding: 0 8px;
    font-size: 0.7rem;
  }
}
</style>

<style>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>