import React, { useState } from "react";

export default function HumanHandoff() {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState("May 22, 2025 - May 29, 2025");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "May 22, 2025 - May 29, 2025",
  ];

  const handoffs = [
    {
      id: 1,
      initials: "SU",
      avatar: "#c084fc",
      employee: "Suveth",
      phone: "+91 98765 43210",
      intent: "Attendance Status",
      reason: "HR Verification Required",
      assignedTo: "Priya HR",
      priority: "High",
      status: "Pending",
      time: "10:42 AM",
      ago: "12 min ago",
    },
    {
      id: 2,
      initials: "PV",
      avatar: "#65b86b",
      employee: "Pavithra V",
      phone: "+91 91234 56789",
      intent: "Apply Leave",
      reason: "Leave Approval Required",
      assignedTo: "Ramesh HR",
      priority: "Medium",
      status: "In Progress",
      time: "10:17 AM",
      ago: "37 min ago",
    },
    {
      id: 3,
      initials: "K",
      avatar: "#f5c94a",
      employee: "Keshav",
      phone: "+91 99876 54321",
      intent: "Salary Query",
      reason: "Complex Query",
      assignedTo: "HR Team",
      priority: "High",
      status: "Pending",
      time: "09:58 AM",
      ago: "56 min ago",
    },
    {
      id: 4,
      initials: "H",
      avatar: "#91b7e8",
      employee: "Harshini",
      phone: "+91 90123 45678",
      intent: "Attendance Status",
      reason: "AI Unable to Answer",
      assignedTo: "Priya HR",
      priority: "Low",
      status: "Pending",
      time: "09:30 AM",
      ago: "1h 24m ago",
    },
    {
      id: 5,
      initials: "S",
      avatar: "#c084c9",
      employee: "Siranjeevi",
      phone: "+91 87654 32109",
      intent: "Leave Request",
      reason: "Policy Clarification",
      assignedTo: "Ramesh HR",
      priority: "Medium",
      status: "In Progress",
      time: "09:15 AM",
      ago: "1h 39m ago",
    },
  ];

  const filteredHandoffs = handoffs.filter((item) => {
    const matchesTab = activeTab === "All" || item.status === activeTab;
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      item.employee.toLowerCase().includes(query) ||
      item.intent.toLowerCase().includes(query) ||
      item.reason.toLowerCase().includes(query) ||
      item.assignedTo.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#ffffff",
    boxSizing: "border-box",
  };

  const smallIconBox = (background) => ({
    width: "40px",
    height: "40px",
    borderRadius: "9px",
    background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  const badgeStyle = (type) => {
    const styles = {
      High: { background: "#fff0f0", color: "#f06b6b" },
      Medium: { background: "#fff6e7", color: "#e99b2f" },
      Low: { background: "#edf9f0", color: "#5aa66b" },
      Pending: { background: "#fff8e8", color: "#e9a52b" },
      "In Progress": { background: "#edf4ff", color: "#548bdc" },
      Resolved: { background: "#edf9f1", color: "#4ca66c" },
    };

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: type === "In Progress" ? "78px" : "48px",
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      ...styles[type],
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "18px 30px 40px",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#172033",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "27px",
              lineHeight: "34px",
              fontWeight: 700,
              color: "#0f2747",
            }}
          >
            Human Handoff
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Monitor and manage conversations that have been handed off from AI
            to human agents.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8C18 5.79 16.21 4 14 4H10C7.79 4 6 5.79 6 8V13L4 16H20L18 13V8Z"
                stroke="#475569"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 19C9.4 20.15 10.48 21 12 21C13.52 21 14.6 20.15 15 19"
                stroke="#475569"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>

            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-3px",
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
              }}
            >
              3
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              P
            </div>

            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, lineHeight: "16px" }}>
                Priya HR
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: "14px" }}>
                HR Admin
              </div>
            </div>

            <span style={{ fontSize: "13px", color: "#64748b" }}>⌄</span>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "calc(100% + 60px)",
          height: "1px",
          background: "#e2e8f0",
          marginTop: "16px",
          marginLeft: "-30px",
        }}
      />

      {/* 1. HANDOFF OVERVIEW */}
      <div
        style={{
          marginTop: "28px",
          marginBottom: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
          1. Handoff Overview
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* DATE DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              style={{
                height: "38px",
                minWidth: "250px",
                padding: "0 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                background: "#fff",
                border: "1px solid #d9dee7",
                borderRadius: "8px",
                color: "#374151",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4.5"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="#475569"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M7 2.8V6.2M17 2.8V6.2M3 9H21"
                    stroke="#475569"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{selectedDate}</span>
              </span>
              <span style={{ fontSize: "15px", color: "#64748b" }}>⌄</span>
            </button>

            {showDateDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "44px",
                  right: 0,
                  width: "250px",
                  background: "#fff",
                  border: "1px solid #e1e5eb",
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                  padding: "6px",
                  zIndex: 1000,
                }}
              >
                {dateOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedDate(option);
                      setShowDateDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      background: selectedDate === option ? "#f5f7fa" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            style={{
              height: "38px",
              padding: "0 13px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "#fff",
              border: "1px solid #d9dee7",
              borderRadius: "8px",
              color: "#374151",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6H20M7 12H17M10 18H14"
                stroke="#475569"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        {[
          {
            title: "Total Handoffs",
            value: "27",
            sub: "100% of conversations",
            bg: "#eff6ff",
            color: "#3b82f6",
            icon: "users",
          },
          {
            title: "Pending",
            value: "8",
            sub: "29.63% of handoffs",
            bg: "#fff7ed",
            color: "#f59e0b",
            icon: "clock",
          },
          {
            title: "In Progress",
            value: "5",
            sub: "18.52% of handoffs",
            bg: "#f5f3ff",
            color: "#8b5cf6",
            icon: "play",
          },
          {
            title: "Resolved",
            value: "14",
            sub: "51.85% of handoffs",
            bg: "#f0fdf4",
            color: "#22c55e",
            icon: "check",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              ...cardStyle,
              minHeight: "125px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "10px",
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: "27px", fontWeight: 700 }}>
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: "9px",
                  }}
                >
                  {card.sub}
                </div>
              </div>

              <div style={smallIconBox(card.bg)}>
                {card.icon === "users" && (
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="3" stroke={card.color} strokeWidth="1.7" />
                    <path
                      d="M3.5 19C3.5 15.9 5.9 13.5 9 13.5C12.1 13.5 14.5 15.9 14.5 19"
                      stroke={card.color}
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <circle cx="17" cy="9" r="2.5" stroke={card.color} strokeWidth="1.7" />
                  </svg>
                )}
                {card.icon === "clock" && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke={card.color} strokeWidth="1.6" />
                    <path
                      d="M12 7V12L15 14"
                      stroke={card.color}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {card.icon === "play" && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke={card.color} strokeWidth="1.6" />
                    <path d="M10 9L15 12L10 15V9Z" fill={card.color} />
                  </svg>
                )}
                {card.icon === "check" && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke={card.color} strokeWidth="1.6" />
                    <path
                      d="M8 12L11 15L16 9"
                      stroke={card.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 + 4 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: "22px",
          marginTop: "46px",
          alignItems: "start",
        }}
      >
        {/* HANDOFF REASONS */}
        <div>
          <h2 style={{ margin: "0 0 18px", fontSize: "18px", fontWeight: 700 }}>
            2. Handoff Reasons
          </h2>

          <div
            style={{
              ...cardStyle,
              minHeight: "280px",
              padding: "18px",
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}
          >
            <div
              style={{
                width: "190px",
                height: "190px",
                borderRadius: "50%",
                background:
                  "conic-gradient(#3b82f6 0% 44%, #22c55e 44% 70%, #f59e0b 70% 85%, #8b5cf6 85% 96%, #ec4899 96% 100%)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "48px",
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
              <span style={{ position: "absolute", top: "76px", right: "8px", color: "#fff", fontSize: "11px", fontWeight: 700 }}>44%</span>
              <span style={{ position: "absolute", bottom: "27px", left: "60px", color: "#fff", fontSize: "11px", fontWeight: 700 }}>26%</span>
              <span style={{ position: "absolute", left: "20px", top: "87px", color: "#fff", fontSize: "11px", fontWeight: 700 }}>15%</span>
              <span style={{ position: "absolute", top: "31px", left: "50px", color: "#fff", fontSize: "10px", fontWeight: 700 }}>11%</span>
              <span style={{ position: "absolute", top: "10px", left: "80px", color: "#fff", fontSize: "10px", fontWeight: 700 }}>4%</span>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 65px 35px",
                  paddingBottom: "10px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <span>Reason</span>
                <span>Handoffs</span>
                <span>%</span>
              </div>

              {[
                ["Attendance Issue", "12", "44%", "#3b82f6"],
                ["Leave Request", "7", "26%", "#22c55e"],
                ["Salary Query", "4", "15%", "#f59e0b"],
                ["Complex Query", "3", "11%", "#8b5cf6"],
                ["AI Unable to Answer", "1", "4%", "#ec4899"],
              ].map(([name, count, percent, dotColor]) => (
                <div
                  key={name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 65px 35px",
                    alignItems: "center",
                    padding: "10px 0",
                    borderTop: "1px solid #edf2f7",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: dotColor,
                      }}
                    />
                    {name}
                  </span>
                  <strong>{count}</strong>
                  <strong>{percent}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HR PERFORMANCE */}
        <div>
          <h2 style={{ margin: "0 0 18px", fontSize: "18px", fontWeight: 700 }}>
            4. HR Performance
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {[
              ["Average Response Time", "8 min", "Time to first response", "#65a873"],
              ["Average Resolution Time", "24 min", "Time to resolve", "#65a873"],
              ["Oldest Pending Handoff", "42 min", "Waiting for response", "#e85d04"],
              ["Handoff Resolution Rate", "82%", "Resolved successfully", "#65a873"],
            ].map(([title, value, sub, graphColor]) => (
              <div
                key={title}
                style={{
                  ...cardStyle,
                  minHeight: "130px",
                  padding: "18px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "18px" }}>
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "27px",
                    lineHeight: "32px",
                    fontWeight: 700,
                    color: title === "Oldest Pending Handoff" ? "#e85d04" : "#172033",
                  }}
                >
                  {value}
                </div>
                <div style={{ marginTop: "12px", fontSize: "9px", color: "#94a3b8" }}>
                  {sub}
                </div>

                <svg
                  width="105"
                  height="48"
                  viewBox="0 0 125 55"
                  style={{ position: "absolute", right: "8px", bottom: "8px", opacity: 0.5 }}
                >
                  <path
                    d="M2 42 C15 34,20 38,30 32 S45 40,55 24 S68 36,78 20 S92 30,101 12 S113 26,123 7 L123 55 L2 55 Z"
                    fill={graphColor}
                    opacity="0.12"
                  />
                  <path
                    d="M2 42 C15 34,20 38,30 32 S45 40,55 24 S68 36,78 20 S92 30,101 12 S113 26,123 7"
                    fill="none"
                    stroke={graphColor}
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HANDOFF QUEUE */}
      <div style={{ marginTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
            3. Handoff Queue
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "2px",
                background: "#fff",
              }}
            >
              {["All", "Pending", "In Progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: activeTab === tab ? "1px solid #65a873" : "1px solid transparent",
                    background: activeTab === tab ? "#fff" : "#fff",
                    color: activeTab === tab ? "#4d9a60" : "#475569",
                    borderRadius: "7px",
                    padding: "8px 16px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div
              style={{
                height: "36px",
                width: "132px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: "7px",
                boxSizing: "border-box",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6" stroke="#64748b" strokeWidth="1.7" />
                <path d="M16 16L21 21" stroke="#64748b" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "11px",
                  color: "#374151",
                }}
              />
            </div>
          </div>
        </div>

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
              minWidth: "1000px",
            }}
          >
            <thead>
              <tr>
                {[
                  "Employee",
                  "Intent",
                  "Reason",
                  "Assigned To",
                  "Priority",
                  "Status",
                  "Handoff Time",
                  "View Conversation",
                  "",
                ].map((heading, index) => (
                  <th
                    key={index}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#374151",
                      background: "#fbfcfd",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredHandoffs.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: item.avatar,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {item.employee}
                        </div>
                        <div style={{ fontSize: "9px", color: "#64748b", marginTop: "3px" }}>
                          {item.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7", fontSize: "11px", whiteSpace: "nowrap" }}>
                    {item.intent}
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7", fontSize: "11px", whiteSpace: "nowrap" }}>
                    {item.reason}
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7", fontSize: "11px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#eef2f7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {item.assignedTo === "HR Team" ? "HR" : item.assignedTo === "Priya HR" ? "P" : "R"}
                      </div>
                      {item.assignedTo}
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7" }}>
                    <span style={badgeStyle(item.priority)}>{item.priority}</span>
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7" }}>
                    <span style={badgeStyle(item.status)}>{item.status}</span>
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700 }}>{item.time}</div>
                    <div style={{ fontSize: "9px", color: "#64748b", marginTop: "3px" }}>
                      {item.ago}
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #edf2f7" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(item)}
                      style={{
                        height: "28px",
                        padding: "0 10px",
                        border: "1px solid #b9dfc4",
                        background: "#f8fffa",
                        borderRadius: "7px",
                        color: "#4f9361",
                        fontSize: "10px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ◉&nbsp; View Conversation
                    </button>
                  </td>

                  <td style={{ padding: "11px 10px", borderBottom: "1px solid #edf2f7" }}>
                    <button
                      type="button"
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "18px",
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}

              {filteredHandoffs.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    No handoffs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONVERSATION MODAL */}
      {selectedConversation && (
        <div
          onClick={() => setSelectedConversation(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "430px",
              maxWidth: "90%",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              padding: "22px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  {selectedConversation.employee}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>
                  {selectedConversation.phone}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConversation(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "9px",
                padding: "14px",
                fontSize: "12px",
                lineHeight: "1.7",
                color: "#475569",
              }}
            >
              <div><strong>Intent:</strong> {selectedConversation.intent}</div>
              <div><strong>Reason:</strong> {selectedConversation.reason}</div>
              <div><strong>Assigned To:</strong> {selectedConversation.assignedTo}</div>
              <div><strong>Status:</strong> {selectedConversation.status}</div>
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "13px",
                border: "1px solid #e2e8f0",
                borderRadius: "9px",
                fontSize: "11px",
                color: "#475569",
              }}
            >
              Conversation preview will appear here when the backend conversation
              API is connected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
