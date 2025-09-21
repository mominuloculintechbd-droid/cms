const sequelize = require('./src/config/database');
const Customer = require('./src/models/Customer');
const MeterReplacement = require('./src/models/MeterReplacement');
const MdmRead = require('./src/models/MdmRead');
const MeterReading = require('./src/models/MeterReading');

async function populateTestData() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });

    // Create sample customers
    await Customer.bulkCreate([
      {
        CUSTOMER_NUM: 'CUST001',
        METER_NO: 'METER001',
        TARIFF: 'LT-A',
        CONN_DATE: '2023-01-01'
      },
      {
        CUSTOMER_NUM: 'CUST002',
        METER_NO: 'METER002',
        TARIFF: 'LT-B',
        CONN_DATE: '2023-02-01'
      },
      {
        CUSTOMER_NUM: 'CUST003',
        METER_NO: 'METER003',
        TARIFF: 'HT-A',
        CONN_DATE: '2023-03-01'
      },
      {
        CUSTOMER_NUM: 'CUST004',
        METER_NO: 'METER004',
        TARIFF: 'LT-A',
        CONN_DATE: '2023-04-01'
      },
      {
        CUSTOMER_NUM: 'CUST005',
        METER_NO: 'METER005',
        TARIFF: 'LT-C',
        CONN_DATE: '2023-05-01'
      }
    ]);

    // Create sample meter replacements
    await MeterReplacement.bulkCreate([
      {
        customerId: 'CUST001',
        oldMeterNumber: 'METER001',
        replaceMeterNumber: 'METER001_NEW',
        installDate: '2023-01-01',
        replaceDate: '2024-02-01',
        lastBillDate: '2024-01-15',
        oldMeterLastReads: 1500.50
      },
      {
        customerId: 'CUST002',
        oldMeterNumber: 'METER002',
        replaceMeterNumber: 'METER002_NEW',
        installDate: '2023-02-01',
        replaceDate: '2024-01-01',
        lastBillDate: '2023-12-20',
        oldMeterLastReads: 2200.75
      }
    ]);

    // Create sample MDM reads
    const mdmReadsData = [];
    const currentDate = new Date();
    
    // Generate MDM reads for the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      
      // Add some missing data scenarios
      const remarks = i === 2 ? 'Missing Data' : 'OK';
      
      mdmReadsData.push(
        {
          CUSTOMER_ID: 'CUST001',
          METER_NO: 'METER001',
          MSRMT_DTTM: date,
          DATE_TYPE: 'Monthly',
          READING_TYPE: 'kWh Daily',
          READING_VAL: 1000 + (i * 100),
          REMARKS: remarks,
          LAST_BILL_DT: '2024-01-15'
        },
        {
          CUSTOMER_ID: 'CUST002',
          METER_NO: 'METER002',
          MSRMT_DTTM: date,
          DATE_TYPE: 'Monthly',
          READING_TYPE: 'kWh Daily',
          READING_VAL: 2000 + (i * 150),
          REMARKS: 'OK',
          LAST_BILL_DT: '2024-02-20'
        },
        {
          CUSTOMER_ID: 'CUST002',
          METER_NO: 'METER002',
          MSRMT_DTTM: date,
          DATE_TYPE: 'Monthly',
          READING_TYPE: 'kWh Daily TOD1',
          READING_VAL: 800 + (i * 50),
          REMARKS: 'OK',
          LAST_BILL_DT: '2024-02-20'
        },
        {
          CUSTOMER_ID: 'CUST002',
          METER_NO: 'METER002',
          MSRMT_DTTM: date,
          DATE_TYPE: 'Monthly',
          READING_TYPE: 'kWh Daily TOD2',
          READING_VAL: 1200 + (i * 100),
          REMARKS: 'OK',
          LAST_BILL_DT: '2024-02-20'
        }
      );
    }

    await MdmRead.bulkCreate(mdmReadsData);

    // Create sample billing profile readings
    const billingReadingsData = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      
      billingReadingsData.push(
        {
          meter_no: 'METER001',
          value_kwh: 1000 + (i * 100),
          reading_date: date
        },
        {
          meter_no: 'METER002',
          value_kwh: 2000 + (i * 150),
          reading_date: date
        },
        {
          meter_no: 'METER003',
          value_kwh: 3000 + (i * 200),
          reading_date: date
        },
        {
          meter_no: 'METER004',
          value_kwh: 1500 + (i * 75),
          reading_date: date
        },
        {
          meter_no: 'METER005',
          value_kwh: 2500 + (i * 125),
          reading_date: date
        }
      );
    }

    await MeterReading.bulkCreate(billingReadingsData);

    console.log('Test data populated successfully!');
    console.log('Sample data includes:');
    console.log('- 5 customers with different tariffs');
    console.log('- 2 meter replacements');
    console.log('- 6 months of MDM reads (with some missing data)');
    console.log('- 6 months of billing profile readings');
    
  } catch (error) {
    console.error('Error populating test data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
populateTestData();
