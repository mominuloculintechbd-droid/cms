const xlsx = require('xlsx');
const fs = require('fs');
const { Op } = require('sequelize');
const MeterReading = require('../models/MeterReading');
const Customer = require('../models/Customer');
const LastBillDate = require('../models/LastBillDate');
const PDFDocument = require('pdfkit');
const { sequelize } = require('../models');
const { estimateMissingMonths } = require('../services/estimationService');

const uploadReadings = async (req, res) => {
  const uploadedFiles = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : []);
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.status(400).send('No file uploaded.');
  }

  const transaction = await sequelize.transaction();

  try {
    const expectedHeaders = ['Meter No', 'Value kWh', 'Reading Date'];
    const allReadings = [];

    for (const file of uploadedFiles) {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new Error('One of the uploaded files is empty.');
      }

      const actualHeaders = Object.keys(data[0]);
      if (!expectedHeaders.every(header => actualHeaders.includes(header))) {
        throw new Error(`Invalid headers. Expected headers are: ${expectedHeaders.join(', ')}`);
      }

      for (const row of data) {
        const excelDate = row['Reading Date'];
        const readingDate = typeof excelDate === 'number'
          ? new Date((excelDate - (25567 + 2)) * 86400 * 1000)
          : new Date(excelDate);
        allReadings.push({
          meter_no: row['Meter No'],
          value_kwh: row['Value kWh'],
          reading_date: readingDate,
        });
      }
    }

    if (allReadings.length === 0) {
      throw new Error('No valid rows found in uploaded files.');
    }

    await MeterReading.bulkCreate(allReadings, { transaction });

    await transaction.commit();

    // Cleanup
    for (const file of uploadedFiles) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }

    res.status(201).send({ message: 'Files uploaded and data stored successfully.' });
  } catch (error) {
    await transaction.rollback();
    // Cleanup on error
    for (const file of uploadedFiles) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
    console.error(error);
    res.status(500).send(error.message || 'An error occurred while processing the files.');
  }
};

const getReadingsByMeterNo = async (req, res) => {
  try {
    const { meterNo } = req.params;
    const readings = await MeterReading.findAll({
      where: { meter_no: meterNo },
      order: [['reading_date', 'DESC']],
    });

    const customer = await Customer.findOne({ where: { METER_NO: meterNo } });

    let analysis = null;
    let customerInfo = null;
    if (customer) {
      customerInfo = {
        NOCS_NAME: customer.NOCS_NAME,
        CUSTOMER_NUM: customer.CUSTOMER_NUM,
        METER_NO: customer.METER_NO,
        TARIFF: customer.TARIFF,
        CONN_DATE: customer.CONN_DATE,
      };

      // Determine last bill date and bill status
      const lastBill = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
      const lastBillDate = lastBill ? lastBill.LAST_BILL_DATE : null;
      const now = new Date();
      let billStatus = 'Unknown';
      if (lastBillDate) {
        const lb = new Date(lastBillDate);
        billStatus = (lb.getMonth() === now.getMonth() && lb.getFullYear() === now.getFullYear()) ? 'Bill Start' : 'Bill Stop';
      } else {
        billStatus = 'Bill Not Generated';
      }

      // Months to analyze: from month after last bill to current month (inclusive)
      const monthsToAnalyze = [];
      if (lastBillDate) {
        let cursor = new Date(lastBillDate);
        cursor.setDate(1);
        cursor.setMonth(cursor.getMonth() + 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        while (cursor <= end) {
          monthsToAnalyze.push({
            key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
            label: cursor.toLocaleString('default', { month: 'long', year: 'numeric' })
          });
          cursor.setMonth(cursor.getMonth() + 1);
        }
      } else if (customer.CONN_DATE) {
        let cursor = new Date(customer.CONN_DATE);
        cursor.setDate(1);
        cursor.setMonth(cursor.getMonth() + 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        while (cursor <= end) {
          monthsToAnalyze.push({
            key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
            label: cursor.toLocaleString('default', { month: 'long', year: 'numeric' })
          });
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }

      const readingMonthKeys = new Set(readings.map(r => {
        const d = new Date(r.reading_date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      }));

      const coveredMonths = [];
      const missingMonths = [];
      for (const m of monthsToAnalyze) {
        if (readingMonthKeys.has(m.key)) coveredMonths.push(m.label);
        else missingMonths.push(m.label);
      }

      analysis = {
        CUSTOMER_NUM: customer.CUSTOMER_NUM,
        NOCS_NAME: customer.NOCS_NAME,
        METER_NO: customer.METER_NO,
        TARIFF: customer.TARIFF,
        CONN_DATE: customer.CONN_DATE,
        LAST_BILL_DATE: lastBillDate,
        BILL_STATUS: billStatus,
        missingMonths,
        coveredMonths,
      };
    }

    res.status(200).json({ readings, analysis, customer: customerInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the readings.');
  }
};

const getReadingsInBulk = async (req, res) => {
  try {
    const { meterNos } = req.body;
    if (!meterNos || !Array.isArray(meterNos)) {
      return res.status(400).send('Invalid request body. Expected an array of meter numbers.');
    }

    const results = [];
    for (const meterNo of meterNos) {
      const readings = await MeterReading.findAll({
        where: { meter_no: meterNo },
        order: [['reading_date', 'DESC']],
      });

      const customer = await Customer.findOne({ where: { METER_NO: meterNo } });

      let analysis = null;
      let customerInfo = null;
      if (customer) {
        customerInfo = {
          NOCS_NAME: customer.NOCS_NAME,
          CUSTOMER_NUM: customer.CUSTOMER_NUM,
          METER_NO: customer.METER_NO,
          TARIFF: customer.TARIFF,
          CONN_DATE: customer.CONN_DATE,
        };

        const lastBill = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
        const lastBillDate = lastBill ? lastBill.LAST_BILL_DATE : null;
        const now = new Date();
        let billStatus = 'Unknown';
        if (lastBillDate) {
          const lb = new Date(lastBillDate);
          billStatus = (lb.getMonth() === now.getMonth() && lb.getFullYear() === now.getFullYear()) ? 'Bill Start' : 'Bill Stop';
        } else {
          billStatus = 'Bill Not Generated';
        }

        const monthsToAnalyze = [];
        if (lastBillDate) {
          let cursor = new Date(lastBillDate);
          cursor.setDate(1);
          cursor.setMonth(cursor.getMonth() + 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 1);
          while (cursor <= end) {
            monthsToAnalyze.push({
              key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
              label: cursor.toLocaleString('default', { month: 'long', year: 'numeric' })
            });
            cursor.setMonth(cursor.getMonth() + 1);
          }
        }

        const readingMonthKeys = new Set(readings.map(r => {
          const d = new Date(r.reading_date);
          return `${d.getFullYear()}-${d.getMonth()}`;
        }));

        const coveredMonths = [];
        const missingMonths = [];
        for (const m of monthsToAnalyze) {
          if (readingMonthKeys.has(m.key)) coveredMonths.push(m.label);
          else missingMonths.push(m.label);
        }

        analysis = {
          CUSTOMER_NUM: customer.CUSTOMER_NUM,
          NOCS_NAME: customer.NOCS_NAME,
          METER_NO: customer.METER_NO,
          TARIFF: customer.TARIFF,
          CONN_DATE: customer.CONN_DATE,
          LAST_BILL_DATE: lastBillDate,
          BILL_STATUS: billStatus,
          missingMonths,
          coveredMonths,
        };
      }
      results.push({ meter_no: meterNo, readings, analysis, customer: customerInfo });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the readings.');
  }
};

const downloadReadingsAnalysis = async (req, res) => {
  try {
    const { meterNos, format } = req.body;
    if (!meterNos || !Array.isArray(meterNos)) {
      return res.status(400).send('Invalid request body. Expected an array of meter numbers.');
    }
    if (!format || !['xlsx', 'pdf'].includes(format)) {
        return res.status(400).send('Invalid request body. Expected format to be xlsx or pdf.');
    }

    const flatData = [];
    for (const meterNo of meterNos) {
      const readings = await MeterReading.findAll({
        where: { meter_no: meterNo },
        order: [['reading_date', 'DESC']],
      });

      const customer = await Customer.findOne({ where: { METER_NO: meterNo } });

      let analysis = null;
      if (customer && customer.CONN_DATE) {
        const existingReadings = new Set(readings.map(r => {
          const d = new Date(r.reading_date);
          return `${d.getFullYear()}-${d.getMonth()}`;
        }));

        const missingMonths = [];
        let currentDate = new Date(customer.CONN_DATE);
        currentDate.setMonth(currentDate.getMonth() + 1);
        const today = new Date();

        while (currentDate <= today) {
          const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
          if (!existingReadings.has(monthKey)) {
            missingMonths.push(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        analysis = {
          CUSTOMER_NUM: customer.CUSTOMER_NUM,
          InstallDate: customer.CONN_DATE,
          TARIFF: customer.TARIFF,
          MissingReadings: missingMonths.length > 0 ? `Missing readings for: ${missingMonths.join(', ')}` : 'No missing readings',
        };
      }

      if (readings.length > 0) {
        for (const reading of readings) {
            flatData.push({
                'Meter Number': meterNo,
                'Customer Number': analysis ? analysis.CUSTOMER_NUM : '',
                'Install Date': analysis ? new Date(analysis.InstallDate).toLocaleDateString() : '',
                'Tariff': analysis ? analysis.TARIFF : '',
                'Missing Months': analysis ? analysis.MissingReadings : '',
                'Reading Date': new Date(reading.reading_date).toLocaleDateString(),
                'Reading Value (kWh)': reading.value_kwh,
            });
        }
      } else if (analysis) {
        flatData.push({
            'Meter Number': meterNo,
            'Customer Number': analysis.CUSTOMER_NUM,
            'Install Date': new Date(analysis.InstallDate).toLocaleDateString(),
            'Tariff': analysis.TARIFF,
            'Missing Months': analysis.MissingReadings,
            'Reading Date': 'N/A',
            'Reading Value (kWh)': 'N/A',
        });
      }
    }

    if (format === 'xlsx') {
        const worksheet = xlsx.utils.json_to_sheet(flatData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "ReadingsAnalysis");
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename=readings_analysis.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } else if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Disposition', 'attachment; filename=readings_analysis.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Readings Analysis Report', { align: 'center' });
        doc.moveDown();

        const tableTop = doc.y;
        const item = flatData[0];
        const headers = Object.keys(item);
        const colWidths = [80, 80, 60, 50, 100, 60, 60];

        function generateTableRow(y, rowData) {
            doc.fontSize(8);
            rowData.forEach((cell, i) => {
                doc.text(cell, 30 + i * 85, y, { width: colWidths[i], align: 'left' });
            });
            doc.moveTo(30, y + 15).lineTo(570, y + 15).stroke();
        }

        doc.fontSize(10);
        headers.forEach((header, i) => {
            doc.text(header, 30 + i * 85, tableTop, { width: colWidths[i], align: 'left' });
        });
        doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();

        let y = tableTop + 20;
        flatData.forEach(item => {
            const row = Object.values(item);
            generateTableRow(y, row);
            y += 20;
            if (y > 750) {
                doc.addPage();
                y = 50;
            }
        });

        doc.end();
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating the download.');
  }
};

const deleteAllReadings = async (req, res) => {
  try {
    await MeterReading.destroy({ where: {} });
    res.status(200).json({ message: 'All billing profile data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting billing profile data:', error);
    res.status(500).send('An error occurred while deleting billing profile data.');
  }
};

/**
 * Calculate estimates for missing months (doesn't save to DB)
 */
const calculateEstimates = async (req, res) => {
  try {
    const { meterNo } = req.params;

    // Get all readings for this meter
    const readings = await MeterReading.findAll({
      where: {
        meter_no: meterNo,
        is_estimated: false  // Only use actual readings for estimation
      },
      order: [['reading_date', 'ASC']]
    });

    // Get customer info
    const customer = await Customer.findOne({ where: { METER_NO: meterNo } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found for this meter number' });
    }

    // Get last bill date
    const lastBill = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
    const lastBillDate = lastBill ? lastBill.LAST_BILL_DATE : customer.CONN_DATE;

    if (!lastBillDate) {
      return res.status(400).json({ error: 'No last bill date or connection date found' });
    }

    // Calculate missing months
    const now = new Date();
    const monthsToAnalyze = [];
    let cursor = new Date(lastBillDate);
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() + 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    while (cursor <= end) {
      monthsToAnalyze.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        label: cursor.toLocaleString('default', { month: 'long', year: 'numeric' }),
        date: new Date(cursor)
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Check which months have readings
    const readingMonthKeys = new Set(readings.map(r => {
      const d = new Date(r.reading_date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));

    const missingMonthKeys = monthsToAnalyze
      .filter(m => !readingMonthKeys.has(m.key))
      .map(m => m.key);

    if (missingMonthKeys.length === 0) {
      return res.json({
        meter_no: meterNo,
        message: 'No missing months to estimate',
        missing_months: [],
        estimates: []
      });
    }

    // Calculate estimates
    const estimates = estimateMissingMonths(readings, missingMonthKeys, lastBillDate);

    // Add human-readable month labels to estimates
    const estimatesWithLabels = estimates.map(est => {
      const [year, month] = est.month.split('-').map(Number);
      const date = new Date(year, month, 1); // 1st of month
      return {
        ...est,
        month_label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        reading_date: new Date(year, month, 1).toISOString() // For consistency
      };
    });

    res.json({
      meter_no: meterNo,
      last_bill_date: lastBillDate,
      missing_months: missingMonthKeys,
      estimates: estimatesWithLabels,
      total_estimated_kwh: estimates.reduce((sum, est) => sum + est.estimated_kwh, 0)
    });

  } catch (error) {
    console.error('Error calculating estimates:', error);
    res.status(500).json({ error: 'Failed to calculate estimates', details: error.message });
  }
};

/**
 * Save estimates to database
 */
const saveEstimates = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { meter_no, estimates } = req.body;

    if (!meter_no || !estimates || !Array.isArray(estimates)) {
      return res.status(400).json({ error: 'Invalid request body. Expected meter_no and estimates array.' });
    }

    // Prepare records for bulk insert
    const records = estimates.map(est => {
      const [year, month] = est.month.split('-').map(Number);
      return {
        meter_no: meter_no,
        reading_date: new Date(year, month, 1), // Use 1st of month
        value_kwh: est.estimated_kwh,
        is_estimated: true,
        estimation_method: est.method,
        estimated_at: new Date()
      };
    });

    // Check for duplicates
    for (const record of records) {
      const existing = await MeterReading.findOne({
        where: {
          meter_no: record.meter_no,
          reading_date: record.reading_date
        },
        transaction
      });

      if (existing) {
        // Update existing record
        await existing.update({
          value_kwh: record.value_kwh,
          is_estimated: record.is_estimated,
          estimation_method: record.estimation_method,
          estimated_at: record.estimated_at
        }, { transaction });
      } else {
        // Insert new record
        await MeterReading.create(record, { transaction });
      }
    }

    await transaction.commit();

    res.json({
      message: 'Estimates saved successfully',
      count: records.length
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error saving estimates:', error);
    res.status(500).json({ error: 'Failed to save estimates', details: error.message });
  }
};

/**
 * Get covered months (actual + estimated readings)
 */
const getCoveredMonths = async (req, res) => {
  try {
    const { meterNo } = req.params;

    // Get all readings (actual + estimated)
    const readings = await MeterReading.findAll({
      where: { meter_no: meterNo },
      order: [['reading_date', 'DESC']],
    });

    const customer = await Customer.findOne({ where: { METER_NO: meterNo } });

    // Get analysis including covered months
    let analysis = null;
    if (customer) {
      const lastBill = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
      const lastBillDate = lastBill ? lastBill.LAST_BILL_DATE : null;
      const now = new Date();

      const monthsToAnalyze = [];
      if (lastBillDate) {
        let cursor = new Date(lastBillDate);
        cursor.setDate(1);
        cursor.setMonth(cursor.getMonth() + 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        while (cursor <= end) {
          monthsToAnalyze.push({
            key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
            label: cursor.toLocaleString('default', { month: 'long', year: 'numeric' })
          });
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }

      const readingMonthKeys = new Set(readings.map(r => {
        const d = new Date(r.reading_date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      }));

      const coveredMonths = monthsToAnalyze
        .filter(m => readingMonthKeys.has(m.key))
        .map(m => m.label);

      const missingMonths = monthsToAnalyze
        .filter(m => !readingMonthKeys.has(m.key))
        .map(m => m.label);

      analysis = {
        LAST_BILL_DATE: lastBillDate,
        coveredMonths,
        missingMonths,
        coverage_percentage: monthsToAnalyze.length > 0
          ? Math.round((coveredMonths.length / monthsToAnalyze.length) * 100)
          : 0
      };
    }

    // Filter to show only covered months
    const coveredReadings = readings.filter(r => {
      const d = new Date(r.reading_date);
      const monthLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      return analysis?.coveredMonths.includes(monthLabel);
    });

    res.json({
      meter_no: meterNo,
      total_readings: coveredReadings.length,
      actual_readings: coveredReadings.filter(r => !r.is_estimated).length,
      estimated_readings: coveredReadings.filter(r => r.is_estimated).length,
      readings: coveredReadings,
      analysis
    });

  } catch (error) {
    console.error('Error getting covered months:', error);
    res.status(500).json({ error: 'Failed to get covered months', details: error.message });
  }
};

module.exports = {
  uploadReadings,
  getReadingsByMeterNo,
  getReadingsInBulk,
  downloadReadingsAnalysis,
  deleteAllReadings,
  calculateEstimates,
  saveEstimates,
  getCoveredMonths,
};
