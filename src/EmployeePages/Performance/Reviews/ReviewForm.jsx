import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import useReview from "../../../Hooks/useReview";
import { useAuth } from "../../../context/AuthContext";

export default function ReviewForm({ onClose, fetchreviews }) {
    const { createReview, loading } = useReview();
    const { user } = useAuth();


    const [formData, setFormData] = useState({
        employee_uid: user.uid,
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMetricChange = (index, value) => {
        const updatedMetrics = [...formData.metrics];

        updatedMetrics[index].score = Number(value);

        setFormData({
            ...formData,
            metrics: updatedMetrics,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createReview(formData);

            alert("Review submitted successfully");
            await fetchreviews();

            onClose?.();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 no-scrollbar">
            <motion.form
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Performance Review
                    </h2>

                    <button type="button" onClick={onClose}>
                        <X className="text-red-500" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="employee_uid"
                        placeholder="Employee UID"
                        value={formData.employee_uid}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                        required
                    />

                    <input
                        type="text"
                        name="employeeName"
                        placeholder="Employee Name"
                        value={formData.employeeName}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                        required
                    />

                    <input
                        type="text"
                        name="employeeDesignation"
                        placeholder="Employee Designation"
                        value={formData.employeeDesignation}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                        required
                    />

                    <input
                        type="text"
                        name="reviewerName"
                        placeholder="Reviewer Name"
                        value={formData.reviewerName}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                        required
                    />

                    <input
                        type="text"
                        name="reviewerDesignation"
                        placeholder="Reviewer Designation"
                        value={formData.reviewerDesignation}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                    />

                    <input
                        type="text"
                        name="reviewerImage"
                        placeholder="Reviewer Image URL"
                        value={formData.reviewerImage}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                    />

                    <input
                        type="text"
                        name="reviewTitle"
                        placeholder="Review Title"
                        value={formData.reviewTitle}
                        onChange={handleChange}
                        className="border rounded-lg p-3 md:col-span-2"
                        required
                    />

                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        name="overallRating"
                        placeholder="Overall Rating"
                        value={formData.overallRating}
                        onChange={handleChange}
                        className="border rounded-lg p-3"
                        required
                    />
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-4">
                        Performance Metrics
                    </h3>

                    <div className="space-y-4">
                        {formData.metrics.map((metric, index) => (
                            <div
                                key={metric.title}
                                className="flex items-center gap-4"
                            >
                                <label className="w-40 text-slate-700">
                                    {metric.title}
                                </label>

                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={metric.score}
                                    onChange={(e) =>
                                        handleMetricChange(index, e.target.value)
                                    }
                                    className="border rounded-lg p-2 flex-1"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <textarea
                    name="feedback"
                    placeholder="Feedback"
                    value={formData.feedback}
                    onChange={handleChange}
                    rows={5}
                    className="w-full border rounded-lg p-3 mt-6"
                    required
                />

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}