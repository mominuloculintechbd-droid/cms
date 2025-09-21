
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const verifyPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    const user = await User.findOne({ where: { email: 'superadmin@admin.com' } });

    if (!user) {
      console.log('User superadmin@admin.com not found.');
      return;
    }

    console.log('User found:', user.toJSON());
    console.log('Stored Hashed Password:', user.password);

    const isMatch = await bcrypt.compare('Admin@123', user.password);

    if (isMatch) {
      console.log(`Password 'Admin@123' matches the stored password.`);
    } else {
      console.log(`Password 'Admin@123' DOES NOT match the stored password.`);
    }

  } catch (error) {
    console.error('Error verifying password:', error);
  } finally {
    await sequelize.close();
  }
};

verifyPassword();
