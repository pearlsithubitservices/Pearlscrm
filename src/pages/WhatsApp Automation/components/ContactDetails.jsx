import React, { useState } from "react";

import {
  takeOverConversation,
  resolveConversation,
  blockConversation,
} from "../services/api";


export default function ContactDetails({ contact }) {

  const [takingOver, setTakingOver] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [blocking, setBlocking] = useState(false);


  // =====================================================
  // NO CONTACT SELECTED
  // =====================================================

  if (!contact) {

    return (
      <div className="contact-details">

        <div className="contact-empty">
          Select a conversation
        </div>

      </div>
    );
  }


  // =====================================================
  // MESSAGE INFORMATION
  // =====================================================

  const messages =
    contact.messages || [];

  const firstMessage =
    messages[0];

  const lastMessage =
    messages[messages.length - 1];


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (timestamp) => {

    if (!timestamp) {
      return "Not available";
    }

    return new Date(timestamp).toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // =====================================================
  // TAKE OVER
  // =====================================================

  const handleTakeOver = async () => {

    if (!contact.id) {

      console.error(
        "Conversation ID is missing"
      );

      return;
    }

    try {

      setTakingOver(true);

      console.log(
        "Taking over conversation:",
        contact.id
      );

      const data =
        await takeOverConversation(
          contact.id
        );

      console.log(
        "Take Over successful:",
        data
      );

      // Temporary refresh
      window.location.reload();

    } catch (error) {

      console.error(
        "Take Over failed:",
        error
      );

      alert(
        "Failed to take over conversation."
      );

    } finally {

      setTakingOver(false);

    }
  };


  // =====================================================
  // RESOLVE
  // =====================================================

  const handleResolve = async () => {

    if (!contact.id) {

      console.error(
        "Conversation ID is missing"
      );

      return;
    }

    try {

      setResolving(true);

      console.log(
        "Resolving conversation:",
        contact.id
      );

      const data =
        await resolveConversation(
          contact.id
        );

      console.log(
        "Conversation resolved:",
        data
      );

      // Temporary refresh
      window.location.reload();

    } catch (error) {

      console.error(
        "Resolve failed:",
        error
      );

      alert(
        "Failed to resolve conversation."
      );

    } finally {

      setResolving(false);

    }
  };


  // =====================================================
  // BLOCK
  // =====================================================

  const handleBlock = async () => {

    if (!contact.id) {

      console.error(
        "Conversation ID is missing"
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to block this conversation?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setBlocking(true);

      console.log(
        "Blocking conversation:",
        contact.id
      );

      const data =
        await blockConversation(
          contact.id
        );

      console.log(
        "Conversation blocked:",
        data
      );

      // Temporary refresh
      window.location.reload();

    } catch (error) {

      console.error(
        "Block failed:",
        error
      );

      alert(
        "Failed to block conversation."
      );

    } finally {

      setBlocking(false);

    }
  };


  // =====================================================
  // STATUS
  // =====================================================

  const status =
    contact.status || "In Progress";

  const handledBy =
    contact.handledBy || "AI";


  // =====================================================
  // RETURN UI
  // =====================================================

  return (

    <div className="contact-details">


      {/* =================================================
          CONTACT HEADER
      ================================================= */}

      <div className="contact-header">

        <div className="contact-avatar">

          {contact.name
            ?.charAt(0)
            .toUpperCase()}

        </div>


        <h3>
          {contact.name}
        </h3>


        <span className="active-status">
          {status}
        </span>

      </div>


      {/* =================================================
          CONTACT INFORMATION
      ================================================= */}

      <div className="details-section">

        <h4>
          Contact Information
        </h4>


        <div className="detail-row">

          <span>
            Contact Name
          </span>

          <strong>
            {contact.name ||
              "Not available"}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            Phone
          </span>

          <strong>
            {contact.phone ||
              "Not available"}
          </strong>

        </div>

      </div>


      {/* =================================================
          CONVERSATION DETAILS
      ================================================= */}

      <div className="details-section">

        <h4>
          Conversation Details
        </h4>


        <div className="detail-row">

          <span>
            Contact ID
          </span>

          <strong>
            {contact.contactId ||
              "Not available"}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            Status
          </span>

          <strong>
            {status}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            Intent
          </span>

          <strong>
            {contact.intent ||
              "General Query"}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            Total Messages
          </span>

          <strong>
            {messages.length}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            First Message
          </span>

          <strong>
            {formatDateTime(
              firstMessage?.timestamp
            )}
          </strong>

        </div>


        <div className="detail-row">

          <span>
            Last Message
          </span>

          <strong>
            {formatDateTime(
              lastMessage?.timestamp
            )}
          </strong>

        </div>

      </div>


            {/* =================================================
          ACTIONS
      ================================================= */}

      {status !== "Completed" &&
       status !== "Blocked" && (

        <div className="details-section actions-section">

          <h4>
            Actions
          </h4>


          {/* ===============================================
              TAKE OVER

              Show only when AI is handling
          =============================================== */}

          {handledBy !== "Human" && (

            <button
              type="button"
              className="action-primary"
              onClick={handleTakeOver}
              disabled={takingOver}
            >

              {takingOver
                ? "Taking Over..."
                : "Take Over"}

            </button>

          )}


          {/* ===============================================
              RESOLVE
          =============================================== */}

          <button
            type="button"
            className="action-resolved"
            onClick={handleResolve}
            disabled={resolving}
          >

            {resolving
              ? "Resolving..."
              : "Mark as Resolved"}

          </button>


          {/* ===============================================
              BLOCK
          =============================================== */}

          <button
            type="button"
            className="action-block"
            onClick={handleBlock}
            disabled={blocking}
          >

            {blocking
              ? "Blocking..."
              : "Block Contact"}

          </button>

        </div>

      )}

    </div>
  );
}