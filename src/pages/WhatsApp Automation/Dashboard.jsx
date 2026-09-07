import React, { useEffect, useState } from "react";

import StatCard from "./components/StatCard";

import {
  fetchStats,
  fetchConversations,
} from "./services/api";

import {
  MessageCircle,
  Bot,
  Users,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";


const COLORS = [
  "#2563EB",
  "#F59E0B",
  "#60A5FA",
  "#FBBF24",
  "#9CA3AF",
];


export default function Dashboard() {

  const [stats, setStats] =
    useState(null);

  const [conversations, setConversations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        const [
          statsData,
          conversationsData,
        ] = await Promise.all([

          fetchStats(),

          fetchConversations(),

        ]);


        setStats(
          statsData
        );

        setConversations(
          conversationsData
        );


      } catch (error) {

        console.error(
          "Dashboard load error:",
          error
        );

        setError(
          "Failed to load dashboard data."
        );


      } finally {

        setLoading(false);

      }

    }


    loadDashboard();


  }, []);



  /* =====================================================
     CALCULATE AI / HUMAN HANDLED
  ===================================================== */

  const aiHandled =
    conversations.filter(
      (conversation) =>
        String(
          conversation.handledBy
        ).toLowerCase() === "ai"
    ).length;


  const humanHandled =
    conversations.filter(
      (conversation) => {

        const handledBy =
          String(
            conversation.handledBy
          ).toLowerCase();

        return (
          handledBy === "human" ||
          handledBy === "agent"
        );

      }
    ).length;



  /* =====================================================
     ACTIVE CONVERSATIONS
  ===================================================== */

  const activeConversations =
    conversations.filter(
      (conversation) => {

        const status =
          String(
            conversation.status
          ).toLowerCase();

        return (
          status === "in progress" ||
          status === "active"
        );

      }
    ).length;



  /* =====================================================
     BUILD TREND DATA
  ===================================================== */

  const trendMap = {};


  conversations.forEach(
    (conversation) => {

      const messages =
        conversation.messages || [];


      let date = null;


      if (
        messages.length > 0
      ) {

        const lastMessage =
          messages[
            messages.length - 1
          ];

        if (
          lastMessage.timestamp
        ) {

          date =
            new Date(
              lastMessage.timestamp
            );

        }

      }


      if (!date) {

        return;

      }


      const day =
        date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        );


      if (!trendMap[day]) {

        trendMap[day] = 0;

      }


      trendMap[day] += 1;

    }
  );


  const trendData =
    Object.keys(
      trendMap
    ).map(
      (day) => ({

        day:

          day,

        conversations:

          trendMap[
            day
          ],

      })
    );



  /* =====================================================
     INTENT DISTRIBUTION
  ===================================================== */

  const intentMap = {};


  conversations.forEach(
    (conversation) => {

      const intent =
        conversation.intent ||
        "Others";


      if (
        !intentMap[
          intent
        ]
      ) {

        intentMap[
          intent
        ] = 0;

      }


      intentMap[
        intent
      ] += 1;

    }
  );


  const totalConversations =
    conversations.length;


  const intentData =
    Object.entries(
      intentMap
    ).map(
      ([name, count]) => ({

        name,

        count,

        value:

          totalConversations > 0

            ? Math.round(
                (
                  count /
                  totalConversations
                ) * 100
              )

            : 0,

      })
    );



  /* =====================================================
     RECENT CONVERSATIONS
  ===================================================== */

  const recentConversations =
    [...conversations]

      .sort(
        (a, b) => {

          const aMessages =
            a.messages || [];

          const bMessages =
            b.messages || [];


          const aLast =
            aMessages[
              aMessages.length - 1
            ];

          const bLast =
            bMessages[
              bMessages.length - 1
            ];


          const aTime =
            aLast?.timestamp
              ? new Date(
                  aLast.timestamp
                ).getTime()
              : 0;


          const bTime =
            bLast?.timestamp
              ? new Date(
                  bLast.timestamp
                ).getTime()
              : 0;


          return (
            bTime - aTime
          );

        }
      )

      .slice(
        0,
        5
      );



  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div>
        Loading dashboard...
      </div>

    );

  }



  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (

      <div>
        {error}
      </div>

    );

  }



  return (

    <div>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="cards">


        <StatCard
          title="Total Conversations"
          value={
            stats?.total ??
            conversations.length
          }
          muted="All conversations"
          color="#2563EB"
          icon={
            <MessageCircle
              size={22}
              color="#ffffff"
            />
          }
        />


        <StatCard
          title="AI Handled"
          value={
            aiHandled
          }
          muted="Handled automatically"
          color="#16A34A"
          icon={
            <Bot
              size={22}
              color="#ffffff"
            />
          }
        />


        <StatCard
          title="Human Handled"
          value={
            humanHandled
          }
          muted="Handled by human"
          color="#7C3AED"
          icon={
            <Users
              size={22}
              color="#ffffff"
            />
          }
        />


        <StatCard
          title="Active Conversations"
          value={
            activeConversations
          }
          muted="Currently in progress"
          color="#F59E0B"
          icon={
            <Activity
              size={22}
              color="#ffffff"
            />
          }
        />


      </div>



      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="dashboard-charts">


        {/* CONVERSATION TREND */}

        <div className="chart-card">


          <h3>
            Conversations Trend
          </h3>


          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <LineChart
              data={
                trendData
              }
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >


              <CartesianGrid
                stroke="#E5EAF2"
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="day"
                tick={{
                  fill: "#64748B",
                  fontSize: 12,
                }}
              />


              <YAxis
                tick={{
                  fill: "#64748B",
                  fontSize: 12,
                }}
              />


              <Tooltip />


              <Line
                type="monotone"
                dataKey="conversations"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#2563EB",
                }}
                activeDot={{
                  r: 7,
                }}
              />


            </LineChart>

          </ResponsiveContainer>


        </div>



        {/* INTENT DISTRIBUTION */}

        <div className="chart-card">


          <h3>
            Intent Distribution
          </h3>


          <div className="donut-container">


            <div className="donut-chart">


              <PieChart
                width={220}
                height={220}
              >


                <Pie
                  data={
                    intentData
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >


                  {intentData.map(
                    (
                      item,
                      index
                    ) => (

                      <Cell
                        key={
                          item.name
                        }
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    )
                  )}


                </Pie>


                <Tooltip />


              </PieChart>



              <div className="donut-center">


                <div className="donut-total">

                  {
                    totalConversations
                  }

                </div>


                <div className="donut-label">

                  Total

                </div>


              </div>


            </div>



            <div className="intent-list">


              {intentData.length === 0 ? (

                <div>
                  No intent data available
                </div>

              ) : (

                intentData.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="intent-item"
                      key={
                        item.name
                      }
                    >


                      <span
                        className="intent-dot"
                        style={{
                          backgroundColor:
                            COLORS[
                              index %
                              COLORS.length
                            ],
                        }}
                      />


                      <span className="intent-name">

                        {
                          item.name
                        }

                      </span>


                      <span className="intent-percentage">

                        {
                          item.value
                        }%

                      </span>


                      <span className="intent-count">

                        (
                        {
                          item.count
                        }
                        )

                      </span>


                    </div>

                  )
                )

              )}


            </div>


          </div>


        </div>


      </div>



      {/* =================================================
          RECENT CONVERSATIONS
      ================================================= */}

      <div className="recent-conversations">


        <h3>
          Recent Conversations
        </h3>


        <div className="table-wrapper">


          <table className="recent-table">


            <thead>

              <tr>

                <th>
                  Contact
                </th>

                <th>
                  Last Message
                </th>

                <th>
                  Intent
                </th>

                <th>
                  Handled By
                </th>

                <th>
                  Time
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>



            <tbody>


              {recentConversations.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "20px",
                    }}
                  >

                    No conversations found.

                  </td>

                </tr>

              ) : (

                recentConversations.map(
                  (
                    conversation
                  ) => {


                    const initial =
                      conversation.name
                        ? conversation.name
                            .charAt(0)
                            .toUpperCase()
                        : "?";


                    const latestMessage =
                      conversation.message ||
                      "No messages";


                    const latestMessageData =
                      conversation.messages?.[
                        conversation.messages.length - 1
                      ];


                    const timestamp =
                      latestMessageData?.timestamp;


                    const formattedTime =
                      timestamp

                        ? new Date(
                            timestamp
                          ).toLocaleString(
                            "en-IN"
                          )

                        : "-";


                    return (

                      <tr
                        key={
                          conversation.id
                        }
                      >


                        {/* CONTACT */}

                        <td>

                          <div className="contact-info">


                            <div className="avatar avatar-blue">

                              {
                                initial
                              }

                            </div>


                            <div>


                              <strong>

                                {
                                  conversation.name ||
                                  "Unknown"
                                }

                              </strong>


                              <small>

                                {
                                  conversation.phone ||
                                  "-"
                                }

                              </small>


                            </div>


                          </div>

                        </td>



                        {/* LAST MESSAGE */}

                        <td>

                          {
                            latestMessage
                          }

                        </td>



                        {/* INTENT */}

                        <td>

                          <span className="intent-badge general">

                            {
                              conversation.intent ||
                              "GENERAL"
                            }

                          </span>

                        </td>



                        {/* HANDLED BY */}

                        <td>

                          {
                            conversation.handledBy ||
                            "AI"
                          }

                        </td>



                        {/* TIME */}

                        <td>

                          {
                            formattedTime
                          }

                        </td>



                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-badge ${
                              String(
                                conversation.status
                              )
                                .toLowerCase()
                                .replace(
                                  /\s/g,
                                  ""
                                )
                            }`}
                          >

                            ●

                            {" "}

                            {
                              conversation.status ||
                              "Unknown"
                            }

                          </span>

                        </td>


                      </tr>

                    );

                  }
                )

              )}


            </tbody>


          </table>


        </div>


      </div>


    </div>

  );

}