<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type { ChartData } from 'chart.js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  chartData: {
    type: Object as () => ChartData<'bar'>,
    required: true,
  },
  multiAxis: {
    type: Boolean,
    default: false,
  },
});

import type { ChartOptions } from 'chart.js';

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-secondary)',
        },
        grid: {
          color: 'var(--color-border)',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: 'var(--text-secondary)',
        },
        grid: {
          color: 'var(--color-border)',
        },
      },
    },
  };

  if (props.multiAxis) {
    options.scales.y1 = {
      type: 'linear',
      display: true,
      position: 'right',
      ticks: {
        color: 'var(--text-secondary)',
      },
      grid: {
        drawOnChartArea: false,
      },
    };
  }

  return options;
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
