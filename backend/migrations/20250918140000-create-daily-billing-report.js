'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_billing_report', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      report_date: {
        type: Sequelize.DATEONLY,
        unique: true
      },
      active_customers: {
        type: Sequelize.INTEGER
      },
      billed_customers: {
        type: Sequelize.INTEGER
      },
      unbilled_customers: {
        type: Sequelize.INTEGER
      },
      percent_unbilled: {
        type: Sequelize.FLOAT
      },
      kwh_reads_received: {
        type: Sequelize.INTEGER
      },
      percent_reads_received: {
        type: Sequelize.FLOAT
      },
      percent_billed: {
        type: Sequelize.FLOAT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('daily_billing_report');
  }
};
