<template>
  <div class="settings-view">
    <h1>Settings</h1>
    <div class="card">
      <div class="card-header">
        User Profile
      </div>
      <div class="card-body">
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label for="fullName" class="form-label">Full Name</label>
            <input type="text" id="fullName" class="form-control" v-model="user.fullName">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" class="form-control" v-model="user.email">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" class="form-control" v-model="user.password">
          </div>
          <div class="mb-3">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input type="text" id="phoneNumber" class="form-control" v-model="user.phoneNumber">
          </div>
          <div class="mb-3">
            <label for="designation" class="form-label">Designation</label>
            <input type="text" id="designation" class="form-control" v-model="user.designation">
          </div>
          <div class="mb-3">
            <label for="division" class="form-label">Division</label>
            <input type="text" id="division" class="form-control" v-model="user.division">
          </div>
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const user = ref({
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: '' as 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User',
  designation: '',
  division: '',
  status: ''
});

onMounted(async () => {
  if (auth.user) {
    user.value = { ...auth.user, password: '', phoneNumber: auth.user.phoneNumber || '', designation: auth.user.designation || '', division: auth.user.division || '' };
  }
});

const updateProfile = async () => {
  try {
    const response = await apiClient.put(`/users/${auth.user?.id}`,
      {
        fullName: user.value.fullName,
        email: user.value.email,
        password: user.value.password,
        phoneNumber: user.value.phoneNumber,
        designation: user.value.designation,
        division: user.value.division,
      });
    auth.updateUserProfile(response.data);
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile.');
  }
};

</script>

<style scoped>
.settings-view {
  padding: 20px;
}
</style>