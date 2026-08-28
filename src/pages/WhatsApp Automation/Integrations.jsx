import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Phone,
  Building2,
  KeyRound,
  Link2,
  Eye,
  EyeOff,
  RefreshCcw,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const emptyForm = {
  phoneNumberId: "",
  businessAccountId: "",
  accessToken: "",
  webhookUrl: "",
  verifyToken: "",
};

export default function Integrations() {
  const [connected, setConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD WHATSAPP CONFIGURATION
  // =====================================================

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/whatsapp-integration`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load WhatsApp configuration"
        );
      }

      if (data.config) {
        setFormData({
          phoneNumberId: data.config.phoneNumberId || "",
          businessAccountId: data.config.businessAccountId || "",
          accessToken: data.config.accessToken || "",
          webhookUrl: data.config.webhookUrl || "",
          verifyToken: data.config.verifyToken || "",
        });

        setConnected(data.connected === true);
      } else {
        setFormData(emptyForm);
        setConnected(false);
      }
    } catch (err) {
      console.error("Load WhatsApp configuration error:", err);

      setError(
        err.message || "Unable to load WhatsApp configuration"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // SAVE CONFIGURATION
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/whatsapp-integration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save WhatsApp configuration"
        );
      }

      /*
       * Saving configuration does NOT mean Meta is connected.
       * Real connection will happen after Meta credentials are available.
       */
      setConnected(data.config?.connected === true);

      setMessage("WhatsApp configuration saved successfully.");
    } catch (err) {
      console.error("Save WhatsApp configuration error:", err);

      setError(
        err.message || "Failed to save WhatsApp configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TEST CONNECTION
  // =====================================================

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/whatsapp-integration/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to test WhatsApp connection"
        );
      }

      setConnected(data.connected === true);

      setMessage(data.message);
    } catch (err) {
      console.error("Test WhatsApp connection error:", err);

      setError(
        err.message || "Failed to test WhatsApp connection"
      );
    } finally {
      setTesting(false);
    }
  };

  // =====================================================
  // DISCONNECT
  // =====================================================

  const handleDisconnect = async () => {
    /*
     * Real disconnect API will be added later.
     *
     * For now we only clear the frontend state.
     */
    setConnected(false);
    setMessage(
      "WhatsApp is currently not connected to Meta."
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="integrations-page">
        <div className="loading-state">
          Loading WhatsApp configuration...
        </div>

        <style>{`
          .integrations-page {
            padding: 28px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .loading-state {
            padding: 40px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="integrations-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Integrations</h1>
          <p>
            Connect your CRM with external communication services.
          </p>
        </div>
      </div>

      {/* WhatsApp Card */}
      <div className="integration-card">

        {/* Card Header */}
        <div className="integration-card-header">
          <div className="integration-title-section">

            <div className="whatsapp-icon">
              <MessageCircle size={28} />
            </div>

            <div>
              <h2>WhatsApp Business</h2>

              <p>
                Connect your Meta WhatsApp Business account
                to receive and send customer messages.
              </p>
            </div>
          </div>

          <div
            className={`connection-status ${
              connected
                ? "connected"
                : "not-connected"
            }`}
          >
            {connected ? (
              <>
                <CheckCircle size={16} />
                Connected
              </>
            ) : (
              <>
                <XCircle size={16} />
                Not Connected
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="integration-divider" />

        {/* Success Message */}
        {message && (
          <div className="success-message">
            <CheckCircle size={16} />
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* Information */}
        <div className="integration-info">

          <div className="info-box">
            <ShieldCheck size={20} />

            <div>
              <strong>Secure connection</strong>

              <span>
                Your WhatsApp credentials are used only
                for connecting your CRM.
              </span>
            </div>
          </div>

          <div className="info-box">
            <MessageCircle size={20} />

            <div>
              <strong>Two-way messaging</strong>

              <span>
                Receive WhatsApp messages and send replies
                from the Conversations page.
              </span>
            </div>
          </div>

        </div>

        {/* Configuration */}
        <div className="configuration-section">

          <h3>WhatsApp Configuration</h3>

          <div className="form-grid">

            {/* Phone Number ID */}
            <div className="form-group">

              <label>
                <Phone size={15} />
                Phone Number ID
              </label>

              <input
                type="text"
                name="phoneNumberId"
                value={formData.phoneNumberId}
                onChange={handleChange}
                placeholder="Enter WhatsApp Phone Number ID"
              />

            </div>

            {/* Business Account ID */}
            <div className="form-group">

              <label>
                <Building2 size={15} />
                Business Account ID
              </label>

              <input
                type="text"
                name="businessAccountId"
                value={formData.businessAccountId}
                onChange={handleChange}
                placeholder="Enter WhatsApp Business Account ID"
              />

            </div>

            {/* Access Token */}
            <div className="form-group full-width">

              <label>
                <KeyRound size={15} />
                Access Token
              </label>

              <div className="password-input">

                <input
                  type={
                    showToken
                      ? "text"
                      : "password"
                  }
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleChange}
                  placeholder="Enter Meta WhatsApp access token"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowToken(!showToken)
                  }
                >
                  {showToken ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Webhook URL */}
            <div className="form-group">

              <label>
                <Link2 size={15} />
                Webhook URL
              </label>

              <input
                type="text"
                name="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleChange}
                placeholder="https://your-domain.com/webhook"
              />

            </div>

            {/* Verify Token */}
            <div className="form-group">

              <label>
                <ShieldCheck size={15} />
                Verify Token
              </label>

              <input
                type="text"
                name="verifyToken"
                value={formData.verifyToken}
                onChange={handleChange}
                placeholder="Enter webhook verify token"
              />

            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="integration-actions">

          {connected && (
            <button
              className="disconnect-btn"
              onClick={handleDisconnect}
            >
              <XCircle size={17} />
              Disconnect
            </button>
          )}

          <button
            className="test-btn"
            onClick={handleTestConnection}
            disabled={testing}
          >
            <RefreshCcw
              size={17}
              className={testing ? "spin" : ""}
            />

            {testing
              ? "Testing..."
              : "Test Connection"}
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <CheckCircle size={17} />

            {saving
              ? "Saving..."
              : "Save Configuration"}
          </button>

        </div>
      </div>

      {/* Flow */}
      <div className="integration-flow">

        <h3>How WhatsApp Integration Works</h3>

        <div className="flow-items">

          <div className="flow-item">

            <div className="flow-number">
              1
            </div>

            <div>
              <strong>
                Customer sends WhatsApp message
              </strong>

              <span>
                The customer contacts your company
                through WhatsApp.
              </span>
            </div>

          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-item">

            <div className="flow-number">
              2
            </div>

            <div>
              <strong>
                Meta WhatsApp API
              </strong>

              <span>
                Meta receives the message and sends
                it to your webhook.
              </span>
            </div>

          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-item">

            <div className="flow-number">
              3
            </div>

            <div>
              <strong>
                Your CRM Backend
              </strong>

              <span>
                The backend stores the conversation
                in MongoDB.
              </span>
            </div>

          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-item">

            <div className="flow-number">
              4
            </div>

            <div>
              <strong>
                Conversations
              </strong>

              <span>
                Admin can view, reply, take over
                or resolve the chat.
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* CSS */}
      <style>{`

        .integrations-page {
          padding: 28px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .page-header p {
          margin: 7px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .integration-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 25px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
        }

        .integration-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .integration-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .whatsapp-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9f9f0;
          color: #16a34a;
        }

        .integration-title-section h2 {
          margin: 0;
          font-size: 20px;
        }

        .integration-title-section p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .connected {
          color: #15803d;
          background: #dcfce7;
        }

        .not-connected {
          color: #b45309;
          background: #fef3c7;
        }

        .integration-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 24px 0;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 9px;
          background: #dcfce7;
          color: #15803d;
          font-size: 13px;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 9px;
          background: #fee2e2;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 500;
        }

        .integration-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 15px;
          border-radius: 12px;
          background: #f8fafc;
          color: #475569;
        }

        .info-box svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-box strong {
          display: block;
          color: #1f2937;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .info-box span {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .configuration-section h3 {
          margin: 0 0 18px;
          font-size: 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 13px;
          outline: none;
          font-size: 13px;
          background: #fff;
          transition: 0.2s;
        }

        .form-group input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 45px;
        }

        .password-input button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
        }

        .integration-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .integration-actions button {
          display: flex;
          align-items: center;
          gap: 7px;
          border: none;
          border-radius: 9px;
          padding: 10px 15px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .integration-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .test-btn {
          background: #f1f5f9;
          color: #334155;
        }

        .save-btn {
          background: #16a34a;
          color: white;
        }

        .disconnect-btn {
          background: #fee2e2;
          color: #dc2626;
          margin-right: auto;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .integration-flow {
          margin-top: 22px;
          background: var(--card-bg, #ffffff);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 23px;
        }

        .integration-flow h3 {
          margin: 0 0 20px;
          font-size: 16px;
        }

        .flow-items {
          display: flex;
          align-items: stretch;
          gap: 10px;
        }

        .flow-item {
          flex: 1;
          display: flex;
          gap: 10px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .flow-number {
          min-width: 27px;
          height: 27px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dcfce7;
          color: #15803d;
          font-size: 12px;
          font-weight: 700;
        }

        .flow-item strong {
          display: block;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .flow-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .flow-arrow {
          display: flex;
          align-items: center;
          color: #94a3b8;
          font-size: 20px;
        }

        @media (max-width: 850px) {

          .integration-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .integration-info,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: auto;
          }

          .flow-items {
            flex-direction: column;
          }

          .flow-arrow {
            justify-content: center;
            transform: rotate(90deg);
          }
        }

      `}</style>
    </div>
  );
}