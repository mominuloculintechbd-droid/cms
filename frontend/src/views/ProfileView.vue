<template>
  <div class="profile-view">
    <!-- Header Section -->
    <div class="profile-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          My Profile
        </h1>
        <p class="page-subtitle">Manage your profile information and view your activity</p>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="alert alert-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ errorMessage }}
    </div>

    <div v-if="user" class="profile-content">
      <!-- Profile Overview Cards -->
      <div class="profile-overview">
        <div class="profile-card">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img 
                :src="profilePicturePreview || user.profilePicture || defaultAvatar" 
                class="profile-avatar" 
                alt="Profile Picture"
              >
              <div class="avatar-overlay" @click="triggerFileUpload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            <input 
              type="file" 
              id="fileInput"
              @change="handleFileUpload" 
              accept="image/*" 
              class="file-input"
            >
            <button class="btn btn-secondary btn-sm" @click="triggerFileUpload">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Change Photo
            </button>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ user.fullName || 'User' }}</h2>
            <p class="profile-email">{{ user.email }}</p>
            <div class="profile-role">
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ user.role }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Statistics -->
      <div class="ticket-stats">
        <h3 class="section-title">My Ticket Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card open-tickets">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ ticketStats.openTickets }}</h3>
              <p>Open Tickets</p>
            </div>
          </div>
          <div class="stat-card closed-tickets">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ ticketStats.closedTickets }}</h3>
              <p>Closed Tickets</p>
            </div>
          </div>
          <div class="stat-card assigned-tickets">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ ticketStats.assignedTickets }}</h3>
              <p>Assigned Tickets</p>
            </div>
          </div>
          <div class="stat-card pending-tickets">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ ticketStats.pendingTickets }}</h3>
              <p>Pending Tickets</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path :d="getActivityIcon(activity.type)"/>
              </svg>
            </div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.message }}</p>
              <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="profile-form-section">
        <h3 class="section-title">Profile Information</h3>
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="fullName" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Full Name
              </label>
              <input 
                type="text" 
                id="fullName" 
                class="form-control" 
                v-model="profileData.fullName"
                placeholder="Enter your full name"
              >
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                class="form-control" 
                :value="user.email" 
                disabled
              >
              <small class="form-text">Email cannot be changed</small>
            </div>

            <div class="form-group">
              <label for="phoneNumber" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Phone Number
              </label>
              <input 
                type="text" 
                id="phoneNumber" 
                class="form-control" 
                v-model="profileData.phoneNumber"
                placeholder="Enter your phone number"
              >
            </div>

            <div class="form-group">
              <label for="designation" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Designation
              </label>
              <input 
                type="text" 
                id="designation" 
                class="form-control" 
                v-model="profileData.designation"
                placeholder="Enter your designation"
              >
            </div>

            <div class="form-group">
              <label for="division" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                Division
              </label>
              <input 
                type="text" 
                id="division" 
                class="form-control" 
                v-model="profileData.division"
                placeholder="Enter your division"
              >
            </div>

            <div class="form-group">
              <label for="profilePictureUrl" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Profile Picture URL
              </label>
              <input 
                type="url" 
                id="profilePictureUrl" 
                class="form-control" 
                v-model="profileData.profilePicture"
                placeholder="Enter profile picture URL"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              <div v-else class="spinner"></div>
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1,4 1,10 7,10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getProfile, updateMe } from '../api';

const authStore = useAuthStore();
const user = ref(authStore.user);

const profileData = ref({
  fullName: '',
  phoneNumber: '',
  designation: '',
  division: '',
  profilePicture: ''
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const profilePicturePreview = ref('');
const defaultAvatar = '/default-avatar.png';

// Activity data
const ticketStats = ref({
  openTickets: 0,
  closedTickets: 0,
  assignedTickets: 0,
  pendingTickets: 0
});

interface Activity {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

const recentActivity = ref<Activity[]>([]);

const fetchProfileData = async () => {
  try {
    const response = await getProfile();
    const profile = response.data;
    user.value = profile.user;
    ticketStats.value = profile.ticketStats;
    recentActivity.value = profile.recentActivity;

    profileData.value = {
      fullName: profile.user.fullName || '',
      phoneNumber: profile.user.phoneNumber || '',
      designation: profile.user.designation || '',
      division: profile.user.division || '',
      profilePicture: profile.user.profilePicture || ''
    };
  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    errorMessage.value = 'Failed to load profile data.';
  }
};

onMounted(() => {
  fetchProfileData();
});

const handleUpdateProfile = async () => {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const response = await updateMe(profileData.value);
    authStore.updateUserProfile(response.data.user);
    successMessage.value = 'Profile updated successfully!';
    
    // Refresh profile data after update
    await fetchProfileData();

  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile.';
  } finally {
    isLoading.value = false;
  }
};

const triggerFileUpload = () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  fileInput?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Please select an image file.';
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Image size should be less than 5MB.';
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicturePreview.value = e.target?.result as string;
      profileData.value.profilePicture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const resetForm = () => {
  if (user.value) {
    profileData.value = {
      fullName: user.value.fullName || '',
      phoneNumber: user.value.phoneNumber || '',
      designation: user.value.designation || '',
      division: user.value.division || '',
      profilePicture: user.value.profilePicture || ''
    };
    profilePicturePreview.value = '';
  }
  successMessage.value = '';
  errorMessage.value = '';
};

const getRoleClass = (role: string) => {
  switch (role) {
    case 'Super Admin':
      return 'role-super-admin';
    case 'Admin':
      return 'role-admin';
    case 'Manager':
      return 'role-manager';
    case 'Agent':
      return 'role-agent';
    default:
      return 'role-user';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'ticket_created':
      return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14,2 14,8 20,8';
    case 'ticket_updated':
      return 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7';
    case 'comment_added':
      return 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z';
    default:
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
  }
};
</script>

<style scoped>
/* Main Container */
.profile-view {
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
}

/* Header Section */
.profile-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.page-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #4f46e5;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-danger {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Profile Overview */
.profile-overview {
  margin-bottom: 2rem;
}

.profile-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay svg {
  width: 2rem;
  height: 2rem;
  color: white;
}

.file-input {
  display: none;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.profile-email {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.profile-role {
  margin-bottom: 1rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-super-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #dcfce7;
  color: #166534;
}

.role-agent {
  background: #e0e7ff;
  color: #3730a3;
}

.role-user {
  background: #f3f4f6;
  color: #374151;
}

/* Ticket Statistics */
.ticket-stats {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.open-tickets .stat-icon {
  background: #dbeafe;
  color: #1e40af;
}

.stat-card.closed-tickets .stat-icon {
  background: #fef2f2;
  color: #dc2626;
}

.stat-card.assigned-tickets .stat-icon {
  background: #dcfce7;
  color: #16a34a;
}

.stat-card.pending-tickets .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.stat-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
  border-color: #e5e7eb;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.activity-content p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Profile Form */
.profile-form-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-label svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-control:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.form-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-view {
    padding: 1rem;
  }
  
  .profile-card {
    flex-direction: column;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>