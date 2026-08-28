import React, { useEffect, useState } from "react";

import {
  MessageSquare,
  Bot,
  User,
  CheckCircle,
  Clock,
  Ban,
  MessagesSquare,
  RefreshCcw,
  Users,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

/* =====================================================
   PERCENTAGE HELPER
   IMPORTANT:
   Keep this OUTSIDE all React components.
===================================================== */

const getPercentage = (value, total) => {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  if (numericTotal <= 0) {
    return 0;
  }

  return Math.round((numericValue / numericTotal) * 100);
};


/* =====================================================
   MAIN REPORT COMPONENT
===================================================== */

export default function WhatsAppReports() {
  const [summary, setSummary] = useState({
    totalConversations: 0,

    aiHandled: 0,
    humanHandled: 0,

    completed: 0,
    inProgress: 0,
    blocked: 0,

    totalMessages: 0,

    employeeMessages: 0,
    aiMessages: 0,
    agentMessages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  /* =====================================================
     FETCH REPORT SUMMARY
  ===================================================== */

  const fetchSummary = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/reports/summary`
      );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("WhatsApp Reports:", data);

      setSummary({
        totalConversations:
          Number(data.totalConversations) || 0,

        aiHandled:
          Number(data.aiHandled) || 0,

        humanHandled:
          Number(data.humanHandled) || 0,

        completed:
          Number(data.completed) || 0,

        inProgress:
          Number(data.inProgress) || 0,

        blocked:
          Number(data.blocked) || 0,

        totalMessages:
          Number(data.totalMessages) || 0,

        /*
          Support both names temporarily:
          employeeMessages
          OR customerMessages
        */

        employeeMessages:
          Number(
            data.employeeMessages ??
            data.customerMessages
          ) || 0,

        aiMessages:
          Number(data.aiMessages) || 0,

        agentMessages:
          Number(data.agentMessages) || 0,
      });

    } catch (err) {
      console.error(
        "WhatsApp analytics error:",
        err
      );

      setError(
        "Unable to load WhatsApp analytics. Make sure the backend server is running."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchSummary();
  }, []);


  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchSummary();
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={pageStyle}>

        <div style={loadingBox}>

          <div style={spinner}></div>

          <p>
            Loading WhatsApp analytics...
          </p>

        </div>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div style={pageStyle}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={header}>

        <div>

          <div style={titleRow}>

            <div style={titleIcon}>
              <MessageSquare size={22} />
            </div>

            <h1 style={title}>
              WhatsApp Reports & Analytics
            </h1>

          </div>

          <p style={subtitle}>
            Monitor employee WhatsApp conversations,
            AI handling and admin activity.
          </p>

        </div>


        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={refreshButton}
        >

          <RefreshCcw
            size={16}
            style={{
              animation: refreshing
                ? "spin 1s linear infinite"
                : "none",
            }}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div style={errorBox}>

          <strong>
            Analytics unavailable
          </strong>

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =================================================
          CONVERSATION OVERVIEW
      ================================================= */}

      <h2 style={sectionTitle}>
        Conversation Overview
      </h2>

      <p style={sectionSubtitle}>
        Employee WhatsApp conversations handled by AI
        and human admins.
      </p>


      <div style={grid}>

        {/* TOTAL */}

        <StatCard
          title="Total Conversations"
          value={summary.totalConversations}
          icon={MessageSquare}
          background="#eff6ff"
          color="#2563eb"
          description="All employee conversations"
        />


        {/* AI */}

        <StatCard
          title="AI Handled"
          value={summary.aiHandled}
          icon={Bot}
          background="#f0fdf4"
          color="#16a34a"
          description={`${getPercentage(
            summary.aiHandled,
            summary.totalConversations
          )}% of conversations`}
        />


        {/* ADMIN */}

        <StatCard
          title="Admin Handled"
          value={summary.humanHandled}
          icon={User}
          background="#fff7ed"
          color="#ea580c"
          description={`${getPercentage(
            summary.humanHandled,
            summary.totalConversations
          )}% of conversations`}
        />


        {/* COMPLETED */}

        <StatCard
          title="Completed"
          value={summary.completed}
          icon={CheckCircle}
          background="#ecfdf5"
          color="#059669"
          description="Resolved conversations"
        />


        {/* IN PROGRESS */}

        <StatCard
          title="In Progress"
          value={summary.inProgress}
          icon={Clock}
          background="#fefce8"
          color="#ca8a04"
          description="Currently active"
        />


        {/* BLOCKED */}

        <StatCard
          title="Blocked"
          value={summary.blocked}
          icon={Ban}
          background="#fef2f2"
          color="#dc2626"
          description="Blocked conversations"
        />

      </div>


      {/* =================================================
          MESSAGE ANALYTICS
      ================================================= */}

      <div style={section}>

        <h2 style={sectionTitle}>
          Message Analytics
        </h2>

        <p style={sectionSubtitle}>
          Breakdown of employee, AI and admin messages.
        </p>


        <div style={messageGrid}>

          {/* TOTAL MESSAGES */}

          <div style={bigCard}>

            <div style={bigIcon}>
              <MessagesSquare size={25} />
            </div>

            <p style={label}>
              Total Messages
            </p>

            <h2 style={bigNumber}>
              {summary.totalMessages}
            </h2>

            <p style={muted}>
              All messages exchanged
            </p>

          </div>


          {/* MESSAGE BREAKDOWN */}

          <div style={bigCard}>

            <div style={breakdownHeader}>

              <div>

                <h3 style={cardTitle}>
                  Message Breakdown
                </h3>

                <p style={muted}>
                  Employee, AI and admin activity
                </p>

              </div>

              <Users
                size={20}
                color="#64748b"
              />

            </div>


            {/* EMPLOYEE */}

            <MessageProgress
              label="Employee Messages"
              value={summary.employeeMessages}
              total={summary.totalMessages}
              color="#2563eb"
            />


            {/* AI */}

            <MessageProgress
              label="AI Messages"
              value={summary.aiMessages}
              total={summary.totalMessages}
              color="#16a34a"
            />


            {/* ADMIN */}

            <MessageProgress
              label="Admin Messages"
              value={summary.agentMessages}
              total={summary.totalMessages}
              color="#ea580c"
            />

          </div>

        </div>

      </div>


      {/* =================================================
          AI VS ADMIN
      ================================================= */}

      <div style={section}>

        <h2 style={sectionTitle}>
          AI vs Admin Handling
        </h2>

        <p style={sectionSubtitle}>
          Distribution of employee conversations handled
          by AI and human admins.
        </p>


        <div style={bigCard}>

          <HandlingRow
            label="AI Handled"
            value={summary.aiHandled}
            total={summary.totalConversations}
            color="#16a34a"
            icon={Bot}
          />


          <HandlingRow
            label="Admin Handled"
            value={summary.humanHandled}
            total={summary.totalConversations}
            color="#ea580c"
            icon={User}
          />

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div style={footer}>
        Data source: CRM MongoDB • Employee WhatsApp AI Automation
      </div>


      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  background,
  color,
  description,
}) {
  return (
    <div style={statCard}>

      <div
        style={{
          ...statIcon,
          background,
          color,
        }}
      >
        <Icon size={21} />
      </div>

      <p style={statTitle}>
        {title}
      </p>

      <h2 style={statValue}>
        {value}
      </h2>

      <p style={statDescription}>
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   MESSAGE PROGRESS
===================================================== */

function MessageProgress({
  label,
  value,
  total,
  color,
}) {

  /*
    IMPORTANT:
    Use getPercentage(), which is defined globally.
  */

  const percent = getPercentage(
    value,
    total
  );


  return (
    <div style={messageProgress}>

      <div style={progressHeader}>

        <span style={progressLabel}>
          {label}
        </span>

        <span style={progressValue}>
          {Number(value) || 0} ({percent}%)
        </span>

      </div>


      <div style={progressTrack}>

        <div
          style={{
            ...progressBar,
            width: `${percent}%`,
            background: color,
          }}
        />

      </div>

    </div>
  );
}


/* =====================================================
   HANDLING ROW
===================================================== */

function HandlingRow({
  label,
  value,
  total,
  color,
  icon: Icon,
}) {

  /*
    IMPORTANT:
    Use getPercentage(), NOT percentage().
  */

  const percent = getPercentage(
    value,
    total
  );


  return (
    <div style={handlingRow}>

      <div style={handlingLeft}>

        <div
          style={{
            ...handlingIcon,
            color,
            background: "#f8fafc",
          }}
        >

          <Icon size={20} />

        </div>


        <div>

          <strong>
            {label}
          </strong>

          <p style={muted}>
            {value} of {total} conversations
          </p>

        </div>

      </div>


      <div style={handlingRight}>

        <strong>
          {percent}%
        </strong>


        <div style={handlingTrack}>

          <div
            style={{
              ...handlingBar,
              width: `${percent}%`,
              background: color,
            }}
          />

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const pageStyle = {
  minHeight: "100vh",
  padding: "30px",
  background: "#f8fafc",
  color: "#0f172a",
  boxSizing: "border-box",
};


const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};


const titleRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};


const titleIcon = {
  width: "44px",
  height: "44px",
  borderRadius: "11px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const title = {
  margin: 0,
  fontSize: "27px",
  fontWeight: 700,
};


const subtitle = {
  margin: "8px 0 0 56px",
  color: "#64748b",
  fontSize: "14px",
};


const refreshButton = {
  border: "1px solid #dbe3ef",
  background: "#fff",
  borderRadius: "9px",
  padding: "10px 15px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontWeight: 600,
};


const section = {
  marginTop: "32px",
};


const sectionTitle = {
  margin: 0,
  fontSize: "19px",
  fontWeight: 700,
};


const sectionSubtitle = {
  margin: "5px 0 16px",
  color: "#64748b",
  fontSize: "13px",
};


const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "16px",
};


const statCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
  boxShadow:
    "0 2px 8px rgba(15,23,42,0.04)",
};


const statIcon = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const statTitle = {
  marginTop: "15px",
  marginBottom: "0",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 600,
};


const statValue = {
  margin: "6px 0",
  fontSize: "29px",
};


const statDescription = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "11px",
};


const messageGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(220px, 0.7fr) minmax(400px, 1.5fr)",
  gap: "18px",
};


const bigCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "24px",
  boxShadow:
    "0 2px 8px rgba(15,23,42,0.04)",
};


const bigIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const label = {
  marginTop: "18px",
  color: "#64748b",
  fontSize: "13px",
};


const bigNumber = {
  fontSize: "38px",
  margin: "6px 0",
};


const muted = {
  margin: "4px 0",
  color: "#94a3b8",
  fontSize: "12px",
};


const breakdownHeader = {
  display: "flex",
  justifyContent: "space-between",
};


const cardTitle = {
  margin: 0,
  fontSize: "15px",
};


const messageProgress = {
  marginTop: "22px",
};


const progressHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "12px",
};


const progressLabel = {
  fontWeight: 600,
  color: "#334155",
};


const progressValue = {
  fontWeight: 700,
  color: "#0f172a",
};


const progressTrack = {
  height: "8px",
  marginTop: "9px",
  background: "#f1f5f9",
  borderRadius: "10px",
  overflow: "hidden",
};


const progressBar = {
  height: "100%",
  borderRadius: "10px",
  transition: "width .4s ease",
};


const handlingRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "30px",
  padding: "16px 0",
};


const handlingLeft = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: "220px",
};


const handlingIcon = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const handlingRight = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flex: 1,
  maxWidth: "600px",
};


const handlingTrack = {
  flex: 1,
  height: "9px",
  background: "#f1f5f9",
  borderRadius: "10px",
  overflow: "hidden",
};


const handlingBar = {
  height: "100%",
  borderRadius: "10px",
  transition: "width .4s ease",
};


const footer = {
  textAlign: "center",
  marginTop: "32px",
  color: "#94a3b8",
  fontSize: "11px",
};


const loadingBox = {
  minHeight: "400px",
  background: "#fff",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};


const spinner = {
  width: "32px",
  height: "32px",
  border: "3px solid #dbeafe",
  borderTop: "3px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};


const errorBox = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  padding: "13px 16px",
  borderRadius: "10px",
  display: "flex",
  gap: "10px",
  flexDirection: "column",
};