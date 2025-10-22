<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <svg class="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              Telegram Notifications Management
            </h1>
            <p class="mt-2 text-sm text-gray-600">
              Configure Telegram notifications and auto-close behavior for complaint categories
            </p>
          </div>
          <button
            @click="saveAllSettings"
            :disabled="saving"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="!saving" class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Save All Changes
            </span>
            <span v-else class="flex items-center">
              <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium text-gray-700">Quick Actions:</div>
          <div class="flex gap-3">
            <button
              @click="initializeDefaults"
              class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Initialize Defaults
            </button>
            <button
              @click="enableAllNotifications"
              class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              Enable All Notifications
            </button>
            <button
              @click="disableAllNotifications"
              class="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              Disable All Notifications
            </button>
          </div>
        </div>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>

      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <p class="text-sm text-green-800">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <svg class="animate-spin h-12 w-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600">Loading notification settings...</p>
      </div>

      <!-- Settings Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Complaint Category
                </th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Notifications
                </th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Notify When
                </th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Auto-Close
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Auto-Close Reason
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="setting in settings"
                :key="setting.categoryId"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Category Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                      <span class="text-blue-600 font-semibold text-sm">
                        {{ setting.categoryId }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ setting.categoryName }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Telegram Notifications Toggle -->
                <td class="px-6 py-4 text-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="setting.enabled"
                      class="sr-only peer"
                    >
                    <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span class="ml-3 text-sm font-medium" :class="setting.enabled ? 'text-blue-600' : 'text-gray-400'">
                      {{ setting.enabled ? 'ON' : 'OFF' }}
                    </span>
                  </label>
                </td>

                <!-- Notification Timing Dropdown -->
                <td class="px-6 py-4 text-center">
                  <select
                    v-model="setting.notificationTiming"
                    :disabled="!setting.enabled"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="open">On Open Only</option>
                    <option value="close">On Close Only</option>
                    <option value="both">On Both</option>
                  </select>
                </td>

                <!-- Auto-Close Toggle -->
                <td class="px-6 py-4 text-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="setting.autoClose"
                      class="sr-only peer"
                    >
                    <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    <span class="ml-3 text-sm font-medium" :class="setting.autoClose ? 'text-green-600' : 'text-gray-400'">
                      {{ setting.autoClose ? 'Enabled' : 'Disabled' }}
                    </span>
                  </label>
                </td>

                <!-- Auto-Close Reason -->
                <td class="px-6 py-4">
                  <input
                    type="text"
                    v-model="setting.autoCloseReason"
                    :disabled="!setting.autoClose"
                    placeholder="Enter auto-close reason..."
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-blue-800">How it works:</h3>
            <ul class="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Notifications:</strong> When enabled, complaints from this category will send notifications to your Telegram group</li>
              <li><strong>Notify When:</strong> Control when to send notifications:
                <ul class="ml-6 mt-1 space-y-1">
                  <li><strong>On Open Only:</strong> Send notification only when complaint is created</li>
                  <li><strong>On Close Only:</strong> Send notification only when complaint is closed (manual or auto)</li>
                  <li><strong>On Both:</strong> Send notifications both when opened and closed</li>
                </ul>
              </li>
              <li><strong>Auto-Close:</strong> When enabled, complaints from this category will be automatically closed upon creation</li>
              <li><strong>Auto-Close Reason:</strong> Custom message displayed when a complaint is auto-closed (optional)</li>
              <li><strong>Bill Stop Category:</strong> Has special logic - only auto-closes if customer's last bill date is in the current month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

interface NotificationSetting {
  categoryId: number;
  categoryName: string;
  enabled: boolean;
  notificationTiming: 'open' | 'close' | 'both';
  autoClose: boolean;
  autoCloseReason: string | null;
  id: number | null;
}

const settings = ref<NotificationSetting[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const loadSettings = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.get('/telegram-notifications');
    settings.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load notification settings';
    console.error('Error loading settings:', err);
  } finally {
    loading.value = false;
  }
};

const saveAllSettings = async () => {
  try {
    saving.value = true;
    error.value = null;
    successMessage.value = null;

    await api.post('/telegram-notifications/bulk', {
      settings: settings.value.map(s => ({
        categoryId: s.categoryId,
        enabled: s.enabled,
        notificationTiming: s.notificationTiming,
        autoClose: s.autoClose,
        autoCloseReason: s.autoCloseReason
      }))
    });

    successMessage.value = 'All settings saved successfully!';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save settings';
    console.error('Error saving settings:', err);
  } finally {
    saving.value = false;
  }
};

const initializeDefaults = async () => {
  if (!confirm('This will set default settings for specific categories (Balance Inquery, Apps Problem, Information, Bill Stop). Continue?')) {
    return;
  }

  try {
    await api.post('/telegram-notifications/initialize-defaults');
    successMessage.value = 'Default settings initialized successfully!';
    await loadSettings();
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to initialize defaults';
    console.error('Error initializing defaults:', err);
  }
};

const enableAllNotifications = () => {
  settings.value.forEach(s => {
    s.enabled = true;
  });
};

const disableAllNotifications = () => {
  settings.value.forEach(s => {
    s.enabled = false;
  });
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
