import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock } from "lucide-react";
import useTicket from "../../../Hooks/useTicket";
import { useAuth } from "../../../context/AuthContext";



export default function SupportTickets() {
  const { fetchTickets, tickets } = useTicket();
  const { user } = useAuth();

  const ticketByid = tickets.filter((item) => item.employeeId == user?.uid);

  if (!tickets) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            My support tickets
          </h1>


        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          {ticketByid.length > 0 ? ticketByid?.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 * 0.05 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              {/* Left Side */}
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  {item.issuedcategory.toUpperCase()}
                </h2>
                <h5 className="text-sm font-semibold text-gray-800">
                  {item.description}
                </h5>
                <p className="text-xs text-gray-500 mt-1">Assigned To: {item.assignedTo || "Deepan"}</p>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-6">

                {/* Status Badge */}
                {item.priority?.toLowerCase() === "in progress" ? (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                    <Clock size={14} /> {item.status}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                    <BadgeCheck size={14} /> {item.status}
                  </span>
                )}

                {/* Date */}
                <span className="text-xs text-gray-400 w-32 text-right">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          )):
          <div className="w-full h-[300px] ">
            <p className="flex items-center justify-center">
              No Tickets Found
            </p>
          </div>
          }
        </div>

      </div>
    </div>
  );
}