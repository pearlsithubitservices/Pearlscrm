import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  CalendarDays,
} from "lucide-react";

const AttendanceClockin = ({
  open,
  pendingClockIn,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-[380px] rounded-2xl p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            Confirm Clock In
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl mb-4">
          <img
            src="https://i.pravatar.cc/40"
            alt=""
            className="w-10 h-10 rounded-full"
          />

          <div>
            <p className="font-semibold text-sm">
              Employee
            </p>

            <p className="text-xs text-gray-500">
              Education
            </p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">
            Clock In Time
          </p>

          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <Clock size={16} />

            <span>
              {pendingClockIn?.time?.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">
            Clock In Day
          </p>

          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <CalendarDays size={16} />
            <span>Today</span>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-1">
            Work Location
          </p>

          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <MapPin size={16} />
            <span>
              {pendingClockIn?.location}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceClockin;