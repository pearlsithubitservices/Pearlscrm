import React, { useEffect, useMemo, useState } from "react";
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
import useFollowups from "../../Hooks/useFollowups";
import { useAuth } from "../../context/AuthContext";
import useEmployees from "../../Hooks/useEmployees";


export default function FollowUps() {

    const navigate = useNavigate();
    const { user } = useAuth();
    const { employees } = useEmployees();

    const [search, setSearch] = useState("");
    const [active, setActive] = useState(0);
    const [loading] = useState(false);
    const [followups, setFollowups] = useState([]);
    const { getFollowups } = useFollowups();
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const data = await getFollowups();
                const res = data.filter((item) =>
                    item.assignedTo == user?.uid)
                setFollowups(res);
                console.log(res);
            }
            catch (err) {
                console.log(err);
            }
        }
        fetchdata();
    }, []);
    const employeeMap = useMemo(() => {
        return employees.reduce((acc, emp) => {
            acc[emp.uid] = emp.name; // or emp.employeeName
            return acc;
        }, {});
    }, [employees]);

    const recentFollowups = [...followups]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    console.log(recentFollowups);
    const [currentPage, setCurrentPage] = useState(1);

    const buttons = ["All", "Missed", "Pending", "Completed", "Scheduled"];

    /* PAGINATION */

    const filesPerPage = 5;

    const lastIndex = currentPage * filesPerPage;
    const firstIndex = lastIndex - filesPerPage;

    const currentFiles = recentFollowups.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(recentFollowups.length / filesPerPage);

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
                                    currentFiles.map((item) => {
                                        const assignedEmployee = employees.find(
                                            (emp) => emp.uid === item.assignedTo
                                        );

                                        return (
                                            <tr
                                                key={item._id}
                                                onClick={() => navigate(`/employee/empfollowupDetails/${item._id}`)}
                                                className="border-t hover:bg-gray-50 cursor-pointer transition"
                                            >
                                                <td className="p-4">
                                                    <p className="font-medium">{item.clientName}</p>

                                                    <p className="text-xs text-gray-400">
                                                        {item.companyName}
                                                    </p>
                                                </td>

                                                <td>
                                                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs">
                                                        {item.type}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs">
                                                         {employeeMap[item.assignedTo] || ""}
                                                    </span>
                                                </td>

                                                <td>{item.followupTime}</td>

                                                <td>
                                                    <span className="bg-gray-100 px-3 py-1 rounded text-xs">
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td>{item.nextFollowupDate || item.date || "Not scheduled"}</td>
                                            </tr>
                                        );
                                    })
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