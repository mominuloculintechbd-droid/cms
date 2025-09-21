<template>
  <div class="login-container">
    <!-- Background with animated gradient -->
    <div class="login-background">
      <div class="gradient-orb gradient-orb-1"></div>
      <div class="gradient-orb gradient-orb-2"></div>
      <div class="gradient-orb gradient-orb-3"></div>
    </div>

    <!-- Login Card -->
    <div class="login-card animate-fade-in">
      <div class="login-header">
        <div class="login-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-subtitle">Sign in to your OTBL CMS account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-floating mb-4">
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              placeholder="name@example.com" 
              v-model="email"
              required
            >
            <label for="email">Email address</label>
          </div>
        
        <div class="form-floating mb-4">
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              placeholder="Password" 
              v-model="password"
              required
            >
            <label for="password">Password</label>
          </div>

        <div v-if="errorMessage" class="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="btn btn--primary btn--lg w-100" :disabled="isLoading">
          <span v-if="isLoading" class="animate-spin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </span>
          <span v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <div class="admin-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <p>User accounts are managed by administrators only</p>
        </div>
        <div class="support-info">
          <p>Need access? Contact your system administrator</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const authStore = useAuthStore();
const toast = useToast();

const handleLogin = async () => {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter both email and password';
    toast.error('Please enter both email and password');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    console.log('Attempting login with:', { email: email.value.trim() });
    await authStore.login({ email: email.value.trim(), password: password.value });
    console.log('Login successful');
    // The store handles redirection on success
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract error message from response
    let message = 'Login failed. Please try again.';
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    
    errorMessage.value = message;
    toast.error(message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.gradient-orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.gradient-orb-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--info-400), var(--info-600));
  top: 50%;
  right: -100px;
  animation-delay: 2s;
}

.gradient-orb-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, var(--success-400), var(--success-600));
  bottom: -125px;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.3);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.login-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--error-50);
  border: 1px solid var(--error-200);
  border-radius: 12px;
  color: var(--error-700);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-out;
}



.login-footer {
  text-align: center;
}

.admin-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.admin-notice svg {
  color: #d97706;
  flex-shrink: 0;
}

.admin-notice p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
  font-size: 0.875rem;
}

.support-info {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.support-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

/* Dark mode adjustments */
[data-theme="dark"] .login-container {
  background: linear-gradient(135deg, var(--surface-900) 0%, var(--surface-800) 100%);
}

[data-theme="dark"] .login-card {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .gradient-orb-1 {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
}

[data-theme="dark"] .gradient-orb-2 {
  background: linear-gradient(135deg, var(--info-600), var(--info-800));
}

[data-theme="dark"] .gradient-orb-3 {
  background: linear-gradient(135deg, var(--success-600), var(--success-800));
}

[data-theme="dark"] .admin-notice {
  background: linear-gradient(135deg, #451a03, #78350f);
  border-color: #d97706;
}

[data-theme="dark"] .admin-notice svg {
  color: #f59e0b;
}

[data-theme="dark"] .admin-notice p {
  color: #fbbf24;
}

[data-theme="dark"] .support-info {
  background: #1e293b;
  border-color: #334155;
}

[data-theme="dark"] .support-info p {
  color: #94a3b8;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 16px;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .login-logo {
    width: 64px;
    height: 64px;
  }
}
</style>