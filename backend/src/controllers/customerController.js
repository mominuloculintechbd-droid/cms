const Customer = require('../models/Customer');
const LastBillDate = require('../models/LastBillDate');
const xlsx = require('xlsx');
const { Op } = require('sequelize');

const uploadCustomers = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const customers = xlsx.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'dd-mmm-yyyy' });

    // Map the Excel data to the model fields
    const customerData = customers.map(customer => ({
      NOCS_NAME: customer.NOCS_NAME,
      CUSTOMER_NUM: customer.CUSTOMER_NUM,
      CUSTOMER_NAME: customer.CUSTOMER_NAME,
      FATHER_NAME: customer.FATHER_NAME,
      ADDRESS: customer.ADDRESS,
      MOBILE_NO: customer.MOBILE_NO,
      SANCTION_LOAD: customer.SANCTION_LOAD,
      METER_NO: customer.METER_NO,
      PHASE: customer.PHASE,
      TARIFF: customer.TARIFF,
      CONN_DATE: new Date(customer.CONN_DATE),
      FEEDER_NO: customer.FEEDER_NO,
      FEEDER_NAME: customer.FEEDER_NAME,
    }));

    await Customer.bulkCreate(customerData, { updateOnDuplicate: ['CUSTOMER_NUM'] });

    res.status(200).send('Customer data uploaded successfully.');
  } catch (error) {
    console.error('Error uploading customer data:', error);
    res.status(500).send('An error occurred while uploading customer data.');
  }
};

const searchCustomers = async (req, res) => {
  try {
    const { CUSTOMER_NUM, METER_NO, page = 1, pageSize = 200 } = req.query;

    // Only search if customer number or meter number is provided
    if (!CUSTOMER_NUM && !METER_NO) {
      return res.status(200).json({
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10),
        customers: [],
        billStatusSummary: {
          billStart: 0,
          billStop: 0,
          total: 0
        }
      });
    }

    const whereClause = {};

    if (CUSTOMER_NUM) {
      const customerNumbers = CUSTOMER_NUM.split(',').map(num => num.trim());
      whereClause.CUSTOMER_NUM = { [Op.in]: customerNumbers };
    }

    if (METER_NO) {
      const meterNumbers = METER_NO.split(',').map(num => num.trim());
      whereClause.METER_NO = { [Op.in]: meterNumbers };
    }

    const offset = (page - 1) * pageSize;

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });

    // Get customer numbers for last bill date lookup
    const customerNumbers = rows.map(customer => customer.CUSTOMER_NUM);
    
    // Fetch last bill dates for these customers
    const lastBillDates = await LastBillDate.findAll({
      where: {
        CUSTOMER_NUM: {
          [Op.in]: customerNumbers,
        },
      },
    });

    // Create a map for quick lookup
    const lastBillDateMap = {};
    lastBillDates.forEach(item => {
      lastBillDateMap[item.CUSTOMER_NUM] = item.LAST_BILL_DATE;
    });

    // Add bill status to each customer
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let billStartCount = 0;
    let billStopCount = 0;

    const customersWithStatus = rows.map(customer => {
      const lastBillDate = lastBillDateMap[customer.CUSTOMER_NUM];
      let billStatus = 'Unknown';
      
      if (lastBillDate) {
        const billDate = new Date(lastBillDate);
        const billMonth = billDate.getMonth();
        const billYear = billDate.getFullYear();
        
        if (billMonth === currentMonth && billYear === currentYear) {
          billStatus = 'Bill Start';
          billStartCount++;
        } else {
          billStatus = 'Bill Stop';
          billStopCount++;
        }
      } else {
        billStatus = 'No Bill Data';
        billStopCount++; // Treat as bill stop if no data
      }

      return {
        ...customer.toJSON(),
        LAST_BILL_DATE: lastBillDate,
        BILL_STATUS: billStatus
      };
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page, 10),
      customers: customersWithStatus,
      billStatusSummary: {
        billStart: billStartCount,
        billStop: billStopCount,
        total: customersWithStatus.length
      }
    });
  } catch (error) {
    console.error('Error searching for customers:', error);
    res.status(500).send('An error occurred while searching for customers.');
  }
};

const deleteAllCustomers = async (req, res) => {
  try {
    await Customer.destroy({ where: {}, truncate: true });
    res.status(200).send({ message: 'All customers deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting customers.', error });
  }
};

const getCustomerCount = async (req, res) => {
  try {
    const count = await Customer.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting customer count', error });
  }
};

// Monthly installation counts grouped by year-month based on CONN_DATE
const getMonthlyInstallations = async (req, res) => {
  try {
    const rows = await Customer.findAll({
      attributes: [
        [Customer.sequelize.fn('strftime', '%Y-%m', Customer.sequelize.col('CONN_DATE')), 'ym'],
        [Customer.sequelize.fn('count', Customer.sequelize.col('CUSTOMER_NUM')), 'count']
      ],
      group: ['ym'],
      order: [[Customer.sequelize.literal('ym'), 'ASC']]
    });

    const data = rows.map(r => ({
      month: r.get('ym'),
      count: Number(r.get('count'))
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error getting monthly installations:', error);
    res.status(500).json({ message: 'Error getting monthly installations', error });
  }
};

const getNocsReport = async (req, res) => {
  try {
    const nocsReport = await Customer.findAll({
      attributes: [
        'NOCS_NAME',
        [Customer.sequelize.fn('COUNT', Customer.sequelize.col('CUSTOMER_NUM')), 'customerCount']
      ],
      group: ['NOCS_NAME']
    });
    res.status(200).json(nocsReport);
  } catch (error) {
    console.error('Error generating NOCS report:', error);
    res.status(500).json({ message: 'Error generating NOCS report', error });
  }
};

module.exports = {
  uploadCustomers,
  searchCustomers,
  deleteAllCustomers,
  getCustomerCount,
  getMonthlyInstallations,
  getNocsReport,
};