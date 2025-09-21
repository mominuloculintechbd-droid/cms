<template>
  <div class="ticket-create container">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="mb-0">Create Ticket</h1>
      <router-link to="/tickets" class="btn btn--outline">Back to Tickets</router-link>
    </div>
    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="createTicket">
      <div class="form-floating mb-3">
        <input type="text" class="form-control" :class="{ 'is-invalid': titleError }" id="title" placeholder="Title" v-model="title">
        <label for="title">Title</label>
        <div class="invalid-feedback">
          {{ titleError }}
        </div>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <QuillEditor theme="snow" v-model:content="description" contentType="html" style="height: 220px;" toolbar="full" />
        <div class="invalid-feedback d-block" v-if="descriptionError">
          {{ descriptionError }}
        </div>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="priority" v-model="priority">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <label for="priority">Priority</label>
      </div>
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="category" placeholder="Category" v-model="category">
        <label for="category">Category</label>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-floating mb-3">
            <select class="form-select" id="type" v-model="type">
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
            </select>
            <label for="type">Type</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating mb-3">
            <select class="form-select" id="severity" v-model="severity">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <label for="severity">Severity</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-floating mb-3">
            <input type="date" class="form-control" id="dueDate" v-model="dueDate">
            <label for="dueDate">Due Date</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating mb-3">
            <input type="number" min="1" class="form-control" id="assigneeId" v-model.number="assigneeId">
            <label for="assigneeId">Assignee User ID</label>
          </div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Create</button>
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
const severity = ref('Medium');
const dueDate = ref<string | null>(null);
const assigneeId = ref<number | null>(null);
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
    await apiClient.post('/tickets', {
      title: title.value,
      description: description.value,
      priority: priority.value,
      category: category.value,
      type: type.value,
      severity: severity.value,
      dueDate: dueDate.value || undefined,
      assigneeId: assigneeId.value || undefined,
    });
    router.push('/tickets');
  } catch (error: any) {
    console.error('Error creating ticket', error);
    // Display error message
    if (error.response && error.response.data && error.response.data.message) {
      // For simplicity, we'll just show a generic error for now
      titleError.value = 'Error creating ticket.';
    } else {
      titleError.value = 'An unexpected error occurred.';
    }
  }
};
</script>

