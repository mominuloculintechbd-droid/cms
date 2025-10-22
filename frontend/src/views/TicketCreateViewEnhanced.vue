<template>
  <div class="ticket-create container">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="mb-0">Create Ticket</h1>
      <router-link to="/tickets" class="btn btn--outline">Back to Tickets</router-link>
    </div>
    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="createTicket">
          <!-- Title -->
          <div class="form-floating mb-3">
            <input type="text" class="form-control" :class="{ 'is-invalid': titleError }" id="title" placeholder="Title" v-model="title">
            <label for="title">Title *</label>
            <div class="invalid-feedback">{{ titleError }}</div>
          </div>

          <!-- Description -->
          <div class="mb-3">
            <label for="description" class="form-label">Description *</label>
            <QuillEditor theme="snow" v-model:content="description" contentType="html" style="height: 220px;" toolbar="full" />
            <div class="invalid-feedback d-block" v-if="descriptionError">{{ descriptionError }}</div>
          </div>

          <!-- Type and Priority Row -->
          <div class="row">
            <div class="col-md-4">
              <div class="form-floating mb-3">
                <select class="form-select" id="type" v-model="type">
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                  <option value="Subtask">Subtask</option>
                  <option value="Improvement">Improvement</option>
                  <option value="New Feature">New Feature</option>
                </select>
                <label for="type">Type</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating mb-3">
                <select class="form-select" id="priority" v-model="priority">
                  <option value="Lowest">Lowest</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Highest">Highest</option>
                </select>
                <label for="priority">Priority</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating mb-3">
                <select class="form-select" id="severity" v-model="severity">
                  <option value="">None</option>
                  <option value="Trivial">Trivial</option>
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                  <option value="Blocker">Blocker</option>
                </select>
                <label for="severity">Severity</label>
              </div>
            </div>
          </div>

          <!-- Category and Story Points -->
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="category" placeholder="Category" v-model="category">
                <label for="category">Category</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="0" class="form-control" id="storyPoints" v-model.number="storyPoints">
                <label for="storyPoints">Story Points</label>
              </div>
            </div>
          </div>

          <!-- Assignee and Reporter -->
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="1" class="form-control" id="assigneeId" v-model.number="assigneeId">
                <label for="assigneeId">Assignee User ID</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="1" class="form-control" id="projectId" v-model.number="projectId">
                <label for="projectId">Project ID</label>
              </div>
            </div>
          </div>

          <!-- Sprint and Epic -->
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="1" class="form-control" id="sprintId" v-model.number="sprintId">
                <label for="sprintId">Sprint ID</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="1" class="form-control" id="epicId" v-model.number="epicId">
                <label for="epicId">Epic ID</label>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="startDate" v-model="startDate">
                <label for="startDate">Start Date</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="date" class="form-control" id="dueDate" v-model="dueDate">
                <label for="dueDate">Due Date</label>
              </div>
            </div>
          </div>

          <!-- Time Estimates -->
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="0" step="0.5" class="form-control" id="originalEstimate" v-model.number="originalEstimate">
                <label for="originalEstimate">Original Estimate (hours)</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input type="number" min="1" class="form-control" id="parentId" v-model.number="parentId">
                <label for="parentId">Parent Ticket ID</label>
              </div>
            </div>
          </div>

          <!-- Labels -->
          <div class="mb-3">
            <label for="labels" class="form-label">Labels (comma-separated)</label>
            <input type="text" class="form-control" id="labels" placeholder="frontend, backend, urgent" v-model="labelsInput">
          </div>

          <!-- Components -->
          <div class="mb-3">
            <label for="components" class="form-label">Components (comma-separated)</label>
            <input type="text" class="form-control" id="components" placeholder="API, UI, Database" v-model="componentsInput">
          </div>

          <!-- Environment -->
          <div class="mb-3">
            <label for="environment" class="form-label">Environment</label>
            <textarea class="form-control" id="environment" rows="2" v-model="environment"></textarea>
          </div>

          <!-- Versions -->
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="affectedVersions" class="form-label">Affected Versions (comma-separated)</label>
                <input type="text" class="form-control" id="affectedVersions" placeholder="1.0.0, 2.0.1" v-model="affectedVersionsInput">
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="fixVersions" class="form-label">Fix Versions (comma-separated)</label>
                <input type="text" class="form-control" id="fixVersions" placeholder="2.1.0" v-model="fixVersionsInput">
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Create Ticket</button>
            <router-link to="/tickets" class="btn btn-outline-secondary">Cancel</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const title = ref('');
const description = ref('');
const priority = ref('Medium');
const category = ref('');
const type = ref('Task');
const severity = ref('');
const dueDate = ref<string | null>(null);
const startDate = ref<string | null>(null);
const assigneeId = ref<number | null>(null);
const projectId = ref<number | null>(null);
const sprintId = ref<number | null>(null);
const epicId = ref<number | null>(null);
const parentId = ref<number | null>(null);
const storyPoints = ref<number | null>(null);
const originalEstimate = ref<number | null>(null);
const labelsInput = ref('');
const componentsInput = ref('');
const affectedVersionsInput = ref('');
const fixVersionsInput = ref('');
const environment = ref('');

const titleError = ref('');
const descriptionError = ref('');
const router = useRouter();

const validateForm = () => {
  titleError.value = '';
  descriptionError.value = '';
  let isValid = true;

  if (!title.value) {
    titleError.value = 'Title is required.';
    isValid = false;
  }

  if (!description.value) {
    descriptionError.value = 'Description is required.';
    isValid = false;
  }

  return isValid;
};

const createTicket = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const labels = labelsInput.value ? labelsInput.value.split(',').map(l => l.trim()).filter(l => l) : [];
    const components = componentsInput.value ? componentsInput.value.split(',').map(c => c.trim()).filter(c => c) : [];
    const affectedVersions = affectedVersionsInput.value ? affectedVersionsInput.value.split(',').map(v => v.trim()).filter(v => v) : [];
    const fixVersions = fixVersionsInput.value ? fixVersionsInput.value.split(',').map(v => v.trim()).filter(v => v) : [];

    await apiClient.post('/tickets', {
      title: title.value,
      description: description.value,
      priority: priority.value,
      category: category.value,
      type: type.value,
      severity: severity.value || undefined,
      dueDate: dueDate.value || undefined,
      startDate: startDate.value || undefined,
      assigneeId: assigneeId.value || undefined,
      projectId: projectId.value || undefined,
      sprintId: sprintId.value || undefined,
      epicId: epicId.value || undefined,
      parentId: parentId.value || undefined,
      storyPoints: storyPoints.value || undefined,
      originalEstimate: originalEstimate.value || undefined,
      labels,
      components,
      affectedVersions,
      fixVersions,
      environment: environment.value || undefined,
    });
    router.push('/tickets');
  } catch (error: any) {
    console.error('Error creating ticket', error);
    if (error.response && error.response.data && error.response.data.message) {
      titleError.value = error.response.data.message;
    } else {
      titleError.value = 'An unexpected error occurred.';
    }
  }
};
</script>
