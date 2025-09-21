'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old unique constraint
    await queryInterface.removeConstraint('batch_operational_report', 'unique_batch_cd_bus_dt');

    // Add the new unique constraint
    await queryInterface.addConstraint('batch_operational_report', {
      fields: ['batch_cd', 'start_dttm'],
      type: 'unique',
      name: 'unique_batch_cd_start_dttm'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes
    await queryInterface.removeConstraint('batch_operational_report', 'unique_batch_cd_start_dttm');

    await queryInterface.addConstraint('batch_operational_report', {
      fields: ['batch_cd', 'batch_bus_dt'],
      type: 'unique',
      name: 'unique_batch_cd_bus_dt'
    });
  }
};
