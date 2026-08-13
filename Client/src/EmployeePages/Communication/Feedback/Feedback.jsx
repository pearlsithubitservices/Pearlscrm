import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown } from "lucide-react";
import useFeedback from "../../../Hooks/useFeedback";

export default function FeedbackPage() {
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);

  const { createFeedback,feedbacks } = useFeedback();

  const [form, setForm] = useState({
    feedbackType: " ",
    subject: "",
    comments: "",
    suggestion: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createFeedback({
        ...form,
        rating,
      });

      // reset form
      setForm({
        feedbackType: "Workplace Experience",
        subject: "",
        comments: "",
        suggestion: "",
        anonymous: false,
      });

      setRating(1);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const hrFeedbacks = feedbacks.filter(
    (item) => item.feedbackType === "HR Policy"
  );

  const total = hrFeedbacks.reduce(
    (sum, item) => sum + item.rating,
    0
  );

  const avg = hrFeedbacks.length ? total / hrFeedbacks.length : 0;

  const hrPolicyStats = {
    title: "HR Policy",
    value: avg.toFixed(1),
    width: `${(avg / 5) * 100}%`,
  };

  const categories = [
    { title: "Work culture", value: "4.5%", width: "80%", color: "bg-fuchsia-500" },
    { title: "HR policies", value: "4.1%", width: "62%", color: "bg-emerald-500" },
    { title: "IT & tools", value: "2.8%", width: "35%", color: "bg-pink-600" },
    { title: "Cafeteria", value: "3.8%", width: "68%", color: "bg-orange-500" },
    { title: "Transport", value: "3.5%", width: "54%", color: "bg-amber-500" },
  ];

  return (
    <div className="bg-[#efede8] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-4 sm:gap-6 md:gap-6 auto-rows-auto lg:auto-rows-auto">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 lg:col-span-8 lg:row-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Share Your Voice
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-3">
            Help us improve the employee experience.
          </p>

          {/* TYPE + SUBJECT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Feedback Type
              </label>

              <div className="relative">
                <select
                  name="feedbackType"
                  value={form.feedbackType}
                  onChange={handleChange}
                  className="w-full h-12 sm:h-14 border rounded-2xl px-4 bg-slate-50 appearance-none text-sm sm:text-base"
                >
                  <option>Workplace Experience</option>
                  <option>HR Policy</option>
                  <option>Transport</option>
                  <option>IT Tools</option>
                </select>

                <ChevronDown className="absolute right-4 top-3 sm:top-5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Subject
              </label>

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full h-12 sm:h-14 border rounded-2xl px-4 bg-slate-50 text-sm sm:text-base"
                placeholder="e.g., Office chairs"
              />
            </div>
          </div>

          {/* RATING */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Your Rating</h3>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? "fill-blue-600 text-blue-600"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="mt-6">
            <label className="font-semibold text-sm sm:text-base">Comments</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              rows={4}
              className="w-full mt-2 p-3 sm:p-4 border rounded-2xl bg-slate-50 text-sm sm:text-base"
            />
          </div>

          {/* SUGGESTION */}
          <div className="mt-4">
            <label className="font-semibold text-sm sm:text-base">Suggestion</label>
            <textarea
              name="suggestion"
              value={form.suggestion}
              onChange={handleChange}
              rows={3}
              className="w-full mt-2 p-3 sm:p-4 border rounded-2xl bg-slate-50 text-sm sm:text-base"
            />
          </div>

          {/* FOOTER */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) =>
                  setForm({ ...form, anonymous: e.target.checked })
                }
              />
              Submit anonymously
            </label>

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-white bg-blue-600"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 lg:col-span-4 bg-white rounded-3xl border p-6 sm:p-8"
        >
          <h2 className="font-bold text-base sm:text-lg mb-6">
            Feedback Categories
          </h2>

          {categories.map((item, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>{item.title}</span>
                <span>{item.value}</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full mt-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: item.width }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}