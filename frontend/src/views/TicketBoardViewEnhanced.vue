<template>
  <div class="board-enhanced container-fluid">
    <!-- Header -->
    <div class="board-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-2">
            <i class="bi bi-kanban"></i>
            {{ activeSprint ? activeSprint.name : 'Kanban Board' }}
          </h2>
          <p class="text-muted mb-0" v-if="activeSprint && activeSprint.goal">{{ activeSprint.goal }}</p>
        </div>
        <div class="d-flex gap-2">
          <select class="form-select" v-model="selectedSprintId" @change="loadBoard">
            <option :value="null">All Issues (No Sprint)</option>
            <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
              {{ sprint.name }} ({{ sprint.status }})
            </option>
          </select>
          <router-link to="/sprints" class="btn btn-outline-primary">
            <i class="bi bi-lightning"></i> Manage Sprints
          </router-link>
          <router-link to="/tickets" class="btn btn-outline-secondary">
            <i class="bi bi-list-ul"></i> List View
          </router-link>
        </div>
      </div>

      <!-- Sprint Progress -->
      <div v-if="activeSprint" class="sprint-progress mt-3">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-label">Total Issues</div>
              <div class="stat-value">{{ tickets.length }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-label">Completed</div>
              <div class="stat-value text-success">{{ completedCount }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-label">Story Points</div>
              <div class="stat-value">{{ completedPoints }} / {{ totalPoints }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-label">Progress</div>
              <div class="stat-value">{{ progressPercentage }}%</div>
            </div>
          </div>
        </div>
        <div class="progress mt-2" style="height: 10px;">
          <div class="progress-bar bg-success" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters mt-3">
        <div class="row g-2">
          <div class="col-md-2">
            <select class="form-select form-select-sm" v-model="filters.type" @change="filterTickets">
              <option value="">All Types</option>
              <option value="Epic">Epic</option>
              <option value="Story">Story</option>
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Subtask">Subtask</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" v-model="filters.priority" @change="filterTickets">
              <option value="">All Priorities</option>
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" v-model="filters.assigneeId" @change="filterTickets">
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              <!-- Add user options dynamically -->
            </select>
          </div>
          <div class="col-md-2">
            <input type="text" class="form-control form-control-sm" v-model="searchQuery" @input="filterTickets" placeholder="Search...">
          </div>
        </div>
      </div>
    </div>

    <!-- Board Columns -->
    <div class="board-columns">
      <div class="row g-3">
        <div class="col" v-for="column in columns" :key="column.key">
          <div class="board-column">
            <div class="column-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ column.title }}</h5>
                <span class="badge bg-secondary">{{ getColumnTickets(column.key).length }}</span>
              </div>
              <div class="column-limit" v-if="column.limit">
                <small class="text-muted">Limit: {{ column.limit }}</small>
              </div>
            </div>
            <div class="column-body">
              <div
                v-for="ticket in getColumnTickets(column.key)"
                :key="ticket.id"
                class="ticket-card"
                :class="{ 'flagged': ticket.isFlagged }"
                @click="openTicket(ticket.id)"
                draggable="true"
                @dragstart="onDragStart(ticket, column.key)"
                @dragover.prevent
                @drop="onDrop(column.key)"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="ticket-header-info">
                    <span class="ticket-id">#{{ ticket.id }}</span>
                    <span class="badge badge-sm ms-1" :class="getTypeClass(ticket.type)">{{ ticket.type }}</span>
                  </div>
                  <div class="ticket-badges">
                    <i class="bi bi-flag-fill text-warning" v-if="ticket.isFlagged"></i>
                    <span class="badge badge-sm" :class="getPriorityClass(ticket.priority)">
                      {{ getPriorityIcon(ticket.priority) }}
                    </span>
                  </div>
                </div>

                <div class="ticket-title mb-2">{{ ticket.title }}</div>

                <div class="ticket-meta">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex gap-2 align-items-center">
                      <!-- Story Points -->
                      <span v-if="ticket.storyPoints" class="badge bg-light text-dark">
                        <i class="bi bi-bar-chart-fill"></i> {{ ticket.storyPoints }}
                      </span>
                      <!-- Subtasks count -->
                      <span v-if="ticket.subtasks && ticket.subtasks.length > 0" class="badge bg-light text-dark">
                        <i class="bi bi-list-check"></i> {{ getCompletedSubtasks(ticket) }}/{{ ticket.subtasks.length }}
                      </span>
                      <!-- Comments count -->
                      <span v-if="ticket.Comments && ticket.Comments.length > 0" class="badge bg-light text-dark">
                        <i class="bi bi-chat"></i> {{ ticket.Comments.length }}
                      </span>
                    </div>
                    <!-- Assignee Avatar -->
                    <div v-if="ticket.assignee" class="assignee-avatar" :title="ticket.assignee.name || ticket.assignee.email">
                      {{ getInitials(ticket.assignee.name || ticket.assignee.email) }}
                    </div>
                    <div v-else class="assignee-avatar unassigned">
                      <i class="bi bi-person"></i>
                    </div>
                  </div>
                </div>

                <!-- Labels -->
                <div v-if="ticket.labels && ticket.labels.length > 0" class="ticket-labels mt-2">
                  <span v-for="label in ticket.labels.slice(0, 3)" :key="label" class="label-tag">{{ label }}</span>
                  <span v-if="ticket.labels.length > 3" class="label-tag">+{{ ticket.labels.length - 3 }}</span>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="getColumnTickets(column.key).length === 0" class="empty-column">
                <i class="bi bi-inbox"></i>
                <p class="text-muted small mb-0">No tickets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';

type StatusKey = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Testing' | 'Done';

const router = useRouter();

const tickets = ref<any[]>([]);
const allTickets = ref<any[]>([]);
const sprints = ref<any[]>([]);
const activeSprint = ref<any>(null);
const selectedSprintId = ref<number | null>(null);
const draggedTicket = ref<any>(null);
const draggedFromColumn = ref<string>('');

const searchQuery = ref('');
const filters = ref({
  type: '',
  priority: '',
  assigneeId: ''
});

const columns = [
  { key: 'Backlog', title: 'Backlog', limit: null },
  { key: 'To Do', title: 'To Do', limit: null },
  { key: 'In Progress', title: 'In Progress', limit: 5 },
  { key: 'In Review', title: 'In Review', limit: null },
  { key: 'Testing', title: 'Testing', limit: null },
  { key: 'Done', title: 'Done', limit: null },
] as { key: StatusKey, title: string, limit: number | null }[];

const loadSprints = async () => {
  try {
    const response = await apiClient.get('/sprints');
    sprints.value = response.data || [];
  } catch (error) {
    console.error('Error loading sprints:', error);
  }
};

const loadBoard = async () => {
  try {
    const params: any = {};
    if (selectedSprintId.value) {
      params.sprintId = selectedSprintId.value;
      const sprintResponse = await apiClient.get(`/sprints/${selectedSprintId.value}`);
      activeSprint.value = sprintResponse.data;
    } else {
      activeSprint.value = null;
    }

    const response = await apiClient.get('/tickets', { params });
    allTickets.value = response.data || [];
    tickets.value = allTickets.value;
  } catch (error) {
    console.error('Error loading board:', error);
  }
};

const filterTickets = () => {
  let filtered = [...allTickets.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.id.toString().includes(query)
    );
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(t => t.type === filters.value.type);
  }

  // Priority filter
  if (filters.value.priority) {
    filtered = filtered.filter(t => t.priority === filters.value.priority);
  }

  // Assignee filter
  if (filters.value.assigneeId) {
    if (filters.value.assigneeId === 'unassigned') {
      filtered = filtered.filter(t => !t.assigneeId);
    } else {
      filtered = filtered.filter(t => t.assigneeId === parseInt(filters.value.assigneeId));
    }
  }

  tickets.value = filtered;
};

const getColumnTickets = (status: StatusKey) => {
  return tickets.value.filter(t => t.status === status);
};

const completedCount = computed(() => {
  return tickets.value.filter(t => t.status === 'Done').length;
});

const totalPoints = computed(() => {
  return tickets.value.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
});

const completedPoints = computed(() => {
  return tickets.value
    .filter(t => t.status === 'Done')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
});

const progressPercentage = computed(() => {
  if (totalPoints.value === 0) return 0;
  return Math.round((completedPoints.value / totalPoints.value) * 100);
});

const onDragStart = (ticket: any, fromColumn: string) => {
  draggedTicket.value = ticket;
  draggedFromColumn.value = fromColumn;
};

const onDrop = async (toColumn: StatusKey) => {
  if (!draggedTicket.value) return;

  try {
    await apiClient.put(`/tickets/${draggedTicket.value.id}`, {
      ...draggedTicket.value,
      status: toColumn
    });
    await loadBoard();
  } catch (error) {
    console.error('Error moving ticket:', error);
  }

  draggedTicket.value = null;
  draggedFromColumn.value = '';
};

const openTicket = (id: number) => {
  router.push(`/tickets/${id}`);
};

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

const getPriorityClass = (priority: string) => {
  const classes: any = {
    'Lowest': 'bg-light text-dark',
    'Low': 'bg-info',
    'Medium': 'bg-warning',
    'High': 'bg-danger',
    'Highest': 'bg-danger'
  };
  return classes[priority] || 'bg-secondary';
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

const getCompletedSubtasks = (ticket: any) => {
  if (!ticket.subtasks) return 0;
  return ticket.subtasks.filter((st: any) => st.status === 'Done').length;
};

onMounted(async () => {
  await loadSprints();
  await loadBoard();
});
</script>

<style scoped>
.board-enhanced {
  padding: 20px;
  height: calc(100vh - 100px);
  overflow-x: auto;
}

.board-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card {
  background: var(--surface-50);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.board-columns {
  margin-top: 20px;
}

.board-column {
  background: var(--surface-100);
  border-radius: 8px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 15px;
  border-bottom: 2px solid var(--surface-200);
}

.column-body {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

.ticket-card {
  background: white;
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.ticket-card.flagged {
  border-left: 4px solid #fbbf24;
}

.ticket-id {
  font-family: monospace;
  font-weight: 600;
  color: var(--primary-600);
  font-size: 0.875rem;
}

.ticket-title {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.badge-sm {
  font-size: 0.7rem;
  padding: 2px 6px;
}

.assignee-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
}

.assignee-avatar.unassigned {
  background: var(--surface-300);
  color: var(--text-tertiary);
}

.label-tag {
  display: inline-block;
  background: var(--surface-200);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  margin-right: 4px;
  margin-bottom: 4px;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.empty-column i {
  font-size: 2rem;
  opacity: 0.3;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}
</style>
