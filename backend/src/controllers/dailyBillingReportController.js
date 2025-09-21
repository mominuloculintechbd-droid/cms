'use strict';

const xlsx = require('xlsx');
const { DailyBillingReport } = require('../models');
const { Op } = require('sequelize');

const uploadBillingReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
        return res.status(400).send('Excel file is empty.');
    }

    const recordsToInsert = data.map(row => ({
      report_date: new Date((row.REPORT_DATE - (25567 + 2)) * 86400 * 1000),
      active_customers: row.ACTIVE_CUSTOMERS,
      billed_customers: row.BILLED_CUSTOMERS,
      unbilled_customers: row.UNBILLED_CUSTOMERS,
      percent_unbilled: row.PERCENT_UNBILLED,
      kwh_reads_received: row.KWH_READS_RECEIVED,
      percent_reads_received: row.PERCENT_READS_RECEIVED,
      percent_billed: row.PERCENT_BILLED
    }));

    for (const record of recordsToInsert) {
      await DailyBillingReport.upsert(record);
    }

    res.status(201).send({ message: 'File uploaded and data saved successfully.' });
  } catch (error) {
    console.error('Error uploading billing report:', error);
    res.status(500).send({ message: 'Error uploading file.', error: error.message });
  }
};

const getBillingReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).send({ message: 'month and year are required.' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const reports = await DailyBillingReport.findAll({
            where: {
                report_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['report_date', 'ASC']]
        });

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching billing report:', error);
        res.status(500).send({ message: 'Error fetching report.', error: error.message });
    }
};

module.exports = {
  uploadBillingReport,
  getBillingReport
};
