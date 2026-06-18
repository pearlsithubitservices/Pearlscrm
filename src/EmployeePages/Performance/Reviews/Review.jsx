// ReviewHistory.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import FullReview from "./FullReview";
import PerformanceReviewForm from "./ReviewForm";
import ReviewForm from "./ReviewForm";
import useReview from "../../../Hooks/useReview";



export default function ReviewHistory() {
  const [showreview, setShowReview] = useState(false);
  const [showreviewform, setShowReviewForm] = useState(false);
  const [review, setReview] = useState([]);
  const { getReviews, getReviewByEmployee } = useReview();
  const [selectedReview, setSelectedReview] = useState(null);
  console.log(review);

  useEffect(() => {
    fetchReviews();
  }, []);
  const fetchReviews = async () => {
    try {
      const res = await getReviews();

      setReview(res.data); // assuming API returns { success, data }
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className="min-h-screen bg-[#F5F4EE] p-6">
      <div className="max-w-7xl mx-auto space-y-5 ">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm"
        >
          <h1 className="text-2xl font-bold text-black">
            Review history
          </h1>


          <div className="bg-[#EEF2F7] text-gray-600 px-5 py-2 rounded-full text-lg font-medium">
            <button onClick={() => setShowReviewForm(true)}> Reviews Form </button>
          </div>
          <div className="bg-[#EEF2F7] text-gray-600 px-5 py-2 rounded-full text-lg font-medium">
            {review.length} Reviews
          </div>
        </motion.div>

        {/* Review Cards */}
        {review.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 * 0.15 }}
            whileHover={{ y: -3 }}
            className={`bg-white rounded-2xl shadow-sm px-5 cursor-pointer border-l-4 py-5 ${review.overallRating >= 4 ? " border-yellow-700" : review.overallRating >= 3.5 ? "  border-green-500" : " border-red-500"}  `}
            onClick={() => {
              setSelectedReview(review)
              setShowReview(true)
            }}
          >
            {/* Top Section */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left */}
              <div className="flex gap-4">
                <div className="rounded-full bg-blue-400 w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
                  {review.employeeName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[24px] font-bold text-[#12345B]">
                    {review.employeeName
                    }
                  </h2>

                  <p className="text-gray-400 text-[18px]">
                    {review.employeeDesignation
                    }
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      className="text-[#5B8DEF]"
                      fill={
                        star <= Math.floor(review.overallRating)
                          ? "#5B8DEF"
                          : "transparent"
                      }
                    />
                  ))}
                </div>

                <span className="text-[18px] font-semibold text-[#5B8DEF]">
                  {review.overallRating}
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="mt-6">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
                <h3 className="text-[24px] font-medium text-[#12345B]">
                  {review.reviewTitle}
                </h3>

                <span className="text-gray-300 text-[18px]">
                  {new Date(review.reviewDate).toLocaleDateString('en-GB')}
                </span>
              </div>

              <p className="mt-4 text-[18px] leading-relaxed text-gray-400">
                {review.feedback.slice(0, 200)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {showreview && (
        <div className="fixed inset-0 z-40 flex items-end ml-[200px] backdrop-blur-sm justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-3xl mx-4">
            <FullReview
              selectedreview={selectedReview}
              onClose={() => setShowReview(false)} />
          </div>
        </div>
      )}
      {showreviewform && (
        <div className="fixed inset-0 z-40 flex items-end ml-[200px] backdrop-blur-sm justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-3xl mx-4">
            <ReviewForm
              fetchreviews={fetchReviews}

              onClose={() => setShowReviewForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}