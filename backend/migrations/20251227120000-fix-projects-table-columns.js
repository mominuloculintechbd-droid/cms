'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Projects');

    // Add status column if it doesn't exist
    if (!tableInfo.status) {
      await queryInterface.addColumn('Projects', 'status', {
        type: Sequelize.STRING,
        defaultValue: 'Active',
        allowNull: true,
      });
      console.log('✅ Added status column to Projects');
    }

    // Add startDate column if it doesn't exist
    if (!tableInfo.startDate) {
      await queryInterface.addColumn('Projects', 'startDate', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      console.log('✅ Added startDate column to Projects');
    }

    // Add endDate column if it doesn't exist
    if (!tableInfo.endDate) {
      await queryInterface.addColumn('Projects', 'endDate', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      console.log('✅ Added endDate column to Projects');
    }

    // Add createdBy column if it doesn't exist
    if (!tableInfo.createdBy) {
      await queryInterface.addColumn('Projects', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      console.log('✅ Added createdBy column to Projects');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Projects', 'status');
    await queryInterface.removeColumn('Projects', 'startDate');
    await queryInterface.removeColumn('Projects', 'endDate');
    await queryInterface.removeColumn('Projects', 'createdBy');
  },
};
