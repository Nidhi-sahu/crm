const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const whatsappService = require('../services/whatsapp.service');

const sendForLead = asyncHandler(async (req, res) => {
  const message = await whatsappService.sendForLead(req.params.id, req.body, req.user);
  ApiResponse.created(res, { message }, 'WhatsApp message sent');
});

const listForLead = asyncHandler(async (req, res) => {
  const items = await whatsappService.listForLead(req.params.id);
  ApiResponse.ok(res, items, 'WhatsApp messages fetched');
});

// Meta webhook verification handshake (GET). Public — no auth.
const webhookVerify = (req, res) => {
  const challenge = whatsappService.verifyWebhook(req.query);
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// Meta webhook events (POST): delivery/read status + inbound replies. Public.
const webhookReceive = asyncHandler(async (req, res) => {
  // Reject forged payloads — verify Meta's HMAC signature over the raw body.
  const ok = whatsappService.verifySignature(req.rawBody, req.get('x-hub-signature-256'));
  if (!ok) {
    res.sendStatus(401);
    return;
  }
  await whatsappService.handleWebhook(req.body);
  res.sendStatus(200); // always ack so Meta doesn't retry
});

module.exports = { sendForLead, listForLead, webhookVerify, webhookReceive };
