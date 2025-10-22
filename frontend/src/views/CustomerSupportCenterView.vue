<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Customer Support Center</h1>

    <!-- Create Complaint Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold mb-4">Create New Complaint</h2>
      <form @submit.prevent="createComplaint">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="complaintCategory" class="block text-sm font-medium text-gray-700">Complaint Category</label>
            <select id="complaintCategory" v-model="newComplaint.complaintCategoryId" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option v-for="category in complaintCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </div>
          <div>
            <label for="customerId" class="block text-sm font-medium text-gray-700">Customer ID / Meter Number</label>
            <input type="text" id="customerId" v-model="customerIdentifier" @blur="fetchCustomerDetails" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter 8-digit Customer ID">
          </div>
        </div>

        <div v-if="customerDetails" class="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 class="font-semibold text-lg mb-2">Customer Information</h3>
          <pre class="text-sm">{{ formatCustomerDetails(customerDetails) }}</pre>
        </div>

        <div class="mt-6">
          <label for="issueDescription" class="block text-sm font-medium text-gray-700">Issue Description</label>
          <textarea id="issueDescription" v-model="newComplaint.issueDescription" rows="4" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>

        <div class="mt-6">
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" v-model="newComplaint.status" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option>Open</option>
            <option>In Progress</option>
            <option>Close</option>
          </select>
        </div>

        <div class="mt-6 flex justify-end">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Create Complaint</button>
        </div>
      </form>
    </div>

    <!-- View Complaints -->
    <div>
      <h2 class="text-xl font-semibold mb-4">All Complaints</h2>
      <!-- Summary -->
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div class="bg-blue-100 p-4 rounded-lg text-center">
          <p class="text-sm text-blue-800">Total Cases</p>
          <p class="text-2xl font-bold">{{ complaintStats.total }}</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg text-center">
          <p class="text-sm text-yellow-800">Open</p>
          <p class="text-2xl font-bold">{{ complaintStats.open }}</p>
        </div>
        <div class="bg-green-100 p-4 rounded-lg text-center">
          <p class="text-sm text-green-800">In Progress</p>
          <p class="text-2xl font-bold">{{ complaintStats.inProgress }}</p>
        </div>
        <div class="bg-gray-200 p-4 rounded-lg text-center">
          <p class="text-sm text-gray-800">Closed</p>
          <p class="text-2xl font-bold">{{ complaintStats.closed }}</p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="flex justify-between items-center mb-4">
        <input type="text" v-model="searchQuery" placeholder="Search by Customer, Meter, or Issue..." class="p-2 border rounded-md w-1/3">
        <select v-model="filterCategory" class="p-2 border rounded-md">
          <option value="">All Categories</option>
          <option v-for="category in complaintCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>

      <!-- Complaints Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter Number</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Received</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="complaint in complaints" :key="complaint.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ complaint.customerId }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ complaint.meterNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ complaint.agent.firstName }} {{ complaint.agent.lastName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(complaint.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ complaint.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ new Date(complaint.createdAt).toLocaleDateString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="viewComplaint(complaint)" class="text-indigo-600 hover:text-indigo-900">View</button>
                <button @click="editComplaint(complaint)" class="text-yellow-600 hover:text-yellow-900 ml-4">Edit</button>
                <button v-if="isAdmin" @click="deleteComplaint(complaint.id)" class="text-red-600 hover:text-red-900 ml-4">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

interface ComplaintCategory {
  id: number;
  name: string;
}

interface Complaint {
  id: number;
  customerId: string;
  meterNumber: string;
  issueDescription: string;
  status: string;
  createdAt: string;
  agent: {
    firstName: string;
    lastName: string;
  };
}

const authStore = useAuthStore();

const complaintCategories = ref<ComplaintCategory[]>([]);
const complaints = ref<Complaint[]>([]);
const newComplaint = ref({
  complaintCategoryId: '',
  customerId: '',
  issueDescription: '',
  status: 'Open',
});
const customerIdentifier = ref('');
const customerDetails = ref<any>(null);
const searchQuery = ref('');
const filterCategory = ref('');

const isAdmin = computed(() => authStore.user?.role === 'Admin');

const complaintStats = computed(() => {
  const stats = {
    total: complaints.value.length,
    open: 0,
    inProgress: 0,
    closed: 0,
  };
  complaints.value.forEach(c => {
    if (c.status === 'Open') stats.open++;
    else if (c.status === 'In Progress') stats.inProgress++;
    else if (c.status === 'Close') stats.closed++;
  });
  return stats;
});

const fetchComplaintCategories = async () => {
  try {
    const response = await api.get('/complaint-categories');
    complaintCategories.value = response.data;
  } catch (error) {
    console.error('Error fetching complaint categories:', error);
  }
};

const fetchComplaints = async () => {
  try {
    const params = {
      search: searchQuery.value,
      category: filterCategory.value,
    };
    const response = await api.get('/complaints', { params });
    complaints.value = response.data.rows;
  } catch (error) {
    console.error('Error fetching complaints:', error);
  }
};

const fetchCustomerDetails = async () => {
  if (customerIdentifier.value.length >= 8) {
    try {
      // Reset details
      customerDetails.value = null;
      newComplaint.value.issueDescription = '';

      const response = await api.get(`/customers/${customerIdentifier.value}`);
      customerDetails.value = response.data;
      newComplaint.value.customerId = customerDetails.value!.CUSTOMER_NUM;
      
      // Pre-fill issue description
      newComplaint.value.issueDescription = formatCustomerDetails(customerDetails.value);

    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Customer not found.');
    }
  }
};

const formatCustomerDetails = (details: any) => {
    if (!details) return '';
    return `Customer ID: ${details.CUSTOMER_NUM}\nMeter Number: ${details.METER_NO}\nConnection Date: ${new Date(details.CONN_DATE).toLocaleDateString()}\nCustomer Name: ${details.CUSTOMER_NAME}\nAddress: ${details.ADDRESS}\nTariff: ${details.TARIFF}\nLast Bill Date: ${details.LAST_BILL_DATE ? new Date(details.LAST_BILL_DATE).toLocaleDateString() : 'N/A'}`;
};

const createComplaint = async () => {
  try {
    await api.post('/complaints', newComplaint.value);
    alert('Complaint created successfully!');
    // Reset form
    newComplaint.value = { complaintCategoryId: '', customerId: '', issueDescription: '', status: 'Open' };
    customerIdentifier.value = '';
    customerDetails.value = null;
    // Refresh complaints list
    fetchComplaints();
  } catch (error) {
    console.error('Error creating complaint:', error);
    alert('Failed to create complaint.');
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open': return 'bg-yellow-100 text-yellow-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Close': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const viewComplaint = (complaint: Complaint) => {
  // Implement view logic, e.g., show a modal with details
  alert(JSON.stringify(complaint, null, 2));
};

const editComplaint = (complaint: Complaint) => {
  // Implement edit logic, e.g., navigate to an edit page or show a modal
  alert('Edit functionality not implemented yet.');
};

const deleteComplaint = async (id: number) => {
  if (confirm('Are you sure you want to delete this complaint?')) {
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints(); // Refresh list
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint.');
    }
  }
};

onMounted(() => {
  fetchComplaintCategories();
  fetchComplaints();
});

watch([searchQuery, filterCategory], () => {
  fetchComplaints();
});

</script>

<style scoped>
/* You can add additional styles here if needed */
</style>