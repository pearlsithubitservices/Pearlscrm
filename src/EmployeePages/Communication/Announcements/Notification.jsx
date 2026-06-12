import React, { useState } from "react";
import { motion } from "framer-motion";
import { Circle, Star } from "lucide-react";
import useNotification from "../../../Hooks/useNotification";
import NotificationForm from "./NotificationForm";




export default function ImportantNotifications() {
  const { notifications, fetchNotification } = useNotification();
  const [shownotification, setShownotification] = useState(false);
  console.log(notifications);
  return (
    <div className="w-full max-w-4xl mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between bg-white shadow-sm border rounded-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Important notifications</h2>
        <p onClick={() => setShownotification(true)} className="cursor-pointer">Notification</p>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
          02 New
        </span>
      </div>

      {/* Body */}
      <div className="mt-4 bg-white border max-h-[500px] h-full overflow-y-auto no-scrollbar rounded-xl p-5">
        <div className="relative border-l border-gray-200 pl-6 space-y-6">
          {notifications.slice(0,8).map((item, index) => (
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
                    {item.sub} -{item.notificationType || "Leave Type"}{item.isImportant && (<Star size={10} fill="red" className="text-red-300"/>)}
                  </p>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {item.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {shownotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <NotificationForm
            onClose={()=>setShownotification(false)}
            fetchNotifications={fetchNotification}
          />
        </div>
      )}
    </div>
  );
}