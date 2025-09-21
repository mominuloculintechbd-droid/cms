const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createSuperAdmin = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use alter: true to avoid dropping tables

    const superAdminEmail = 'superadmin@admin2.com'; // Changed email
    const existingUser = await User.findOne({ where: { email: superAdminEmail } });

    if (existingUser) {
      console.log('Super Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10); // Changed password

    await User.create({
      fullName: 'Super Admin 2', // Changed name for clarity
      email: superAdminEmail,
      password: hashedPassword,
      phoneNumber: '1234567890',
      role: 'Super Admin',
      designation: 'System Administrator',
      division: 'IT',
      status: 'Active'
    });

    console.log('Super Admin user created successfully.');
    console.log('Email: superadmin@admin2.com');
    console.log('Password: 123456');

  } catch (error) {
    console.error('Error creating Super Admin user:', error);
  } finally {
    await sequelize.close();
  }
};

createSuperAdmin();