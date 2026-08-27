import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api";

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  primary: "#6366f1",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
  pink: "#ec4899",
  cyan: "#06b6d4",
  slate: "#64748b",
};

// =========================================================
// CHART COLORS
// =========================================================

const STATUS_COLORS = [
  COLORS.green,
  COLORS.orange,
  COLORS.red,
];

const HANDLER_COLORS = [
  COLORS.purple,
  COLORS.blue,
];

const MESSAGE_COLORS = [
  COLORS.cyan,
  COLORS.purple,
  COLORS.orange,
];


// =========================================================
// REPORT CARD
// =========================================================

function ReportCard({
  title,
  value,
  subtitle,
  color = COLORS.primary,
}) {
  return (
    <div
      style={{
        background: "var(--card-bg, #ffffff)",
        border: "1px solid var(--border-color, #e5e7eb)",
        borderRadius: 16,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        minHeight: 125,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 5,
          height: "100%",
          background: color,
        }}
      />

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--muted-color, #64748b)",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 750,
          lineHeight: 1.1,
          color: "var(--text-color, #0f172a)",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--muted-color, #94a3b8)",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}


// =========================================================
// SECTION CARD
// =========================================================

function SectionCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      style={{
        background: "var(--card-bg, #ffffff)",
        border: "1px solid var(--border-color, #e5e7eb)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-color, #0f172a)",
          }}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "var(--muted-color, #64748b)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}


// =========================================================
// CUSTOM TOOLTIP
// =========================================================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
      }}
    >
      {label && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 6,
            color: "#0f172a",
          }}
        >
          {label}
        </div>
      )}

      {payload.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          <span style={{ color: "#64748b" }}>
            {item.name}
          </span>

          <strong style={{ color: "#0f172a" }}>
            {item.value}
          </strong>
        </div>
      ))}
    </div>
  );
}


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Reports() {

  // =======================================================
  // STATE
  // =======================================================

  const [summary, setSummary] = useState(null);

  const [
    conversationAnalytics,
    setConversationAnalytics,
  ] = useState(null);

  const [
    messageAnalytics,
    setMessageAnalytics,
  ] = useState(null);

  const [conversations, setConversations] =
    useState([]);

  const [trends, setTrends] =
    useState([]);

  const [period, setPeriod] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadReports("all");
  }, []);


  // =======================================================
  // LOAD REPORTS
  // =======================================================

  const loadReports = async (
    selectedPeriod = period
  ) => {

    try {

      setError("");

      if (summary) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // ---------------------------------------------------
      // PERIOD QUERY
      // ---------------------------------------------------

      const query =
        selectedPeriod === "all"
          ? ""
          : `?period=${selectedPeriod}`;


      // ---------------------------------------------------
      // TREND QUERY
      // ---------------------------------------------------

      const trendQuery =
        selectedPeriod === "all"
          ? "?period=30days"
          : `?period=${selectedPeriod}`;


      // ---------------------------------------------------
      // API REQUESTS
      // ---------------------------------------------------

      const [
        summaryResponse,
        conversationResponse,
        messageResponse,
        conversationsResponse,
        trendsResponse,
      ] = await Promise.all([

        fetch(
          `${API_BASE_URL}/reports/summary${query}`
        ),

        fetch(
          `${API_BASE_URL}/reports/conversations${query}`
        ),

        fetch(
          `${API_BASE_URL}/reports/messages${query}`
        ),

        fetch(
          `${API_BASE_URL}/conversations${query}`
        ),

        fetch(
          `${API_BASE_URL}/reports/trends${trendQuery}`
        ),

      ]);


      // ---------------------------------------------------
      // VALIDATION
      // ---------------------------------------------------

      if (
        !summaryResponse.ok ||
        !conversationResponse.ok ||
        !messageResponse.ok ||
        !conversationsResponse.ok ||
        !trendsResponse.ok
      ) {
        throw new Error(
          "Failed to load reports data"
        );
      }


      // ---------------------------------------------------
      // JSON
      // ---------------------------------------------------

      const summaryData =
        await summaryResponse.json();

      const conversationData =
        await conversationResponse.json();

      const messageData =
        await messageResponse.json();

      const conversationsData =
        await conversationsResponse.json();

      const trendsData =
        await trendsResponse.json();


      // ---------------------------------------------------
      // SET DATA
      // ---------------------------------------------------

      setSummary(
        summaryData.data || {}
      );

      setConversationAnalytics(
        conversationData.data || {}
      );

      setMessageAnalytics(
        messageData.data || {}
      );

      setTrends(
        Array.isArray(trendsData.data)
          ? trendsData.data
          : []
      );


      // ---------------------------------------------------
      // CONVERSATIONS
      // ---------------------------------------------------

      setConversations(
        Array.isArray(conversationsData)
          ? conversationsData
          : Array.isArray(conversationsData.data)
          ? conversationsData.data
          : []
      );

    } catch (err) {

      console.error(
        "Reports Load Error:",
        err
      );

      setError(
        "Unable to load reports. Please check that the CRM backend is running."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // =======================================================
  // PERIOD CHANGE
  // =======================================================

  const handlePeriodChange = (
    newPeriod
  ) => {

    setPeriod(newPeriod);

    loadReports(newPeriod);

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <div
        className="reports-page"
        style={{
          padding: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Reports & Analytics
        </h2>

        <div
          style={{
            marginTop: 20,
            background: "var(--card-bg, #ffffff)",
            border:
              "1px solid var(--border-color, #e5e7eb)",
            borderRadius: 16,
            padding: 30,
            textAlign: "center",
          }}
        >
          <p className="muted">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (
      <div
        className="reports-page"
        style={{
          padding: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          Reports & Analytics
        </h2>

        <div
          style={{
            marginTop: 20,
            background: "var(--card-bg, #ffffff)",
            border:
              "1px solid var(--border-color, #e5e7eb)",
            borderRadius: 16,
            padding: 30,
          }}
        >
          <div
            style={{
              color: "#dc2626",
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {error}
          </div>

          <button
            onClick={() =>
              loadReports(period)
            }
            style={{
              border: "none",
              borderRadius: 8,
              padding: "9px 16px",
              background: COLORS.primary,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  // =======================================================
  // SAFE DATA
  // =======================================================

  const reportConversations =
    summary?.conversations || {};

  const messages =
    summary?.messages || {};

  const status =
    conversationAnalytics?.status || {};

  const handledBy =
    conversationAnalytics?.handledBy || {};

  const intents =
    conversationAnalytics?.intents || {};


  // =======================================================
  // BASIC METRICS
  // =======================================================

  const totalConversations =
    reportConversations.total || 0;

  const completed =
    reportConversations.completed || 0;

  const aiHandled =
    reportConversations.aiHandled || 0;

  const humanHandled =
    reportConversations.humanHandled || 0;

  const inProgress =
    reportConversations.inProgress || 0;

  const blocked =
    reportConversations.blocked || 0;

  const totalMessages =
    messages.total || 0;


  // =======================================================
  // RATES
  // =======================================================

  const resolutionRate =
    totalConversations > 0
      ? Math.round(
          (completed /
            totalConversations) *
            100
        )
      : 0;

  const aiAutomationRate =
    totalConversations > 0
      ? Math.round(
          (aiHandled /
            totalConversations) *
            100
        )
      : 0;

  const humanTakeoverRate =
    totalConversations > 0
      ? Math.round(
          (humanHandled /
            totalConversations) *
            100
        )
      : 0;


  // =======================================================
  // CHART DATA
  // =======================================================

  const statusChartData = [
    {
      name: "Completed",
      value: status.completed || 0,
    },
    {
      name: "In Progress",
      value: status.inProgress || 0,
    },
    {
      name: "Blocked",
      value: status.blocked || 0,
    },
  ];


  const handlingChartData = [
    {
      name: "AI",
      value: handledBy.ai || 0,
    },
    {
      name: "Human",
      value: handledBy.human || 0,
    },
  ];


  const messageChartData = [
    {
      name: "Employee",
      value: messages.employee || 0,
    },
    {
      name: "AI",
      value: messages.ai || 0,
    },
    {
      name: "Agent",
      value: messages.agent || 0,
    },
  ];


  const intentChartData =
    Object.entries(intents).map(
      ([name, value]) => ({
        name,
        value,
      })
    );


  // =======================================================
  // TREND DATA
  // =======================================================

  const trendChartData =
    trends.map((item) => {

      const date = new Date(
        `${item.date}T00:00:00`
      );

      return {
        ...item,

        displayDate:
          date.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          ),

        conversations:
          Number(
            item.conversations || 0
          ),

        employee:
          Number(item.employee || 0),

        ai:
          Number(item.ai || 0),

        agent:
          Number(item.agent || 0),
      };

    });


  // =======================================================
  // PERIOD LABEL
  // =======================================================

  const periodLabels = {
    all: "All Data",
    today: "Today",
    yesterday: "Yesterday",
    "7days": "Last 7 Days",
    month: "This Month",
    "30days": "Last 30 Days",
  };


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <div
      className="reports-page"
      style={{
        padding: 24,
        paddingBottom: 50,
        background:
          "var(--page-bg, transparent)",
      }}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 26,
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 750,
              color:
                "var(--text-color, #0f172a)",
            }}
          >
            Reports & Analytics
          </h2>

          <p
            style={{
              margin:
                "7px 0 0",
              fontSize: 13,
              color:
                "var(--muted-color, #64748b)",
            }}
          >
            Monitor conversations, AI
            performance, messages and
            employee activity.
          </p>

        </div>


        {/* PERIOD FILTER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >

          {[
            {
              label: "All",
              value: "all",
            },
            {
              label: "Today",
              value: "today",
            },
            {
              label: "Yesterday",
              value: "yesterday",
            },
            {
              label: "7 Days",
              value: "7days",
            },
            {
              label: "This Month",
              value: "month",
            },
            {
              label: "30 Days",
              value: "30days",
            },
          ].map((item) => (

            <button
              key={item.value}
              onClick={() =>
                handlePeriodChange(
                  item.value
                )
              }
              style={{
                border:
                  period === item.value
                    ? "1px solid #6366f1"
                    : "1px solid var(--border-color, #e2e8f0)",

                background:
                  period === item.value
                    ? "#6366f1"
                    : "var(--card-bg, #ffffff)",

                color:
                  period === item.value
                    ? "#ffffff"
                    : "var(--text-color, #334155)",

                padding:
                  "8px 13px",

                borderRadius: 8,

                cursor: "pointer",

                fontSize: 12,

                fontWeight:
                  period === item.value
                    ? 700
                    : 500,

                transition:
                  "all 0.2s ease",
              }}
            >
              {item.label}
            </button>

          ))}


          {/* REFRESH */}

          <button
            onClick={() =>
              loadReports(period)
            }
            disabled={refreshing}
            style={{
              border:
                "1px solid var(--border-color, #e2e8f0)",
              background:
                "var(--card-bg, #ffffff)",
              color:
                "var(--text-color, #334155)",
              padding:
                "8px 14px",
              borderRadius: 8,
              cursor:
                refreshing
                  ? "not-allowed"
                  : "pointer",
              fontSize: 12,
              fontWeight: 600,
              opacity:
                refreshing
                  ? 0.6
                  : 1,
            }}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>


      {/* ================================================= */}
      {/* ACTIVE PERIOD */}
      {/* ================================================= */}

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding:
            "7px 12px",
          borderRadius: 20,
          background: "#eef2ff",
          color: "#4f46e5",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#6366f1",
          }}
        />

        Showing:
        {" "}
        {periodLabels[period]}
      </div>


      {/* ================================================= */}
      {/* PERFORMANCE OVERVIEW */}
      {/* ================================================= */}

      <div
        style={{
          marginBottom: 26,
        }}
      >

        <h3
          style={{
            fontSize: 18,
            margin:
              "0 0 14px",
            fontWeight: 700,
          }}
        >
          Performance Overview
        </h3>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 15,
          }}
        >

          <ReportCard
            title="Total Conversations"
            value={totalConversations}
            subtitle="Selected period"
            color={COLORS.primary}
          />

          <ReportCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            subtitle="Completed conversations"
            color={COLORS.green}
          />

          <ReportCard
            title="AI Automation"
            value={`${aiAutomationRate}%`}
            subtitle="AI handled conversations"
            color={COLORS.purple}
          />

          <ReportCard
            title="Human Takeover"
            value={`${humanTakeoverRate}%`}
            subtitle="Human handled conversations"
            color={COLORS.orange}
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* CONVERSATION SUMMARY */}
      {/* ================================================= */}

      <div
        style={{
          marginBottom: 26,
        }}
      >

        <h3
          style={{
            fontSize: 18,
            margin:
              "0 0 14px",
            fontWeight: 700,
          }}
        >
          Conversation Summary
        </h3>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 15,
          }}
        >

          <ReportCard
            title="AI Handled"
            value={aiHandled}
            subtitle="Handled automatically"
            color={COLORS.purple}
          />

          <ReportCard
            title="Human Handled"
            value={humanHandled}
            subtitle="Handled by agents"
            color={COLORS.blue}
          />

          <ReportCard
            title="Completed"
            value={completed}
            subtitle="Resolved"
            color={COLORS.green}
          />

          <ReportCard
            title="In Progress"
            value={inProgress}
            subtitle="Active conversations"
            color={COLORS.orange}
          />

          <ReportCard
            title="Blocked"
            value={blocked}
            subtitle="Blocked conversations"
            color={COLORS.red}
          />

          <ReportCard
            title="Total Messages"
            value={totalMessages}
            subtitle="All messages"
            color={COLORS.cyan}
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* TRENDS */}
      {/* ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20,
          marginBottom: 26,
        }}
      >

        {/* CONVERSATION TREND */}

        <SectionCard
          title="Conversation Trends"
          subtitle="Daily conversation activity"
        >

          <div
            style={{
              height: 300,
            }}
          >

            {trendChartData.length === 0 ? (

              <EmptyState text="No conversation trend data available." />

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={trendChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="displayDate"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="conversations"
                    name="Conversations"
                    stroke={
                      COLORS.primary
                    }
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </SectionCard>


        {/* MESSAGE TREND */}

        <SectionCard
          title="Message Trends"
          subtitle="Employee, AI and agent activity"
        >

          <div
            style={{
              height: 300,
            }}
          >

            {trendChartData.length === 0 ? (

              <EmptyState text="No message trend data available." />

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={trendChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="displayDate"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="employee"
                    name="Employee"
                    stroke={
                      COLORS.cyan
                    }
                    strokeWidth={2.5}
                  />

                  <Line
                    type="monotone"
                    dataKey="ai"
                    name="AI"
                    stroke={
                      COLORS.purple
                    }
                    strokeWidth={2.5}
                  />

                  <Line
                    type="monotone"
                    dataKey="agent"
                    name="Agent"
                    stroke={
                      COLORS.orange
                    }
                    strokeWidth={2.5}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </SectionCard>

      </div>


      {/* ================================================= */}
      {/* CHART ROW */}
      {/* ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20,
          marginBottom: 26,
        }}
      >

        {/* STATUS */}

        <SectionCard
          title="Conversation Status"
          subtitle="Current status distribution"
        >

          <div
            style={{
              height: 300,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  statusChartData
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Bar
                  dataKey="value"
                  name="Conversations"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                >

                  {statusChartData.map(
                    (entry, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={
                          STATUS_COLORS[
                            index
                          ]
                        }
                      />
                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </SectionCard>


        {/* AI VS HUMAN */}

        <SectionCard
          title="AI vs Human"
          subtitle="Conversation handling distribution"
        >

          <div
            style={{
              height: 300,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    handlingChartData
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                  label
                >

                  {handlingChartData.map(
                    (entry, index) => (
                      <Cell
                        key={`handler-${index}`}
                        fill={
                          HANDLER_COLORS[
                            index
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </SectionCard>

      </div>


      {/* ================================================= */}
      {/* MESSAGE + INTENTS */}
      {/* ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20,
          marginBottom: 26,
        }}
      >

        {/* MESSAGE DISTRIBUTION */}

        <SectionCard
          title="Message Distribution"
          subtitle="Employee, AI and agent messages"
        >

          <div
            style={{
              height: 300,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  messageChartData
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Bar
                  dataKey="value"
                  name="Messages"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                >

                  {messageChartData.map(
                    (entry, index) => (
                      <Cell
                        key={`message-${index}`}
                        fill={
                          MESSAGE_COLORS[
                            index
                          ]
                        }
                      />
                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </SectionCard>


        {/* INTENTS */}

        <SectionCard
          title="Employee Intent Distribution"
          subtitle="Most common conversation intents"
        >

          <div
            style={{
              height: 300,
            }}
          >

            {intentChartData.length === 0 ? (

              <EmptyState text="No intent data available." />

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={
                      intentChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    label
                  >

                    {intentChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`intent-${index}`}
                          fill={
                            [
                              COLORS.primary,
                              COLORS.pink,
                              COLORS.cyan,
                              COLORS.orange,
                              COLORS.green,
                              COLORS.purple,
                            ][
                              index %
                                6
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </SectionCard>

      </div>


      {/* ================================================= */}
      {/* AI PERFORMANCE */}
      {/* ================================================= */}

      <SectionCard
        title="AI Performance"
        subtitle="Overview of automation effectiveness"
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 15,
          }}
        >

          <ReportCard
            title="AI Conversations"
            value={
              handledBy.ai || 0
            }
            subtitle="Handled by AI"
            color={COLORS.purple}
          />

          <ReportCard
            title="AI Messages"
            value={
              messages.ai || 0
            }
            subtitle="Automated replies"
            color={COLORS.cyan}
          />

          <ReportCard
            title="Human Takeovers"
            value={
              handledBy.human || 0
            }
            subtitle="Handled by humans"
            color={COLORS.orange}
          />

          <ReportCard
            title="Automation Rate"
            value={`${aiAutomationRate}%`}
            subtitle="Overall AI automation"
            color={COLORS.green}
          />

        </div>

      </SectionCard>


      <div style={{ height: 26 }} />


      {/* ================================================= */}
      {/* TOP INTENTS */}
      {/* ================================================= */}

      <SectionCard
        title="Top Employee Intents"
        subtitle="Most frequently detected employee requests"
      >

        {Object.entries(intents).length === 0 ? (

          <p className="muted">
            No intent data available.
          </p>

        ) : (

          <div>

            {Object.entries(intents)
              .sort(
                ([, a], [, b]) =>
                  b - a
              )
              .map(
                (
                  [intent, count],
                  index
                ) => {

                  const percentage =
                    totalConversations > 0
                      ? Math.round(
                          (count /
                            totalConversations) *
                            100
                        )
                      : 0;

                  return (

                    <div
                      key={intent}
                      style={{
                        padding:
                          "14px 0",
                        borderBottom:
                          index ===
                          Object.entries(
                            intents
                          ).length -
                            1
                            ? "none"
                            : "1px solid var(--border-color, #e5e7eb)",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          marginBottom: 8,
                        }}
                      >

                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {intent}
                        </span>

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              COLORS.primary,
                          }}
                        >
                          {count}
                        </span>

                      </div>


                      <div
                        style={{
                          height: 7,
                          background:
                            "#eef2f7",
                          borderRadius:
                            10,
                          overflow:
                            "hidden",
                        }}
                      >

                        <div
                          style={{
                            width:
                              `${Math.min(
                                percentage,
                                100
                              )}%`,
                            height:
                              "100%",
                            background:
                              `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.purple})`,
                            borderRadius:
                              10,
                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )}

          </div>

        )}

      </SectionCard>


      <div style={{ height: 26 }} />


      {/* ================================================= */}
      {/* MESSAGE SUMMARY */}
      {/* ================================================= */}

      <SectionCard
        title="Message Summary"
        subtitle="Detailed message activity"
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 15,
          }}
        >

          <ReportCard
            title="Employee Messages"
            value={
              messages.employee || 0
            }
            subtitle="Incoming messages"
            color={COLORS.cyan}
          />

          <ReportCard
            title="AI Replies"
            value={
              messages.ai || 0
            }
            subtitle="Automated replies"
            color={COLORS.purple}
          />

          <ReportCard
            title="Agent Replies"
            value={
              messages.agent || 0
            }
            subtitle="Human replies"
            color={COLORS.orange}
          />

          <ReportCard
            title="Total Messages"
            value={
              messages.total || 0
            }
            subtitle="All messages"
            color={COLORS.primary}
          />

        </div>

      </SectionCard>


      <div style={{ height: 26 }} />


      {/* ================================================= */}
      {/* CHANNEL OVERVIEW */}
      {/* ================================================= */}

      <SectionCard
        title="Channel Overview"
        subtitle="Communication channel activity"
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 15,
          }}
        >

          <ReportCard
            title="WhatsApp Conversations"
            value={
              totalConversations
            }
            subtitle="Selected period"
            color={COLORS.green}
          />

          <ReportCard
            title="Primary Channel"
            value="WhatsApp"
            subtitle="Employee communication"
            color={COLORS.primary}
          />

        </div>

      </SectionCard>


      <div style={{ height: 26 }} />


      {/* ================================================= */}
      {/* RECENT CONVERSATIONS */}
      {/* ================================================= */}

      <SectionCard
        title="Recent Conversations"
        subtitle={`Conversations from ${periodLabels[period].toLowerCase()}`}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >

          <span
            style={{
              fontSize: 12,
              color:
                "var(--muted-color, #64748b)",
            }}
          >
            {conversations.length} conversations
          </span>

        </div>


        {conversations.length === 0 ? (

          <EmptyState
            text="No conversations available for this period."
          />

        ) : (

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: 650,
              }}
            >

              <thead>

                <tr>

                  {[
                    "Contact",
                    "Intent",
                    "Handler",
                    "Status",
                    "Messages",
                  ].map(
                    (heading) => (

                      <th
                        key={heading}
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          color:
                            "var(--muted-color, #64748b)",
                          borderBottom:
                            "1px solid var(--border-color, #e5e7eb)",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.04em",
                        }}
                      >
                        {heading}
                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {conversations
                  .slice(0, 10)
                  .map(
                    (
                      conversation,
                      index
                    ) => (

                      <tr
                        key={
                          conversation._id ||
                          index
                        }
                      >

                        {/* CONTACT */}

                        <td
                          style={{
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--border-color, #e5e7eb)",
                          }}
                        >

                          <div
                            style={{
                              fontWeight:
                                700,
                              fontSize: 13,
                            }}
                          >
                            {
                              conversation.contactName ||
                              "Unknown"
                            }
                          </div>

                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 11,
                              color:
                                "var(--muted-color, #64748b)",
                            }}
                          >
                            {
                              conversation.phone ||
                              "-"
                            }
                          </div>

                        </td>


                        {/* INTENT */}

                        <td
                          style={{
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--border-color, #e5e7eb)",
                            fontSize: 12,
                          }}
                        >

                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 8px",
                              borderRadius:
                                6,
                              background:
                                "#eef2ff",
                              color:
                                "#4f46e5",
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              conversation.intent ||
                              "General Query"
                            }
                          </span>

                        </td>


                        {/* HANDLER */}

                        <td
                          style={{
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--border-color, #e5e7eb)",
                            fontSize: 12,
                          }}
                        >

                          <span
                            style={{
                              color:
                                conversation.handledBy ===
                                "Human"
                                  ? COLORS.blue
                                  : COLORS.purple,
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              conversation.handledBy ||
                              "AI"
                            }
                          </span>

                        </td>


                        {/* STATUS */}

                        <td
                          style={{
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--border-color, #e5e7eb)",
                            fontSize: 12,
                          }}
                        >

                          <span
                            style={{
                              display:
                                "inline-flex",
                              padding:
                                "5px 9px",
                              borderRadius:
                                20,
                              fontWeight:
                                600,
                              background:
                                conversation.status ===
                                "Completed"
                                  ? "#ecfdf5"
                                  : conversation.status ===
                                    "Blocked"
                                  ? "#fef2f2"
                                  : "#fff7ed",
                              color:
                                conversation.status ===
                                "Completed"
                                  ? "#059669"
                                  : conversation.status ===
                                    "Blocked"
                                  ? "#dc2626"
                                  : "#ea580c",
                            }}
                          >
                            {
                              conversation.status ||
                              "In Progress"
                            }
                          </span>

                        </td>


                        {/* MESSAGES */}

                        <td
                          style={{
                            padding:
                              "14px 10px",
                            borderBottom:
                              "1px solid var(--border-color, #e5e7eb)",
                            fontSize: 13,
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            conversation
                              .messages
                              ?.length ||
                            0
                          }
                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </SectionCard>

    </div>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  text,
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color:
          "var(--muted-color, #64748b)",
        fontSize: 13,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          fontSize: 18,
        }}
      >
        —
      </div>

      {text}
    </div>
  );
}