'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('Users', {
      email: {
        [Op.in]: ['superadmin@example.com', 'admin@example.com', 'manager@example.com']
      }
    }, {});
    const hashedPassword = await bcrypt.hash('password123', 10); // Use a secure password

    await queryInterface.bulkInsert('Users', [
      {
        fullName: 'Super Admin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'Super Admin',
        designation: 'System Administrator',
        division: 'IT',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin',
        designation: 'Administrator',
        division: 'IT',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Manager User',
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'Manager',
        designation: 'Manager',
        division: 'Operations',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('Users', {
      email: {
        [Op.in]: ['superadmin@example.com', 'admin@example.com', 'manager@example.com']
      }
    }, {});
  }
};