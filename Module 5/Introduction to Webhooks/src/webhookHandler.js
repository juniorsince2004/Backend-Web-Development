'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Export handleWebhook(req, res), used by POST /webhooks in app.js.
// Also export _processedIds (your Set or Map) for test inspection/reset.
//
// Steps (in order):
//  1. Verify HMAC-SHA256 signature
//     - Signature header: req.headers['x-webhook-signature'] → 'sha256=<hex>'
//     - Compute: crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex')
//     - Compare: crypto.timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(received,'hex'))
//     - Mismatch or missing → res.status(401).json({ error: 'Invalid signature' })
//
//  2. Parse body: const event = JSON.parse(req.body)
//
//  3. Idempotency: if _processedIds.has(event.id) → res.status(200).json({ status: 'already_processed' })
//
//  4. Mark: _processedIds.add(event.id)
//
//  5. Acknowledge: res.status(200).json({ status: 'received' })
//     Then call handleEvent(event) inside setImmediate(() => { ... })


const crypto = require("crypto");
const { handleEvent } = require("./eventHandlers");

const _processedIds = new Set();

function handleWebhook(req, res) {
  try {
    const signature = req.headers["x-webhook-signature"];
    const secret = process.env.WEBHOOK_SECRET;

    // Reject missing or invalid signature formats
    if (
      !signature ||
      typeof signature !== "string" ||
      !signature.startsWith("sha256=") ||
      !/^[a-fA-F0-9]{64}$/.test(signature.slice(7)) ||
      !secret ||
      !Buffer.isBuffer(req.body)
    ) {
      return res.status(401).json({
        error: "Invalid signature"
      });
    }

    // Generate HMAC-SHA256 from the original request Buffer
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest();

    const receivedSignature = Buffer.from(
      signature.slice(7),
      "hex"
    );

    // Compare signatures securely
    if (
      !crypto.timingSafeEqual(
        expectedSignature,
        receivedSignature
      )
    ) {
      return res.status(401).json({
        error: "Invalid signature"
      });
    }

    // Parse the body after signature verification
    const event = JSON.parse(req.body.toString("utf8"));

    // Check for duplicate event IDs
    if (_processedIds.has(event.id)) {
      return res.status(200).json({
        status: "already_processed"
      });
    }

    // Mark event as processed before handling
    _processedIds.add(event.id);

    // Send response immediately
    res.status(200).json({
      status: "received"
    });

    // Process event after sending response
    setImmediate(() => {
      handleEvent(event);
    });

  } catch (error) {
    if (!res.headersSent) {
      return res.status(400).json({
        error: "Invalid webhook payload"
      });
    }
  }
}

module.exports = {
  handleWebhook,
  _processedIds
};
