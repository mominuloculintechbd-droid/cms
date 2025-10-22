<template>
  <div class="ticket-detail-enhanced">
    <div v-if="ticket" class="container-fluid">
      <!-- Header -->
      <div class="ticket-header">
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-3 mb-2">
              <h1 class="ticket-title mb-0">{{ ticket.title }}</h1>
              <button @click="toggleFlag" class="btn btn-sm btn-outline-warning" :class="{ 'active': ticket.isFlagged }">
                <i class="bi" :class="ticket.isFlagged ? 'bi-flag-fill' : 'bi-flag'"></i>
              </button>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="ticket-id">#{{ ticket.id }}</span>
              <span class="badge" :class="getTypeClass(ticket.type)">{{ ticket.type }}</span>
              <span class="badge" :class="getPriorityClass(ticket.priority)">{{ ticket.priority }}</span>
              <span class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button @click="editMode = !editMode" class="btn btn-outline-primary">
              <i class="bi bi-pencil"></i> {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
            <router-link to="/tickets" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i> Back
            </router-link>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Description -->
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-file-text"></i> Description</h5>
            </div>
            <div class="card-body">
              <div v-if="!editMode" v-html="ticket.description"></div>
              <QuillEditor v-else v-model:content="editData.description" contentType="html" style="height: 200px;" toolbar="full" />
            </div>
          </div>

          <!-- Tabs -->
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs" role="tablist">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'" href="#">
                    <i class="bi bi-chat-left-text"></i> Comments ({{ comments.length }})
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'" href="#">
                    <i class="bi bi-clock-history"></i> History ({{ history.length }})
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'linked' }" @click="activeTab = 'linked'" href="#">
                    <i class="bi bi-link-45deg"></i> Linked Issues ({{ links.length }})
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'subtasks' }" @click="activeTab = 'subtasks'" href="#">
                    <i class="bi bi-list-task"></i> Subtasks ({{ subtasks.length }})
                  </a>
                </li>
              </ul>
            </div>
            <div class="card-body">
              <!-- Comments Tab -->
              <div v-if="activeTab === 'comments'">
                <div v-if="comments.length > 0" class="comments-list mb-4">
                  <div v-for="comment in comments" :key="comment.id" class="comment-item mb-3">
                    <div class="d-flex gap-3">
                      <div class="avatar">{{ getInitials(comment.User?.name || comment.User?.email) }}</div>
                      <div class="flex-grow-1">
                        <div class="comment-header">
                          <strong>{{ comment.User?.name || comment.User?.email }}</strong>
                          <span class="text-muted ms-2">{{ formatDate(comment.createdAt) }}</span>
                        </div>
                        <div class="comment-body" v-html="comment.content"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">No comments yet.</div>

                <div v-if="ticket.status !== 'Closed'" class="add-comment mt-4">
                  <h6>Add Comment</h6>
                  <QuillEditor v-model:content="commentContent" contentType="html" style="height: 150px;" toolbar="minimal" />
                  <div class="invalid-feedback d-block" v-if="commentError">{{ commentError }}</div>
                  <button @click="addComment" class="btn btn-primary mt-3">Add Comment</button>
                </div>
              </div>

              <!-- History Tab -->
              <div v-if="activeTab === 'history'">
                <div v-if="history.length > 0" class="history-list">
                  <div v-for="entry in history" :key="entry.id" class="history-item mb-3 pb-3 border-bottom">
                    <div class="d-flex gap-3">
                      <div class="avatar-sm">{{ getInitials(entry.User?.name || entry.User?.email) }}</div>
                      <div class="flex-grow-1">
                        <div class="history-header">
                          <strong>{{ entry.User?.name || entry.User?.email }}</strong>
                          <span class="text-muted ms-2">{{ formatDate(entry.createdAt) }}</span>
                        </div>
                        <div class="history-action">
                          <span class="badge bg-secondary">{{ entry.action }}</span>
                          <span v-if="entry.field" class="ms-2">{{ entry.field }}</span>
                        </div>
                        <div v-if="entry.description" class="history-description text-muted small">{{ entry.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">No history available.</div>
              </div>

              <!-- Linked Issues Tab -->
              <div v-if="activeTab === 'linked'">
                <div v-if="links.length > 0">
                  <div v-for="link in links" :key="link.id" class="link-item mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <span class="badge bg-info me-2">{{ link.relation }}</span>
                        <router-link :to="`/tickets/${getLinkedTicketId(link)}`">
                          #{{ getLinkedTicketId(link) }} - {{ getLinkedTicket(link)?.title }}
                        </router-link>
                        <span class="ms-2 badge" :class="getStatusClass(getLinkedTicket(link)?.status)">
                          {{ getLinkedTicket(link)?.status }}
                        </span>
                      </div>
                      <button @click="unlinkTicket(link)" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted mb-3">No linked issues.</div>
                <button @click="showLinkDialog = true" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-link"></i> Link Issue
                </button>
              </div>

              <!-- Subtasks Tab -->
              <div v-if="activeTab === 'subtasks'">
                <div v-if="subtasks.length > 0">
                  <div v-for="subtask in subtasks" :key="subtask.id" class="subtask-item mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-check-circle" v-if="subtask.status === 'Done'"></i>
                      <i class="bi bi-circle" v-else></i>
                      <router-link :to="`/tickets/${subtask.id}`">#{{ subtask.id }} - {{ subtask.title }}</router-link>
                      <span class="badge" :class="getStatusClass(subtask.status)">{{ subtask.status }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">No subtasks.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Details Card -->
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-info-circle"></i> Details</h5>
            </div>
            <div class="card-body">
              <!-- Status -->
              <div class="detail-row mb-3">
                <label class="detail-label">Status</label>
                <select v-if="editMode" class="form-select form-select-sm" v-model="editData.status">
                  <option value="Backlog">Backlog</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Testing">Testing</option>
                  <option value="Done">Done</option>
                  <option value="Closed">Closed</option>
                </select>
                <span v-else class="badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span>
              </div>

              <!-- Priority -->
              <div class="detail-row mb-3">
                <label class="detail-label">Priority</label>
                <select v-if="editMode" class="form-select form-select-sm" v-model="editData.priority">
                  <option value="Lowest">Lowest</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Highest">Highest</option>
                </select>
                <span v-else class="badge" :class="getPriorityClass(ticket.priority)">{{ ticket.priority }}</span>
              </div>

              <!-- Assignee -->
              <div class="detail-row mb-3">
                <label class="detail-label">Assignee</label>
                <div v-if="!editMode">
                  <span v-if="ticket.assignee">{{ ticket.assignee.name || ticket.assignee.email }}</span>
                  <span v-else class="text-muted">Unassigned</span>
                </div>
                <input v-else type="number" class="form-control form-control-sm" v-model.number="editData.assigneeId" placeholder="User ID">
              </div>

              <!-- Reporter -->
              <div class="detail-row mb-3">
                <label class="detail-label">Reporter</label>
                <span>{{ ticket.reporter?.name || ticket.reporter?.email || 'Unknown' }}</span>
              </div>

              <!-- Sprint -->
              <div class="detail-row mb-3">
                <label class="detail-label">Sprint</label>
                <div v-if="!editMode">
                  <span v-if="ticket.sprint">{{ ticket.sprint.name }}</span>
                  <span v-else class="text-muted">No sprint</span>
                </div>
                <input v-else type="number" class="form-control form-control-sm" v-model.number="editData.sprintId" placeholder="Sprint ID">
              </div>

              <!-- Epic -->
              <div class="detail-row mb-3">
                <label class="detail-label">Epic</label>
                <div v-if="!editMode">
                  <router-link v-if="ticket.epic" :to="`/tickets/${ticket.epic.id}`">
                    {{ ticket.epic.title }}
                  </router-link>
                  <span v-else class="text-muted">No epic</span>
                </div>
                <input v-else type="number" class="form-control form-control-sm" v-model.number="editData.epicId" placeholder="Epic ID">
              </div>

              <!-- Parent -->
              <div class="detail-row mb-3" v-if="ticket.parent">
                <label class="detail-label">Parent</label>
                <router-link :to="`/tickets/${ticket.parent.id}`">{{ ticket.parent.title }}</router-link>
              </div>

              <!-- Story Points -->
              <div class="detail-row mb-3">
                <label class="detail-label">Story Points</label>
                <input v-if="editMode" type="number" class="form-control form-control-sm" v-model.number="editData.storyPoints">
                <span v-else>{{ ticket.storyPoints || '-' }}</span>
              </div>

              <!-- Due Date -->
              <div class="detail-row mb-3">
                <label class="detail-label">Due Date</label>
                <input v-if="editMode" type="date" class="form-control form-control-sm" v-model="editData.dueDate">
                <span v-else>{{ formatDate(ticket.dueDate) || '-' }}</span>
              </div>

              <!-- Labels -->
              <div class="detail-row mb-3" v-if="ticket.labels && ticket.labels.length > 0">
                <label class="detail-label">Labels</label>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="label in ticket.labels" :key="label" class="badge bg-secondary">{{ label }}</span>
                </div>
              </div>

              <!-- Components -->
              <div class="detail-row mb-3" v-if="ticket.components && ticket.components.length > 0">
                <label class="detail-label">Components</label>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="comp in ticket.components" :key="comp" class="badge bg-info">{{ comp }}</span>
                </div>
              </div>

              <!-- Save/Cancel buttons in edit mode -->
              <div v-if="editMode" class="d-flex gap-2 mt-3">
                <button @click="saveChanges" class="btn btn-primary btn-sm flex-grow-1">Save</button>
                <button @click="editMode = false" class="btn btn-outline-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Time Tracking Card -->
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-stopwatch"></i> Time Tracking</h5>
            </div>
            <div class="card-body">
              <div class="detail-row mb-2">
                <label class="detail-label">Original Estimate</label>
                <span>{{ ticket.originalEstimate || 0 }}h</span>
              </div>
              <div class="detail-row mb-2">
                <label class="detail-label">Time Spent</label>
                <span>{{ ticket.timeSpent || 0 }}h</span>
              </div>
              <div class="detail-row mb-3">
                <label class="detail-label">Remaining</label>
                <span>{{ ticket.remainingEstimate || 0 }}h</span>
              </div>
              <button @click="showLogTimeDialog = true" class="btn btn-sm btn-outline-primary w-100">
                <i class="bi bi-clock"></i> Log Time
              </button>
            </div>
          </div>

          <!-- Actions Card -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-lightning"></i> Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button @click="archiveTicket" class="btn btn-sm btn-outline-warning">
                  <i class="bi bi-archive"></i> Archive
                </button>
                <button @click="deleteTicket" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Time Dialog -->
    <div v-if="showLogTimeDialog" class="modal-overlay" @click="showLogTimeDialog = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5>Log Time</h5>
            <button @click="showLogTimeDialog = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Time Spent (hours)</label>
            <input type="number" step="0.5" min="0" class="form-control" v-model.number="timeToLog">
          </div>
          <div class="modal-footer">
            <button @click="logTime" class="btn btn-primary">Log Time</button>
            <button @click="showLogTimeDialog = false" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { useRoute, useRouter } from 'vue-router';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const route = useRoute();
const router = useRouter();

const ticket = ref<any>(null);
const comments = ref<any[]>([]);
const history = ref<any[]>([]);
const links = ref<any[]>([]);
const subtasks = ref<any[]>([]);
const commentContent = ref('');
const commentError = ref('');
const activeTab = ref('comments');
const editMode = ref(false);
const editData = ref<any>({});
const showLogTimeDialog = ref(false);
const timeToLog = ref(0);
const showLinkDialog = ref(false);

const fetchTicketDetails = async () => {
  try {
    const response = await apiClient.get(`/tickets/${route.params.id}`);
    ticket.value = response.data;
    comments.value = response.data.Comments || [];
    history.value = response.data.history || [];
    links.value = response.data.links || [];
    subtasks.value = response.data.subtasks || [];

    // Initialize edit data
    editData.value = {
      title: ticket.value.title,
      description: ticket.value.description,
      status: ticket.value.status,
      priority: ticket.value.priority,
      assigneeId: ticket.value.assigneeId,
      sprintId: ticket.value.sprintId,
      epicId: ticket.value.epicId,
      storyPoints: ticket.value.storyPoints,
      dueDate: ticket.value.dueDate ? ticket.value.dueDate.split('T')[0] : null,
    };
  } catch (error) {
    console.error('Error fetching ticket details:', error);
  }
};

onMounted(() => {
  fetchTicketDetails();
});

const addComment = async () => {
  commentError.value = '';
  if (!commentContent.value.trim()) {
    commentError.value = 'Comment cannot be empty.';
    return;
  }
  try {
    await apiClient.post(`/tickets/${route.params.id}/comments`, {
      content: commentContent.value,
    });
    commentContent.value = '';
    await fetchTicketDetails();
  } catch (error) {
    console.error('Error adding comment:', error);
    commentError.value = 'Failed to add comment.';
  }
};

const saveChanges = async () => {
  try {
    await apiClient.put(`/tickets/${route.params.id}`, editData.value);
    editMode.value = false;
    await fetchTicketDetails();
  } catch (error) {
    console.error('Error saving changes:', error);
  }
};

const toggleFlag = async () => {
  try {
    await apiClient.post(`/tickets/${route.params.id}/flag`);
    await fetchTicketDetails();
  } catch (error) {
    console.error('Error toggling flag:', error);
  }
};

const archiveTicket = async () => {
  if (!confirm('Are you sure you want to archive this ticket?')) return;
  try {
    await apiClient.post(`/tickets/${route.params.id}/archive`);
    router.push('/tickets');
  } catch (error) {
    console.error('Error archiving ticket:', error);
  }
};

const deleteTicket = async () => {
  if (!confirm('Are you sure you want to delete this ticket?')) return;
  try {
    await apiClient.delete(`/tickets/${route.params.id}`);
    router.push('/tickets');
  } catch (error) {
    console.error('Error deleting ticket:', error);
  }
};

const logTime = async () => {
  try {
    await apiClient.post(`/tickets/${route.params.id}/log-time`, {
      timeSpent: timeToLog.value
    });
    showLogTimeDialog.value = false;
    timeToLog.value = 0;
    await fetchTicketDetails();
  } catch (error) {
    console.error('Error logging time:', error);
  }
};

const unlinkTicket = async (link: any) => {
  try {
    const targetId = link.sourceTicketId === parseInt(route.params.id as string) ? link.targetTicketId : link.sourceTicketId;
    await apiClient.post(`/tickets/${route.params.id}/unlink`, { targetTicketId: targetId });
    await fetchTicketDetails();
  } catch (error) {
    console.error('Error unlinking ticket:', error);
  }
};

const getLinkedTicketId = (link: any) => {
  return link.sourceTicketId === parseInt(route.params.id as string) ? link.targetTicketId : link.sourceTicketId;
};

const getLinkedTicket = (link: any) => {
  return link.sourceTicketId === parseInt(route.params.id as string) ? link.target : link.source;
};

const getStatusClass = (status: string) => {
  const classes: any = {
    'Backlog': 'bg-secondary',
    'To Do': 'bg-info',
    'In Progress': 'bg-primary',
    'In Review': 'bg-warning',
    'Testing': 'bg-warning',
    'Done': 'bg-success',
    'Closed': 'bg-dark'
  };
  return classes[status] || 'bg-secondary';
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

const getTypeClass = (type: string) => {
  const classes: any = {
    'Epic': 'bg-purple',
    'Story': 'bg-success',
    'Task': 'bg-primary',
    'Bug': 'bg-danger',
    'Subtask': 'bg-info',
    'Improvement': 'bg-warning',
    'New Feature': 'bg-success'
  };
  return classes[type] || 'bg-secondary';
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
</script>

<style scoped>
.ticket-detail-enhanced {
  padding: 20px;
}

.ticket-title {
  font-size: 1.75rem;
  font-weight: 600;
}

.ticket-id {
  color: var(--primary-600);
  font-family: monospace;
  font-weight: 600;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.avatar, .avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.comment-item, .history-item, .link-item {
  padding: 15px;
  background: var(--surface-50);
  border-radius: 8px;
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
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.nav-link {
  cursor: pointer;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}
</style>
