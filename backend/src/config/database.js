const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false, // camelCase in JS, Sequelize maps createdAt/updatedAt automatically
    },
    dialectOptions:
      process.env.NODE_ENV === 'production'
        ? {
            // Most managed MySQL hosts (e.g. Railway) require SSL in production.
            // Uncomment if your provider requires it:
            // ssl: { require: true, rejectUnauthorized: false },
          }
        : {},
  }
);

module.exports = sequelize;
