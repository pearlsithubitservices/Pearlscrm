import React, { useState } from "react";
import {
  Smile,
  Paperclip,
  Send,
} from "lucide-react";

import {
  sendAdminMessage,
  takeOverConversation,
} from "../services/api";


export default function ChatWindow({ conversation }) {

  // =====================================================
  // STATE
  // =====================================================

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);


  // =====================================================
  // TAKE OVER CONVERSATION
  // =====================================================

  const handleTakeOver = async () => {

    if (!conversation?.id) {
      console.error(
        "Cannot take over: conversation ID is missing"
      );

      return;
    }

    try {

      setTakingOver(true);

      console.log(
        "Taking over conversation:",
        conversation.id
      );

      const result =
        await takeOverConversation(
          conversation.id
        );

      console.log(
        "Conversation taken over successfully:",
        result
      );

      // Temporary refresh for testing
      window.location.reload();

    } catch (error) {

      console.error(
        "Failed to take over conversation:",
        error
      );

      alert(
        "Failed to take over conversation. Please try again."
      );

    } finally {

      setTakingOver(false);

    }
  };


  // =====================================================
  // NO CONVERSATION SELECTED
  // =====================================================

  if (!conversation) {

    return (
      <div className="chat-window">

        <div className="empty-chat">
          Select a conversation
        </div>

      </div>
    );
  }


  // =====================================================
  // SEND ADMIN MESSAGE
  // =====================================================

  const handleSend = async () => {

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!conversation.id) {

      console.error(
        "Cannot send message: conversation ID is missing"
      );

      return;
    }

    try {

      setSending(true);

      console.log(
        "Sending admin message:",
        conversation.id
      );

      await sendAdminMessage(
        conversation.id,
        trimmedMessage
      );

      setMessage("");

      console.log(
        "Admin message sent successfully"
      );

      // Temporary refresh for testing
      window.location.reload();

    } catch (error) {

      console.error(
        "Failed to send admin message:",
        error
      );

      alert(
        "Failed to send message. Please try again."
      );

    } finally {

      setSending(false);

    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="chat-window">


      {/* =================================================
          CHAT HEADER
      ================================================= */}

      <div className="chat-header">

        <div className="chat-user">

          <div className="chat-avatar">

            {conversation.name
              ?.charAt(0)
              .toUpperCase()}

          </div>


          <div>

            <div className="chat-user-name">

              {conversation.name ||
                "Unknown Contact"}

            </div>


            <div className="chat-phone">

              {conversation.phone ||
                "No phone number"}

            </div>

          </div>

        </div>


        {/* =================================================
            HEADER ACTIONS
        ================================================= */}

        <div className="chat-header-actions">


          {/* HANDLED BY */}

          <span className="ai-handled">

            {conversation.handledBy === "Human"
              ? "Human Handled"
              : "AI Handled"}

          </span>


          {/* TAKE OVER */}

          {conversation.handledBy !== "Human" && (

            <button
              type="button"
              className="take-over-btn"
              onClick={handleTakeOver}
              disabled={takingOver}
            >

              {takingOver
                ? "Taking Over..."
                : "Take Over"}

            </button>

          )}


          {/* VIEW CONTACT */}

          <button
            type="button"
            className="view-contact-btn"
          >
            View Contact
          </button>


          {/* MORE */}

          <button
            type="button"
            className="more-btn"
          >
            ⋮
          </button>

        </div>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      <div className="messages">

        {!conversation.messages ||
        conversation.messages.length === 0 ? (

          <div className="empty-chat">
            No messages in this conversation
          </div>

        ) : (

          conversation.messages.map(
            (message, index) => {

              const isUser =
                message.from === "user";

              const isHuman =
                message.from === "human";


              return (

                <div
                  key={
                    message.timestamp
                      ? `${message.timestamp}-${index}`
                      : index
                  }
                  className={`message-row ${
                    isUser
                      ? "message-left"
                      : "message-right"
                  }`}
                >

                  <div
                    className={`message-bubble ${
                      isUser
                        ? "user-message"
                        : isHuman
                        ? "human-message"
                        : "ai-message"
                    }`}
                  >

                    <div className="message-text">

                      {message.text}

                    </div>


                    <div className="message-time">

                      {message.time || ""}

                    </div>

                  </div>

                </div>

              );
            }
          )

        )}

      </div>


      {/* =================================================
          MESSAGE INPUT
      ================================================= */}

      <div className="chat-input-area">


        <div className="chat-input">

          <input
            type="text"
            placeholder="Reply as admin..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter" &&
                !sending
              ) {

                handleSend();

              }

            }}
            disabled={sending}
          />


          {/* EMOJI */}

          <button
            type="button"
            disabled={sending}
          >
            <Smile size={20} />
          </button>


          {/* ATTACHMENT */}

          <button
            type="button"
            disabled={sending}
          >
            <Paperclip size={20} />
          </button>

        </div>


        {/* SEND */}

        <button
          type="button"
          className="send-button"
          onClick={handleSend}
          disabled={
            sending ||
            !message.trim()
          }
        >

          <span>

            {sending
              ? "Sending..."
              : "Send"}

          </span>


          <Send size={17} />

        </button>

      </div>

    </div>
  );
}