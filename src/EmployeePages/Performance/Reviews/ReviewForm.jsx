import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import useReview from "../../../Hooks/useReview";
import { useAuth } from "../../../context/AuthContext";

export default function ReviewForm({ onClose, fetchreviews }) {
    const { createReview, loading } = useReview();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        employee_uid: user?.uid || "",
        employeeName: "",
        employeeDesignation: "",
        reviewerName: "",
        reviewerDesignation: "HR Manager",
        reviewerImage: "",
        reviewTitle: "",
        overallRating: "",
        feedback: "",
        metrics: [
            { title: "Technical skills", score: "" },
            { title: "Communication", score: "" },
            { title: "Teamwork", score: "" },
            { title: "Initiative", score: "" },
            { title: "Punctuality", score: "" },
        ],
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.employeeName.trim()) newErrors.employeeName = "Employee name is required";
        if (!formData.employeeDesignation.trim()) newErrors.employeeDesignation = "Employee designation is required";
        if (!formData.reviewerName.trim()) newErrors.reviewerName = "Reviewer name is required";
        if (!formData.reviewTitle.trim()) newErrors.reviewTitle = "Review title is required";
        if (!formData.overallRating || formData.overallRating < 0 || formData.overallRating > 5) {
            newErrors.overallRating = "Overall rating must be between 0 and 5";
        }
        if (!formData.feedback.trim()) newErrors.feedback = "Feedback is required";
        formData.metrics.forEach((metric, index) => {
            if (!metric.score || metric.score < 0 || metric.score > 5) {
                newErrors[`metric_${index}`] = "Score must be between 0 and 5";
            }
        });
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleMetricChange = (index, value) => {
        const updatedMetrics = [...formData.metrics];
        updatedMetrics[index].score = Number(value);
        setFormData({
            ...formData,
            metrics: updatedMetrics,
        });
        if (errors[`metric_${index}`]) {
            setErrors({ ...errors, [`metric_${index}`]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createReview(formData);
            alert("Review submitted successfully");
            await fetchreviews?.();
            onClose?.();
        } catch (error) {
            setErrors({ submit: error.message || "Failed to submit review" });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4">
            <motion.form
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#0B2B57]">
                        Performance Review
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="text-gray-500 w-6 h-6" />
                    </button>
                </div>

                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        {errors.submit}
                    </div>
                )}

                {/* Employee Info - Read Only */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#0B2B57] mb-4">Employee Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                            <input
                                type="text"
                                disabled
                                value={formData.employee_uid}
                                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="employeeName"
                                placeholder="Enter employee name"
                                value={formData.employeeName}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeName ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.employeeName && <span className="text-red-500 text-sm mt-1">{errors.employeeName}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Designation <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="employeeDesignation"
                                placeholder="e.g., Software Engineer"
                                value={formData.employeeDesignation}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeDesignation ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.employeeDesignation && <span className="text-red-500 text-sm mt-1">{errors.employeeDesignation}</span>}
                        </div>
                    </div>
                </div>

                {/* Reviewer Info */}
                <div className="mb-8 pb-8 border-b">
                    <h3 className="text-lg font-bold text-[#0B2B57] mb-4">Reviewer Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="reviewerName"
                                placeholder="Enter reviewer name"
                                value={formData.reviewerName}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.reviewerName ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.reviewerName && <span className="text-red-500 text-sm mt-1">{errors.reviewerName}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Designation</label>
                            <input
                                type="text"
                                name="reviewerDesignation"
                                placeholder="HR Manager"
                                value={formData.reviewerDesignation}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Image URL</label>
                            <input
                                type="text"
                                name="reviewerImage"
                                placeholder="https://example.com/image.jpg"
                                value={formData.reviewerImage}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Review Details */}
                <div className="mb-8 pb-8 border-b">
                    <h3 className="text-lg font-bold text-[#0B2B57] mb-4">Review Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Review Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="reviewTitle"
                                placeholder="Q1 2026 Performance Review"
                                value={formData.reviewTitle}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.reviewTitle ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.reviewTitle && <span className="text-red-500 text-sm mt-1">{errors.reviewTitle}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                name="overallRating"
                                placeholder="0 - 5"
                                value={formData.overallRating}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.overallRating ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.overallRating && <span className="text-red-500 text-sm mt-1">{errors.overallRating}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback <span className="text-red-500">*</span></label>
                        <textarea
                            name="feedback"
                            placeholder="Provide detailed feedback about the employee's performance..."
                            value={formData.feedback}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.feedback ? "border-red-500" : "border-gray-300"}`}
                            required
                        />
                        {errors.feedback && <span className="text-red-500 text-sm mt-1">{errors.feedback}</span>}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#0B2B57] mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                        {formData.metrics.map((metric, index) => (
                            <div key={metric.title} className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {metric.title} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={metric.score}
                                        onChange={(e) => handleMetricChange(index, e.target.value)}
                                        placeholder="0 - 5"
                                        className={`w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors[`metric_${index}`] ? "border-red-500" : "border-gray-300"}`}
                                        required
                                    />
                                    {errors[`metric_${index}`] && (
                                        <span className="text-red-500 text-sm mt-1">{errors[`metric_${index}`]}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-[#0B5DB5] text-white font-medium hover:bg-[#0945A0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}