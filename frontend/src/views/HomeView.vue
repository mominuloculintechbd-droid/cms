<template>
  <div class="home">
    <div class="welcome-container">
      <div class="welcome-content">
        <h1 class="welcome-title">Welcome to OTBL CMS</h1>
        <p class="welcome-subtitle">Your Content & Ticket Management System</p>
        <div class="welcome-actions">
          <router-link to="/dashboard" class="btn btn--primary btn--lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Auto-redirect to dashboard after a short delay
onMounted(() => {
  setTimeout(() => {
    router.push('/dashboard');
  }, 2000);
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
}

.welcome-container {
  text-align: center;
  max-width: 600px;
  padding: 40px;
}

.welcome-content {
  background: var(--surface-0);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--surface-200);
}

.welcome-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, var(--primary-600), var(--info-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

.welcome-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn--lg {
  height: 52px;
  padding: 0 24px;
  font-size: 1rem;
  gap: 12px;
}

/* Dark mode adjustments */
[data-theme="dark"] .home {
  background: linear-gradient(135deg, var(--surface-900) 0%, var(--surface-800) 100%);
}

[data-theme="dark"] .welcome-content {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
}

/* Responsive design */
@media (max-width: 768px) {
  .welcome-container {
    padding: 20px;
  }
  
  .welcome-content {
    padding: 32px 24px;
  }
  
  .welcome-title {
    font-size: 2.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .welcome-actions .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>