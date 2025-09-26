<template>
  <div id="app" class="main-layout-root">
    <!-- Sidebar + Main Content Grid -->
    <div class="main-layout-grid">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar--closed': !isSidebarOpen }">
        <div class="sidebar__header">
          <h6 class="sidebar__title">Oculin Tech BD Ltd</h6>
          <!-- <p class="sidebar__subtitle">Manage your system</p> -->
          <div v-if="auth.isAuthenticated" class="user-info-sidebar">
            <div class="user-name">{{ auth.user?.fullName || 'User' }}</div>
            <div class="user-name">{{ auth.user?.designation || 'User' }}</div>
            <div> </div>
          </div>
        </div>
        <nav class="sidebar__nav">
          <ul class="sidebar__menu">
            <li class="sidebar__item">
              <router-link to="/dashboard" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path === '/dashboard' }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                Dashboard
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/tickets" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/tickets') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Tickets
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/content" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/content') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Content
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/customers" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/customers') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Customers
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/billing-profile" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/billing-profile') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Billing Profile
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/data-upload" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/data-upload') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Data Upload
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/data-fetching" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/data-fetching') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Data Fetching
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/bill-stop" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/bill-stop') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Bill Stop
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/meter-replacement" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/meter-replacement') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                  <path d="M7 8h10M7 12h6M7 16h8"/>
                </svg>
                Meter Replacement
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/batch-report" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/batch-report') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                  <path d="M7 8h10M7 12h6M7 16h8"/>
                </svg>
                Batch Report
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/meter-estimator" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/meter-estimator') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                  <path d="M7 8h10M7 12h6M7 16h8"/>
                </svg>
                Meter Estimator
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/c2m-upload" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/c2m-upload') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                C2M Upload
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
              <router-link to="/admin" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/admin') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Admin Panel
              </router-link>
            </li>
            <li class="sidebar__item" v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
              <router-link to="/users/create" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/users/create') }">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create User
              </router-link>
            </li>
            <li class="sidebar__item sidebar__item--divider"></li>
            <li class="sidebar__item sidebar__item--logout" v-if="auth.isAuthenticated">
              <button class="sidebar__link" @click="logout">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="main-content-area">
        <!-- Top Navbar -->
        <nav class="navbar" :class="{ 'navbar--sidebar-open': isSidebarOpen }">
          <div class="navbar__container" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <!-- Left Section -->
            <div class="navbar__left" style="display: flex; align-items: center;">
              <router-link to="/" class="navbar__brand" style="display: flex; align-items: center; gap: 8px;">
                <div class="navbar__logo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span>OTBL CMS</span>
              </router-link>
            </div>

            <!-- Center Section -->
            <div class="navbar__center" style="flex: 1; display: flex; justify-content: center;">
              <div class="navbar__search" style="display: flex; align-items: center; max-width: 320px; width: 100%;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search..." class="navbar__search-input" style="flex: 1; margin-left: 8px;">
              </div>
            </div>

            <!-- Right Section -->
            <div class="navbar__right" style="display: flex; align-items: center; gap: 16px;">
              <!-- Theme Toggle -->
              <ThemeToggle v-model="theme" />

              <!-- Notifications -->
              <div class="notifications" v-if="auth.isAuthenticated" style="position: relative;">
                <button class="btn btn--ghost notification-btn" @click="goToNotifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
                </button>
              </div>

              <!-- User Menu -->
              <div class="user-menu" ref="userMenu" v-if="auth.isAuthenticated" style="position: relative;">
                <button class="btn btn--ghost user-menu__trigger" @click="toggleUserMenu">
                  <div class="user-avatar">
                    <img v-if="auth.user?.profilePicture" :src="auth.user.profilePicture" :alt="auth.user.fullName">
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span>{{ auth.user?.fullName || 'User' }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                <div class="user-menu__dropdown" v-show="isUserMenuOpen" style="z-index: 2000;">
                  <div class="user-menu__header">
                    <div class="user-info">
                      <div class="user-avatar">
                        <img v-if="auth.user?.profilePicture" :src="auth.user.profilePicture" :alt="auth.user.fullName">
                        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div>
                        <div class="user-name">{{ auth.user?.fullName || 'User' }}</div>
                        <div class="user-email">{{ auth.user?.email || 'user@example.com' }}</div>
                        <div class="user-role">{{ auth.user?.role || 'User' }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="user-menu__items">
                    <router-link to="/profile" class="user-menu__item" @click="closeUserMenu">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Profile</span>
                    </router-link>
                    <button class="user-menu__item" @click="logout">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Auth Links -->
              <div v-else class="auth-links" style="display: flex; gap: 8px;">
                <router-link to="/login" class="btn btn--outline">Login</router-link>
                <router-link to="/register" class="btn btn--primary">Register</router-link>
              </div>
            </div>
          </div>
        </nav>
        <!-- Main Content -->
        <main class="main-content">
          <div class="container">
            <router-view />
          </div>
        </main>
      </div>
    </div>
    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>
    <!-- Sidebar Toggle Button -->
    <button
      class="btn btn--ghost sidebar-toggle-external"
      :class="{ 'sidebar-open': isSidebarOpen }"
      @click="toggleSidebar"
      aria-label="Toggle sidebar"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle.vue';

// Reactive state
const theme = ref<'light' | 'dark'>('light');
const isSidebarOpen = ref(true);
const isUserMenuOpen = ref(false);
const isNotificationOpen = ref(false);
const userMenu = ref<HTMLElement | null>(null);

// Notifications
const unreadNotifications = ref(0);

// Store and router - initialize immediately
const router = useRouter();
const auth = useAuthStore();

// Theme management
const applyTheme = (newTheme: 'light' | 'dark') => {
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme.value);
};

watch(theme, (newTheme) => {
  applyTheme(newTheme);
});

// Sidebar management
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
};

const handleResize = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = true;
  } else {
    isSidebarOpen.value = false;
  }
};

// User menu management
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  isNotificationOpen.value = false; // Close notifications when opening user menu
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleClickOutsideUserMenu = (event: MouseEvent) => {
  if (userMenu.value && !userMenu.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

const handleClickOutsideNotifications = (event: MouseEvent) => {
  const notificationElement = document.querySelector('.notifications');
  if (notificationElement && !notificationElement.contains(event.target as Node)) {
    isNotificationOpen.value = false;
  }
};

// Notification management
const goToNotifications = () => {
  router.push('/notifications');
};

const loadUnreadCount = async () => {
  if (!auth.isAuthenticated) return;
  try {
    const res = await api.get('/notifications', { headers: { Authorization: `Bearer ${auth.token}` } });
    unreadNotifications.value = (res.data || []).filter((n: any) => !n.isRead).length;
  } catch {}
};

// Auth management
const logout = () => {
  if (auth && router) {
    auth.logout();
    router.push('/login');
    isUserMenuOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  loadTheme();
  handleResize();
  loadUnreadCount();
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutsideUserMenu);
  document.addEventListener('click', handleClickOutsideNotifications);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutsideUserMenu);
  document.removeEventListener('click', handleClickOutsideNotifications);
});
</script>

<style>
/* Global styles */
:root {
  --color-background: #f9fafb;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-background-soft: #f3f4f6;
  --color-border: #e5e7eb;
}

[data-theme='dark'] {
  --color-background: #111827;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-background-soft: #1f2937;
  --color-border: #374151;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
}

.main-layout-root {
  min-height: 100vh;
  background: var(--color-background);
}

.main-layout-grid {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: 260px;
  min-width: 220px;
  max-width: 320px;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
  color: #fff;
  box-shadow: 2px 0 12px 0 rgba(0,0,0,0.07);
  transition: width 0.2s, left 0.2s;
  z-index: 100;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar--closed {
  width: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0 !important;
}

.main-content-area {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-background);
  transition: margin-left 0.2s;
}

.navbar {
  background: linear-gradient(90deg, #06b6d4 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 0.5rem 2rem;
  min-height: 56px;
  display: flex;
  align-items: center;
  z-index: 101;
}

.main-content {
  flex: 1 1 0%;
  padding: 2rem 1.5rem;
  background: transparent;
  min-width: 0;
}

@media (max-width: 900px) {
  .main-layout-grid {
    flex-direction: column;
  }
  .sidebar {
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 200;
    box-shadow: 2px 0 12px 0 rgba(0,0,0,0.12);
  }
  .sidebar--closed {
    left: -100vw;
    width: 0;
    min-width: 0;
    box-shadow: none;
  }
  .main-content-area {
    margin-left: 0;
  }
}

.sidebar__header {
  padding: 2rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sidebar__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #fff;
}

.sidebar__subtitle {
  font-size: 1rem;
  color: #e0e7ff;
  margin-bottom: 1rem;
}

.sidebar__nav {
  flex: 1 1 0%;
  padding: 1rem 0;
  overflow-y: auto;
}

.sidebar__menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__item {
  margin-bottom: 0.5rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  color: #e0e7ff;
  text-decoration: none;
  border-radius: 0 2rem 2rem 0;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  background: transparent;
}

.sidebar__link--active,
.sidebar__link:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.sidebar__icon {
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 150;
  display: block;
}

.sidebar-toggle-external {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 300;
  background: #fff;
  color: #4f46e5;
  border-radius: 50%;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.sidebar-toggle-external.sidebar-open {
  background: #4f46e5;
  color: #fff;
}

/* Notifications */
.notifications {
  position: relative;
  margin-right: 1rem;
}

.notification-btn {
  position: relative;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 350px;
  max-height: 400px;
  z-index: 9999;
  overflow: hidden;
  display: block;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.no-notifications svg {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h5 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.notification-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.user-menu {
  position: relative;
  display: inline-block;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 280px;
  z-index: 9999;
  padding: 0.5rem;
  display: block;
}

.user-menu__header {
  padding: 0.5rem 1rem 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 600;
}

.user-email,
.user-role {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.user-menu__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-radius: 0.25rem;
    color: var(--color-text);
    cursor: pointer;
    font-size: 1rem;
    text-decoration: none;
}

.user-menu__item:hover {
    background-color: var(--color-background-soft);
}

.user-menu__item svg {
    width: 16px;
    height: 16px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.sidebar__item--divider {
  height: 1px;
  margin: 1rem 2rem;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar__item--logout .sidebar__link {
  background-color: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

@media (min-width: 900px) {
  .sidebar-toggle-external {
    display: none;
  }
  .sidebar-overlay {
    display: none;
  }
}
</style>
