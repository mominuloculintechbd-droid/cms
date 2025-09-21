const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OTBL CMS Backend Server...\n');

// First, create super admin if needed
console.log('📋 Creating Super Admin user...');
const createAdmin = spawn('node', ['createSuperAdmin.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

createAdmin.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Super Admin user ready\n');
    
    // Then start the server
    console.log('🌐 Starting server...');
    const server = spawn('node', ['src/app.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    server.on('close', (code) => {
      console.log(`\n🛑 Server stopped with code ${code}`);
    });

    server.on('error', (err) => {
      console.error('❌ Failed to start server:', err);
    });
  } else {
    console.log('⚠️ Super Admin creation completed (may already exist)\n');
    
    // Start server anyway
    console.log('🌐 Starting server...');
    const server = spawn('node', ['src/app.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    server.on('close', (code) => {
      console.log(`\n🛑 Server stopped with code ${code}`);
    });

    server.on('error', (err) => {
      console.error('❌ Failed to start server:', err);
    });
  }
});

createAdmin.on('error', (err) => {
  console.error('❌ Failed to create super admin:', err);
});
