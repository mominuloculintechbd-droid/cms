const axios = require('axios');

const registerSuperAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      fullName: 'Super Admin 2',
      email: 'superadmin@admin2.com',
      password: '123456',
      phoneNumber: '0987654321',
      role: 'Super Admin',
      designation: 'System Administrator',
      division: 'IT',
      status: 'Active'
    });
    console.log('Super Admin 2 registration successful:', response.data);
  } catch (error) {
    console.error('Error registering Super Admin 2:', error.response?.data || error.message);
  }
};

registerSuperAdmin();