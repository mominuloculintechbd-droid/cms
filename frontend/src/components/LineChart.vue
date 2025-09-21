<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const chartData = computed(() => ({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Data One',
      backgroundColor: '#f87979',
      borderColor: '#f87979',
      data: [40, 39, 10, 40, 39, 80, 40],
      tension: 0.3,
    },
    {
      label: 'Data Two',
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
      data: [20, 50, 30, 60, 20, 70, 50],
      tension: 0.3,
    },
  ],
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'var(--text-primary)', // Use CSS variable for legend text color
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'var(--text-secondary)', // Use CSS variable for x-axis tick color
      },
      grid: {
        color: 'var(--color-border)', // Use CSS variable for grid line color
      },
    },
    y: {
      ticks: {
        color: 'var(--text-secondary)', // Use CSS variable for y-axis tick color
      },
      grid: {
        color: 'var(--color-border)', // Use CSS variable for grid line color
      },
    },
  },
});
</script>

<style scoped>
.chart-container {
  height: 300px; /* Adjust height as needed */
  width: 100%;
}
</style>