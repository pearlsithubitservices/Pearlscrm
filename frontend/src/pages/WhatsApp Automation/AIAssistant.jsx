import React, { useState } from "react";
import { sendMessage } from "./services/aiAssistantApi";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I’m your Admin AI Assistant. You can ask me about employees, attendance, leave, and tasks.",
    },
  ]);

  // Send message to FastAPI
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const currentMessage = message.trim();

    // Show admin message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
      },
    ]);

    // Clear input
    setMessage("");

    // Show loading state
    setLoading(true);

    try {
      // Call FastAPI
      const data = await sendMessage(currentMessage);

      console.log("FastAPI response:", data);

      // Get response from backend
      const aiResponse =
        data.reply ||
        data.message ||
        data.response ||
        "No response received from AI.";

      // Show AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      // Show error inside chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the AI backend. Please check that the FastAPI server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            AI Assistant
          </h1>

          <p style={styles.subtitle}>
            Ask questions about your CRM data
          </p>
        </div>

        <div style={styles.status}>
          <span style={styles.statusDot}></span>
          AI Online
        </div>
      </div>

      {/* Chat Container */}
      <div style={styles.chatContainer}>

        {/* Messages */}
        <div style={styles.messagesArea}>

          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent:
                  msg.role === "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >

              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div style={styles.aiAvatar}>
                  AI
                </div>
              )}

              {/* Message Bubble */}
              <div
                style={{
                  ...styles.messageBubble,
                  ...(msg.role === "user"
                    ? styles.userBubble
                    : styles.aiBubble),
                }}
              >
                {msg.content}
              </div>

            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div style={styles.messageRow}>

              <div style={styles.aiAvatar}>
                AI
              </div>

              <div
                style={{
                  ...styles.messageBubble,
                  ...styles.aiBubble,
                }}
              >
                Thinking...
              </div>

            </div>
          )}

        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask something like: Show today's attendance"
            rows={1}
            disabled={loading}
            style={{
              ...styles.textarea,
              opacity: loading ? 0.6 : 1,
            }}
          />

          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            style={{
              ...styles.sendButton,
              opacity:
                message.trim() && !loading
                  ? 1
                  : 0.5,
              cursor:
                message.trim() && !loading
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>

        </div>

        <p style={styles.hint}>
          Press Enter to send
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    height: "100%",
    background: "#f6f8fc",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
    color: "#172033",
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#7b8495",
  },

  status: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    color: "#4b5563",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
  },

  chatContainer: {
    width: "100%",
    maxWidth: "1000px",
    margin: "24px auto",
    flex: 1,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  messagesArea: {
    flex: 1,
    padding: "28px",
    overflowY: "auto",
    minHeight: "400px",
  },

  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    marginBottom: "20px",
  },

  aiAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#1e3a5f",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "600",
    flexShrink: 0,
  },

  messageBubble: {
    maxWidth: "65%",
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  aiBubble: {
    background: "#f1f4f8",
    color: "#273142",
    borderBottomLeftRadius: "4px",
  },

  userBubble: {
    background: "#2563eb",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
  },

  inputArea: {
    borderTop: "1px solid #e5e7eb",
    padding: "16px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "#ffffff",
  },

  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid #d8dee8",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    minHeight: "44px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  sendButton: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 22px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
  },

  hint: {
    margin: "0 16px 12px",
    fontSize: "11px",
    color: "#9ca3af",
    textAlign: "right",
  },
};