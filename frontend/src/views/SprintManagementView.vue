<template>
  <div class="sprint-management">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sprint Management</h1>
        <p class="page-subtitle">Plan and manage agile sprints</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> Create Sprint
      </button>
    </div>

    <!-- Sprint List -->
    <div class="sprints-container">
      <!-- Active Sprint -->
      <div v-if="activeSprint" class="sprint-card active-sprint mb-4">
        <div class="sprint-header">
          <div>
            <h3 class="sprint-name">
              <span class="badge bg-success me-2">ACTIVE</span>
              {{ activeSprint.name }}
            </h3>
            <p class="sprint-goal" v-if="activeSprint.goal">{{ activeSprint.goal }}</p>
            <div class="sprint-dates">
              <i class="bi bi-calendar3"></i>
              {{ formatDate(activeSprint.startDate) }} - {{ formatDate(activeSprint.endDate) }}
            </div>
          </div>
          <div class="sprint-actions">
            <button @click="completeSprint(activeSprint.id)" class="btn btn-success">
              <i class="bi bi-check-circle"></i> Complete Sprint
            </button>
            <button @click="editSprint(activeSprint)" class="btn btn-outline-primary">
              <i class="bi bi-pencil"></i> Edit
            </button>
          </div>
        </div>

        <!-- Sprint Metrics -->
        <div class="sprint-metrics mt-3">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="metric-card">
                <div class="metric-label">Total Issues</div>
                <div class="metric-value">{{ activeSprint.metrics?.totalTickets || 0 }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="metric-card">
                <div class="metric-label">Completed</div>
                <div class="metric-value text-success">{{ activeSprint.metrics?.completedTickets || 0 }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="metric-card">
                <div class="metric-label">Story Points</div>
                <div class="metric-value">
                  {{ activeSprint.metrics?.completedPoints || 0 }} / {{ activeSprint.metrics?.totalPoints || 0 }}
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="metric-card">
                <div class="metric-label">Completion</div>
                <div class="metric-value">{{ activeSprint.metrics?.completionPercentage || 0 }}%</div>
              </div>
            </div>
          </div>
          <div class="progress mt-3" style="height: 15px;">
            <div
              class="progress-bar bg-success"
              :style="{ width: (activeSprint.metrics?.completionPercentage || 0) + '%' }"
            >
              {{ activeSprint.metrics?.completionPercentage || 0 }}%
            </div>
          </div>
        </div>

        <!-- Sprint Tickets -->
        <div class="sprint-tickets mt-4">
          <h5>Sprint Backlog</h5>
          <div v-if="activeSprint.tickets && activeSprint.tickets.length > 0">
            <div v-for="ticket in activeSprint.tickets" :key="ticket.id" class="ticket-item">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill text-success" v-if="ticket.status === 'Done'"></i>
                  <i class="bi bi-circle text-muted" v-else></i>
                  <router-link :to="`/tickets/${ticket.id}`" class="ticket-link">
                    #{{ ticket.id }} - {{ ticket.title }}
                  </router-link>
                  <span class="badge badge-sm" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span>
                  <span class="badge bg-light text-dark" v-if="ticket.storyPoints">
                    {{ ticket.storyPoints }} pts
                  </span>
                </div>
                <button @click="removeFromSprint(ticket.id)" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">No tickets in this sprint</div>
        </div>
      </div>

      <!-- Future Sprints -->
      <div class="future-sprints mb-4" v-if="futureSprints.length > 0">
        <h4 class="mb-3"><i class="bi bi-hourglass-split"></i> Future Sprints</h4>
        <div v-for="sprint in futureSprints" :key="sprint.id" class="sprint-card mb-3">
          <div class="sprint-header">
            <div>
              <h5 class="sprint-name">
                <span class="badge bg-info me-2">FUTURE</span>
                {{ sprint.name }}
              </h5>
              <p class="sprint-goal" v-if="sprint.goal">{{ sprint.goal }}</p>
              <div class="sprint-dates" v-if="sprint.startDate">
                <i class="bi bi-calendar3"></i>
                {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
              </div>
            </div>
            <div class="sprint-actions">
              <button @click="startSprint(sprint.id)" class="btn btn-success">
                <i class="bi bi-play-fill"></i> Start Sprint
              </button>
              <button @click="editSprint(sprint)" class="btn btn-outline-primary">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button @click="deleteSprint(sprint.id)" class="btn btn-outline-danger">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Sprints -->
      <div class="completed-sprints" v-if="completedSprints.length > 0">
        <h4 class="mb-3"><i class="bi bi-check-circle"></i> Completed Sprints</h4>
        <div v-for="sprint in completedSprints" :key="sprint.id" class="sprint-card mb-3 completed">
          <div class="sprint-header">
            <div>
              <h5 class="sprint-name">
                <span class="badge bg-secondary me-2">CLOSED</span>
                {{ sprint.name }}
              </h5>
              <p class="sprint-goal" v-if="sprint.goal">{{ sprint.goal }}</p>
              <div class="sprint-dates">
                <i class="bi bi-calendar3"></i>
                {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
              </div>
              <div class="sprint-summary mt-2">
                <span class="badge bg-success me-2">{{ sprint.completedPoints }} / {{ sprint.totalPoints }} points</span>
              </div>
            </div>
            <div class="sprint-actions">
              <button @click="viewSprintReport(sprint.id)" class="btn btn-outline-info">
                <i class="bi bi-file-text"></i> View Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Sprint Modal -->
    <div v-if="showCreateModal || editingSprint" class="modal-overlay" @click="closeModal">
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingSprint ? 'Edit Sprint' : 'Create Sprint' }}</h5>
            <button @click="closeModal" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSprint">
              <div class="mb-3">
                <label class="form-label">Sprint Name *</label>
                <input type="text" class="form-control" v-model="sprintForm.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Sprint Goal</label>
                <textarea class="form-control" rows="3" v-model="sprintForm.goal"></textarea>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Start Date</label>
                    <input type="date" class="form-control" v-model="sprintForm.startDate">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-control" v-model="sprintForm.endDate">
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Project ID *</label>
                <input type="number" class="form-control" v-model.number="sprintForm.projectId" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Team ID</label>
                <input type="number" class="form-control" v-model.number="sprintForm.teamId">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="saveSprint" class="btn btn-primary">
              {{ editingSprint ? 'Update' : 'Create' }} Sprint
            </button>
            <button @click="closeModal" class="btn btn-secondary">Cancel</button>
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

const router = useRouter();

const sprints = ref<any[]>([]);
const showCreateModal = ref(false);
const editingSprint = ref<any>(null);

const sprintForm = ref({
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  projectId: null as number | null,
  teamId: null as number | null,
});

const activeSprint = computed(() => sprints.value.find(s => s.status === 'Active'));
const futureSprints = computed(() => sprints.value.filter(s => s.status === 'Future'));
const completedSprints = computed(() => sprints.value.filter(s => s.status === 'Closed'));

onMounted(async () => {
  await loadSprints();
});

const loadSprints = async () => {
  try {
    const response = await apiClient.get('/sprints');
    sprints.value = response.data || [];

    // Load detailed info for active sprint
    if (activeSprint.value) {
      const detailResponse = await apiClient.get(`/sprints/${activeSprint.value.id}`);
      const index = sprints.value.findIndex(s => s.id === activeSprint.value.id);
      if (index !== -1) {
        sprints.value[index] = detailResponse.data;
      }
    }
  } catch (error) {
    console.error('Error loading sprints:', error);
  }
};

const saveSprint = async () => {
  try {
    if (editingSprint.value) {
      await apiClient.put(`/sprints/${editingSprint.value.id}`, sprintForm.value);
    } else {
      await apiClient.post('/sprints', sprintForm.value);
    }
    closeModal();
    await loadSprints();
  } catch (error) {
    console.error('Error saving sprint:', error);
    alert('Error saving sprint');
  }
};

const editSprint = (sprint: any) => {
  editingSprint.value = sprint;
  sprintForm.value = {
    name: sprint.name,
    goal: sprint.goal || '',
    startDate: sprint.startDate ? sprint.startDate.split('T')[0] : '',
    endDate: sprint.endDate ? sprint.endDate.split('T')[0] : '',
    projectId: sprint.projectId,
    teamId: sprint.teamId,
  };
};

const startSprint = async (sprintId: number) => {
  if (!confirm('Are you sure you want to start this sprint?')) return;
  try {
    await apiClient.post(`/sprints/${sprintId}/start`);
    await loadSprints();
  } catch (error: any) {
    console.error('Error starting sprint:', error);
    alert(error.response?.data?.message || 'Error starting sprint');
  }
};

const completeSprint = async (sprintId: number) => {
  if (!confirm('Are you sure you want to complete this sprint?')) return;
  try {
    await apiClient.post(`/sprints/${sprintId}/complete`);
    await loadSprints();
  } catch (error) {
    console.error('Error completing sprint:', error);
    alert('Error completing sprint');
  }
};

const deleteSprint = async (sprintId: number) => {
  if (!confirm('Are you sure you want to delete this sprint?')) return;
  try {
    await apiClient.delete(`/sprints/${sprintId}`);
    await loadSprints();
  } catch (error) {
    console.error('Error deleting sprint:', error);
    alert('Error deleting sprint');
  }
};

const removeFromSprint = async (ticketId: number) => {
  if (!confirm('Remove this ticket from the sprint?')) return;
  try {
    await apiClient.delete(`/sprints/${activeSprint.value.id}/tickets`, {
      data: { ticketId }
    });
    await loadSprints();
  } catch (error) {
    console.error('Error removing ticket:', error);
  }
};

const viewSprintReport = (sprintId: number) => {
  router.push(`/sprints/${sprintId}/report`);
};

const closeModal = () => {
  showCreateModal.value = false;
  editingSprint.value = null;
  sprintForm.value = {
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    projectId: null,
    teamId: null,
  };
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const getStatusClass = (status: string) => {
  const classes: any = {
    'Backlog': 'bg-secondary',
    'To Do': 'bg-info',
    'In Progress': 'bg-warning',
    'In Review': 'bg-purple',
    'Testing': 'bg-info',
    'Done': 'bg-success',
    'Closed': 'bg-dark'
  };
  return classes[status] || 'bg-secondary';
};
</script>

<style scoped>
.sprint-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.sprint-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-500);
}

.sprint-card.active-sprint {
  border-left-color: #10b981;
  background: linear-gradient(to right, #f0fdf4 0%, white 100%);
}

.sprint-card.completed {
  border-left-color: #6b7280;
  opacity: 0.9;
}

.sprint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sprint-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.sprint-goal {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.sprint-dates {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.sprint-actions {
  display: flex;
  gap: 8px;
}

.metric-card {
  background: var(--surface-50);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.ticket-item {
  padding: 12px;
  background: var(--surface-50);
  border-radius: 8px;
  margin-bottom: 8px;
}

.ticket-link {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
}

.ticket-link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}

.badge-sm {
  font-size: 0.7rem;
  padding: 2px 6px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}
</style>
