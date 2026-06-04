import { motion } from "framer-motion";
import { Send } from "lucide-react";

const activities = [
  {
    name: "Vishnu R",
    text: "You updated Revenue Analysis to 65%",
    time: "10:30 AM",
  },
  {
    name: "Deepan",
    text: "Sarah Jenkins assigned you a new task: Security Audit",
    time: "10:30 AM",
  },
  {
    name: "Ragavi",
    text: "HR approved your completion of Database Migration",
    time: "10:30 AM",
  },
];

export default function TaskActivityFeed() {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-5 border">
      
      {/* Header */}
      <h2 className="text-xl font-semibold text-slate-800 mb-5">
        Activity Feed
      </h2>

      {/* Timeline */}
      <div className="relative pl-6 space-y-6 overflow-y-auto no-scrollbar">

        {/* vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-slate-200 " />

        {activities.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="relative "
          >
            {/* dot */}
            <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-slate-900" />

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500">{item.name}</p>
                <p className="text-sm text-slate-800 leading-snug">
                  {item.text}
                </p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-6">
        <div className="bg-slate-100 rounded-xl p-3">
          <input
            type="text"
            placeholder="What have you Activity today?"
            className="w-full bg-transparent outline-none text-sm text-slate-700"
          />
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0b2b57] text-white py-3 rounded-xl font-medium hover:bg-[#081f3f] transition"
        >
          <Send size={18} />
          Send
        </motion.button>
      </div>
    </div>
  );
}