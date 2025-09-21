const { Op } = require('sequelize');
const LastBillDate = require('../models/LastBillDate');
const csv = require('csv-parser');
const { Readable } = require('stream');

const uploadLastBillDate = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const parseDMonYYYY = (str) => {
    if (!str) return null;
    const m = String(str).trim();
    const match = m.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{4})$/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const monAbbr = match[2].slice(0, 3).toLowerCase();
    const year = parseInt(match[3], 10);
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const monthIndex = months[monAbbr];
    if (monthIndex === undefined) return null;
    const date = new Date(year, monthIndex, day);
    return isNaN(date.getTime()) ? null : date;
  };

  try {
    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          let inserted = 0;
          let skipped = 0;
          const billDateData = [];

          for (const item of rows) {
            const customerId = (item['CUSTOMER_ID'] || item['Customer ID'] || item['CUSTOMER_NUM'] || '').toString().trim();
            const dateStr = (item['LAST_BILL_DATE'] || item['Last Bill Date'] || item['Last Bill date'] || '').toString().trim();
            const parsedDate = parseDMonYYYY(dateStr) || new Date(dateStr);
            if (!customerId || !parsedDate || isNaN(parsedDate.getTime())) {
              skipped++;
              continue;
            }
            billDateData.push({
              CUSTOMER_NUM: customerId,
              LAST_BILL_DATE: parsedDate,
            });
          }

          if (billDateData.length > 0) {
            await LastBillDate.bulkCreate(billDateData, { updateOnDuplicate: ['LAST_BILL_DATE'] });
            inserted = billDateData.length;
          }

          res.status(200).json({
            message: 'Last bill date data uploaded successfully.',
            inserted,
            skipped,
          });
        } catch (error) {
          console.error('Error saving last bill date data:', error);
          res.status(500).send('An error occurred while saving last bill date data.');
        }
      });
  } catch (error) {
    console.error('Error uploading last bill date data:', error);
    res.status(500).send('An error occurred while uploading last bill date data.');
  }
};

const searchLastBillDate = async (req, res) => {
  try {
    const { CUSTOMER_NUM } = req.query;

    if (!CUSTOMER_NUM) {
      return res.status(400).send('Customer number is required.');
    }

    const customerNumbers = CUSTOMER_NUM.split(',').map(num => num.trim());

    const lastBillDates = await LastBillDate.findAll({
      where: {
        CUSTOMER_NUM: {
          [Op.in]: customerNumbers,
        },
      },
    });

    res.status(200).json(lastBillDates);
  } catch (error) {
    console.error('Error searching for last bill dates:', error);
    res.status(500).send('An error occurred while searching for last bill dates.');
  }
};

const deleteAllLastBillDate = async (req, res) => {
  try {
    await LastBillDate.destroy({ where: {}, truncate: true });
    res.status(200).send('All last bill date data deleted successfully.');
  } catch (error) {
    console.error('Error deleting last bill date data:', error);
    res.status(500).send('An error occurred while deleting last bill date data.');
  }
};

module.exports = {
  uploadLastBillDate,
  searchLastBillDate,
  deleteAllLastBillDate,
};