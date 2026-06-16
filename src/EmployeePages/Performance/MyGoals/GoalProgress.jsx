import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  FolderOpen,
  Plus,
} from "lucide-react";
import useGoals from "../../../Hooks/useGoals";

export default function GoalProgress({ goals, setGoals, fetchGoals }) {

  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState("");
  const { updateProgress } = useGoals();


  const [progressLogs, setProgressLogs] = useState([
    {
      id: 1,
      text:
        "Lead opened the intro presentation 3 times. Spent 8 minutes on pricing section.features.",
      date: "Today, 10:22 AM",
      user: "Rohan M",
      progress: 52,
    },
    {
      id: 2,
      text:
        "Lead mentioned budget approval needed from CFO before moving forward. Expected by end of month",
      date: "Jun 6, 11:10 AM",
      user: "Rohan M.",
      progress: 45,
    },
  ]);
  const handleAddProgress = async () => {
    if (!description.trim()) return;

    try {
      const response = await updateProgress(
        goals._id,
        {
          progress: Number(goals.progress) + Number(progress),
          description,
        }
      );

      // Update parent state using DB response
      setGoals(response.goals);

      setDescription("");
      fetchGoals();
    } catch (err) {
      console.log(err);
    }
  };



  return (
    <div className="bg-[#F4F2EC]">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-[#F4F2EC] rounded-[30px]  overflow-hidden shadow-sm"
      >
        {/* Header */}


        {/* Tabs */}


        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">

            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              {/* Title */}
              <h2 className="uppercase text-gray-500 font-bold text-xl">
                Update Progress
              </h2>

              {/* Progress Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-[28px] font-semibold text-[#244161] mb-8">
                  Update Your Goals progress {progress} %
                </p>

                <div className="relative">
                  <div className="h-4 rounded-full bg-gray-200" />

                  <motion.div
                    animate={{
                      width: `${progress}%`,
                    }}
                    className="absolute top-0 left-0 h-4 rounded-full bg-[#35BE88]"
                  />

                  <motion.div
                    animate={{
                      left: `calc(${progress}% - 12px)`,
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#35BE88]"
                  />

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) =>
                      setProgress(e.target.value)
                    }
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Add a new progress Descrption..."
                  className="w-full bg-white rounded-2xl border border-gray-200 p-6 text-xl outline-none resize-none placeholder:text-gray-400"
                />

                <div className="flex justify-end mt-5">
                  <button className="bg-[#3F7BEF] hover:bg-[#356fe0] text-white rounded-full px-6 py-2 text-sm font-medium flex items-center gap-2 transition"
                    onClick={handleAddProgress}
                  >
                    <Plus size={15} />
                    Add to progress
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8">
                <div className="absolute left-3 top-4 bottom-4 w-[2px] bg-[#D2D7E5]" />

                <div className="space-y-14">
                  {goals.progressLogs.map((item) => (
                    <div
                      key={item._id}
                      className="relative"
                    >
                      <div className="absolute -left-7 top-2 w-5 h-5 rounded-full bg-[#3577F5]" />

                      <div>
                        <p className="text-[19px] leading-relaxed text-gray-500">
                          {item.description}
                        </p>
                        <p className="text-[19px] leading-relaxed text-gray-500">
                          {item.progress}% Completed
                        </p>

                        <p className="mt-3 text-gray-400 text-[18px]">
                          {new Date(item.date).toLocaleDateString('en-GB')}
                          <span className="mx-2">
                            •
                          </span>
                          by {item.user || 'deepan'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}