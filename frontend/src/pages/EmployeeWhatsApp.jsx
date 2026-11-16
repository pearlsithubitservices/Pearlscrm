import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CRM_API = "http://localhost:5000/api";

export default function EmployeeWhatsApp() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Logged-in employee phone
   *
   * Example:
   * 9345972029
   *
   * CRM WhatsApp phone:
   * 919345972029
   */
  const employeePhone = user?.profile?.phone || "";

  const digits = employeePhone.replace(/\D/g, "");

  const whatsappPhone = digits
    ? digits.startsWith("91")
      ? digits
      : `91${digits}`
    : "";

  /*
   * Format message time
   */
  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * Load the real WhatsApp conversation
   * from the CRM backend.
   */
  const loadConversation = async () => {
    if (!whatsappPhone) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${CRM_API}/conversations`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load conversations (${response.status})`
        );
      }

      const data = await response.json();

      /*
       * Your backend currently returns the
       * conversations as an array.
       *
       * This also supports:
       * { conversations: [...] }
       */
      const conversations = Array.isArray(data)
        ? data
        : Array.isArray(data?.conversations)
        ? data.conversations
        : [];

      /*
       * Find this logged-in employee's
       * WhatsApp conversation.
       */
      const conversation = conversations.find(
        (item) =>
          item?.channel === "WhatsApp" &&
          String(item?.phone || "") ===
            whatsappPhone
      );

      if (!conversation) {
        setMessages([]);
        return;
      }

      /*
       * IMPORTANT:
       * We use the backend conversation
       * as the source of truth.
       */
      setMessages(
        Array.isArray(conversation.messages)
          ? conversation.messages
          : []
      );
    } catch (err) {
      console.error(
        "WhatsApp conversation load error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load WhatsApp conversation"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial load + automatic refresh.
   *
   * Every 3 seconds we check the backend
   * for new WhatsApp/AI messages.
   */
  useEffect(() => {
    loadConversation();

    const interval = setInterval(() => {
      loadConversation();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [whatsappPhone]);

  /*
   * Employee/customer messages are shown
   * on the RIGHT.
   *
   * AI/admin/company messages are shown
   * on the LEFT.
   */
  const isEmployeeMessage = (sender) => {
    return sender === "customer";
  };

  return (
    <div className="h-full bg-white flex flex-col">

      {/* =========================
          HEADER
      ========================== */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-white">

        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
          <MessageCircle size={22} />
        </div>

        <div>
          <h1 className="font-semibold text-gray-900">
            PEARLS IT HUB
          </h1>

          <p className="text-sm text-gray-500">
            +91 85259 06562
          </p>

          <p className="text-xs text-gray-400">
            Your WhatsApp:{" "}
            {employeePhone
              ? `+91 ${employeePhone}`
              : "Phone number not available"}
          </p>
        </div>

      </div>

      {/* =========================
          CONVERSATION
      ========================== */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f7f9f7]">

        <div className="flex justify-center mb-6">
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            WhatsApp conversation
          </span>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-gray-500">
              Loading WhatsApp conversation...
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center py-8">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          messages.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <MessageCircle
                  size={40}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="text-gray-500 text-sm">
                  No WhatsApp messages yet.
                </p>

                <p className="text-gray-400 text-xs mt-1">
                  Send a message from your WhatsApp
                  to +91 85259 06562.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          messages.map((item, index) => {
            const employeeMessage =
              isEmployeeMessage(item?.sender);

            return (
              <div
                key={
                  item?._id ||
                  item?.id ||
                  `${item?.timestamp}-${index}`
                }
                className={`flex mb-3 ${
                  employeeMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={
                    employeeMessage
                      ? "bg-green-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[70%]"
                      : "bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 max-w-[70%] shadow-sm"
                  }
                >

                  <p className="text-sm whitespace-pre-wrap break-words">
                    {item?.message || ""}
                  </p>

                  <div
                    className={
                      employeeMessage
                        ? "text-[10px] text-green-100 text-right mt-1"
                        : "text-[10px] text-gray-400 text-right mt-1"
                    }
                  >
                    {formatTime(item?.timestamp)}
                  </div>

                </div>

              </div>
            );
          })}

      </div>

      {/* =========================
          STATUS / INFORMATION
      ========================== */}
      <div className="border-t border-gray-200 px-6 py-3 bg-white">

        <div className="flex items-center justify-between">

          <div className="text-xs text-gray-400">
            Connected to WhatsApp conversation
          </div>

          <div className="flex items-center gap-2 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Live sync
          </div>

        </div>

      </div>

    </div>
  );
}