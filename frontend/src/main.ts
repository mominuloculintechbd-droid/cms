import './assets/main.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "vue-toastification/dist/index.css"; // Toast CSS

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { io } from "socket.io-client";
import { SOCKET_URL } from './config';
import Toast, { useToast } from "vue-toastification";
import { CkeditorPlugin } from '@ckeditor/ckeditor5-vue';

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast); // Use Toast
app.use(CkeditorPlugin); // Register CKEditor component

const socket = io(SOCKET_URL);

// Set up router guards after Pinia is initialized
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore();

    // Try to fetch user if token exists but user doesn't
    if (authStore.token && !authStore.user) {
      await authStore.fetchUser();
    }

    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    const isAuthenticated = authStore.isAuthenticated;

    // Public routes (login, register) - explicitly set requiresAuth: false
    if (to.meta.requiresAuth === false) {
      if (isAuthenticated) {
        // Already logged in, redirect to dashboard
        next('/dashboard');
      } else {
        next();
      }
      return;
    }

    // Protected routes - require authentication
    if (requiresAuth && !isAuthenticated) {
      // Not authenticated, redirect to login
      next('/login');
      return;
    }

    // Check role-based access
    const requiredRoles = to.meta.roles as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = authStore.userRole;
      if (!userRole || !requiredRoles.includes(userRole)) {
        // User doesn't have required role, redirect to dashboard
        next('/dashboard');
        return;
      }
    }

    // All checks passed
    next();
  } catch (error) {
    console.error('Router guard error:', error);
    // On error, clear auth and redirect to login
    const authStore = useAuthStore();
    authStore.logout();
    next('/login');
  }
});

router.isReady().then(() => {
  const toast = useToast();

  // --- Socket.io Client Setup ---

  socket.on('connect', () => {
    console.log('Connected to WebSocket server with ID:', socket.id);
  });

  socket.on('notification', (data) => {
    console.log('Notification received:', data);
    toast.info(data.message, {
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: "button",
      icon: true,
      rtl: false
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server.');
  });

  // Make the socket instance available globally
  app.config.globalProperties.$socket = socket;

  app.mount('#app')
});