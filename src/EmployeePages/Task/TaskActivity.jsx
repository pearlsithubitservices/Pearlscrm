import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useActivity from "../../Hooks/useActivity";
import useEmployees from "../../Hooks/useEmployees";

export default function TaskActivityFeed() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const userUid = user?.uid || user?._id || user?.id;
  const empObj = (employees || []).find((item) =>
    item?.uid === userUid || item?._id === userUid || item?.id === userUid
  );
  const empName = empObj?.name || empObj?.employeeName || user?.displayName || user?.name || "Employee";
  const {
    createActivity,
    getActivities,
    getAllActivities,
    deleteActivity,
  } = useActivity();

  const [activities, setActivities] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (userUid) {
      fetchActivities();
    }
  }, [userUid]);

  const fetchActivities = async () => {
    try {
      const data = await getAllActivities();
      setActivities(data.data || data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await createActivity({
        employee_uid: userUid || "employee",
        name: empName,
        text,
      });

      setText("");
      fetchActivities();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-md max-h-[530px] h-full overflow-hidden no-scrollbar mx-auto bg-white rounded-2xl  p-5 border">
      <h2 className="text-xl font-semibold text-slate-800 mb-5">
        Activity Feed
      </h2>

      <div className="relative pl-6 space-y-6 overflow-y-auto no-scrollbar max-h-[300px] h-full  ">
        <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-slate-200 " />

        {activities?.map((item) => (
          <motion.div
            key={item._id || item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative "
          >
            <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-slate-900" />

            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-sm text-slate-500">{item.name}</p>
                <p className="text-sm text-slate-800">{item.text}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {item.time}
                </span>
                <button
                  onClick={() => handleDelete(item._id || item.id)}
                  title="Delete Activity"
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <div className="bg-slate-100 rounded-xl p-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What have you done today?"
            className="w-full bg-transparent outline-none text-sm text-slate-700"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSend}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0b2b57] text-white py-3 rounded-xl font-medium hover:bg-[#081f3f]"
        >
          <Send size={18} />
          Send
        </motion.button>
      </div>
    </div>
  );
}