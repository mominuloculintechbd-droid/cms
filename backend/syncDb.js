const { sequelize, Project, Team, TeamMember } = require('./src/models');

const syncDatabase = async () => {
  try {
    console.log('Starting database synchronization...');

    // Only create tables that don't exist (not alter existing ones)
    await sequelize.query('PRAGMA foreign_keys = OFF;', { raw: true });

    // Sync only new models without altering existing tables
    await Project.sync();
    console.log('✅ Projects table synced');

    await Team.sync();
    console.log('✅ Teams table synced');

    await TeamMember.sync();
    console.log('✅ TeamMembers table synced');

    await sequelize.query('PRAGMA foreign_keys = ON;', { raw: true });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();