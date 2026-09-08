import { Bell, CheckCircle, Plus, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import React from 'react';
import { useEffect, useState } from "react";
import CourseForm from "./CourseForm";
import useCourse from "../../../Hooks/useCourse";

export default function Dashboard() {
    const [showform, setShowForm] = useState(false);
    const [course, setCourse] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getCourses, deleteAllCourses } = useCourse();

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const data = await getCourses();
            setCourse(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setCourse([]);
        } finally {
            setLoading(false);
        }
    };

    const trainingHistory = [
        {
            title: "Python for Data Science",
            status: "completed",
            date: "May 15 2025",
            hours: "24hrs"
        },
        {
            title: "Web Security Fundamentals",
            status: "completed",
            date: "Jun 15 2025",
            hours: "32hrs"
        },
        {
            title: "Data Visualizations",
            status: "completed",
            date: "April 15 2025",
            hours: "12hrs"
        },
        {
            title: "Agile & Scrum Essentials",
            status: "completed",
            date: "Jan 20 2026",
            hours: "24hrs"
        },
    ];

    return (
        <div className="flex-1 p-6 overflow-auto bg-[#F5F2EC] min-h-screen">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0B2B57] mb-2">
                            Training & Learning
                        </h2>
                        <p className="text-gray-500">Recommended courses for your professional development</p>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-[#0B5DB5] text-white px-6 py-3 rounded-xl hover:bg-[#0945A0] transition shadow-sm whitespace-nowrap"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>
            </motion.div>

            {/* Recommended Courses */}
            <div className="mb-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h3 className="text-2xl font-bold text-[#0B2B57] mb-2">
                        Recommended for you
                    </h3>
                    <p className="text-gray-500">Enhance your skills with these curated courses</p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5DB5]"></div>
                        <p className="ml-4 text-gray-500">Loading courses...</p>
                    </div>
                ) : course?.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
                    >
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No courses available yet</p>
                        <p className="text-gray-400 mt-2">Add a course to get started with your training</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {course.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CourseCard
                                    id={item._id}
                                    src={`http://localhost:5000${item.image}`}
                                    title={item.title}
                                    tag={item.tag}
                                    time={item.duration}
                                    level={item.level}
                                    provider={item.provider}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Training History */}
            <div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h3 className="text-2xl font-bold text-[#0B2B57] mb-2">
                        Training History
                    </h3>
                    <p className="text-gray-500">Your completed training courses</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainingHistory.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl flex-shrink-0">
                                    <CheckCircle size={24} className="text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-[#0B2B57] truncate">
                                        {item.title}
                                    </p>
                                    <div className="flex flex-wrap gap-3 items-center mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            {item.status}
                                        </span>
                                        <span>•</span>
                                        <span>{item.date}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {item.hours}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add Course Modal */}
            {showform && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm p-4 overflow-y-auto no-scrollbar flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <CourseForm
                            fetchCourse={fetchCourse}
                            onClose={() => setShowForm(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}