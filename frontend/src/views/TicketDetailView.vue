<template>
  <div class="ticket-detail container">
    <div v-if="ticket">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 class="mb-1">{{ ticket.title }}</h1>
          <div class="text-muted small">#{{ ticket.id }}</div>
        </div>
        <router-link to="/tickets" class="btn btn--outline">Back to Tickets</router-link>
      </div>

      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Status</h5>
              <span class="badge" :class="{'bg-success': ticket.status === 'Open', 'bg-warning': ticket.status === 'Pending', 'bg-danger': ticket.status === 'Closed'}">{{ ticket.status }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Priority</h5>
              <span class="badge" :class="{'bg-info': ticket.priority === 'Low', 'bg-warning': ticket.priority === 'Medium', 'bg-danger': ticket.priority === 'High'}">{{ ticket.priority }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Category</h5>
              <span class="badge bg-primary">{{ ticket.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3 shadow-sm">
        <div class="card-header">Description</div>
        <div class="card-body" v-html="ticket.description"></div>
      </div>

      <div class="card mt-4 shadow-sm">
        <div class="card-header">Comments</div>
        <div class="card-body">
          <div v-if="comments.length > 0">
            <div v-for="comment in comments" :key="comment.id" class="card mb-3">
              <div class="card-body">
                <small class="text-muted">{{ comment.User?.email }} - {{ new Date(comment.createdAt).toLocaleString() }}</small>
                <div v-html="comment.content"></div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No comments yet.</p>
          </div>

          <div v-if="ticket.status !== 'Closed'" class="mt-4">
            <h5>Add a Comment</h5>
            <QuillEditor
              v-model:content="commentContent"
              contentType="html"
              style="height: 200px;"
              toolbar="full"
            />
            <div class="invalid-feedback d-block" v-if="commentError">
              {{ commentError }}
            </div>
            <button @click="addComment" class="btn btn-primary mt-3">Add Comment</button>
          </div>
          <div v-else class="mt-4 alert alert-info">
            Ticket is closed. No new comments can be added.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '../api';
import { useRoute } from 'vue-router';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const ticket = ref<any>(null);
const comments = ref<any[]>([]);
const commentContent = ref('');
const commentError = ref('');
const route = useRoute();
let pollingInterval: number | undefined;

const fetchTicketDetails = async () => {
  try {
    const ticketResponse = await apiClient.get(`/tickets/${route.params.id}`);
    ticket.value = ticketResponse.data;

    const commentsResponse = await apiClient.get(`/tickets/${route.params.id}/comments`);
    comments.value = commentsResponse.data;
  } catch (error) {
    console.error('Error getting ticket details or comments', error);
  }
};

onMounted(() => {
  fetchTicketDetails();
  pollingInterval = setInterval(fetchTicketDetails, 5000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});

const addComment = async () => {
  commentError.value = '';
  if (!commentContent.value.trim()) {
    commentError.value = 'Comment cannot be empty.';
    return;
  }
  try {
    const response = await apiClient.post(`/tickets/${route.params.id}/comments`, {
      content: commentContent.value,
    });
    comments.value.push(response.data);
    commentContent.value = '';
  } catch (error) {
    console.error('Error adding comment', error);
    commentError.value = 'Failed to add comment.';
  }
};
</script>
