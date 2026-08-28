import React, { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import { fetchStats } from "./services/api";

import {
  MessageCircle,
  Bot,
  Users,
  Activity,
} from "lucide-react";

import {
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

const trendData = [
  { day: "12 Aug", conversations: 190 },
  { day: "13 Aug", conversations: 150 },
  { day: "14 Aug", conversations: 160 },
  { day: "15 Aug", conversations: 240 },
  { day: "16 Aug", conversations: 300 },
  { day: "17 Aug", conversations: 330 },
  { day: "18 Aug", conversations: 360 },
];

const intentData = [
  { name: "Attendance Query", value: 35, count: 438 },
  { name: "Leave Request", value: 25, count: 313 },
  { name: "Order Status", value: 15, count: 188 },
  { name: "General Query", value: 15, count: 188 },
  { name: "Others", value: 10, count: 125 },
];

const COLORS = [
  "#2563EB",
  "#F59E0B",
  "#60A5FA",
  "#FBBF24",
  "#9CA3AF",
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then((s) => setStats(s));
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div>

      {/* ================= STAT CARDS ================= */}

      <div className="cards">

        <StatCard
          title="Total Conversations"
          value="1,250"
          trend="↑"
          muted="12.5% from last week"
          trendType="positive"
          color="#2563EB"
          icon={<MessageCircle size={22} color="#ffffff" />}
        />

        <StatCard
          title="AI Handled"
          value="980"
          trend="↑"
          muted="18.3% from last week"
          trendType="positive"
          color="#16A34A"
          icon={<Bot size={22} color="#ffffff" />}
        />

        <StatCard
          title="Human Handled"
          value="270"
          trend="↓"
          muted="4.6% from last week"
          trendType="negative"
          color="#7C3AED"
          icon={<Users size={22} color="#ffffff" />}
        />

        <StatCard
          title="Active Conversations"
          value="32"
          muted="Currently in progress"
          color="#F59E0B"
          icon={<Activity size={22} color="#ffffff" />}
        />

      </div>

      {/* ================= CHARTS ================= */}

      <div className="dashboard-charts">

        {/* CONVERSATION TREND */}

        <div className="chart-card">

          <h3>Conversations Trend</h3>

          <LineChart
            width={500}
            height={280}
            data={trendData}
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
              domain={[0, 500]}
              ticks={[0, 100, 200, 300, 400, 500]}
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

        </div>

        {/* INTENT DISTRIBUTION */}

        <div className="chart-card">

          <h3>Intent Distribution</h3>

          <div className="donut-container">

            <div className="donut-chart">

              <PieChart width={220} height={220}>

                <Pie
                  data={intentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >

                  {intentData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index]}
                    />
                  ))}

                </Pie>

              </PieChart>

              <div className="donut-center">

                <div className="donut-total">
                  1,250
                </div>

                <div className="donut-label">
                  Total
                </div>

              </div>

            </div>

            <div className="intent-list">

              {intentData.map((item, index) => (

                <div
                  className="intent-item"
                  key={item.name}
                >

                  <span
                    className="intent-dot"
                    style={{
                      backgroundColor: COLORS[index],
                    }}
                  />

                  <span className="intent-name">
                    {item.name}
                  </span>

                  <span className="intent-percentage">
                    {item.value}%
                  </span>

                  <span className="intent-count">
                    ({item.count})
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

      {/* ================= RECENT CONVERSATIONS ================= */}

      <div className="recent-conversations">

        <h3>Recent Conversations</h3>
        
        

        <div className="table-wrapper">

          <table className="recent-table">

            <thead>
              <tr>
                <th>Contact</th>
                <th>Last Message</th>
                <th>Intent</th>
                <th>Handled By</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              <tr>

                <td>
                  <div className="contact-info">
                    <div className="avatar avatar-blue">
                      J
                    </div>

                    <div>
                      <strong>John Smith</strong>
                      <small>+91 9876543210</small>
                    </div>
                  </div>
                </td>

                <td>
                  What is my attendance today?
                </td>

                <td>
                  <span className="intent-badge attendance">
                    ATTENDANCE_STATUS
                  </span>
                </td>

                <td>AI</td>

                <td>2 mins ago</td>

                <td>
                  <span className="status-badge completed">
                    ● Completed
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button>🔗</button>
                    <button>▣</button>
                  </div>
                </td>

              </tr>

              <tr>

                <td>
                  <div className="contact-info">
                    <div className="avatar avatar-pink">
                      S
                    </div>

                    <div>
                      <strong>Sarah Johnson</strong>
                      <small>+91 412545600</small>
                    </div>
                  </div>
                </td>

                <td>
                  I want leave tomorrow.
                </td>

                <td>
                  <span className="intent-badge leave">
                    APPLY_LEAVE
                  </span>
                </td>

                <td>AI</td>

                <td>5 mins ago</td>

                <td>
                  <span className="status-badge completed">
                    ● Completed
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button>🔗</button>
                    <button>▣</button>
                  </div>
                </td>

              </tr>

              <tr>

                <td>
                  <div className="contact-info">
                    <div className="avatar avatar-purple">
                      A
                    </div>

                    <div>
                      <strong>Arun Kumar</strong>
                      <small>+91 808678655</small>
                    </div>
                  </div>
                </td>

                <td>
                  Where is my order?
                </td>

                <td>
                  <span className="intent-badge order">
                    ORDER_STATUS
                  </span>
                </td>

                <td>AI</td>

                <td>10 mins ago</td>

                <td>
                  <span className="status-badge completed">
                    ● Completed
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button>🔗</button>
                    <button>▣</button>
                  </div>
                </td>

              </tr>

              <tr>

                <td>
                  <div className="contact-info">
                    <div className="avatar avatar-red">
                      P
                    </div>

                    <div>
                      <strong>Priya Sharma</strong>
                      <small>+91 9234567890</small>
                    </div>
                  </div>
                </td>

                <td>
                  I need help with login.
                </td>

                <td>
                  <span className="intent-badge general">
                    GENERAL_QUERY
                  </span>
                </td>

                <td>Human</td>

                <td>15 mins ago</td>

                <td>
                  <span className="status-badge progress">
                    ● In Progress
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button>🔗</button>
                    <button>▣</button>
                  </div>
                </td>

              </tr>

              <tr>

                <td>
                  <div className="contact-info">
                    <div className="avatar avatar-orange">
                      R
                    </div>

                    <div>
                      <strong>Rahul Verma</strong>
                      <small>+91 9871254567</small>
                    </div>
                  </div>
                </td>

                <td>
                  Can you help me?
                </td>

                <td>
                  <span className="intent-badge general">
                    GENERAL_QUERY
                  </span>
                </td>

                <td>AI</td>

                <td>20 mins ago</td>

                <td>
                  <span className="status-badge completed">
                    ● Completed
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button>🔗</button>
                    <button>▣</button>
                  </div>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}