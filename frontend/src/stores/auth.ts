import { defineStore } from 'pinia';
import { login as apiLogin, getMe, register as apiRegister } from '../api';
import { createToastInterface } from 'vue-toastification';

const toast = createToastInterface();


// Define the User type according to your backend model
interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User';
  designation?: string;
  division?: string;
  profilePicture?: string;
  status: 'Active' | 'Inactive';
  phoneNumber?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null as string | null,
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
    returnUrl: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role,
    isSuperAdmin: (state) => state.user?.role === 'Super Admin',
    isAdmin: (state) => state.user?.role === 'Admin',
    isManager: (state) => state.user?.role === 'Manager',
    canManageUsers: (state) => {
      const role = state.user?.role;
      return role === 'Super Admin' || role === 'Admin' || role === 'Manager';
    },
    canCreateContent: (state) => {
      const role = state.user?.role;
      return role === 'Super Admin' || role === 'Admin' || role === 'Manager';
    },
    canDeleteData: (state) => {
      const role = state.user?.role;
      return role === 'Super Admin' || role === 'Admin';
    }
  },

  actions: {
    async login(credentials: any) {
      try {
        console.log('Auth store: Attempting login...');
        const response = await apiLogin(credentials);
        console.log('Auth store: Login response received:', response.data);
        
        const { token, user } = response.data;
        
        if (!token || !user) {
          throw new Error('Invalid response from server');
        }
        
        this.token = token;
        this.user = user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Login successful!');
        console.log('Auth store: Login successful, redirecting...');

        // Force a router push to dashboard and replace the current history entry
        
        // Force reload the page to ensure proper state
      } catch (error: any) {
        console.error('Auth store: Login failed:', error);
        
        // Don't show toast here as it's handled in the component
        // Re-throw the error to be caught in the component
        throw error;
      }
    },

    async register(userData: any) {
      try {
        await apiRegister(userData);
        toast.success('Registration successful! Please login.');
      } catch (error: any) {
        console.error('Auth store: Registration failed:', error);
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async fetchUser() {
      if (this.token && !this.user) {
        try {
          const response = await getMe();
          this.user = response.data;
          localStorage.setItem('user', JSON.stringify(this.user));
        } catch (error) {
          // Token might be invalid, so log out
          console.error('Failed to fetch user:', error);
          this.logout();
        }
      }
    },

    // Action to update user data in the store
    updateUserProfile(updatedUser: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    }
  },
});