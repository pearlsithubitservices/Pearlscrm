import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import { SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";

import { fetchConversations } from "./services/api";

import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import ContactDetails from "./components/ContactDetails";


export default function Conversations() {

  const location = useLocation();

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  // ===============================
  // FILTER STATES
  // ===============================

  const [statusFilter, setStatusFilter] =
    useState("");

  const [intentFilter, setIntentFilter] =
    useState("");


  // =====================================================
  // GET CONVERSATION ID FROM HUMAN HANDOFF PAGE
  // =====================================================

  const handoffConversationId =
    location.state?.conversation_id || null;


  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  useEffect(() => {

    const loadConversations = async () => {

      try {

        const data =
          await fetchConversations();

        console.log(
          "Conversations from API:",
          data
        );

        setItems(data);


        // ===============================================
        // OPEN CONVERSATION FROM HUMAN HANDOFF
        // ===============================================

        if (handoffConversationId) {

          console.log(
            "Human handoff conversation ID:",
            handoffConversationId
          );

          const matchingConversation =
            data.find(
              (conversation) => {

                const conversationId =
                  conversation._id ||
                  conversation.id;

                return (
                  String(conversationId) ===
                  String(handoffConversationId)
                );

              }
            );


          console.log(
            "Matching conversation:",
            matchingConversation
          );


          if (matchingConversation) {

            setSelected(
              matchingConversation
            );

            return;
          }


          console.warn(
            "No matching conversation found for handoff ID:",
            handoffConversationId
          );
        }


        // ===============================================
        // DEFAULT FIRST CONVERSATION
        // ===============================================

        if (data.length > 0) {

          setSelected(
            data[0]
          );
        }

      } catch (error) {

        console.error(
          "Failed to load conversations:",
          error
        );
      }

    };


    loadConversations();

  }, [
    handoffConversationId
  ]);


  // =====================================================
  // FILTER CONVERSATIONS
  // =====================================================

  const filteredItems = useMemo(() => {

    return items.filter(
      (conversation) => {


        // ===============================================
        // STATUS
        // ===============================================

        const conversationStatus =
          conversation.status || "";


        const statusMatches =
          !statusFilter ||
          conversationStatus
            .toLowerCase()
            .trim() ===
          statusFilter
            .toLowerCase()
            .trim();


        // ===============================================
        // INTENT
        // ===============================================

        const conversationIntent =
          conversation.intent || "";


        const intentMatches =
          !intentFilter ||
          conversationIntent
            .toUpperCase()
            .replace(/\s+/g, "_")
            .trim() ===
          intentFilter
            .toUpperCase()
            .trim();


        // ===============================================
        // RETURN FILTER RESULT
        // ===============================================

        return (
          statusMatches &&
          intentMatches
        );

      }
    );

  }, [
    items,
    statusFilter,
    intentFilter
  ]);


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleResetFilters = () => {

    setStatusFilter("");
    setIntentFilter("");

  };


  // =====================================================
  // UPDATE SELECTED CONVERSATION
  // WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {

    if (
      filteredItems.length === 0
    ) {

      setSelected(null);

      return;
    }


    // Check whether currently selected
    // conversation still exists in filtered list

    const selectedStillExists =
      filteredItems.some(
        (conversation) => {

          const currentId =
            conversation._id ||
            conversation.id;

          const selectedId =
            selected?._id ||
            selected?.id;

          return (
            String(currentId) ===
            String(selectedId)
          );

        }
      );


    // Select first conversation
    // if current selected is filtered out

    if (
      !selected ||
      !selectedStillExists
    ) {

      setSelected(
        filteredItems[0]
      );
    }

  }, [
    filteredItems
  ]);


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="conversations-page">


      {/* ================= MAIN LAYOUT ================= */}

      <div className="conversation-layout">


        {/* ================= LEFT PANEL ================= */}

        <div className="conversation-left">

          <ConversationList
            items={filteredItems}
            onSelect={setSelected}
          />

        </div>


        {/* ================= CENTER PANEL ================= */}

        <div className="conversation-center">


          {/* ================= FILTERS ================= */}

          <div className="conversation-top-filters">


            {/* STATUS FILTER */}

            <select
              className="conversation-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="In Progress">
                In Progress
              </option>

              

            </select>


            {/* INTENT FILTER */}

            <select
              className="conversation-select"
              value={intentFilter}
              onChange={(event) =>
                setIntentFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Intent
              </option>

              <option value="ATTENDANCE_STATUS">
                Attendance Status
              </option>

              <option value="APPLY_LEAVE">
                Apply Leave
              </option>

              <option value="GENERAL_QUERY">
                General Query
              </option>

            </select>


            {/* RESET FILTER */}

            <button
              className="conversation-filter-button"
              type="button"
              onClick={handleResetFilters}
              title="Clear Filters"
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