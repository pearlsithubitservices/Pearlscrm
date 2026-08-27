import React, { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { fetchConversations } from "./services/api";

import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import ContactDetails from "./components/ContactDetails";

export default function Conversations() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchConversations();

        console.log("Conversations from API:", data);

        setItems(data);

        if (data.length > 0) {
          setSelected(data[0]);
        }
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      }
    };

    loadConversations();
  }, []);

  return (
    <div className="conversations-page">

      {/* ================= MAIN CONVERSATION LAYOUT ================= */}

      <div className="conversation-layout">

        {/* ================= LEFT PANEL ================= */}

        <div className="conversation-left">

          <ConversationList
            items={items}
            onSelect={setSelected}
          />

        </div>


        {/* ================= CENTER PANEL ================= */}

        <div className="conversation-center">

          {/* FILTERS */}

          <div className="conversation-top-filters">

            <select className="conversation-select">
              <option value="">
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>


            <select className="conversation-select">

              <option value="">
                All Intent
              </option>

              <option value="ATTENDANCE_STATUS">
                Attendance Status
              </option>

              <option value="APPLY_LEAVE">
                Apply Leave
              </option>

              <option value="ORDER_STATUS">
                Order Status
              </option>

              <option value="GENERAL_QUERY">
                General Query
              </option>

            </select>


            <button
              className="conversation-filter-button"
              type="button"
            >
              <SlidersHorizontal size={18} />
            </button>

          </div>


          {/* ================= CHAT ================= */}

          <div className="conversation-chat">

            <ChatWindow
              conversation={selected}
            />

          </div>

        </div>


        {/* ================= RIGHT PANEL ================= */}

        <div className="conversation-right">

          <ContactDetails
            contact={selected}
          />

        </div>

      </div>

    </div>
  );
}