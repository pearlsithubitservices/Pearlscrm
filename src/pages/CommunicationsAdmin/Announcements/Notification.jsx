import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Circle, Star, X } from "lucide-react";
import useNotification from "../../../Hooks/useNotification";
import NotificationForm from "./NotificationForm";
import { useAuth } from "../../../context/AuthContext";
import useEmployees from "../../../Hooks/useEmployees";




export default function ImportantNotifications() {
  const { notifications, fetchNotification, deleteNotification } = useNotification();
  const [shownotification, setShownotification] = useState(false);
  console.log(notifications);

  const { user } = useAuth();
  console.log(user.uid);
  const { employees } = useEmployees();
  //GETTING EMPLOYEES NAME
  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.uid] = {
        name: employee.name,
        role: employee.role || employee.employeeRole
      }
      return map;
    }, {});
  }, [employees]);
  const empnotification = notifications.filter((item) =>
    item.senderId == user.uid
  );
  console.log(empnotification);
  const today = new Date();

  const todayNotificationCount = empnotification.filter((item) => {
    const createdDate = new Date(item.createdAt);

    return (
      createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div className="w-full max-w-5xl mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between bg-white shadow-sm border rounded-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Important notifications</h2>
        <div className="flex gap-6">
          <p onClick={() => setShownotification(true)} className=" bg-blue-700  text-white  hover:scale-105  transition-transform duration-200 p-1 rounded-lg cursor-pointer">Notification</p>
          <span className="text-xs font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
            {todayNotificationCount}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 bg-white border max-h-[500px] h-full overflow-y-auto no-scrollbar rounded-xl p-5">
        <div className="relative border-l border-gray-200 pl-6 space-y-6">
          {empnotification?.slice(0, 8).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative"
            >
              {/* Dot */}
              <div className="absolute -left-[30px] top-1">
                <Circle className="w-3 h-3 fill-blue-600 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex justify-between items-start gap-4">
                {/* Left Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {item.title}
                  </p>

                  <p className="text-xs flex items-center gap-2 text-blue-700 mt-1">
                   <span className="font-bold">SEND TO:</span> {employeeMap[item?.employeeId]?.name} - {item.notificationType || "Leave Type"}

                    {item.isImportant && (
                      <Star
                        size={10}
                        fill="red"
                        className="text-red-500"
                      />
                    )}
                  </p>
                </div>

                {/* Right Content */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {item.time}
                  </span>

                  <button
                    onClick={() => deleteNotification(item._id)}
                    className="p-1 rounded hover:bg-red-100 transition"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
      {
        shownotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <NotificationForm
              onClose={() => setShownotification(false)}
              fetchNotifications={fetchNotification}
            />
          </div>
        )
      }
    </div >
  );
}