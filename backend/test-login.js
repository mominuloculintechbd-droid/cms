const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...\n');
    
    const credentials = {
      email: 'superadmin@admin2.com',
      password: '123456'
    };
    
    console.log('📤 Sending login request:', credentials);
    
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Login successful!');
    console.log('📊 Response status:', response.status);
    console.log('👤 User data:', {
      id: response.data.user.id,
      fullName: response.data.user.fullName,
      email: response.data.user.email,
      role: response.data.user.role
    });
    console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Login test failed:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Message:', error.response.data?.message || 'Unknown error');
      console.error('📄 Full response:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Network error - Server might not be running');
      console.error('💡 Make sure to start the server with: node start-server.js');
    } else {
      console.error('⚠️ Error:', error.message);
    }
  }
};

// Check if server is running first
const checkServer = async () => {
  try {
    await axios.get('http://localhost:3000/', { timeout: 2000 });
    console.log('✅ Server is running\n');
    await testLogin();
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('💡 Please start the server first with: node start-server.js');
    console.error('💡 Or manually with: node src/app.js');
  }
};

checkServer();
