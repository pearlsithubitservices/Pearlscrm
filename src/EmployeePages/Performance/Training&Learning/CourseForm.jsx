import React, { useState } from "react";
import useCourse from "../../../Hooks/useCourse";

export default function CourseForm({ onClose, fetchCourse }) {
    const { createCourse } = useCourse();
    const [imagefile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("")

    const [course, setCourse] = useState({
        title: "",
        tag: "Recommended",
        duration: "",
        level: "Beginner",
        image: "",
        description: "",
        provider:""
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
            formData.append("provider",course.provider);
            formData.append("image", imagefile);

            const res = await createCourse(formData);

            alert("Course Created Successfully");
            await fetchCourse();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow ">
            <h2 className="text-2xl font-bold mb-4">Add Course</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="title"
                    placeholder="Course Title"
                    value={course.title}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                />

                <input
                    type="text"
                    name="duration"
                    placeholder="Duration (32 hrs)"
                    value={course.duration}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                />
                <input
                    type="text"
                    name="provider"
                    placeholder="course provider"
                    value={course.provider}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border p-3 rounded-lg"
                />

                <select
                    name="tag"
                    value={course.tag}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                >
                    <option value="Recommended">Recommended</option>
                    <option value="New">New</option>
                    <option value="Mandatory">Mandatory</option>
                </select>

                <select
                    name="level"
                    value={course.level}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                <textarea
                    name="description"
                    placeholder="Course Description"
                    value={course.description}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    rows={4}
                />
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg"
                    />
                )}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                    >
                        cancel
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                    >
                        Create Course
                    </button>
                </div>
            </form>

        </div>
    );
}