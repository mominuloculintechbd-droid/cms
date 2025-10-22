const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
const ComplaintCategory = require('./src/models/ComplaintCategory');

const syncDatabase = async () => {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF;', { raw: true });
    await sequelize.sync({ alter: true });
    await sequelize.query('PRAGMA foreign_keys = ON;', { raw: true });
    console.log('Database synchronized successfully, schema updated.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();