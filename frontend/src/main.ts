import './assets/main.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'quill/dist/quill.core.css' // Quill CSS
import 'quill/dist/quill.snow.css' // Quill theme CSS
import "vue-toastification/dist/index.css"; // Toast CSS

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { io } from "socket.io-client";
import { SOCKET_URL } from './config';
import Toast, { useToast } from "vue-toastification";
import { QuillEditor } from '@vueup/vue-quill';

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast); // Use Toast

// Register QuillEditor globally
app.component('QuillEditor', QuillEditor);

const socket = io(SOCKET_URL);

// Set up router guards after Pinia is initialized
router.beforeEach((to, from, next) => {
  try {
    const authStore = useAuthStore();
    
    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    const isAuthenticated = authStore.isAuthenticated;

    if (requiresAuth && !isAuthenticated) {
      // Redirect to login if trying to access protected route without auth
      next('/login');
    } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
      // Redirect to dashboard if already authenticated and trying to access auth pages
      next('/dashboard');
    } else {
      // Check role-based access
      const requiredRoles = to.meta.roles as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = authStore.userRole;
        if (!userRole || !requiredRoles.includes(userRole)) {
          next('/dashboard'); // Redirect to dashboard if no permission
          return;
        }
      }
      
      next();
    }
  } catch (error) {
    console.error('Router guard error:', error);
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