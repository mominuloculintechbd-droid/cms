<template>
  <div class="ticket-list-enhanced">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Tickets</h1>
        <p class="page-subtitle">Manage and track all project issues</p>
      </div>
      <div class="page-header__actions">
        <router-link to="/tickets/board" class="btn btn--outline me-2">
          <i class="bi bi-kanban"></i> Board View
        </router-link>
        <router-link to="/tickets/create" class="btn btn--primary">
          <i class="bi bi-plus-lg"></i> Create Ticket
        </router-link>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="search-input-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="form-control search-input"
              placeholder="Search by title or ID..."
              v-model="searchTerm"
            >
          </div>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="filters.type">
            <option value="">All Types</option>
            <option value="Epic">Epic</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Subtask">Subtask</option>
            <option value="Improvement">Improvement</option>
            <option value="New Feature">New Feature</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="filters.status">
            <option value="">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="filters.priority">
            <option value="">All Priorities</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="filters.sprintId">
            <option value="">All Sprints</option>
            <option value="null">No Sprint</option>
            <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
              {{ sprint.name }}
            </option>
          </select>
        </div>
        <div class="col-md-1">
          <button @click="clearFilters" class="btn btn-outline-secondary w-100">
            <i class="bi bi-x-lg"></i> Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="bi bi-ticket-detailed"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ filteredTickets.length }}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inProgressCount }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-danger">
              <i class="bi bi-bug"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ bugCount }}</div>
              <div class="stat-label">Bugs</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th style="width: 60px;"><i class="bi bi-flag"></i></th>
              <th style="width: 80px;">ID</th>
              <th style="width: 100px;">Type</th>
              <th>Title</th>
              <th style="width: 120px;">Status</th>
              <th style="width: 100px;">Priority</th>
              <th style="width: 80px;">Points</th>
              <th style="width: 150px;">Sprint</th>
              <th style="width: 150px;">Assignee</th>
              <th style="width: 120px;">Due Date</th>
              <th style="width: 120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in paginatedTickets" :key="ticket.id" class="table-row">
              <td class="text-center">
                <i class="bi bi-flag-fill text-warning" v-if="ticket.isFlagged"></i>
              </td>
              <td class="ticket-id">#{{ ticket.id }}</td>
              <td>
                <span class="badge badge-sm" :class="getTypeClass(ticket.type)">
                  {{ ticket.type }}
                </span>
              </td>
              <td class="ticket-title">
                <div class="d-flex align-items-center gap-2">
                  {{ ticket.title }}
                  <i class="bi bi-paperclip text-muted" v-if="ticket.attachments && ticket.attachments.length > 0"></i>
                  <span class="badge bg-light text-dark" v-if="ticket.subtasks && ticket.subtasks.length > 0">
                    <i class="bi bi-list-check"></i> {{ ticket.subtasks.length }}
                  </span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(ticket.status)">
                  {{ ticket.status }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="getPriorityClass(ticket.priority)">
                  {{ getPriorityIcon(ticket.priority) }} {{ ticket.priority }}
                </span>
              </td>
              <td class="text-center">
                <span v-if="ticket.storyPoints" class="badge bg-light text-dark">
                  {{ ticket.storyPoints }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="ticket.sprint" class="badge bg-info">
                  {{ ticket.sprint.name }}
                </span>
                <span v-else class="text-muted">No sprint</span>
              </td>
              <td>
                <div v-if="ticket.assignee" class="d-flex align-items-center gap-2">
                  <div class="avatar-sm">{{ getInitials(ticket.assignee.name || ticket.assignee.email) }}</div>
                  <span class="text-truncate">{{ ticket.assignee.name || ticket.assignee.email }}</span>
                </div>
                <span v-else class="text-muted">Unassigned</span>
              </td>
              <td>
                <span v-if="ticket.dueDate" :class="{ 'text-danger': isOverdue(ticket.dueDate) }">
                  {{ formatDate(ticket.dueDate) }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <router-link :to="`/tickets/${ticket.id}`" class="btn btn--outline btn--sm">
                  <i class="bi bi-eye"></i> View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="totalPages > 1">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">Previous</a>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" @click="currentPage = page">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" @click="currentPage = Math.min(totalPages, currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
        <div class="pagination-info">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredTickets.length) }} of {{ filteredTickets.length }} tickets
        </div>
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
  type: string;
  assigneeId: number | null;
  assignee?: any;
  sprint?: any;
  storyPoints?: number;
  dueDate?: string;
  isFlagged?: boolean;
  subtasks?: any[];
  attachments?: any[];
}

const tickets = ref<Ticket[]>([]);
const sprints = ref<any[]>([]);
const searchTerm = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

const filters = ref({
  type: '',
  status: '',
  priority: '',
  sprintId: ''
});

onMounted(async () => {
  await Promise.all([loadTickets(), loadSprints()]);
});

const loadTickets = async () => {
  try {
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;
  } catch (error) {
    console.error('Error getting tickets', error);
  }
};

const loadSprints = async () => {
  try {
    const response = await apiClient.get('/sprints');
    sprints.value = response.data;
  } catch (error) {
    console.error('Error loading sprints:', error);
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  filters.value = {
    type: '',
    status: '',
    priority: '',
    sprintId: ''
  };
  currentPage.value = 1;
};

const filteredTickets = computed<Ticket[]>(() => {
  let result = [...tickets.value];

  // Search filter
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    result = result.filter(ticket =>
      ticket.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      ticket.id.toString().includes(lowerCaseSearchTerm)
    );
  }

  // Type filter
  if (filters.value.type) {
    result = result.filter(t => t.type === filters.value.type);
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status);
  }

  // Priority filter
  if (filters.value.priority) {
    result = result.filter(t => t.priority === filters.value.priority);
  }

  // Sprint filter
  if (filters.value.sprintId) {
    if (filters.value.sprintId === 'null') {
      result = result.filter(t => !t.sprint);
    } else {
      result = result.filter(t => t.sprint?.id === parseInt(filters.value.sprintId));
    }
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredTickets.value.length / pageSize.value));

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTickets.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const inProgressCount = computed(() => tickets.value.filter(t => t.status === 'In Progress').length);
const completedCount = computed(() => tickets.value.filter(t => t.status === 'Done' || t.status === 'Closed').length);
const bugCount = computed(() => tickets.value.filter(t => t.type === 'Bug').length);

const getTypeClass = (type: string) => {
  const classes: any = {
    'Epic': 'bg-purple text-white',
    'Story': 'bg-success',
    'Task': 'bg-primary',
    'Bug': 'bg-danger',
    'Subtask': 'bg-info',
    'Improvement': 'bg-warning',
    'New Feature': 'bg-success'
  };
  return classes[type] || 'bg-secondary';
};

const getStatusClass = (status: string) => {
  const classes: any = {
    'Backlog': 'status-badge--backlog',
    'To Do': 'status-badge--todo',
    'In Progress': 'status-badge--progress',
    'In Review': 'status-badge--review',
    'Testing': 'status-badge--testing',
    'Done': 'status-badge--done',
    'Closed': 'status-badge--closed'
  };
  return classes[status] || 'status-badge--default';
};

const getPriorityClass = (priority: string) => {
  const classes: any = {
    'Lowest': 'priority-badge--lowest',
    'Low': 'priority-badge--low',
    'Medium': 'priority-badge--medium',
    'High': 'priority-badge--high',
    'Highest': 'priority-badge--highest'
  };
  return classes[priority] || 'priority-badge--medium';
};

const getPriorityIcon = (priority: string) => {
  const icons: any = {
    'Highest': '↑↑',
    'High': '↑',
    'Medium': '=',
    'Low': '↓',
    'Lowest': '↓↓'
  };
  return icons[priority] || '=';
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};
</script>

<style scoped>
.ticket-list-enhanced {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
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

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  padding-left: 40px;
}

.stats-cards .stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.table-container {
  background: white;
  border: 1px solid var(--surface-200);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: var(--surface-50);
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--surface-200);
}

.modern-table td {
  padding: 16px;
  border-bottom: 1px solid var(--surface-100);
  font-size: 0.875rem;
  vertical-align: middle;
}

.table-row:hover {
  background: var(--surface-50);
}

.ticket-id {
  font-weight: 600;
  color: var(--primary-600);
  font-family: monospace;
}

.ticket-title {
  font-weight: 500;
  color: var(--text-primary);
}

.status-badge, .priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge--backlog { background: #6b7280; color: white; }
.status-badge--todo { background: #3b82f6; color: white; }
.status-badge--progress { background: #f59e0b; color: white; }
.status-badge--review { background: #8b5cf6; color: white; }
.status-badge--testing { background: #06b6d4; color: white; }
.status-badge--done { background: #10b981; color: white; }
.status-badge--closed { background: #374151; color: white; }

.priority-badge--highest { background: #dc2626; color: white; }
.priority-badge--high { background: #f97316; color: white; }
.priority-badge--medium { background: #fbbf24; color: black; }
.priority-badge--low { background: #60a5fa; color: white; }
.priority-badge--lowest { background: #e5e7eb; color: black; }

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-sm {
  font-size: 0.7rem;
  padding: 2px 6px;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}

.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--surface-200);
}

.pagination {
  margin: 0;
}

.page-link {
  cursor: pointer;
}
</style>
