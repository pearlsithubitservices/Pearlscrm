import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Circle, Star, X } from "lucide-react";
import useNotification from "../../../Hooks/useNotification";
import NotificationForm from "./NotificationForm";
import { useAuth } from "../../../context/AuthContext";




export default function ImportantNotifications() {
  const { notifications, fetchNotification, deleteNotification } = useNotification();
  const [shownotification, setShownotification] = useState(false);
  console.log(notifications);

  const { user } = useAuth();
  console.log(user.uid);
  const empnotification = notifications.filter((item) =>
    item.employeeId == user.uid
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
        <p  onClick={() => setShownotification(true)} className=" bg-blue-700  text-white  hover:scale-105  transition-transform duration-200 p-1 rounded-lg cursor-pointer">Notification</p>
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
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {item.title}
                  </p>

                  <p className="text-xs flex gap-2 items-center text-blue-700 mt-1">
                    {item.sub} -{item.notificationType || "Leave Type"}{item.isImportant && (<Star size={10} fill="red" className="text-red-300" />)}
                  </p>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {item.time}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  <button
                    onClick={async () => await deleteNotification(item._id)}><X className="text-red-700" /></button>
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