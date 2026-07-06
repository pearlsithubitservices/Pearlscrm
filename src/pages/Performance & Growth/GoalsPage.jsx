import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    Circle,
} from "lucide-react";
import useGoals from "../../Hooks/useGoals";

export default function GoalsPage() {

    const goals = [
        {
            id: 1,
            title: "React 18 migration",
            alignment: "Team OKR",
            status: "On Track",
            progress: 75,
            due: "Jun 30, 2026",
        },
        {
            id: 2,
            title: "AWS Solutions Architect certification",
            alignment: "Personal Growth",
            status: "On Track",
            progress: 50,
            due: "Jun 20, 2026",
        },
        {
            id: 3,
            title: "Deliver mobile app v2.0",
            alignment: "Company OKR",
            status: "Completed",
            progress: 100,
            due: "Sep 30, 2026",
        },
        {
            id: 4,
            title: "Mentor 2 junior developers",
            alignment: "Team OKR",
            status: "Completed",
            progress: 100,
            due: "Sep 30, 2026",
        },
        {
            id: 5,
            title: "Complete React 18 migration",
            alignment: "Team OKR",
            status: "Completed",
            progress: 100,
            due: "Sep 30, 2026",
        },
    ];

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Statuses");
    const [alignment, setAlignment] = useState("All Alignment");


    const [Goals, setGoals] = useState([]);

    const { getGoals } = useGoals();

    useEffect(() => {


        fetchGoals();
    }, []);
    const fetchGoals = async () => {
        try {
            const data = await getGoals();
            setGoals(data || []);
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
    };

    console.log(Goals);

    const filteredGoals = useMemo(() => {
        return Goals.filter((goal) => {

            const matchesSearch =
                goal?.title?.toLowerCase()?.includes(search?.toLowerCase());

            const matchesStatus =
                status === "All Statuses" ||
                goal?.status === status;

            const matchesAlignment =
                alignment === "All Alignment" ||
                goal?.alignedTo === alignment;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesAlignment
            );
        });
    }, [search, status, alignment]);

    return (
        <div className="bg-[#f5f2eb] p-2">

            {/* Header */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-wrap gap-4 items-center justify-between">

                {/* Title */}

                <h1 className="text-4xl font-bold">
                    All Goals List
                </h1>

                {/* Right Controls */}

                <div className="flex flex-wrap gap-4">

                    {/* Search */}

                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                        />

                        <input
                            type="text"
                            placeholder="Search Goals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                pl-12
                pr-4
                h-12
                w-72
                rounded-xl
                bg-gray-100
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Status */}

                    <div className="relative">

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="
                appearance-none
                h-12
                w-40
                rounded-xl
                border
                px-4
                pr-10
                bg-white
              "
                        >
                            <option>All Statuses</option>
                            <option>On Track</option>
                            <option>Completed</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />

                    </div>

                    {/* Alignment */}

                    <div className="relative">

                        <select
                            value={alignment}
                            onChange={(e) =>
                                setAlignment(e.target.value)
                            }
                            className="
                appearance-none
                h-12
                w-44
                rounded-xl
                border
                px-4
                pr-10
                bg-white
              "
                        >
                            <option>All Alignment</option>
                            <option>Team OKR</option>
                            <option>Company OKR</option>
                            <option>Personal Growth</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />

                    </div>

                </div>

            </div>

            {/* Cards */}

            <div className="mt-8 space-y-6">

                {filteredGoals.map((goal, index) => (
                    <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                        }}
                        whileHover={{
                            y: -3,
                            scale: 1.01,
                        }}
                        className="
      bg-white
      rounded-2xl
      border
      border-gray-200
      shadow-md
      px-6
      py-6
    "
                    >
                        {/* Top Row */}

                        <div className="flex justify-between items-start">

                            {/* Left */}

                            <div>

                                <h2 className="text-[22px] font-bold text-[#173D6A]">
                                    {goal?.title || ""}
                                </h2>

                                <p className="mt-2 text-[17px]">

                                    <span className="text-black">
                                        Aligned to :
                                    </span>

                                    <span className="text-[#3A78E0] font-medium">
                                        {" "}
                                        {goal.alignedTo}
                                    </span>

                                </p>

                            </div>

                            {/* Right */}

                            <div className="flex flex-col items-end gap-5">

                                <div
                                    className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            text-[17px]
            font-medium

            ${goal.status === "Completed"
                                            ? "bg-[#E8EEF7] text-[#163C67]"
                                            : "bg-[#CFFFD6] text-[#147B3C]"
                                        }
          `}
                                >
                                    <Circle
                                        size={10}
                                        fill="currentColor"
                                        strokeWidth={0}
                                    />

                                    {goal.status}
                                </div>

                                <p className="text-gray-500 text-lg">
                                    Due {goal.due}
                                </p>

                            </div>

                        </div>

                        {/* Progress */}

                        <div className="mt-8 flex items-center gap-6">

                            <p className="text-[#D79C34] text-[20px] whitespace-nowrap">
                                Overall progress
                            </p>

                            <div className="flex-1">

                                <div className="h-3 rounded-full bg-gray-300 overflow-hidden">

                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${goal.progress}%`,
                                        }}
                                        transition={{
                                            duration: 1,
                                            delay: 0.3 + index * 0.15,
                                        }}
                                        className="h-full rounded-full bg-[#4B84EA]"
                                    />

                                </div>

                            </div>

                            <span className="text-[#4B84EA] text-[22px] font-semibold">
                                {goal.progress}%
                            </span>

                        </div>

                    </motion.div>
                ))}

            </div>

        </div>
    );
}