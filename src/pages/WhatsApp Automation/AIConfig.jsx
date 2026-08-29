import React, { useEffect, useState } from "react";

//const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "https://pearlscrm.onrender.com/api";

const defaultConfig = {
  enabled: true,
  provider: "Gemini",
  model: "gemini-2.5-flash",
  systemInstructions:
    "You are a helpful HR assistant. Answer employee questions clearly and professionally. Use available CRM data when required. Do not invent employee information.",
  temperature: 0.8,
  maxTokens: 600,
  humanHandoff: true,
};

export default function AIConfig() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =========================
     GET CONFIGURATION
  ========================= */

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/ai-config`);

      if (!response.ok) {
        throw new Error("Failed to load AI configuration");
      }

      const data = await response.json();

      setConfig({
        enabled: data.enabled ?? true,
        provider: data.provider ?? "Gemini",
        model: data.model ?? "gemini-2.5-flash",
        systemInstructions: data.systemInstructions ?? "",
        temperature: data.temperature ?? 0.8,
        maxTokens: data.maxTokens ?? 600,
        humanHandoff: data.humanHandoff ?? true,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setConfig((prev) => ({
      ...prev,
      [name]:
        name === "temperature" || name === "maxTokens" ? Number(value) : value,
    }));

    setSuccess("");
    setError("");
  };

  /* =========================
     TOGGLE
  ========================= */

  const toggleValue = (name) => {
    setConfig((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setSuccess("");
    setError("");
  };

  /* =========================
     SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const response = await fetch(`${API_BASE_URL}/ai-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save configuration");
      }

      if (data.config) {
        setConfig({
          enabled: data.config.enabled ?? true,
          provider: data.config.provider ?? "Gemini",
          model: data.config.model ?? "gemini-2.5-flash",
          systemInstructions: data.config.systemInstructions ?? "",
          temperature: data.config.temperature ?? 0.8,
          maxTokens: data.config.maxTokens ?? 600,
          humanHandoff: data.config.humanHandoff ?? true,
        });
      }

      setSuccess("AI configuration saved successfully.");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading AI configuration...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* HEADER */}

      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>AI Configuration</h2>

          <p style={subtitleStyle}>
            Configure AI provider, model and assistant behavior for WhatsApp
            automation.
          </p>
        </div>

        <div
          style={{
            ...connectionBadge,
            background: config.enabled ? "#dcfce7" : "#f1f5f9",
            color: config.enabled ? "#15803d" : "#64748b",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: config.enabled ? "#22c55e" : "#94a3b8",
            }}
          />

          {config.enabled ? "AI Enabled" : "AI Disabled"}
        </div>
      </div>

      {/* SUCCESS */}

      {success && <div style={successStyle}>✓ {success}</div>}

      {/* ERROR */}

      {error && <div style={errorStyle}>⚠ {error}</div>}

      {/* AI AUTOMATION */}

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <h3 style={cardTitleStyle}>AI Automation</h3>

            <p style={cardDescriptionStyle}>
              Control whether AI automatically responds to incoming WhatsApp
              conversations.
            </p>
          </div>

          <Toggle
            enabled={config.enabled}
            onClick={() => toggleValue("enabled")}
          />
        </div>
      </div>

      {/* PROVIDER / MODEL */}

      <div style={twoColumnStyle}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>AI Provider</h3>

          <p style={cardDescriptionStyle}>
            Select the AI service used by the automation.
          </p>

          <label style={labelStyle}>Provider</label>

          <select
            name="provider"
            value={config.provider}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Gemini">Gemini</option>
          </select>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>AI Model</h3>

          <p style={cardDescriptionStyle}>
            Select the model used to generate responses.
          </p>

          <label style={labelStyle}>Model</label>

          <select
            name="model"
            value={config.model}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>

            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
          </select>
        </div>
      </div>

      {/* SYSTEM INSTRUCTIONS */}

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>System Instructions</h3>

        <p style={cardDescriptionStyle}>
          Define the role, behavior and rules that the AI should follow.
        </p>

        <textarea
          name="systemInstructions"
          value={config.systemInstructions}
          onChange={handleChange}
          rows={7}
          style={{
            ...inputStyle,
            marginTop: 16,
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />

        <div style={infoBoxStyle}>
          <strong>Tip:</strong> Give the AI clear instructions about how it
          should answer employees and when it should transfer a conversation to
          HR.
        </div>
      </div>

      {/* PARAMETERS */}

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>AI Parameters</h3>

        <p style={cardDescriptionStyle}>
          Control response creativity and maximum response length.
        </p>

        <div style={twoColumnStyle}>
          <div>
            <label style={labelStyle}>Temperature</label>

            <input
              type="number"
              name="temperature"
              value={config.temperature}
              onChange={handleChange}
              min="0"
              max="2"
              step="0.1"
              style={inputStyle}
            />

            <p style={helperTextStyle}>
              Range: 0 - 2. Lower values give more consistent answers.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Maximum Response Tokens</label>

            <input
              type="number"
              name="maxTokens"
              value={config.maxTokens}
              onChange={handleChange}
              min="1"
              style={inputStyle}
            />

            <p style={helperTextStyle}>
              Controls the maximum length of the AI response.
            </p>
          </div>
        </div>
      </div>

      {/* HUMAN HANDOFF */}

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <h3 style={cardTitleStyle}>Human Handoff</h3>

            <p style={cardDescriptionStyle}>
              Automatically allow conversations to be transferred to an HR
              representative when AI cannot handle the request.
            </p>
          </div>

          <Toggle
            enabled={config.humanHandoff}
            onClick={() => toggleValue("humanHandoff")}
          />
        </div>
      </div>

      {/* SAVE BAR */}

      <div style={saveBarStyle}>
        <div>
          <div
            style={{
              fontWeight: 600,
              color: "#334155",
              fontSize: 13,
            }}
          >
            Configuration changes
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Changes will be stored in MongoDB.
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...saveButton,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ enabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 48,
        height: 27,
        border: "none",
        borderRadius: 20,
        padding: 0,
        cursor: "pointer",
        position: "relative",
        background: enabled ? "#2563eb" : "#cbd5e1",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: enabled ? 24 : 3,
          width: 21,
          height: 21,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

/* =========================================================
   STYLES
========================================================= */

const pageStyle = {
  padding: "4px",
  width: "100%",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
  gap: 20,
};

const titleStyle = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  color: "#111827",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
  fontSize: 14,
};

const connectionBadge = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 11px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
};

const cardStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 22,
  marginBottom: 18,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
};

const cardTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#111827",
};

const cardDescriptionStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: 13,
  lineHeight: 1.5,
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};

const labelStyle = {
  display: "block",
  marginTop: 18,
  marginBottom: 7,
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid #dbe1ea",
  background: "#ffffff",
  color: "#334155",
  fontSize: 13,
  outline: "none",
};

const helperTextStyle = {
  margin: "7px 0 0",
  color: "#94a3b8",
  fontSize: 11,
};

const infoBoxStyle = {
  marginTop: 12,
  padding: "10px 12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5,
};

const successStyle = {
  marginBottom: 18,
  padding: "11px 14px",
  borderRadius: 8,
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  color: "#15803d",
  fontSize: 13,
};

const errorStyle = {
  marginBottom: 18,
  padding: "11px 14px",
  borderRadius: 8,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: 13,
};

const loadingStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 30,
  color: "#64748b",
  textAlign: "center",
};

const saveBarStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const saveButton = {
  border: "none",
  borderRadius: 9,
  padding: "11px 18px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 13,
  boxShadow: "0 3px 8px rgba(37, 99, 235, 0.22)",
};
