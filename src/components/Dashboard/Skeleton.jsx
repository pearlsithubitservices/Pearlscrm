import React from "react";
import { motion } from "framer-motion";

//DASHBOARD SKELETON

const S = ({ c }) => (
    <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className={`bg-gray-200 rounded-xl ${c}`}
    />
);

export const Dashboardskeleton = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-4 flex gap-4">



            {/* Main */}
            <div className="flex-1 space-y-4">

                {/* Topbar */}
                <div className="bg-white rounded-3xl p-4 flex justify-between items-center">
                    <div className="space-y-2">
                        <S c="h-6 w-40" />
                        <S c="h-4 w-56" />
                    </div>

                    <div className="flex gap-2">
                        <S c="h-10 w-10 rounded-full" />
                        <S c="h-10 w-10 rounded-full" />
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white h-40 rounded-xl p-4 space-y-5">
                            <S c="h-10 w-10" />
                            <S c="h-4 w-20" />
                            <S c="h-2 w-full" />
                        </div>
                    ))}
                </div>

                {/* Table + Chart */}
                <div className="grid xl:grid-cols-3 gap-4">

                    <div className="xl:col-span-2 bg-white rounded-3xl p-4 space-y-4">
                        <S c="h-5 w-32" />

                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <S c="h-10 w-10 rounded-full" />
                                <S c="h-4 flex-1" />
                                <S c="h-4 w-20" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl p-4 space-y-4">
                        <S c="h-5 w-28" />
                        <S c="h-56 w-full rounded-2xl" />
                    </div>
                </div>
                <div className="grid xl:grid-cols-3 gap-4">

                    <div className="xl:col-span-2 bg-white rounded-3xl p-4 space-y-4">
                        <S c="h-5 w-32" />

                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <S c="h-10 w-10 rounded-full" />
                                <S c="h-4 flex-1" />
                                <S c="h-4 w-20" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl p-4 space-y-4">
                        <S c="h-5 w-28" />
                        <S c="h-56 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}



//LEAD SKELETON

export const LeadSkeleton = ({ className = "" }) => (
    <div
        className={`relative overflow-hidden rounded bg-slate-200 
    before:absolute before:inset-0 before:-translate-x-full
    before:animate-[shimmer_2s_infinite]
    before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
    ${className}`}
    />
);

const LeadSkeletonPage = () => {
    return (
        <div className="flex min-h-screen bg-[#f5f3ef]">
            

            {/* MAIN */}
            <div className="flex-1">
                {/* TOPBAR */}
                <div className="bg-white border-b px-4 md:px-8 py-5 flex items-center justify-between">
                    <div className="space-y-3">
                        <Skeleton className="w-52 h-7" />
                        <Skeleton className="w-40 h-4" />
                    </div>

                    <div className="flex gap-3">
                        <Skeleton className="w-32 h-11 bg-blue-400 rounded-xl" />
                        <Skeleton className="w-11 h-11 bg-blue-400 rounded-xl" />
                        <Skeleton className="w-11 h-11 bg-blue-400 rounded-xl" />
                    </div>
                </div>

                <div className="p-4 md:p-8 space-y-6">
                    {/* CARDS */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
                    >
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border rounded-2xl p-5 space-y-4"
                            >
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <Skeleton className="w-24 h-3" />
                                <Skeleton className="w-20 h-6" />
                            </div>
                        ))}
                    </motion.div>

                    {/* TABLE */}
                    <motion.div
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border rounded-2xl overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="flex flex-col lg:flex-row justify-between gap-4 p-5 border-b">
                            <Skeleton className="w-32 h-7" />

                            <div className="flex gap-3">
                                {[60, 50, 60, 60].map((w, i) => (
                                    <Skeleton
                                        key={i}
                                        className={`h-9 rounded-full ${i === 0 ? "bg-blue-400" : ""
                                            }`}
                                        style={{ width: w }}
                                    />
                                ))}
                            </div>

                            <Skeleton className="w-full lg:w-[280px] h-11 rounded-xl" />
                        </div>

                        {/* TABLE HEADER */}
                        <div className="grid grid-cols-6 gap-4 p-4 bg-slate-50 min-w-[900px] border-b">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="w-20 h-4" />
                            ))}
                        </div>

                        {/* ROWS */}
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-6 gap-4 p-4 min-w-[900px] border-b items-center"
                            >
                                <div className="space-y-2">
                                    <Skeleton className="w-32 h-4" />
                                    <Skeleton className="w-24 h-3" />
                                </div>

                                <Skeleton className="w-20 h-7 bg-green-100 rounded-lg" />
                                <Skeleton className="w-16 h-7 bg-yellow-100 rounded-lg" />
                                <Skeleton className="w-24 h-4" />
                                <Skeleton className="w-16 h-7 rounded-lg" />
                                <Skeleton className="w-14 h-4" />
                            </div>
                        ))}

                        {/* PAGINATION */}
                        <div className="flex justify-center gap-4 py-6">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className={`rounded-full ${i === 3 ? "bg-blue-300" : ""
                                        } ${i === 1 || i === 2 ? "w-4 h-4" : "w-5 h-5"}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>
                {`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
            </style>
        </div>
    );
};

