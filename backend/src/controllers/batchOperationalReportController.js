'use strict';

const xlsx = require('xlsx');
const { BatchOperationalReport } = require('../models');
const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/database');

const uploadBatchReport = async (req, res) => {
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
      batch_cd: row.BATCH_CD,
      batch_job_stat_flg: row.BATCH_JOB_STAT_FLG,
      start_dttm: new Date((row.START_DTTM - (25567 + 2)) * 86400 * 1000), // Convert Excel date
      end_dttm: new Date((row.END_DTTM - (25567 + 2)) * 86400 * 1000), // Convert Excel date
      batch_thread_cnt: row.BATCH_THREAD_CNT,
      total_duration: row.TOTAL_DURATION,
      total_records: row.TOTAL_RECORDS,
      rps: row.RPS,
      batch_bus_dt: new Date((row.BATCH_BUS_DT - (25567 + 2)) * 86400 * 1000) // Convert Excel date
    }));

    for (const record of recordsToInsert) {
      const [foundRecord, created] = await BatchOperationalReport.findOrCreate({
        where: { batch_cd: record.batch_cd, start_dttm: record.start_dttm },
        defaults: record
      });

      if (!created) {
        // If the record was found, update it
        await foundRecord.update(record);
      }
    }

    res.status(201).send({ message: 'File uploaded and data saved successfully.' });
  } catch (error) {
    console.error('Error uploading batch report:', error);
    res.status(500).send({ message: 'Error uploading file.', error: error.message });
  }
};

const getBatchReport = async (req, res) => {
    try {
        const { batch_bus_dt } = req.query;

        if (!batch_bus_dt) {
            return res.status(400).send({ message: 'batch_bus_dt is required.' });
        }

        const reports = await BatchOperationalReport.findAll({
            where: {
                batch_bus_dt: new Date(batch_bus_dt)
            },
            order: [['start_dttm', 'ASC']]
        });

        for (let i = 0; i < reports.length; i++) {
            if (reports[i].end_dttm === null || reports[i].end_dttm === undefined) {
                if (i + 1 < reports.length) {
                    reports[i].end_dttm = reports[i + 1].start_dttm;
                } else {
                    reports[i].batch_job_stat_flg = 'ERROR';
                }
            }
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching batch report:', error);
        res.status(500).send({ message: 'Error fetching report.', error: error.message });
    }
};

const deleteBatchReport = async (req, res) => {
    try {
        const { batch_bus_dt } = req.query;

        if (!batch_bus_dt) {
            return res.status(400).send({ message: 'batch_bus_dt is required.' });
        }

        await BatchOperationalReport.destroy({
            where: {
                batch_bus_dt: new Date(batch_bus_dt)
            }
        });

        res.status(200).send({ message: 'Batch reports deleted successfully.' });
    } catch (error) {
        console.error('Error deleting batch report:', error);
        res.status(500).send({ message: 'Error deleting report.', error: error.message });
    }
};

const getMonthlyBatchPerformance = async (req, res) => {
    try {
        const { month, year, batch_cd } = req.query;

        if (!month || !year || !batch_cd) {
            return res.status(400).send({ message: 'month, year, and batch_cd are required.' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const performance = await BatchOperationalReport.findAll({
            attributes: [
                'batch_bus_dt',
                [sequelize.fn('sum', sequelize.col('total_records')), 'total_records'],
                [sequelize.fn('avg', sequelize.col('total_duration')), 'avg_duration']
            ],
            where: {
                batch_cd: batch_cd,
                batch_bus_dt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['batch_bus_dt'],
            order: [['batch_bus_dt', 'ASC']]
        });

        res.status(200).json(performance);
    } catch (error) {
        console.error('Error fetching monthly batch performance:', error);
        res.status(500).send({ message: 'Error fetching monthly performance.', error: error.message });
    }
};

module.exports = {
  uploadBatchReport,
  getBatchReport,
  deleteBatchReport,
  getMonthlyBatchPerformance
};
