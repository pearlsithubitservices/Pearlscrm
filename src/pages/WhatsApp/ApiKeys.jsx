import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Key, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import useWhatsApp from "../../Hooks/useWhatsApp";

const ENV_VARS = [
  { key: "WHATSAPP_PHONE_NUMBER_ID", desc: "Your WhatsApp Business phone number ID from Meta Developer Console" },
  { key: "WHATSAPP_BUSINESS_ACCOUNT_ID", desc: "WhatsApp Business Account (WABA) ID" },
  { key: "WHATSAPP_ACCESS_TOKEN", desc: "Permanent access token from Meta Business settings" },
  { key: "WHATSAPP_WEBHOOK_VERIFY_TOKEN", desc: "Custom token for webhook verification (you choose this value)" },
  { key: "WHATSAPP_APP_SECRET", desc: "App secret from Meta Developer Console for webhook signature validation" },
  { key: "REDIS_URL", desc: "Redis connection URL for message queue (optional, defaults to localhost)" },
];

export default function ApiKeys() {
  const { connection, fetchConnection } = useWhatsApp();

  useEffect(() => {
    fetchConnection();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Keys & Configuration</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your WhatsApp Business API credentials</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-[#2563a9]" />
            <h2 className="font-semibold text-gray-800">Connection Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Status</span>
              {connection?.connected ? (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                  <XCircle className="w-4 h-4" /> Not Connected
                </span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="text-sm font-medium">{connection?.phoneNumber ? `+${connection.phoneNumber}` : "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Verified Name</span>
              <span className="text-sm font-medium">{connection?.verifiedName || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Quality Rating</span>
              <span className="text-sm font-medium">{connection?.qualityRating || "—"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          <h2 className="font-semibold text-gray-800 mb-4">Webhook URL</h2>
          <p className="text-sm text-gray-500 mb-3">
            Set this URL in your Meta Developer Console webhook configuration:
          </p>
          <code className="block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono break-all">
            https://pearlscrm.onrender.com/api/whatsapp/webhook
          </code>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#2563a9] mt-4 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Meta WhatsApp Cloud API Documentation
          </a>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Required Environment Variables</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add these to your backend <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> file on the server:
        </p>
        <div className="space-y-4">
          {ENV_VARS.map((v) => (
            <div key={v.key} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono text-[#2563a9] font-medium shrink-0 w-72">{v.key}</code>
              <p className="text-sm text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
