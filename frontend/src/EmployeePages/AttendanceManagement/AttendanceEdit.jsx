import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import useEmpAttendance from "../../Hooks/useEmpAttendance";
import { formatDateTimeLocal } from "../../Utils/formatNumber";

export default function AttendanceEdit({
  attendance,
  onClose,
  onSuccess,
}) {
  const { updateAttendance, loading } = useEmpAttendance();


  const [formData, setFormData] = useState({
    _id: "",
    clockIn: "",
    clockOut: "",
    status: "",
    isOnline: false,
    breaks: [],
  });

  useEffect(() => {
    if (attendance) {
      setFormData({
        _id: attendance._id,
        clockIn: attendance.clockIn
          ? formatDateTimeLocal(attendance.clockIn)
          : "",
        clockOut: attendance.clockOut
          ? formatDateTimeLocal(attendance.clockOut)
          : "",
        status: attendance.status || "present",
        isOnline: attendance.isOnline || false,
        breaks:
          attendance.breaks?.map((br) => ({
            start: br.start
              ? formatDateTimeLocal(br.start)
              : "",
            end: br.end
              ? formatDateTimeLocal(br.end)
              : "",
          })) || [],
      });
    }
  }, [attendance]);

  const handleBreakChange = (
    index,
    field,
    value
  ) => {
    const updated = [...formData.breaks];

    updated[index][field] = value;

    setFormData({
      ...formData,
      breaks: updated,
    });
  };

  const addBreak = () => {
    setFormData({
      ...formData,
      breaks: [
        ...formData.breaks,
        {
          start: "",
          end: "",
        },
      ],
    });
  };

  const removeBreak = (index) => {
    const updated = formData.breaks.filter(
      (_, i) => i !== index
    );

    setFormData({
      ...formData,
      breaks: updated,
    });
  };

  const handleSubmit = async () => {
    try {
      await updateAttendance(
        formData._id,
        {
          clockIn: formData.clockIn,
          clockOut: formData.clockOut,
          status: formData.status,
          isOnline: formData.isOnline,
          breaks: formData.breaks,
        }
      );

      alert("Attendance updated successfully");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 max-w-4xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Edit Attendance
        </h2>

        <button onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="font-semibold">
            Clock In
          </label>

          <input
            type="datetime-local"
            className="w-full border rounded-xl p-3 mt-2"
            value={formData.clockIn}
            onChange={(e) =>
              setFormData({
                ...formData,
                clockIn: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="font-semibold">
            Clock Out
          </label>

          <input
            type="datetime-local"
            className="w-full border rounded-xl p-3 mt-2"
            value={formData.clockOut}
            onChange={(e) =>
              setFormData({
                ...formData,
                clockOut: e.target.value,
              })
            }
          />
        </div>

      </div>

      <div className="mt-6">
        <label className="font-semibold">
          Status
        </label>

        <select
          className="w-full border rounded-xl p-3 mt-2"
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value,
            })
          }
        >
          <option value="present">
            Present
          </option>

          <option value="absent">
            Absent
          </option>

          <option value="half day">
            Half Day
          </option>
          <option value="late comer">
            Late Comer
          </option>
          <option value="leave">
            Leave
          </option>
          <option value="early logout">
            Early Logout
          </option>
        </select>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.isOnline}
          onChange={(e) =>
            setFormData({
              ...formData,
              isOnline: e.target.checked,
            })
          }
        />

        <label>Employee Online</label>
      </div>

      <div className="mt-8">

        <div className="flex justify-between items-center mb-4">

          <h3 className="text-xl font-bold">
            Breaks
          </h3>

          <button
            onClick={addBreak}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <Plus size={18} />

            Add Break
          </button>

        </div>

        {formData.breaks.map((br, index) => (
          <div
            key={index}
            className="grid md:grid-cols-3 gap-4 mb-4"
          >

            <input
              type="datetime-local"
              className="border rounded-xl p-3"
              value={br.start}
              onChange={(e) =>
                handleBreakChange(
                  index,
                  "start",
                  e.target.value
                )
              }
            />

            <input
              type="datetime-local"
              className="border rounded-xl p-3"
              value={br.end}
              onChange={(e) =>
                handleBreakChange(
                  index,
                  "end",
                  e.target.value
                )
              }
            />

            <button
              onClick={() =>
                removeBreak(index)
              }
              className="bg-red-600 text-white rounded-xl flex justify-center items-center"
            >
              <Trash2 size={18} />
            </button>

          </div>
        ))}

      </div>

      <div className="flex gap-4 mt-8">

        <button
          onClick={onClose}
          className="px-6 py-3 border rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-xl py-3"
        >
          {loading
            ? "Updating..."
            : "Update Attendance"}
        </button>

      </div>

    </div>
  );
}