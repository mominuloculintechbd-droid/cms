'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('batch_operational_report', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batch_cd: {
        type: Sequelize.STRING
      },
      batch_job_stat_flg: {
        type: Sequelize.STRING
      },
      start_dttm: {
        type: Sequelize.DATE
      },
      end_dttm: {
        type: Sequelize.DATE
      },
      batch_thread_cnt: {
        type: Sequelize.INTEGER
      },
      total_duration: {
        type: Sequelize.BIGINT
      },
      total_records: {
        type: Sequelize.BIGINT
      },
      rps: {
        type: Sequelize.FLOAT
      },
      batch_bus_dt: {
        type: Sequelize.DATEONLY
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('batch_operational_report', {
      fields: ['batch_cd', 'batch_bus_dt'],
      type: 'unique',
      name: 'unique_batch_cd_bus_dt'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('batch_operational_report');
  }
};
