const axios = require("axios");

const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const getConfig = () => ({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  appSecret: process.env.WHATSAPP_APP_SECRET,
});

const isConfigured = () => {
  const cfg = getConfig();
  return !!(cfg.phoneNumberId && cfg.accessToken);
};

const apiClient = () => {
  const { accessToken } = getConfig();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });
};

const sendTemplateMessage = async ({ to, templateName, languageCode = "en", components = [] }) => {
  const { phoneNumberId } = getConfig();
  const client = apiClient();

  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const { data } = await client.post(`/${phoneNumberId}/messages`, payload);
  return data;
};

const sendTextMessage = async ({ to, body }) => {
  const { phoneNumberId } = getConfig();
  const client = apiClient();

  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""),
    type: "text",
    text: { body },
  };

  const { data } = await client.post(`/${phoneNumberId}/messages`, payload);
  return data;
};

const fetchTemplates = async () => {
  const { businessAccountId } = getConfig();
  const client = apiClient();
  const { data } = await client.get(`/${businessAccountId}/message_templates`, {
    params: { limit: 100 },
  });
  return data.data || [];
};

const getPhoneNumberInfo = async () => {
  const { phoneNumberId } = getConfig();
  const client = apiClient();
  const { data } = await client.get(`/${phoneNumberId}`, {
    params: { fields: "display_phone_number,verified_name,quality_rating" },
  });
  return data;
};

module.exports = {
  getConfig,
  isConfigured,
  sendTemplateMessage,
  sendTextMessage,
  fetchTemplates,
  getPhoneNumberInfo,
};
