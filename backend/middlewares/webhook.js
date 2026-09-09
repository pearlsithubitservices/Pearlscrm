const crypto = require("crypto");
const { getConfig } = require("../config/whatsapp");

const verifyWebhook = (req, res, next) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const { webhookVerifyToken } = getConfig();

  if (mode === "subscribe" && token === webhookVerifyToken) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
};

const verifySignature = (req, res, next) => {
  const { appSecret } = getConfig();
  if (!appSecret) return next();

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(401).json({ message: "Missing signature" });

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  if (signature !== expected) {
    return res.status(401).json({ message: "Invalid signature" });
  }
  next();
};

module.exports = { verifyWebhook, verifySignature };
