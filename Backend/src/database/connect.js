const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: config.env !== 'production',
    });
    logger.info('MongoDB connected', {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });
  } catch (err) {
    logger.error('MongoDB connection failed', { err: err && err.message });
    throw err;
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', { err: err && err.message }));
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

module.exports = { connectDB, disconnectDB };
