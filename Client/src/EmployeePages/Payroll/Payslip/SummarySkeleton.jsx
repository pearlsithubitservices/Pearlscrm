import React from "react";

const SummarySkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">

            {/* Summary Card */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">

                    <div className="space-y-3">
                        <div className="h-8 w-64 bg-gray-200 rounded" />

                        <div className="h-4 w-52 bg-gray-200 rounded" />
                    </div>

                    <div className="md:text-right space-y-3">
                        <div className="h-5 w-28 bg-gray-200 rounded md:ml-auto" />

                        <div className="h-10 w-40 bg-gray-200 rounded md:ml-auto" />
                    </div>

                </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Earnings */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm">

                    <div className="flex justify-between mb-6">
                        <div className="h-8 w-32 bg-gray-200 rounded" />

                        <div className="h-8 w-24 bg-gray-200 rounded" />
                    </div>

                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index}>
                            <div className="flex justify-between py-4">

                                <div className="h-6 w-40 bg-gray-200 rounded" />

                                <div className="h-6 w-24 bg-gray-200 rounded" />

                            </div>

                            {index !== 3 && (
                                <div className="border-b border-gray-100" />
                            )}
                        </div>
                    ))}

                    <div className="border-b my-2" />

                    <div className="flex justify-between pt-4">

                        <div className="h-8 w-44 bg-gray-200 rounded" />

                        <div className="h-10 w-36 bg-gray-200 rounded" />

                    </div>

                </div>

                {/* Deductions */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm">

                    <div className="flex justify-between mb-6">
                        <div className="h-8 w-36 bg-gray-200 rounded" />

                        <div className="h-8 w-24 bg-gray-200 rounded" />
                    </div>

                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index}>
                            <div className="flex justify-between py-4">

                                <div className="h-6 w-40 bg-gray-200 rounded" />

                                <div className="h-6 w-24 bg-gray-200 rounded" />

                            </div>

                            {index !== 3 && (
                                <div className="border-b border-gray-100" />
                            )}
                        </div>
                    ))}

                    <div className="border-b my-2" />

                    <div className="flex justify-between pt-4">

                        <div className="h-8 w-48 bg-gray-200 rounded" />

                        <div className="h-10 w-36 bg-gray-200 rounded" />

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SummarySkeleton;