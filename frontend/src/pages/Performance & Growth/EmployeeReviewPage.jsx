import { motion } from "framer-motion";

import { Star } from "lucide-react";
import { useState } from "react";
import AddReviewForm from "./AddReviewForm";
import { useNavigate } from "react-router-dom";
import useCourse from "../../Hooks/useCourse";
import useReview from "../../Hooks/useReview";

export default function EmployeeReviewPage({ reviews, onClose, currentUserid }) {
    console.log(reviews);
    const [Open, setOpen] = useState(false);
    const { deleteReview } = useReview();
    const getMetricColor = (title) => {
        switch (title) {
            case "Technical Skills":
                return "from-blue-500 to-cyan-500";

            case "Communication":
                return "from-violet-500 to-purple-600";

            case "Teamwork":
                return "from-emerald-500 to-green-600";

            case "Initiative":
                return "from-orange-500 to-amber-500";

            case "Punctuality":
                return "from-pink-500 to-rose-500";

            default:
                return "from-gray-500 to-gray-600";
        }
    };


    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate(
            `/admin-performance/${currentUserid}`,
            {
                state: {
                    review: reviews,
                    isEdit: true,
                    openForm: true,
                },
            }
        );

        // onClose?.(); // Optional: close the review modal
    };

    return (
        <div className="min-h-screen bg-[#f5f2ea] py-8 px-3 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Employee Card */}

                <div className="bg-white rounded-2xl shadow-lg border p-5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        {/* <img
                            src={review.employee.image}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover"
                        /> */}
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            {reviews?.employeeName?.charAt(0)?.toUpperCase() || reviews?.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-[#12355B]">
                                {reviews?.employeeName || reviews?.name || "Employee Name"}
                            </h1>

                            <p className="text-gray-500 text-xl">
                                {reviews?.employeeDesignation || reviews?.role || "Employee Role"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <Star
                                key={item}
                                size={32}
                                className={`${item <= Math.floor(reviews?.overallRating)
                                    ? "fill-blue-500 text-blue-500"
                                    : "text-blue-500"
                                    }`}
                            />
                        ))}

                        <span className="text-blue-500 text-3xl ml-2">
                            {reviews?.overallRating || "0"}
                        </span>
                    </div>
                </div>

                {/* Heading */}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#12355B]">
                        {reviews?.reviewTitle}
                    </h2>

                    <p className="text-gray-500 text-xl">{reviews?.date}</p>
                </div>

                {/* Metrics */}

                <div className="bg-white rounded-2xl shadow-lg mt-6 p-6">
                    <h2 className="text-4xl font-semibold mb-8">
                        Performance metrics
                    </h2>

                    <div className="space-y-7">
                        {reviews?.metrics?.map((metric) => (
                            <motion.div
                                key={metric.title}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex justify-between mb-3">
                                    <h3 className="text-2xl text-[#12355B]">
                                        {metric?.title}
                                    </h3>

                                    <span className="text-2xl text-gray-700">
                                        {metric?.score}
                                    </span>
                                </div>

                                <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{
                                            width: `${(metric?.score / 5) * 100}%`,
                                        }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${getMetricColor(metric?.title)}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Feedback */}

                <div className="bg-white rounded-2xl shadow-lg mt-6 p-6">
                    <h2 className="text-4xl mb-5">feedback</h2>

                    <p className="text-[#12355B] text-xl leading-relaxed">
                        {reviews?.feedback}
                    </p>
                </div>

                {/* Buttons */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: .97 }}
                        className="border border-red-500 text-red-500 rounded-xl py-4 font-semibold bg-white"
                        onClick={async () => {
                            await deleteReview(reviews?._id);
                            onClose();
                        }}
                    >
                        Remove
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: .97 }}
                        className="rounded-xl py-4 font-semibold bg-green-200 text-green-900"
                        onClick={handleEditClick}
                    >
                        Edit
                    </motion.button>
                </div>
            </motion.div>

        </div>
    );
}