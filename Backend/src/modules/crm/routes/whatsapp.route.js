const express = require('express');
const ctrl = require('../controllers/whatsapp.controller');

// PUBLIC routes — Meta calls these directly, so NO auth middleware.
const router = express.Router();

// GET = verification handshake; POST = delivery/read status + inbound messages.
router.get('/webhook', ctrl.webhookVerify);
router.post('/webhook', ctrl.webhookReceive);

module.exports = router;
