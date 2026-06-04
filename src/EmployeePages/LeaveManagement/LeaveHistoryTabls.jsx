import React from "react";

const leaveData = [
  {
    id: 1,
    type: "Casual Leave",
    from: "2026-06-01",
    to: "2026-06-02",
    days: 2,
    status: "Approved",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "2026-05-20",
    to: "2026-05-21",
    days: 2,
    status: "Pending",
  },
  {
    id: 3,
    type: "Earned Leave",
    from: "2026-04-10",
    to: "2026-04-12",
    days: 3,
    status: "Rejected",
  },
];

const statusColor = (status) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function LeaveHistoryTable() {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-[#0b2b57] mb-4">
        Leave History
      </h2>

      <div id="leave-history-table" className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f5f7fb] text-left text-sm text-gray-600">
              <th className="p-3">Leave Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaveData.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.from}</td>
                <td className="p-3">{item.to}</td>
                <td className="p-3">{item.days}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}