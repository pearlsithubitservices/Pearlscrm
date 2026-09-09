import React from "react";
import { MessageCircle } from "lucide-react";

export default function ConversationItem({ convo, onClick }) {
  const initial = convo.name?.charAt(0).toUpperCase();

  return (
    <div
      className="conversation-item"
      onClick={onClick}
    >
      <div className="conversation-avatar">
        {initial}
      </div>

      <div className="conversation-info">

        <div className="conversation-top">
          <strong>{convo.name}</strong>

          <span className="conversation-time">
            {convo.time || "2 mins ago"}
          </span>
        </div>

        <div className="conversation-bottom">

          <span className="conversation-message">
            {convo.message}
          </span>

          <MessageCircle
            size={18}
            className="whatsapp-icon"
          />

        </div>

      </div>
    </div>
  );
}