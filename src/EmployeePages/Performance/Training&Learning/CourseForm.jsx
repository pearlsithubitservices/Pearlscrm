import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import useCourse from "../../../Hooks/useCourse";

export default function CourseForm({ onClose, fetchCourse }) {
    const { createCourse } = useCourse();
    const [imagefile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [course, setCourse] = useState({
        title: "",
        tag: "Recommended",
        duration: "",
        level: "Beginner",
        image: "",
        description: "",
        provider: ""
    });

    const validateForm = () => {
        const newErrors = {};
        if (!course.title.trim()) newErrors.title = "Course title is required";
        if (!course.duration.trim()) newErrors.duration = "Duration is required";
        if (!course.provider.trim()) newErrors.provider = "Provider is required";
        if (!course.description.trim()) newErrors.description = "Description is required";
        if (!imagefile) newErrors.image = "Course image is required";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse({
            ...course,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            if (errors.image) {
                setErrors({ ...errors, image: "" });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("title", course.title);
            formData.append("tag", course.tag);
            formData.append("duration", course.duration);
            formData.append("level", course.level);
            formData.append("description", course.description);
            formData.append("provider", course.provider);
            formData.append("image", imagefile);

            const res = await createCourse(formData);

            alert("Course Created Successfully");
            await fetchCourse?.();
            onClose?.();
        } catch (error) {
            setErrors({ submit: error.message || "Failed to create course" });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#0B2B57]">
                        Add New Course
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Course Title */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter course title"
                            value={course.title}
                            onChange={handleChange}
                            className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                            required
                        />
                        {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title}</span>}
                    </div>

                    {/* Duration & Provider */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                                Duration <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="duration"
                                placeholder="e.g., 32 hrs"
                                value={course.duration}
                                onChange={handleChange}
                                className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.duration ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.duration && <span className="text-red-500 text-sm mt-1">{errors.duration}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                                Provider <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="provider"
                                placeholder="e.g., Udemy"
                                value={course.provider}
                                onChange={handleChange}
                                className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.provider ? "border-red-500" : "border-gray-300"}`}
                                required
                            />
                            {errors.provider && <span className="text-red-500 text-sm mt-1">{errors.provider}</span>}
                        </div>
                    </div>

                    {/* Tag & Level */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                                Tag
                            </label>
                            <select
                                name="tag"
                                value={course.tag}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Recommended">Recommended</option>
                                <option value="New">New</option>
                                <option value="Mandatory">Mandatory</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                                Level
                            </label>
                            <select
                                name="level"
                                value={course.level}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter course description"
                            value={course.description}
                            onChange={handleChange}
                            className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
                            rows={4}
                            required
                        />
                        {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                            Course Image <span className="text-red-500">*</span>
                        </label>
                        <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${errors.image ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50"}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                required
                            />
                            {preview ? (
                                <div className="flex flex-col items-center">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg mb-3"
                                    />
                                    <p className="text-sm font-medium text-gray-700">Image selected</p>
                                    <p className="text-xs text-gray-500">Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">Click to upload course image</p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                            )}
                        </label>
                        {errors.image && <span className="text-red-500 text-sm mt-1">{errors.image}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl hover:bg-gray-200 transition font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#0B5DB5] text-white p-3 rounded-xl hover:bg-[#0945A0] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Course"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}