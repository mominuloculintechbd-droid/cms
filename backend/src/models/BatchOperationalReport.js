'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BatchOperationalReport extends Model {
    static associate(models) {
      // define association here
    }
  }

  BatchOperationalReport.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    batch_cd: {
      type: DataTypes.STRING
    },
    batch_job_stat_flg: {
      type: DataTypes.STRING
    },
    start_dttm: {
      type: DataTypes.DATE
    },
    end_dttm: {
      type: DataTypes.DATE
    },
    batch_thread_cnt: {
      type: DataTypes.INTEGER
    },
    total_duration: {
      type: DataTypes.BIGINT
    },
    total_records: {
      type: DataTypes.BIGINT
    },
    rps: {
      type: DataTypes.FLOAT
    },
    batch_bus_dt: {
      type: DataTypes.DATEONLY
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BatchOperationalReport',
    tableName: 'batch_operational_report',
    timestamps: false // 'created_at' is handled by the database default
  });

  return BatchOperationalReport;
};
