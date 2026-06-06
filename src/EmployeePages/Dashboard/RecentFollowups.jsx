import React, { useMemo, useState } from "react";
import {
    Search,
    Filter,
    Bell,
    Plus,
    Users2,
    Clock2,
    CheckCheck,
    PhoneMissed,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Pagination from "../../components/Pagination";
import AnimateModals from "../../components/Dashboard/AnimateModals";
import LoadingPage from "../../components/Dashboard/Loading";


export default function FollowUps() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [active, setActive] = useState(0);
    const [loading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const buttons = ["All", "Missed", "Pending", "Completed", "Scheduled"];

    const tableData = [
        {
            _id: 1,
            lead: "Sarah Chen",
            company: "Nexigen Corp",
            type: "Call",
            assigned: "Rohan M",
            time: "Today",
            status: "Completed",
        },
        {
            _id: 2,
            lead: "Vishnu",
            company: "TechFlow Solutions",
            type: "Meeting",
            assigned: "Priya V",
            time: "Tomorrow",
            status: "Pending",
        },
        {
            _id: 3,
            lead: "Dhoni",
            company: "GreenPath Inc.",
            type: "Demo",
            assigned: "Leo",
            time: "Feb 14, 2025",
            status: "Scheduled",
        },
        {
            _id: 4,
            lead: "Ragavi",
            company: "Baltic Ventures",
            type: "Email",
            assigned: "Nina",
            time: "Feb 14, 2025",
            status: "Scheduled",
        },
        {
            _id: 5,
            lead: "Rock",
            company: "Luminary Studio",
            type: "Call",
            assigned: "Priya",
            time: "Mar 29, 2025",
            status: "Completed",
        },
        {
            _id: 6,
            lead: "Virat",
            company: "Gulf Dynamics",
            type: "Call",
            assigned: "Leo",
            time: "Apr 5, 2025",
            status: "Missed",
        },
    ];



    /* FILTER */



    /* PAGINATION */

    const filesPerPage = 5;

    const lastIndex = currentPage * filesPerPage;
    const firstIndex = lastIndex - filesPerPage;

    const currentFiles = tableData.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(tableData.length / filesPerPage);

    return (
        <div className="flex max-h-screen bg-[#f3f0eb] overflow-x-hidden">

            <div className="flex-1 flex flex-col">
                <div className="">

                    {/* TABLE */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-white rounded-xl overflow-x-auto border"
                    >

                        <table className="min-w-[900px] w-full text-sm">

                            <thead className="bg-gray-50 text-gray-600">

                                <tr>

                                    {[
                                        "LEAD",
                                        "TYPE",
                                        "ASSIGNED",
                                        "TIME",
                                        "STATUS",
                                        "ACTION",
                                    ].map((head, i) => (

                                        <th key={i} className="p-4 text-left">
                                            {head}
                                        </th>

                                    ))}

                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td colSpan="6" className="py-10">
                                            <LoadingPage />
                                        </td>
                                    </tr>

                                ) : (

                                    currentFiles.map((item) => (

                                        <tr
                                            key={item._id}
                                            onClick={() => navigate(`/followupDetails/${item._id}`)}
                                            className="border-t hover:bg-gray-50 cursor-pointer transition"

                                        >

                                            <td className="p-4">

                                                <p className="font-medium">
                                                    {item.lead}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {item.company}
                                                </p>

                                            </td>

                                            <td>
                                                <span className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs">
                                                    {item.type}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs">
                                                    {item.assigned}
                                                </span>
                                            </td>

                                            <td>{item.time}</td>

                                            <td>
                                                <span className="bg-gray-100 px-3 py-1 rounded text-xs">
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td>Today</td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </motion.div>

                    {/* PAGINATION */}

                    <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                    />

                </div>

            </div>

            {/* MODAL */}



        </div>
    );
}