const sequelize = require('./src/config/database');
const User = require('./src/models/User');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully, schema updated.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();