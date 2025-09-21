const { Op } = require('sequelize');
const MdmRead = require('../models/MdmRead');
const csv = require('csv-parser');
const { Readable } = require('stream');
const json2csv = require('json2csv').parse;

const uploadMdmReads = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const mdmData = results.map(item => ({
            CUSTOMER_ID: item.CUSTOMER_ID,
            METER_NO: item.METER_NO,
            MSRMT_DTTM: new Date(item.MSRMT_DTTM),
            DATE_TYPE: item.DATE_TYPE,
            READING_TYPE: item.READING_TYPE,
            READING_VAL: parseFloat(item.READING_VAL),
            REMARKS: item.REMARKS,
            LAST_BILL_DT: new Date(item.LAST_BILL_DT),
          }));

          await MdmRead.bulkCreate(mdmData);
          res.status(200).send('MDM reads data uploaded successfully.');
        } catch (error) {
          console.error('Error saving MDM reads data:', error);
          res.status(500).send('An error occurred while saving MDM reads data.');
        }
      });
  } catch (error) {
    console.error('Error uploading MDM reads data:', error);
    res.status(500).send('An error occurred while uploading MDM reads data.');
  }
};

const getMdmReads = async (req, res) => {
  try {
    const { customerId, meterNo } = req.query;
    const where = {};
    if (customerId) {
      where.CUSTOMER_ID = { [Op.like]: `%${customerId}%` };
    }
    if (meterNo) {
      where.METER_NO = { [Op.like]: `%${meterNo}%` };
    }

    const mdmReads = await MdmRead.findAll({ where });
    res.status(200).json(mdmReads);
  } catch (error) {
    console.error('Error fetching MDM reads:', error);
    res.status(500).send('An error occurred while fetching MDM reads.');
  }
};

const deleteMdmReads = async (req, res) => {
  try {
    await MdmRead.destroy({ where: {}, truncate: true });
    res.status(200).send('All MDM reads data deleted successfully.');
  } catch (error) {
    console.error('Error deleting MDM reads data:', error);
    res.status(500).send('An error occurred while deleting MDM reads data.');
  }
};

const downloadMdmReads = async (req, res) => {
  try {
    const mdmReads = await MdmRead.findAll();
    const fields = ['id', 'CUSTOMER_ID', 'METER_NO', 'MSRMT_DTTM', 'DATE_TYPE', 'READING_TYPE', 'READING_VAL', 'REMARKS', 'LAST_BILL_DT'];
    const csv = json2csv(mdmReads, { fields });
    res.header('Content-Type', 'text/csv');
    res.attachment('mdm_reads.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error downloading MDM reads data:', error);
    res.status(500).send('An error occurred while downloading MDM reads data.');
  }
};

module.exports = {
  uploadMdmReads,
  getMdmReads,
  deleteMdmReads,
  downloadMdmReads,
};
