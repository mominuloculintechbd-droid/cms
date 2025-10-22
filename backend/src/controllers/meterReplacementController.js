const { Customer, LastBillDate } = require('../models');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Helpers
const determineHesByMeterPrefix = (meterNumber = '') => {
  const value = String(meterNumber || '');
  if (value.startsWith('90') || value.startsWith('91')) return 'L+G';
  if (value.startsWith('80') || value.startsWith('81')) return 'WASION';
  if (value.startsWith('70') || value.startsWith('71')) return 'SHENZHEN';
  return 'Unknown HES';
};

const determinePhaseByMeterPrefix = (meterNumber = '') => {
  const value = String(meterNumber || '');
  if (value.startsWith('90') || value.startsWith('80') || value.startsWith('70')) return 'E-1P';
  if (value.startsWith('91') || value.startsWith('81') || value.startsWith('71')) return 'E-3P';
  return ''; // Fallback
};

const determineModelByPhaseAndHes = (phase = '', hes = '') => {
  // Extend mapping as needed
  if (phase === 'E-1P' && hes === 'L+G') return 'SM110E';
  if (phase === 'E-3P' && hes === 'L+G') return 'SM310E';
  if (phase === 'E-1P' && hes === 'WASION') return 'DDSD101';
  if (phase === 'E-3P' && hes === 'WASION') return 'DTSY341';
  if (phase === 'E-1P' && hes === 'SHENZHEN') return 'DDS26D';
  if (phase === 'E-3P' && hes === 'SHENZHEN') return 'DTS27';
  // TODO: Add mappings for [E-1P, Wasion], [E-1P, Shenzhen]
  // Fallback
  return '';
};

const formatManufacturerName = (hes) => {
  if (hes === 'WASION') return 'Wasion';
  return hes;
};

const buildRemarksFromDates = (lastBillDate, replaceDate, installDate) => {
  if (!replaceDate || Number.isNaN(replaceDate.getTime())) return 'Error: Invalid Replace Date';
  if (lastBillDate) {
    if (lastBillDate > replaceDate) return 'Error: Last Bill Date is after Replace Date';
    if (lastBillDate.getTime() === replaceDate.getTime()) return 'Immediate replacement needed';
    return `Reads needed from ${lastBillDate.toISOString().split('T')[0]} to ${replaceDate.toISOString().split('T')[0]}`;
  }
  // If missing last bill date, use install to replace if available
  if (installDate instanceof Date && !Number.isNaN(installDate.getTime())) {
    return `Reads needed from ${installDate.toISOString().split('T')[0]} to ${replaceDate.toISOString().split('T')[0]}`;
  }
  return 'Reads needed from Install Date to Replace Date';
};

const enrichAndValidateRow = async (row) => {
  const customerId = row['Customer ID'] || row['CUSTID'] || row['CustomerID'] || row['CUST_ID'];
  const oldMeterNumber = row['Old Meter Number'] || row['OLDMETER'] || row['OldMeter'] || row['OLD_METER'];
  const newMeterNumber = row['New Meter Number'] || row['Replace Meter Number'] || row['NEWMETER'] || row['NewMeter'] || row['NEW_METER'];
  const replaceDateStr = row['Replace Date'] || row['METERCNGDATE'] || row['ReplaceDate'];
  const replaceDate = replaceDateStr ? new Date(replaceDateStr) : null;

  // Accumulate validation errors
  const validationErrors = [];
  if (!customerId) validationErrors.push('Customer ID missing');
  if (!oldMeterNumber) validationErrors.push('Old Meter Number missing');
  if (!newMeterNumber) validationErrors.push('Replace Meter Number missing');
  if (!replaceDateStr) validationErrors.push('Replace Date missing');

  const customer = customerId ? await Customer.findOne({ where: { CUSTOMER_NUM: customerId } }) : null;
  if (customerId && !customer) validationErrors.push('Customer not found');

  // Validate old meter number matches current meter in DB
  if (customer && oldMeterNumber && customer.METER_NO && String(customer.METER_NO) !== String(oldMeterNumber)) {
    validationErrors.push(`Meter number mismatch for customer ${customerId}`);
  }

  const lastBillDateEntry = customerId ? await LastBillDate.findOne({ where: { CUSTOMER_NUM: customerId } }) : null;
  const lastBillDate = lastBillDateEntry && lastBillDateEntry.LAST_BILL_DATE ? new Date(lastBillDateEntry.LAST_BILL_DATE) : null;

  const hes = determineHesByMeterPrefix(newMeterNumber || '');
  const phase = determinePhaseByMeterPrefix(newMeterNumber || '');
  const model = determineModelByPhaseAndHes(phase, hes);
  const manufacturer = formatManufacturerName(hes); // Derived from HES per requirements
  const netMeter = 'N';

  let remarks = buildRemarksFromDates(lastBillDate, replaceDate, customer?.CONN_DATE ? new Date(customer.CONN_DATE) : null);
  if (validationErrors.length > 0) {
    remarks = `Error: ${validationErrors.join('; ')}`;
  }

  return {
    'Customer ID': customerId,
    'Old Meter Number': oldMeterNumber || '',
    'New Meter Number': newMeterNumber || '',
    'Replace Date': replaceDateStr || '',
    installDate: customer?.CONN_DATE ? new Date(customer.CONN_DATE).toISOString().split('T')[0] : '',
    nocs: customer?.NOCS_NAME || '',
    tariff: customer?.TARIFF || '',
    sanctionLoad: customer?.SANCTION_LOAD || '',
    phase: phase,
    address: customer?.ADDRESS || '',
    lastBillDate: lastBillDate ? lastBillDate.toISOString().split('T')[0] : 'N/A',
    hes,
    model,
    manufacturer,
    netMeter,
    remarks,
  };
};

const processMeterReplacementData = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const processedData = await Promise.all(results.map(enrichAndValidateRow));
        // Deduplicate by Customer ID (keep first occurrence)
        const uniqueByCustomer = new Map();
        for (const row of processedData) {
          const key = row['Customer ID'] || row['CUSTID'] || '';
          if (key && !uniqueByCustomer.has(key)) {
            uniqueByCustomer.set(key, row);
          }
          if (!key) {
            // Rows without a recognizable customer id are kept with a synthetic key to avoid loss
            uniqueByCustomer.set(`__no_id__${uniqueByCustomer.size + 1}`, row);
          }
        }
        res.json(Array.from(uniqueByCustomer.values()));
      } catch (error) {
        res.status(500).send(`Error processing data: ${error.message}`);
      }
    });
};

// Single row processing (for manual add)
const processSingleRow = async (req, res) => {
  try {
    const row = req.body || {};
    const processed = await enrichAndValidateRow(row);
    return res.json(processed);
  } catch (error) {
    return res.status(500).send(`Error processing row: ${error.message}`);
  }
};

// Get replacement history for a meter number
const getMeterReplacementHistory = async (req, res) => {
  try {
    const { meterNo } = req.params;

    if (!meterNo) {
      return res.status(400).json({ error: 'Meter number is required' });
    }

    const { MeterReplacement } = require('../models');

    // Find all replacements where the meter was either the old meter or the new meter
    const replacements = await MeterReplacement.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { oldMeterNumber: meterNo },
          { replaceMeterNumber: meterNo }
        ]
      },
      order: [['replaceDate', 'DESC']]
    });

    // Format the response
    const formattedReplacements = replacements.map(r => ({
      id: r.id,
      customerId: r.customerId,
      oldMeterNumber: r.oldMeterNumber,
      replaceMeterNumber: r.replaceMeterNumber,
      installDate: r.installDate,
      replaceDate: r.replaceDate,
      lastBillDate: r.lastBillDate,
      oldMeterLastReads: r.oldMeterLastReads,
      reason: r.oldMeterNumber === meterNo ?
        'This meter was replaced' :
        'This meter replaced another meter',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    res.json({
      meterNumber: meterNo,
      totalReplacements: formattedReplacements.length,
      replacements: formattedReplacements
    });
  } catch (error) {
    console.error('Error fetching meter replacement history:', error);
    res.status(500).json({
      error: 'Error fetching replacement history',
      message: error.message
    });
  }
};

module.exports = {
  processMeterReplacementData,
  processSingleRow,
  getMeterReplacementHistory,
};