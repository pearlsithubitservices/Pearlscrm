import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    SquarePen,
} from "lucide-react";
import useCourse from "../../../Hooks/useCourse";
import CourseForm from "../../../EmployeePages/Performance/Training&Learning/CourseForm";



export default function CourseLibrary() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const { getCourses } = useCourse();
    const [coursesData, setCoursesData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    useEffect(() => {
        fetchCourse();
    }, [])

    const getTagColor = (title) => {
        switch (title) {
            case "Recommended":
                return " bg-yellow-200 text-yellow-700";

            case "Mandatory":
                return "bg-red-200 text-red-700";

            case "New":
                return "bg-blue-200 text-blue-700";





            default:
                return "from-gray-500 to-gray-600";
        }
    };
    const filteredCourses = useMemo(() => {
        return coursesData.filter((course) => {
            const matchesSearch =
                course?.title?.toLowerCase()?.includes(search.toLowerCase()) ||
                course?.provider?.toLowerCase()?.includes(search.toLowerCase());

            const matchesCategory =
                category === "All Categories" ||
                course?.level === category;

            return matchesSearch && matchesCategory;
        });
    }, [search, category, coursesData]);
    console.log(filteredCourses);

    const fetchCourse = async () => {
        try {
            const response = await getCourses();

            const sortedCourses = [...response.data].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setCoursesData(sortedCourses);
            console.log(sortedCourses);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };


    return (
        <div className="min-h-screen bg-[#F7F4EC] p-5 lg:p-7">

            {/* Header */}

            <motion.div
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
             >

                {/* Title */}

                <h1 className="text-2xl font-bold text-black">
                    Course library
                </h1>

                {/* Right */}

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
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                w-72
                h-12
                rounded-xl
                bg-[#F5F5F5]
                border
                border-transparent
                pl-12
                pr-4
                outline-none
                focus:border-blue-500
              "
                        />

                    </div>

                    {/* Category */}

                    <div className="relative">

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="
                appearance-none
                h-12
                w-52
                rounded-xl
                border
                border-gray-300
                bg-white
                px-5
                pr-10
                outline-none
               
              "
                        >
                            <option>All Categories</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                    {/* Add Button */}

                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="
              h-12
              px-6
              rounded-xl
              bg-[#E9EEF9]
              text-[#334155]
              font-semibold
              flex
              items-center
               gap-2
             "
                        onClick={() => setOpenForm(true)}
                    >
                        <SquarePen size={18} />
                        Add Course
                    </motion.button>

                </div>

            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {filteredCourses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                        }}
                        whileHover={{
                            y: -5,
                            scale: 1.01,
                        }}
                        className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              shadow-md
              overflow-hidden
              cursor-pointer
            "
                    >
                        {/* Course Image */}

                        <div className="p-5 pb-0">
                            <img
                                // src={`https://pearlscrm.onrender.com/${course?.image}`}
                                src={`http://localhost:5000${course?.image}`}
                                alt={course?.title}
                                className="
                  w-full
                  h-56
                  object-cover
                  rounded-xl
                "
                            />
                        </div>

                        {/* Card Content */}

                        <div className="px-5 pt-5 pb-5">

                            {/* Course Title */}

                            <h2
                                className="
                  text-[22px]
                  md:text-[24px]
                  font-bold
                  text-[#143B63]
                  leading-tight
                "
                            >
                                {course?.title}
                            </h2>

                            {/* Provider */}

                            <p
                                className="
                  mt-2
                  text-[17px]
                  text-gray-500
                "
                            >
                                {course?.provider}
                                <span className="mx-2">·</span>
                                {course?.duration}
                                <span className="mx-2">·</span>
                                {course?.level}
                            </p>

                            {/* Bottom */}

                            <div className="mt-6 flex items-center justify-between">

                                {/* Badge */}

                                <span
                                    className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-medium
                    ${getTagColor(course?.tag)}
                    
                  `}
                                >
                                    {course?.tag}
                                </span>

                                {/* Enroll Button */}

                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    className="
                    px-6
                    py-2
                    rounded-lg
                    bg-[#1F8A63]
                    text-white
                    font-medium
                    shadow-sm
                  "
                                >
                                    Enroll
                                </motion.button>

                            </div>

                        </div>
                    </motion.div>
                ))}

            </div>



            {/* Empty State */}

            {filteredCourses.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="
            mt-20
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
                >
                    <h2 className="text-3xl font-bold text-gray-700">
                        No Courses Found
                    </h2>

                    <p className="mt-3 text-gray-500 text-lg">
                        Try searching with another keyword.
                    </p>
                </motion.div>
            )}

            {openForm && (
                <div className="fixed inset-0 z-40  backdrop-blur-sm p-2  overflow-y-auto no-scrollbar">
                    <CourseForm
                        fetchCourse={fetchCourse}
                        onClose={() => setOpenForm(false)} />
                </div>
            )

            }

        </div>
    );
}