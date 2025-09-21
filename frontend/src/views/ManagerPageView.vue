<template>
  <div class="manager-page">
    <h1>Manager Dashboard</h1>
    <p>This page is accessible only to Managers.</p>

    <h2>Manager Users</h2>
    <div v-if="loadingManagers">Loading Manager users...</div>
    <div v-else-if="managerUsers.length === 0">No Manager users found.</div>
    <div v-else>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in managerUsers" :key="user.id">
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-4">Register New User</h2>
    <form @submit.prevent="registerUser" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="fullName" class="form-label">Full Name</label>
        <input type="text" class="form-control" id="fullName" v-model="newUser.fullName" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="newUser.email" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password" v-model="newUser.password" required>
      </div>
      <div class="mb-3">
        <label for="phoneNumber" class="form-label">Phone Number</label>
        <input type="text" class="form-control" id="phoneNumber" v-model="newUser.phoneNumber">
      </div>
      <div class="mb-3">
        <label for="role" class="form-label">Role</label>
        <select class="form-select" id="role" v-model="newUser.role" required>
          <option value="">Select Role</option>
          <option value="Agent">Agent</option>
          <option value="User">User</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="designation" class="form-label">Designation</label>
        <input type="text" class="form-control" id="designation" v-model="newUser.designation">
      </div>
      <div class="mb-3">
        <label for="division" class="form-label">Division</label>
        <input type="text" class="form-control" id="division" v-model="newUser.division">
      </div>
      <button type="submit" class="btn btn-primary">Register User</button>
      <div v-if="registrationMessage" :class="{'text-success': registrationSuccess, 'text-danger': !registrationSuccess}" class="mt-3">
        {{ registrationMessage }}
      </div>
    </form>

    <h2 class="mt-4">Ticket Overview</h2>
    <div v-if="loadingTickets">Loading tickets...</div>
    <div v-else-if="tickets.length === 0">No tickets found.</div>
    <div v-else>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.id }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticket.status }}</td>
            <td>{{ ticket.priority }}</td>
            <td>{{ ticket.category }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-4">All Users Overview</h2>
    <div v-if="loadingAllUsers">Loading all users...</div>
    <div v-else-if="allUsers.length === 0">No users found.</div>
    <div v-else>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in allUsers" :key="user.id">
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.status }}</td>
            <td>{{ user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-4">Reports (Placeholder)</h2>
    <p>Reporting features will be implemented here.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import type { Ref } from 'vue';

const auth = useAuthStore();
const managerUsers = ref<any[]>([]);
const loadingManagers = ref(true);
const error = ref<string | null>(null);

const newUser = ref({
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: '',
  designation: '',
  division: ''
});

const registrationMessage = ref<string | null>(null);
const registrationSuccess = ref(false);

const tickets = ref<any[]>([]);
const loadingTickets = ref(true);

const allUsers = ref<any[]>([]);
const loadingAllUsers = ref(true);

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string; // lastLogin is optional
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  userId: number;
}

const fetchManagerUsers = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users?role=Manager`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    managerUsers.value = response.data;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error fetching Manager users:', err);
  } finally {
    loadingManagers.value = false;
  }
};

const registerUser = async () => {
  registrationMessage.value = null;
  registrationSuccess.value = false;
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, newUser.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    registrationMessage.value = response.data.message;
    registrationSuccess.value = true;
    // Clear form
    newUser.value = {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: '',
      designation: '',
      division: ''
    };
    // Refresh manager users list if needed, or add the new user if it's a manager
    // For now, just show success message
  } catch (err: any) {
    registrationMessage.value = err.response?.data?.message || 'Error registering user.';
    registrationSuccess.value = false;
    console.error('Error registering user:', err);
  }
};

const fetchTickets = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/tickets`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    tickets.value = response.data;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error fetching tickets:', err);
  } finally {
    loadingTickets.value = false;
  }
};

const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    allUsers.value = response.data;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error fetching all users:', err);
  } finally {
    loadingAllUsers.value = false;
  }
};

onMounted(() => {
  fetchManagerUsers();
  fetchTickets();
  fetchAllUsers();
});
</script>

<style scoped>
.manager-page {
  padding: 20px;
}
.table {
  margin-top: 15px;
}
</style>