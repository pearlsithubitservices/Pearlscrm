import React, { useState } from "react";
import { Phone, Plus, Search } from "lucide-react";

const CallLogs = ({
  callLogs,
  setCallLogs,
}) => {
  const [formData, setFormData] = useState({
    leadName: "",
    callDate: "",
    outcome: "Interested",
    remarks: "",
  });

  const handleSubmit = () => {
    if (!formData.leadName) return;

    setCallLogs([
      {
        id: Date.now(),
        ...formData,
      },
      ...callLogs,
    ]);

    setFormData({
      leadName: "",
      callDate: "",
      outcome: "Interested",
      remarks: "",
    });
  };

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0b2b57]">
          Call Logs
        </h2>

        <Phone className="text-green-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">

        <input
          type="text"
          placeholder="Lead Name"
          value={formData.leadName}
          onChange={(e) =>
            setFormData({
              ...formData,
              leadName: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <input
          type="datetime-local"
          value={formData.callDate}
          onChange={(e) =>
            setFormData({
              ...formData,
              callDate: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        />

        <select
          value={formData.outcome}
          onChange={(e) =>
            setFormData({
              ...formData,
              outcome: e.target.value,
            })
          }
          className="border rounded-xl p-3"
        >
          <option>Interested</option>
          <option>Follow Up</option>
          <option>Not Interested</option>
          <option>Meeting Fixed</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-[#0b2b57] text-white rounded-xl flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Log
        </button>

      </div>

      <textarea
        rows={3}
        placeholder="Remarks"
        value={formData.remarks}
        onChange={(e) =>
          setFormData({
            ...formData,
            remarks: e.target.value,
          })
        }
        className="w-full border rounded-xl p-3 mb-6"
      />

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">
                Lead
              </th>

              <th className="text-left py-3">
                Date
              </th>

              <th className="text-left py-3">
                Outcome
              </th>

              <th className="text-left py-3">
                Remarks
              </th>
            </tr>
          </thead>

          <tbody>

            {callLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b"
              >
                <td className="py-3">
                  {log.leadName}
                </td>

                <td>
                  {log.callDate}
                </td>

                <td>
                  {log.outcome}
                </td>

                <td>
                  {log.remarks}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default CallLogs;