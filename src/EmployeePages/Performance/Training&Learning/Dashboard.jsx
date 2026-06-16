
import { Bell, CheckCircle, SquareCheck } from "lucide-react";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import aws from '../../../assets/aws.jpeg';
import Leadership from '../../../assets/Leadership.jpeg';
import React from '../../../assets/React.jpeg';
import SystemDesign from '../../../assets/SystemDesign.jpeg';


export default function Dashboard() {
    return (
        <div className="flex-1 p-6 overflow-auto">
            {/* Courses */}
            <div className="flex justify-between items-center bg-white rounded-xl  p-4 mb-8" >
                <h2 className="font-semibold ">Recommended for you</h2>
                <button className="font-semibold cursor-pointer hover:underline hover:scale-105 transition-none duration-200 ">Browse All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <CourseCard
                    src={aws}
                    title="AWS Solutions Architect"
                    tag="Recommended"
                    time="32 hrs"
                    level="Intermediate"
                />
                <CourseCard
                    src={SystemDesign}
                    title="System Design Masterclass"
                    tag="New"
                    time="18 hrs"
                    level="Advanced"
                />
                <CourseCard
                    src={React}
                    title="React Performance Optimization"
                    tag="New"
                    time="12 hrs"
                    level="Intermediate"
                />
                <CourseCard
                    src={Leadership}
                    title="Leadership Essentials"
                    tag="Mandatory"
                    time="10 hrs"
                    level="Beginner"
                />
            </div>

            {/* History */}
            <h2 className="font-semibold mt-6 mb-3">Training history</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                    {
                        title: "Python for Data Science",
                        status: "completed",
                        date: "May 15 2025",
                        hours: "24hrs"
                    },
                    {
                        title: "Web Security Fundamentals",
                        status: "completed",
                        date: "jun 15 2025",
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
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-3 rounded-xl shadow-sm"
                    >
                        <div className="flex gap-8 items-center">
                            <div className=" flex items-center justify-center w-10 h-10 bg-green-400 rounded-xl"><CheckCircle size={18}   className=" text-black/40 "/></div>
                            <div className="flex flex-col gap-1 items-start">
                               <p className="font-bold text-lg"> {item.title}</p>
                               <div className="flex gap-2 items-center"> <p>{item.status}.</p>
                               <p>{item.date}. </p><p>{item.hours}</p>
                               </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}