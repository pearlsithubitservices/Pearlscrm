import React from "react";

const SalaryBreakupSkeleton = () => {
    return (
        <div className="min-h-screen flex animate-pulse">
            <main className="flex-1">
                <div className="p-4 bg-[#f3f0eb]">

                    {/* Salary Breakup */}
                    <div className="rounded-2xl overflow-hidden">

                        {/* Header */}
                        <div className="bg-white rounded-lg px-6 py-4 flex justify-between items-center mb-4 shadow-sm">
                            <div className="h-8 w-48 bg-gray-200 rounded" />
                            <div className="h-6 w-24 bg-gray-200 rounded" />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto bg-white rounded-lg">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th className="p-5">
                                            <div className="h-6 w-32 bg-gray-200 rounded" />
                                        </th>

                                        <th className="p-5">
                                            <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
                                        </th>

                                        <th className="p-5">
                                            <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {[...Array(4)].map((_, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-5">
                                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                            </td>

                                            <td className="p-5">
                                                <div className="h-5 w-28 bg-gray-200 rounded ml-auto" />
                                            </td>

                                            <td className="p-5">
                                                <div className="h-5 w-32 bg-gray-200 rounded ml-auto" />
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border-t">
                                        <td className="p-5">
                                            <div className="h-7 w-32 bg-gray-300 rounded" />
                                        </td>

                                        <td className="p-5">
                                            <div className="h-7 w-32 bg-gray-300 rounded ml-auto" />
                                        </td>

                                        <td className="p-5">
                                            <div className="h-7 w-36 bg-gray-300 rounded ml-auto" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Deductions Breakup */}
                    <div className="rounded-2xl border shadow-sm mt-8 overflow-hidden">

                        {/* Header */}
                        <div className="bg-white mb-8 px-6 py-4 flex justify-between items-center">
                            <div className="h-8 w-56 bg-gray-200 rounded" />
                            <div className="h-6 w-24 bg-gray-200 rounded" />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg bg-white">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th className="p-5">
                                            <div className="h-6 w-32 bg-gray-200 rounded" />
                                        </th>

                                        <th className="p-5">
                                            <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
                                        </th>

                                        <th className="p-5">
                                            <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {[...Array(4)].map((_, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-5">
                                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                            </td>

                                            <td className="p-5">
                                                <div className="h-5 w-28 bg-gray-200 rounded ml-auto" />
                                            </td>

                                            <td className="p-5">
                                                <div className="h-5 w-32 bg-gray-200 rounded ml-auto" />
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border-t">
                                        <td className="p-5">
                                            <div className="h-7 w-32 bg-gray-300 rounded" />
                                        </td>

                                        <td className="p-5">
                                            <div className="h-7 w-32 bg-gray-300 rounded ml-auto" />
                                        </td>

                                        <td className="p-5">
                                            <div className="h-7 w-36 bg-gray-300 rounded ml-auto" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default SalaryBreakupSkeleton;