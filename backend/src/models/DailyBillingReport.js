'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DailyBillingReport extends Model {}

  DailyBillingReport.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    report_date: {
      type: DataTypes.DATEONLY,
      unique: true
    },
    active_customers: {
      type: DataTypes.INTEGER
    },
    billed_customers: {
      type: DataTypes.INTEGER
    },
    unbilled_customers: {
      type: DataTypes.INTEGER
    },
    percent_unbilled: {
      type: DataTypes.FLOAT
    },
    kwh_reads_received: {
      type: DataTypes.INTEGER
    },
    percent_reads_received: {
      type: DataTypes.FLOAT
    },
    percent_billed: {
      type: DataTypes.FLOAT
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'DailyBillingReport',
    tableName: 'daily_billing_report',
    timestamps: false
  });

  return DailyBillingReport;
};
