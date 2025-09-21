<template>
  <div class="container py-4">
    <h1 class="mb-3">SOP: Configure API and Socket URLs</h1>
    <p class="text-muted mb-4">
      This SOP explains how the app switches between localhost and the real server, and how to override via environment variables.
    </p>
    <button class="btn btn-primary" @click="downloadPdf">Download SOP (PDF)</button>
    <div class="mt-4">
      <h5>Summary</h5>
      <ul>
        <li>Central config in <code>src/config.ts</code> picks URLs based on environment.</li>
        <li>Development defaults to <code>http://localhost:3000</code>.</li>
        <li>Production defaults to <code>http://192.168.10.109:3000</code>.</li>
        <li>Override with <code>VITE_API_ORIGIN</code>, <code>VITE_API_URL</code>, <code>VITE_SOCKET_URL</code>.</li>
      </ul>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'

const downloadPdf = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const left = 48
  let top = 48
  const lineHeight = 20

  const write = (text: string, bold = false) => {
    if (bold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    const lines = doc.splitTextToSize(text, 515)
    lines.forEach((line: string) => {
      doc.text(line, left, top)
      top += lineHeight
    })
    top += 6
  }

  write('SOP: Configure API and Socket URLs', true)
  write('')

  write('Overview', true)
  write('The frontend uses a central config (src/config.ts) to determine the API and Socket.IO base URLs. In development it defaults to http://localhost:3000; in production it defaults to http://192.168.10.109:3000. You can override with environment variables.')

  write('Config Behavior', true)
  write('- In development (npm run dev): API_ORIGIN = http://localhost:3000, API_URL = http://localhost:3000/api, SOCKET_URL = http://localhost:3000')
  write('- In production (npm run build): API_ORIGIN = http://192.168.10.109:3000, API_URL = http://192.168.10.109:3000/api, SOCKET_URL = http://192.168.10.109:3000')

  write('Environment Overrides', true)
  write('Use the following variables in frontend/.env.local or frontend/.env.production:')
  write('VITE_API_ORIGIN=http://host:port  # e.g., http://localhost:3000 or http://192.168.10.109:3000')
  write('VITE_API_URL=http://host:port/api  # Optional explicit REST URL override')
  write('VITE_SOCKET_URL=http://host:port   # Optional explicit Socket.IO URL override')

  write('Where Used', true)
  write('src/api.ts uses API_URL for REST. src/main.ts uses SOCKET_URL for WebSocket connections.')

  doc.save('SOP-API-and-Socket-Config.pdf')
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>


