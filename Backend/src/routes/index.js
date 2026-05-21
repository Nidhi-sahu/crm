const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');
const crmRouter = require('../modules/crm');
const config = require('../config');

const router = express.Router();

const dbStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

router.get('/health', async (req, res) => {
  const start = Date.now();
  const dbState = mongoose.connection.readyState;
  let dbPingMs = null;
  let dbOk = false;
  if (dbState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - start;
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  const mem = process.memoryUsage();
  const toMB = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  const status = dbOk ? 'ok' : 'degraded';
  const statusCode = dbOk ? 200 : 503;

  res.status(statusCode).json({
    success: dbOk,
    message: dbOk ? 'Service healthy' : 'Service degraded — database unreachable',
    data: {
      status,
      env: config.env,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      requestId: req.id,
      database: {
        state: dbStateLabels[dbState] || 'unknown',
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
        pingMs: dbPingMs,
      },
      memoryMB: {
        rss: toMB(mem.rss),
        heapTotal: toMB(mem.heapTotal),
        heapUsed: toMB(mem.heapUsed),
        external: toMB(mem.external),
      },
      node: process.version,
    },
  });
});

router.use('/crm', crmRouter);

module.exports = router;
