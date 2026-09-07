import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    SquarePen,
    Bell,
    Star,
} from "lucide-react";
import useReview from "../../Hooks/useReview";
import { useNavigate, useParams } from "react-router-dom";
import AddReviewForm from "./AddReviewForm";
import EmployeeReviewPage from "./EmployeeReviewPage";
import { useLocation } from "react-router-dom";

export default function PerformanceReviews({ currentUserid, employee }) {
    const params = useParams();
    const targetEmpId = currentUserid || employee?.uid || employee?.id || employee?._id || params.id;
    const [openForm, setOpenForm] = useState(false);
    const [openReview, setOpenReview] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [selectedReview, setSelectedReview] = useState(null);
    const { review, getReviews } = useReview();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.isEdit) {
            setSelectedReview(location.state.review);
            setOpenForm(true);
            setOpenReview(false);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location]);

    const employeeReviews = useMemo(() => {
        if (!targetEmpId) return review;
        const empName = employee?.employeeName || employee?.name || "";
        return review.filter((r) => {
            const rUid = r?.employee_uid || r?.employeeId || r?.employee?.uid || r?.employee?.id;
            return (
                String(rUid || "") === String(targetEmpId) ||
                String(r?.id || "") === String(targetEmpId) ||
                String(r?._id || "") === String(targetEmpId) ||
                (empName && String(r?.employeeName || "").toLowerCase() === empName.toLowerCase())
            );
        });
    }, [review, targetEmpId, employee]);

    const filteredReviews = useMemo(() => {
        return employeeReviews.filter((r) => {
            const matchesSearch =
                !search ||
                r?.employeeName?.toLowerCase()?.includes(search.toLowerCase()) ||
                r?.title?.toLowerCase()?.includes(search.toLowerCase()) ||
                r?.reviewTitle?.toLowerCase()?.includes(search.toLowerCase());

            const matchesCategory =
                category === "All Categories" ||
                r?.category === category ||
                r?.reviewType === category;

            return matchesSearch && matchesCategory;
        });
    }, [employeeReviews, search, category]);

    return (
        <div className="min-h-screen bg-[#F8F5EF] p-4">

            {/* Header */}

            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl shadow-sm px-6 py-5 mb-6">

                <h1 className="text-[22px] font-bold text-black">
                    All performance reviews
                </h1>

                <div className="flex flex-wrap items-center gap-4">

                    {/* Search */}

                    <div className="relative">

                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search Goals..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="
                w-64
                h-11
                rounded-xl
                bg-[#F5F5F5]
                pl-12
                pr-4
                outline-none
                border
                border-transparent
                focus:border-blue-500
              "
                        />

                    </div>

                    {/* Category */}

                    <div className="relative">

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            className="
                appearance-none
                h-11
                w-44
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                pr-10
                outline-none
              "
                        >
                            <option>All Categories</option>
                            <option>Annual Review</option>
                            <option>Mid-Year Review</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                    {/* Add Review */}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="
              h-11
              px-5
              rounded-xl
              bg-[#EDF3FF]
              flex
              items-center
              gap-2
              text-[#314A67]
              font-medium
            "
                        onClick={() => setOpenForm(true)}
                    >
                        <SquarePen size={18} />
                        Add Review
                    </motion.button>

                </div>

            </header>


            <div className="space-y-5">
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review, index) => (
                        <motion.div
                            key={review._id || review.id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.45,
                                delay: index * 0.08,
                            }}
                            whileHover={{
                                y: -3,
                                scale: 1.01,
                            }}
                            className="
            bg-white
            rounded-2xl
            border
            border-[#D7D7D7]
            shadow-sm
            p-5
            cursor-pointer
          "
                            onClick={() => {
                                setOpenReview(true);
                                setSelectedReview(review);
                            }}
                        >
                            {/* Top Section */}

                            <div className="flex justify-between items-start">
                                {/* Left */}

                                <div className="flex gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold text-xl shadow-sm">
                                        {review?.employeeName?.charAt(0)?.toUpperCase() || "E"}
                                    </div>

                                    <div>
                                        <h2 className="text-[22px] font-bold text-[#163C67]">
                                            {review?.employeeName || "Employee"}
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {review?.employeeDesignation || review?.reviewType || "Performance Review"}
                                        </p>
                                    </div>
                                </div>

                                {/* Right */}

                                <div className="flex flex-col items-end">
                                    {/* Stars */}

                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={18}
                                                className={`${
                                                    star <= (review?.overallRating || 0)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="font-bold text-gray-700 ml-1.5 text-base">
                                            {review?.overallRating || 0}
                                        </span>
                                    </div>

                                    <span className="text-xs text-gray-400 mt-1">
                                        {review?.reviewDate ? new Date(review.reviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                                    </span>
                                </div>
                            </div>

                            {/* Middle Title */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {review?.reviewTitle || "Review"}
                                </h3>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                    {review?.reviewType || "Review"}
                                </span>
                            </div>

                            {review?.feedback && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {review.feedback}
                                </p>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-2xl border border-gray-200">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                            <Star size={28} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">No Performance Reviews Found</h4>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Click &quot;Add Review&quot; above to create a review for this employee.
                        </p>
                    </div>
                )}
            </div>
            {openForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full rounded-2xl shadow-2xl">
                        <AddReviewForm
                            onClose={() => {
                                setOpenForm(false);
                                setSelectedReview(null);
                            }}
                            getReviews={getReviews}
                            currentUserid={targetEmpId}
                            review={selectedReview}
                        />
                    </div>
                </div>
            )}
            {openReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setOpenReview(false)}
                            className="absolute top-1 right-2 text-gray-500 hover:text-black text-2xl cursor-pointer"
                        >
                            ✕
                        </button>

                        <EmployeeReviewPage
                            onClose={() => setOpenReview(false)}
                            reviews={selectedReview}
                            currentUserid={targetEmpId}
                            onReviewDeleted={() => {
                                getReviews();
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}