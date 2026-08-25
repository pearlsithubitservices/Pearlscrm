import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ChevronDown,
    UploadCloud,
    X,
} from "lucide-react";
import useCourse from "../../../Hooks/useCourse";

export default function CourseForm({ onClose, fetchCourse }) {
    const { createCourse } = useCourse();

    const [imagefile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [course, setCourse] = useState({
        title: "",
        tag: "Recommended",
        duration: "",
        level: "Beginner",
        image: "",
        description: "",
        provider: "",
    });

    const handleChange = (e) => {
        setCourse({
            ...course,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("title", course.title);
            formData.append("tag", course.tag);
            formData.append("duration", course.duration);
            formData.append("level", course.level);
            formData.append("description", course.description);
            formData.append("provider", course.provider);
            formData.append("image", imagefile);

            await createCourse(formData);

            alert("Course Created Successfully");

            await fetchCourse();

            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative max-w-5xl mx-auto"
        >
            <X className="absolute top-4 right-4 text-white hover:scale-125 transition-transform duration-200 bg-red-600" size={20} onClick={onClose} />
            <form
                onSubmit={handleSubmit}
                className="bg-[#F4F0E7] rounded-[28px] shadow-xl p-10"
            >
                {/* Header */}

                <div className="flex items-center gap-4 mb-8">
                    <span className="uppercase tracking-[4px] text-xs text-gray-500 whitespace-nowrap">
                        Add Course To Library
                    </span>

                    <div className="flex-1 h-px bg-gray-400" />
                </div>

                {/* Course Title */}

                <div className="mb-7">
                    <label className="block text-[#163B67] font-bold text-2xl mb-3">
                        Course title
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={course.title}
                        onChange={handleChange}
                        placeholder="e.g. System design Masterclass"
                        className="
              w-full
              h-16
              rounded-2xl
              border
              border-gray-300
              bg-white
              px-6
              text-lg
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
                    />
                </div>

                {/* Two Column Grid */}

                {/* Provider & Badge */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* Provider */}

                    <div>

                        <label className="block text-[#143B63] font-bold text-xl mb-3">
                            Provider
                        </label>

                        <input
                            type="text"
                            name="provider"
                            value={course.provider}
                            onChange={handleChange}
                            placeholder="e.g. Amazon web services"
                            className="
                                w-full
                                h-14
                                rounded-2xl
                                border
                                border-gray-300
                                bg-white
                                px-5
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                            required
                        />

                    </div>

                    {/* Status Badge */}

                    <div>

                        <label className="block text-[#143B63] font-bold text-xl mb-3">
                            Status Badges
                        </label>

                        <div className="relative">

                            <select
                                name="tag"
                                value={course.tag}
                                onChange={handleChange}
                                className="
                                    appearance-none
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border
                                    border-gray-300
                                    bg-white
                                    px-5
                                    pr-10
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            >
                                <option value="Recommended">
                                    Recommended
                                </option>

                                <option value="New">
                                    New
                                </option>

                                <option value="Mandatory">
                                    Mandatory
                                </option>
                            </select>

                            <ChevronDown
                                size={20}
                                className="
                                    absolute
                                    right-5
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                    pointer-events-none
                                "
                            />

                        </div>

                    </div>

                </div>

                {/* Duration & Level */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* Duration */}

                    <div>

                        <label className="block text-[#143B63] font-bold text-xl mb-3">
                            Duration (hrs)
                        </label>

                        <input
                            type="text"
                            name="duration"
                            value={course.duration}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            className="
                                w-full
                                h-14
                                rounded-2xl
                                border
                                border-gray-300
                                bg-white
                                px-5
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                            required
                        />

                    </div>

                    {/* Level */}

                    <div>

                        <label className="block text-[#143B63] font-bold text-xl mb-3">
                            Level
                        </label>

                        <div className="relative">

                            <select
                                name="level"
                                value={course.level}
                                onChange={handleChange}
                                className="
                                    appearance-none
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border
                                    border-gray-300
                                    bg-white
                                    px-5
                                    pr-10
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            >
                                <option value="Beginner">
                                    Beginner
                                </option>

                                <option value="Intermediate">
                                    Intermediate
                                </option>

                                <option value="Advanced">
                                    Advanced
                                </option>

                            </select>

                            <ChevronDown
                                size={20}
                                className="
                                    absolute
                                    right-5
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                    pointer-events-none
                                "
                            />

                        </div>

                    </div>


                </div>
                {/* Upload Cover Image */}

                <div className="mb-8">

                    <label className="block text-[#163B67] font-bold text-xl mb-3">
                        Upload Cover image (Course)
                    </label>

                    <label
                        htmlFor="course-image"
                        className="
                            relative
                            flex
                            flex-col
                            items-center
                            justify-center
                            h-56
                            rounded-2xl
                            border-2
                            border-dashed
                            border-gray-300
                            bg-white
                            cursor-pointer
                            overflow-hidden
                            hover:border-blue-400
                            transition
                        "
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <UploadCloud
                                    size={58}
                                    className="text-gray-400 mb-4"
                                />

                                <p className="text-xl text-gray-700">
                                    Drag & Drop or{" "}
                                    <span className="text-green-700 underline font-semibold">
                                        Choose File
                                    </span>
                                </p>

                                <p className="text-sm text-gray-400 mt-2">
                                    Supported: JPG, PNG, PDF (Max 5MB)
                                </p>
                            </>
                        )}

                        <input
                            id="course-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                    </label>

                </div>

                {/* Description */}

                <div className="mb-10">

                    <label className="block text-[#163B67] font-bold text-xl mb-3">
                        Course Description
                    </label>

                    <textarea
                        name="description"
                        value={course.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Write short course description..."
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-300
                            bg-white
                            p-5
                            resize-none
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                        "
                    />

                </div>

                {/* Buttons */}

                <div className="flex flex-col-reverse md:flex-row gap-5">

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={onClose}
                        className="
                            md:w-44
                            h-14
                            rounded-2xl
                            border
                            border-gray-400
                            bg-white
                            text-gray-600
                            font-semibold
                            text-lg
                        "
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 12px 24px rgba(37,99,235,.25)",
                        }}
                        whileTap={{ scale: .98 }}
                        type="submit"
                        className="
                            flex-1
                            h-14
                            rounded-2xl
                            bg-[#2B66A8]
                            text-white
                            text-xl
                            font-semibold
                        "
                    >
                        Add Course
                    </motion.button>

                </div>   {/* End Buttons */}

            </form>

        </motion.div>
    );
}