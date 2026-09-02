import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "http://127.0.0.1:8000/api/v1/handoff";

export default function HumanHandoff() {

  const navigate = useNavigate();

  const [handoffs, setHandoffs] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // OPEN CONVERSATION
  // =====================================================

  const openConversation = (conversationId) => {

    if (!conversationId) {
      alert("Conversation ID is not available.");
      return;
    }

    navigate("/whatsapp-automation/conversations", {
      state: {
        conversation_id: conversationId,
      },
    });

  };



  // =====================================================
  // FETCH HANDOFF REQUESTS
  // =====================================================

  const fetchHandoffs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/`);

      if (!response.ok) {
        throw new Error("Failed to fetch handoff requests");
      }

      const data = await response.json();

      console.log("Human handoff API response:", data);

      setHandoffs(data.requests || []);
    } catch (err) {
      console.error("Handoff fetch error:", err);
      setError("Unable to connect to Human Handoff backend.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchHandoffs();
  }, []);

  // =====================================================
  // RESOLVE HANDOFF
  // =====================================================

  const resolveHandoff = async (handoffId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${handoffId}/resolve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve handoff");
      }

      const updatedHandoff = await response.json();

      console.log(
        "Resolved handoff response:",
        updatedHandoff
      );

      const updatedId =
        updatedHandoff._id || updatedHandoff.id;

      setHandoffs((previousHandoffs) =>
        previousHandoffs.map((handoff) => {
          const currentId = handoff._id || handoff.id;

          return String(currentId) === String(updatedId)
            ? {
                ...handoff,
                ...updatedHandoff,
                status: "resolved",
              }
            : handoff;
        })
      );

      if (selectedConversation) {
        const selectedId =
          selectedConversation._id ||
          selectedConversation.id;

        if (String(selectedId) === String(updatedId)) {
          setSelectedConversation((previous) => ({
            ...previous,
            ...updatedHandoff,
            status: "resolved",
          }));
        }
      }

      // Refresh from backend to make sure latest data is shown
      await fetchHandoffs();

    } catch (err) {
      console.error("Resolve handoff error:", err);
      alert("Unable to resolve handoff.");
    }
  };

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const formatStatus = (status) => {
    if (!status || status === "waiting") {
      return "Pending";
    }

    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "resolved") {
      return "Resolved";
    }

    return status;
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // TIME AGO
  // =====================================================

  const getTimeAgo = (dateString) => {
    if (!dateString) {
      return "-";
    }

    const now = new Date();
    const createdDate = new Date(dateString);

    const difference =
      now.getTime() - createdDate.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
  };

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "HR";
    }

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // FILTER HANDOFFS
  // =====================================================

  const filteredHandoffs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return handoffs.filter((item) => {
      const formattedStatus = formatStatus(
        item.status
      );

      const matchesTab =
        activeTab === "All" ||
        formattedStatus === activeTab;

      const employeeName =
        item.employee_name || "";

      const message =
        item.message || "";

      const source =
        item.source || "";

      const matchesSearch =
        !query ||
        employeeName
          .toLowerCase()
          .includes(query) ||
        message
          .toLowerCase()
          .includes(query) ||
        source
          .toLowerCase()
          .includes(query);

      return matchesTab && matchesSearch;
    });
  }, [handoffs, activeTab, search]);

  // =====================================================
  // OVERVIEW DATA
  // =====================================================

  const totalHandoffs = handoffs.length;

  const pendingCount = handoffs.filter(
    (item) => item.status === "waiting"
  ).length;

  const inProgressCount = handoffs.filter(
    (item) => item.status === "in_progress"
  ).length;

  const resolvedCount = handoffs.filter(
    (item) => item.status === "resolved"
  ).length;

  // =====================================================
  // BADGE STYLE
  // =====================================================

  const badgeStyle = (status) => {
    const styles = {
      Pending: {
        background: "#fff8e8",
        color: "#e9a52b",
      },

      "In Progress": {
        background: "#edf4ff",
        color: "#548bdc",
      },

      Resolved: {
        background: "#edf9f1",
        color: "#4ca66c",
      },
    };

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      minWidth: "75px",
      ...(styles[status] || styles.Pending),
    };
  };

  // =====================================================
  // CARD STYLE
  // =====================================================

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#ffffff",
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "25px 30px 40px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#172033",
      }}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "27px",
            fontWeight: 700,
            color: "#0f2747",
          }}
        >
          Human Handoff
        </h1>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Monitor and manage conversations handed off
          from AI to human agents.
        </p>
      </div>

      {/* ================================================= */}
      {/* OVERVIEW */}
      {/* ================================================= */}

      <div
        style={{
          marginTop: "30px",
          marginBottom: "15px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
          }}
        >
          Handoff Overview
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        <OverviewCard
          title="Total Handoffs"
          value={totalHandoffs}
          color="#3b82f6"
        />

        <OverviewCard
          title="Pending"
          value={pendingCount}
          color="#f59e0b"
        />

        <OverviewCard
          title="In Progress"
          value={inProgressCount}
          color="#8b5cf6"
        />

        <OverviewCard
          title="Resolved"
          value={resolvedCount}
          color="#22c55e"
        />
      </div>

      {/* ================================================= */}
      {/* HANDOFF QUEUE */}
      {/* ================================================= */}

      <div
        style={{
          marginTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            Handoff Queue
          </h2>

          <button
            type="button"
            onClick={fetchHandoffs}
            style={{
              border: "1px solid #65a873",
              background: "#f8fffa",
              color: "#4f9361",
              borderRadius: "7px",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Refresh
          </button>
        </div>

        {/* ================================================= */}
        {/* TABS AND SEARCH */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {[
              "All",
              "Pending",
              "In Progress",
              "Resolved",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(tab)
                }
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 15px",
                  background:
                    activeTab === tab
                      ? "#edf9f0"
                      : "#ffffff",
                  color:
                    activeTab === tab
                      ? "#4d9a60"
                      : "#475569",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight:
                    activeTab === tab
                      ? 600
                      : 400,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search employee or message..."
            style={{
              width: "240px",
              height: "36px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fff1f2",
              color: "#dc2626",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div
          style={{
            ...cardStyle,
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                <TableHeader text="Employee" />
                <TableHeader text="Message" />
                <TableHeader text="Source" />
                <TableHeader text="Status" />
                <TableHeader text="Handoff Time" />
                <TableHeader text="Conversation" />
                <TableHeader text="Action" />
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "35px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Loading handoff requests...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredHandoffs.map(
                  (item) => {
                    const status =
                      formatStatus(
                        item.status
                      );

                    const handoffId =
                      item._id || item.id;

                    return (
                      <tr
                        key={handoffId}
                      >
                        {/* EMPLOYEE */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "9px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius:
                                  "50%",
                                background:
                                  "#65a873",
                                color:
                                  "#ffffff",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  700,
                              }}
                            >
                              {getInitials(
                                item.employee_name
                              )}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              {item.employee_name ||
                                "Unknown Employee"}
                            </div>
                          </div>
                        </td>

                        {/* MESSAGE */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                            fontSize:
                              "11px",
                            maxWidth:
                              "300px",
                          }}
                        >
                          {item.message}
                        </td>

                        {/* SOURCE */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                            fontSize:
                              "11px",
                          }}
                        >
                          {item.source ||
                            "-"}
                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                          }}
                        >
                          <span
                            style={badgeStyle(
                              status
                            )}
                          >
                            {status}
                          </span>
                        </td>

                        {/* TIME */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "11px",
                              fontWeight:
                                600,
                            }}
                          >
                            {formatTime(
                              item.created_at
                            )}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "10px",
                              color:
                                "#64748b",
                              marginTop:
                                "3px",
                            }}
                          >
                            {getTimeAgo(
                              item.created_at
                            )}
                          </div>
                        </td>

                        {/* VIEW */}

                       <td
  style={{
    padding: "12px 14px",
    borderBottom: "1px solid #edf2f7",
    display: "flex",
    gap: "8px",
  }}
>
  {/* VIEW DETAILS */}

  <button
    type="button"
    onClick={() =>
      setSelectedConversation(item)
    }
    style={{
      height: "30px",
      padding: "0 11px",
      border: "1px solid #b9dfc4",
      background: "#f8fffa",
      borderRadius: "7px",
      color: "#4f9361",
      fontSize: "10px",
      cursor: "pointer",
    }}
  >
    View Details
  </button>


  {/* OPEN CRM CONVERSATION */}

  {item.conversation_id && (
    <button
      type="button"
      onClick={() =>
        openConversation(
          item.conversation_id
        )
      }
      style={{
        height: "30px",
        padding: "0 11px",
        border: "1px solid #b9dfc4",
        background: "#f8fffa",
        borderRadius: "7px",
        color: "#4f9361",
        fontSize: "10px",
        cursor: "pointer",
      }}
    >
      Open Conversation
    </button>
  )}
</td>

                        {/* ACTION */}

                        <td
                          style={{
                            padding:
                              "12px 14px",
                            borderBottom:
                              "1px solid #edf2f7",
                          }}
                        >
                          {item.status !==
                            "resolved" && (
                            <button
                              type="button"
                              onClick={() =>
                                resolveHandoff(
                                  handoffId
                                )
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "#65a873",
                                color:
                                  "#ffffff",
                                borderRadius:
                                  "6px",
                                padding:
                                  "7px 12px",
                                fontSize:
                                  "10px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

              {!loading &&
                filteredHandoffs.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        padding: "35px",
                        textAlign:
                          "center",
                        color:
                          "#94a3b8",
                        fontSize:
                          "12px",
                      }}
                    >
                      No handoff requests found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {selectedConversation && (
        <div
          onClick={() =>
            setSelectedConversation(
              null
            )
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "450px",
              maxWidth: "90%",
              background:
                "#ffffff",
              borderRadius:
                "12px",
              padding: "22px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "17px",
                    fontWeight:
                      700,
                  }}
                >
                  {selectedConversation.employee_name ||
                    "Human Handoff"}
                </div>

                <div
                  style={{
                    marginTop:
                      "4px",
                    fontSize:
                      "11px",
                    color:
                      "#64748b",
                  }}
                >
                  Handoff Request
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedConversation(
                    null
                  )
                }
                style={{
                  border: "none",
                  background:
                    "#f1f5f9",
                  borderRadius:
                    "50%",
                  width: "30px",
                  height: "30px",
                  cursor:
                    "pointer",
                  fontSize:
                    "18px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background:
                  "#f8fafc",
                borderRadius:
                  "9px",
                padding:
                  "15px",
                fontSize:
                  "12px",
                lineHeight:
                  "1.8",
              }}
            >
              <div>
                <strong>
                  Message:
                </strong>{" "}
                {
                  selectedConversation.message
                }
              </div>

              <div>
                <strong>
                  Source:
                </strong>{" "}
                {
                  selectedConversation.source ||
                  "-"
                }
              </div>

              <div>
                <strong>
                  Status:
                </strong>{" "}
                {formatStatus(
                  selectedConversation.status
                )}
              </div>

              <div>
                <strong>
                  Created:
                </strong>{" "}
                {selectedConversation.created_at
                  ? new Date(
                      selectedConversation.created_at
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>

            {selectedConversation.status !==
              "resolved" && (
              <button
                type="button"
                onClick={() =>
                  resolveHandoff(
                    selectedConversation._id ||
                      selectedConversation.id
                  )
                }
                style={{
                  width: "100%",
                  marginTop:
                    "18px",
                  height:
                    "38px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#65a873",
                  color:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                }}
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// =====================================================
// OVERVIEW CARD COMPONENT
// =====================================================

function OverviewCard({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "10px",
        background:
          "#ffffff",
        padding:
          "18px",
        minHeight:
          "110px",
      }}
    >
      <div
        style={{
          fontSize:
            "12px",
          color:
            "#64748b",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop:
            "15px",
          fontSize:
            "30px",
          fontWeight:
            700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// =====================================================
// TABLE HEADER COMPONENT
// =====================================================

function TableHeader({ text }) {
  return (
    <th
      style={{
        textAlign:
          "left",
        padding:
          "13px 14px",
        fontSize:
          "11px",
        fontWeight:
          700,
        color:
          "#374151",
        background:
          "#fbfcfd",
        borderBottom:
          "1px solid #e2e8f0",
        whiteSpace:
          "nowrap",
      }}
    >
      {text}
    </th>
  );
}