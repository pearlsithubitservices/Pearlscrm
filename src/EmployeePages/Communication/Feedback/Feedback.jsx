import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, User, MessageSquare } from "lucide-react";
import useFeedback from "../../../Hooks/useFeedback";
import { useAuth } from "../../../context/AuthContext";

export default function FeedbackPage() {
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const { createFeedback, feedbacks, fetchFeedbacks } = useFeedback();
  const { user } = useAuth();

  const currentUserId = user?.uid || user?.id;
  const currentUserName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "Employee");

  const [form, setForm] = useState({
    feedbackType: "Work Culture",
    subject: "",
    comments: "",
    suggestion: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.comments.trim()) {
      alert("Please fill in the subject and comments field.");
      return;
    }

    try {
      setSubmitting(true);

      await createFeedback({
        ...form,
        rating,
        employeeId: currentUserId,
        employeeName: form.anonymous ? "Employee" : currentUserName,
      });

      alert("Thank you! Your feedback has been submitted successfully.");

      // reset form
      setForm({
        feedbackType: "Work Culture",
        subject: "",
        comments: "",
        suggestion: "",
        anonymous: false,
      });
      setRating(4);

      await fetchFeedbacks();
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter feedbacks submitted by this logged-in employee
  const myFeedbacks = (feedbacks || []).filter((item) => {
    if (!currentUserId && !currentUserName) return true;
    return (
      (currentUserId && item.employeeId === currentUserId) ||
      (currentUserName && item.employeeName?.toLowerCase() === currentUserName.toLowerCase())
    );
  });

  return (
    <div className="bg-[#efede8] min-h-screen p-4 sm:p-6 md:p-8 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT SIDE: FEEDBACK FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Share Your Feedback
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Help us improve workplace environment and employee satisfaction.
              </p>
            </div>
          </div>

          {/* AUTOMATIC LOGGED-IN EMPLOYEE BANNER */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Submitting As</p>
                <p className="text-sm font-bold text-[#0b2b57]">
                  {form.anonymous ? "Employee" : currentUserName}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border">
              ID: #{currentUserId ? String(currentUserId).slice(-5).toUpperCase() : "EMP"}
            </span>
          </div>

          {/* TYPE + SUBJECT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Feedback Category
              </label>

              <div className="relative">
                <select
                  name="feedbackType"
                  value={form.feedbackType}
                  onChange={handleChange}
                  className="w-full h-12 border border-slate-200 rounded-2xl px-4 bg-slate-50 outline-none text-xs font-semibold text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="Work Culture">Work Culture</option>
                  <option value="HR Policies">HR Policies</option>
                  <option value="IT & Tools">IT & Tools</option>
                  <option value="Cafeteria">Cafeteria</option>
                  <option value="Transport">Transport</option>
                </select>

                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subject
              </label>

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full h-12 border border-slate-200 rounded-2xl px-4 bg-slate-50 outline-none text-xs text-slate-800 placeholder-slate-400"
                placeholder="e.g., Office ergonomics chairs"
              />
            </div>
          </div>

          {/* RATING */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Rating</h3>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 hover:text-amber-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="mt-6">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detailed Feedback</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your feedback or suggestion..."
              className="w-full mt-2 p-4 border border-slate-200 rounded-2xl bg-slate-50 outline-none text-xs text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

          {/* FOOTER */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) =>
                  setForm({ ...form, anonymous: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              Submit Anonymously
            </label>

            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-white bg-blue-600 font-semibold text-xs hover:bg-blue-700 transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT SIDE: MY SUBMITTED FEEDBACKS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col"
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                My Feedback Submissions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted feedback history ({myFeedbacks.length})
              </p>
            </div>

            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
              History
            </span>
          </div>

          {/* SUBMITTED FEEDBACKS LIST */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 no-scrollbar flex-1">
            {myFeedbacks.length > 0 ? (
              myFeedbacks.map((item, i) => {
                const fbRating = Number(item.rating) || 4;
                const fbDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "Recent";

                return (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between gap-3 hover:bg-slate-100/60 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                          {item.feedbackType || item.type || "General"}
                        </span>

                        <span className="text-[11px] font-medium text-slate-400">
                          {fbDate}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                        {item.subject || item.message || item.comments}
                      </h3>

                      {item.comments && item.subject && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {item.comments}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                      {/* RATING */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= fbRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No feedback submitted yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Submit your first feedback using the form.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}