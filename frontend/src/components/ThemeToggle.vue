<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <div class="theme-toggle__thumb">
      <!-- Sun icon for light mode -->
      <svg v-if="theme === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="theme-toggle__icon">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <!-- Moon icon for dark mode -->
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="theme-toggle__icon">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: 'light' | 'dark';
}

interface Emits {
  (e: 'update:modelValue', value: 'light' | 'dark'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const theme = computed({
  get: () => props.modelValue,
  set: (value: 'light' | 'dark') => emit('update:modelValue', value)
});

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
</script>

<style scoped>
.theme-toggle {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--secondary-300);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--secondary-400);
}

.theme-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.theme-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--color-text-inverse);
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.theme-toggle__icon {
  color: var(--secondary-600);
  transition: color var(--transition-fast);
}

/* Dark mode styles */
[data-theme="dark"] .theme-toggle {
  background: var(--primary-600);
}

[data-theme="dark"] .theme-toggle:hover {
  background: var(--primary-700);
}

[data-theme="dark"] .theme-toggle__thumb {
  transform: translateX(24px);
  background: var(--color-text-inverse);
}

[data-theme="dark"] .theme-toggle__icon {
  color: var(--primary-600);
}

/* Animation for smooth transition */
.theme-toggle__thumb {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(0);
  }
}

[data-theme="dark"] .theme-toggle__thumb {
  animation: slideInDark 0.3s ease-out;
}

@keyframes slideInDark {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(24px);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .theme-toggle {
    width: 44px;
    height: 22px;
  }
  
  .theme-toggle__thumb {
    width: 18px;
    height: 18px;
  }
  
  [data-theme="dark"] .theme-toggle__thumb {
    transform: translateX(22px);
  }
}
</style>
