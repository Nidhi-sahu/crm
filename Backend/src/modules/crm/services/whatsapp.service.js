const crypto = require('crypto');
const waRepo = require('../repositories/whatsappMessage.repository');
const leadRepo = require('../repositories/lead.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const config = require('../../../config');
const logger = require('../../../utils/logger');
const ApiError = require('../../../utils/ApiError');

const wa = () => config.whatsapp || {};

// Validate Meta's X-Hub-Signature-256 over the raw request body. If no App
// Secret is configured yet, we cannot verify — return true so the webhook still
// works during setup (tighten by setting WHATSAPP_APP_SECRET in production).
const verifySignature = (rawBody, signatureHeader) => {
  const secret = wa().appSecret;
  if (!secret) return true; // not configured — skip (setup phase)
  if (!rawBody || !signatureHeader) return false;
  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (_) {
    return false;
  }
};

const isConfigured = () => !!(wa().phoneNumberId && wa().accessToken);

// Meta expects a number with country code, digits only (no +, no spaces).
// Indian 10-digit numbers get a 91 prefix. Already-prefixed numbers pass through.
const normalizeNumber = (raw) => {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10) d = `91${d}`;
  return d;
};

// Low-level Meta WhatsApp Cloud API send. Returns the provider message id.
const callMetaApi = async (payload) => {
  const { apiVersion, phoneNumberId, accessToken } = wa();
  const url = `https://graph.facebook.com/${apiVersion || 'v21.0'}/${phoneNumberId}/messages`;
  let res;
  let json;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    json = await res.json().catch(() => ({}));
  } catch (err) {
    throw ApiError.badRequest(`WhatsApp request failed: ${err.message}`);
  }
  if (!res.ok) {
    const msg = json && json.error && json.error.message ? json.error.message : `HTTP ${res.status}`;
    const e = new Error(msg);
    e.metaResponse = json;
    throw e;
  }
  return (json.messages && json.messages[0] && json.messages[0].id) || '';
};

// Send a WhatsApp message tied to a lead, recording a WhatsappMessage log.
const sendForLead = async (leadId, data, actor) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');

  const enquiry = lead.enquiryId || {};
  const to = normalizeNumber(data.toNumber || enquiry.clientPhone || '');
  if (!to) throw ApiError.badRequest('No valid phone number to send to');

  const type = data.type === 'template' ? 'template' : 'text';
  const body = (data.body || '').trim();
  const templateName = (data.templateName || '').trim();

  if (type === 'text' && !body) throw ApiError.badRequest('Message text is required');
  if (type === 'template' && !templateName) throw ApiError.badRequest('Template name is required');

  // Build the base log entry first (so a failure is still recorded).
  const base = {
    leadId,
    enquiryId: enquiry._id || lead.enquiryId || null,
    sentBy: actor._id,
    direction: 'outbound',
    toNumber: to,
    type,
    templateName,
    body: type === 'text' ? body : `[template: ${templateName}]`,
    stageName: (lead.currentStageId && lead.currentStageId.name) || '',
    sentAt: new Date(),
  };

  if (!isConfigured()) {
    const log = await waRepo.create({
      ...base,
      status: 'failed',
      errorMessage: 'WhatsApp is not configured yet (access token missing). Add WHATSAPP_ACCESS_TOKEN.',
    });
    throw ApiError.badRequest(
      'WhatsApp is not configured yet — add the Access Token in the server .env to enable sending.',
    );
  }

  const payload =
    type === 'template'
      ? {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: data.languageCode || 'en' },
            ...(Array.isArray(data.bodyParams) && data.bodyParams.length
              ? {
                  components: [
                    {
                      type: 'body',
                      parameters: data.bodyParams.map((t) => ({ type: 'text', text: String(t) })),
                    },
                  ],
                }
              : {}),
          },
        }
      : { messaging_product: 'whatsapp', to, type: 'text', text: { body, preview_url: false } };

  try {
    const providerMessageId = await callMetaApi(payload);
    const log = await waRepo.create({ ...base, status: 'sent', providerMessageId });
    return log.toObject();
  } catch (err) {
    logger.error('WhatsApp send failed', { err: err.message });
    await waRepo.create({ ...base, status: 'failed', errorMessage: err.message });
    throw ApiError.badRequest(`WhatsApp send failed: ${err.message}`);
  }
};

const listForLead = (leadId) => waRepo.findByLeadId(leadId);

const buildConfirmationText = (lead) => {
  const enquiry = lead.enquiryId || {};
  const name = enquiry.clientName || 'there';
  const project = lead.project || enquiry.project || '';
  return (
    `Namaste ${name},\n\n` +
    `Thank you for your interest with Langdi Builders` +
    (project ? ` in ${project}` : '') +
    `. Our Sales Coordinator will connect with you shortly to confirm your site visit.\n\n` +
    `— Langdi Builders`
  );
};

// Auto-send the Stage-2 confirmation. NON-throwing — must never break the stage
// move. De-duplicates so re-entering the stage doesn't spam the client.
const autoSendConfirmation = async (leadId, actor) => {
  try {
    const existing = await waRepo.countByLeadId(leadId);
    if (existing > 0) return null; // already messaged — skip

    const lead = await leadRepo.findById(leadId);
    if (!lead) return null;
    const enquiry = lead.enquiryId || {};
    const name = enquiry.clientName || 'there';
    const templateName = (wa().confirmationTemplate || '').trim();

    const payload = templateName
      ? { type: 'template', templateName, languageCode: 'en', bodyParams: [name] }
      : { type: 'text', body: buildConfirmationText(lead) };

    return await sendForLead(leadId, payload, actor);
  } catch (err) {
    logger.warn('Auto WhatsApp confirmation not sent', {
      leadId: String(leadId),
      err: err.message,
    });
    return null;
  }
};

// --- Webhook (delivery/read status + inbound replies) ---

const verifyWebhook = (query) => {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];
  if (mode === 'subscribe' && token && token === wa().webhookVerifyToken) {
    return challenge;
  }
  return null;
};

const handleWebhook = async (body) => {
  try {
    const entries = (body && body.entry) || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = (change && change.value) || {};

        // 1) Delivery/read status updates for outbound messages.
        for (const st of value.statuses || []) {
          const patch = { status: st.status };
          if (st.status === 'delivered') patch.deliveredAt = new Date();
          if (st.status === 'read') patch.readAt = new Date();
          if (st.status === 'failed') {
            patch.errorMessage =
              (st.errors && st.errors[0] && st.errors[0].title) || 'Delivery failed';
          }
          if (st.id) {
            // eslint-disable-next-line no-await-in-loop
            await waRepo.updateStatusByProviderId(st.id, patch);
          }
        }

        // 2) Inbound replies from clients — best-effort match to a lead by phone.
        for (const msg of value.messages || []) {
          const from = (msg.from || '').replace(/\D/g, '');
          const text =
            (msg.text && msg.text.body) ||
            (msg.button && msg.button.text) ||
            `[${msg.type || 'message'}]`;
          let enquiryId = null;
          let leadId = null;
          const last10 = from.slice(-10);
          // Only match on a full 10-digit suffix, anchored — an empty/short
          // number must NOT become an unanchored regex that matches every lead.
          if (last10.length === 10) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const ids = await enquiryRepo.findIdsByMatch({
                clientPhone: { $regex: `${last10}$` },
              });
              if (ids && ids.length) {
                enquiryId = ids[0];
                // eslint-disable-next-line no-await-in-loop
                const lead = await leadRepo.findByEnquiryId(enquiryId);
                if (lead) leadId = lead._id;
              }
            } catch (_) {
              /* best-effort */
            }
          }
          // eslint-disable-next-line no-await-in-loop
          await waRepo.create({
            leadId,
            enquiryId,
            direction: 'inbound',
            toNumber: from,
            type: 'text',
            body: text,
            status: 'delivered',
            providerMessageId: msg.id || '',
            sentAt: new Date(),
          });
        }
      }
    }
  } catch (err) {
    logger.error('WhatsApp webhook processing error', { err: err.message });
  }
};

module.exports = {
  isConfigured,
  normalizeNumber,
  verifySignature,
  sendForLead,
  autoSendConfirmation,
  listForLead,
  verifyWebhook,
  handleWebhook,
};
