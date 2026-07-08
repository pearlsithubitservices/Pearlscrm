import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useReview from "../../Hooks/useReview";
import useEmployees from "../../Hooks/useEmployees";

const reviewTypes = [
    "New",
    "Monthly Review",
    "Quarterly Review",
    "Yearly Review",
];

export default function AddReviewForm({
    onClose,
    getReviews,
    currentUserid,
    review = null, // null => Add Mode
}) {

    const { user } = useAuth();

    const {
        createReview,
        updateReview, // <-- Add this in your hook
    } = useReview();

    const { employees } = useEmployees();
    console.log(currentUserid);

    const currentEmployee = employees.find(
        (item) =>
            item.uid === currentUserid ||
            item.id === currentUserid
    );
    console.log(review);

    const [rating, setRating] = useState(1);
    const [hover, setHover] = useState(0);

    const [formData, setFormData] = useState({
        reviewTitle: "",
        reviewType: "New",

        technicalSkills: "",
        communication: "",
        teamwork: "",
        initiative: "",
        punctuality: "",

        reviewSummary: "",
    });
    console.log(review);

    // Populate form when editing
    useEffect(() => {
        if (review) {

            setRating(review.overallRating || 1);

            setFormData({
                reviewTitle: review.reviewTitle || "",

                reviewType: review.reviewerType || "New",

                technicalSkills:
                    review.metrics?.find(
                        (m) => m.title === "Technical Skills"
                    )?.score || "",

                communication:
                    review.metrics?.find(
                        (m) => m.title === "Communication"
                    )?.score || "",

                teamwork:
                    review.metrics?.find(
                        (m) => m.title === "Teamwork"
                    )?.score || "",

                initiative:
                    review.metrics?.find(
                        (m) => m.title === "Initiative"
                    )?.score || "",

                punctuality:
                    review.metrics?.find(
                        (m) => m.title === "Punctuality"
                    )?.score || "",

                reviewSummary: review.feedback || "",
            });

        } else {

            setRating(1);

            setFormData({
                reviewTitle: "",
                reviewType: "New",

                technicalSkills: "",
                communication: "",
                teamwork: "",
                initiative: "",
                punctuality: "",

                reviewSummary: "",
            });

        }

    }, [review]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            let response;

            if (review) {
                const Updatedpayload = {
                    employee_uid: review.employee_uid,
                    employeeName: review.employeeName,
                    employeeDesignation: review.employeeDesignation,
                    reviewerName: user.uid,
                    reviewerType: formData.reviewType,
                    reviewerDesignation: "HR Manager",
                    reviewerImage: "",
                    reviewTitle: formData.reviewTitle,
                    overallRating: rating,
                    reviewDate: review.reviewDate,

                    metrics: [
                        {
                            title: "Technical Skills",
                            score: Number(formData.technicalSkills),
                        },
                        {
                            title: "Communication",
                            score: Number(formData.communication),
                        },
                        {
                            title: "Teamwork",
                            score: Number(formData.teamwork),
                        },
                        {
                            title: "Initiative",
                            score: Number(formData.initiative),
                        },
                        {
                            title: "Punctuality",
                            score: Number(formData.punctuality),
                        },
                    ],

                    feedback: formData.reviewSummary,
                };

                response = await updateReview(review._id, Updatedpayload);
            } else {
                const payload = {
                    employee_uid: currentEmployee.uid,
                    employeeName: currentEmployee.employeeName || currentEmployee.name,
                    employeeDesignation:
                        currentEmployee.employeeDepartment ||
                        currentEmployee.role ||
                        "Employee",
                    reviewerName: user.uid,
                    reviewerType: formData.reviewType,
                    reviewerDesignation: "HR Manager",
                    reviewerImage: "",
                    reviewTitle: formData.reviewTitle,
                    overallRating: rating,
                    reviewDate: new Date(),

                    metrics: [
                        {
                            title: "Technical Skills",
                            score: Number(formData.technicalSkills),
                        },
                        {
                            title: "Communication",
                            score: Number(formData.communication),
                        },
                        {
                            title: "Teamwork",
                            score: Number(formData.teamwork),
                        },
                        {
                            title: "Initiative",
                            score: Number(formData.initiative),
                        },
                        {
                            title: "Punctuality",
                            score: Number(formData.punctuality),
                        },
                    ],

                    feedback: formData.reviewSummary,
                };

                response = await createReview(payload);
            }

            console.log(response);


            await getReviews();
            setRating(1);

            setFormData({
                reviewTitle: "",
                reviewType: "New",

                technicalSkills: "",
                communication: "",
                teamwork: "",
                initiative: "",
                punctuality: "",

                reviewSummary: "",
            });

            onClose();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-h-screen flex justify-center items-center"
        >
            <div className="relative w-full max-w-4xl h-[500px] overflow-y-auto no-scrollbar rounded-3xl bg-[#f2eee6] shadow-xl p-6 md:p-10">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-red-700 w-8 h-8 rounded-full text-white"
                >
                    <X className="hover:scale-125 transition-transform duration-200 ml-1" />
                </button>

                {/* Header */}

                <div className="flex items-center gap-4 mb-8">

                    <span className="text-xs tracking-[3px] uppercase text-gray-500 whitespace-nowrap">
                        {review
                            ? "Update Performance Review"
                            : "New Performance Review"}
                    </span>

                    <div className="flex-1 h-px bg-gray-400" />

                </div>

                {/* Review Title */}

                <div className="mb-6">

                    <label className="block text-[#12345a] font-semibold text-xl mb-3">
                        Review Title
                    </label>

                    <input
                        type="text"
                        name="reviewTitle"
                        value={formData.reviewTitle}
                        onChange={handleChange}
                        placeholder="e.g. Meets Expectations"
                        className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* Review Type */}

                <div className="mb-8">

                    <label className="block text-[#12345a] font-semibold text-xl mb-3">
                        Review Type
                    </label>

                    <div className="relative">

                        <select
                            name="reviewType"
                            value={formData.reviewType}
                            onChange={handleChange}
                            className="appearance-none w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {reviewTypes.map((type) => (
                                <option key={type}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={20}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                </div>

                {/* Rating */}

                <div className="mb-10">

                    <h2 className="text-[#12345a] font-semibold text-xl mb-4">
                        Your Rating
                    </h2>

                    <div className="flex items-center gap-3 flex-wrap">

                        {[1, 2, 3, 4, 5].map((star) => (

                            <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: .9 }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={34}
                                    strokeWidth={2}
                                    className={
                                        star <= (hover || rating)
                                            ? "fill-blue-600 text-blue-600"
                                            : "text-blue-200"
                                    }
                                />
                            </motion.button>

                        ))}

                        <span className="ml-4 text-gray-600 text-lg">
                            Tap to rate
                        </span>

                    </div>

                </div>

                {/* Performance Metrics */}

                <div className="mb-8">

                    <div className="flex items-center gap-4 mb-8">

                        <span className="text-xs tracking-[3px] uppercase text-gray-500 whitespace-nowrap">
                            Performance Metrics
                        </span>

                        <div className="flex-1 h-px bg-gray-400"></div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Technical Skills */}

                        <div>

                            <label className="block text-[#12345a] font-semibold text-xl mb-3">
                                Technical Skills (out of 05)
                            </label>

                            <input
                                type="number"
                                name="technicalSkills"
                                value={formData.technicalSkills}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 4.3"
                                className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Communication */}

                        <div>

                            <label className="block text-[#12345a] font-semibold text-xl mb-3">
                                Communication (out of 05)
                            </label>

                            <input
                                type="number"
                                name="communication"
                                value={formData.communication}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 4.3"
                                className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Teamwork */}

                        <div>

                            <label className="block text-[#12345a] font-semibold text-xl mb-3">
                                Teamwork (out of 05)
                            </label>

                            <input
                                type="number"
                                name="teamwork"
                                value={formData.teamwork}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 4.3"
                                className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Initiative */}

                        <div>

                            <label className="block text-[#12345a] font-semibold text-xl mb-3">
                                Initiative (out of 05)
                            </label>

                            <input
                                type="number"
                                name="initiative"
                                value={formData.initiative}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 4.3"
                                className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Punctuality */}

                        <div>

                            <label className="block text-[#12345a] font-semibold text-xl mb-3">
                                Punctuality (out of 05)
                            </label>

                            <input
                                type="number"
                                name="punctuality"
                                value={formData.punctuality}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 4.3"
                                className="w-full h-14 rounded-2xl border border-gray-300 bg-white px-5 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                    </div>

                </div>

                {/* Review Summary */}

                <div className="mb-8">

                    <div className="flex items-center justify-between mb-3">

                        <label className="text-[#12345a] font-semibold text-xl">
                            Review Summary
                        </label>

                        <span className="text-sm text-gray-400">
                            {formData.reviewSummary.length}/500
                        </span>

                    </div>

                    <motion.textarea
                        whileFocus={{ scale: 1.01 }}
                        name="reviewSummary"
                        value={formData.reviewSummary}
                        onChange={handleChange}
                        rows={6}
                        maxLength={500}
                        placeholder="Write your review summary here..."
                        className="w-full resize-none rounded-2xl border border-gray-300 bg-white p-5 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* Buttons */}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: .96 }}
                        type="button"
                        onClick={onClose}
                        className="h-14 w-full sm:w-40 rounded-2xl border border-gray-400 bg-white text-gray-600 font-medium"
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 12px 25px rgba(37,99,235,.25)",
                        }}
                        whileTap={{ scale: .98 }}
                        type="submit"
                        onClick={handleSubmit}
                        className="h-14 w-full sm:flex-1 rounded-2xl bg-[#1f5fa9] text-white font-semibold text-lg"
                    >
                        {review ? "Update Review" : "Submit Review"}
                    </motion.button>

                </div>

            </div>
        </motion.div>
    );
}