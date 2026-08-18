import React, { useEffect, useState } from 'react';
import Loading from '../Dashboard/Loading';
import { apiUrl } from "../../config/api.js";
import { staticLeads } from '../../Utils/staticData.js';

const Hotleads = () => {
    const [leads, setLeads] = useState(staticLeads);
    const totalLeads = leads.length;

    const statusCounts = {
        new: 0,
        contacted: 0,
        interested: 0,
        converted: 0,
    };

    leads.forEach((lead) => {
        const status = lead.status?.trim().toLowerCase();

        switch (status) {
            case "new":
                statusCounts.new++;
                break;
            case "contacted":
                statusCounts.contacted++;
                break;
            case "interested":
                statusCounts.interested++;
                break;
            case "converted":
                statusCounts.converted++;
                break;
            default:
                break;
        }
    });

    const statusPercentage = {
        new: totalLeads ? ((statusCounts.new / totalLeads) * 100).toFixed(1) : 0,
        contacted: totalLeads ? ((statusCounts.contacted / totalLeads) * 100).toFixed(1) : 0,
        interested: totalLeads ? ((statusCounts.interested / totalLeads) * 100).toFixed(1) : 0,
        converted: totalLeads ? ((statusCounts.converted / totalLeads) * 100).toFixed(1) : 0,
    };

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchLeads();
    }, []);

    const data = [
        {
            value: Number(statusPercentage.new),
            color: "#eab308",
            status: "New",
        },
        {
            value: Number(statusPercentage.contacted),
            color: "#3b82f6",
            status: "Contacted",
        },
        {
            value: Number(statusPercentage.interested),
            color: "#a855f7",
            status: "Interested",
        },
        {
            value: Number(statusPercentage.converted),
            color: "#22c55e",
            status: "Converted",
        },
    ];

    const radius = 35;
    const stroke = 6;
    const r = radius - stroke / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const fetchLeads = async () => {
        try {
            const response = await fetch(apiUrl("/leads"));
            const fetchedData = await response.json();
            if (fetchedData && fetchedData.length > 0) {
                setLeads(fetchedData);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter((lead) => (lead.priority?.toLowerCase() === "hot"));

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#f3f0eb]">
                {/* TABLE */}
                <div className="lg:col-span-2 p-2">
                    <div className="rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border border-gray-200 rounded-xl mb-4 text-[#0b2b57]">
                            <h2 className="text-lg font-bold text-[#0b2b57]">
                                Hot leads
                            </h2>
                        </div>

                        <div className="responsive-table-container max-h-[500px] overflow-y-auto no-scrollbar hide-scrollbar p-2 sm:p-4">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 text-[#0b2b57] font-semibold border-b">
                                    <tr>
                                        <th className="p-3">LEADS</th>
                                        <th className="p-3">COMPANY</th>
                                        <th className="p-3">LEAD TEMP</th>
                                        <th className="p-3">BUDGET</th>
                                    </tr>
                                </thead>

                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center">
                                                <Loading />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLeads?.slice(0, 5).map((lead) => (
                                            <tr key={lead._id || lead.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-semibold text-[#0b2b57]">
                                                    {lead.name || "John Doe"}
                                                </td>
                                                <td className="p-3 text-gray-600">
                                                    {lead.company || "ABC Corp"}
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                                                        🔴 Hot
                                                    </span>
                                                </td>
                                                <td className="p-3 font-medium text-gray-800">
                                                    {lead.budget || "₹1,20,000"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="rounded-2xl p-2">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border border-gray-200 rounded-xl p-4 bg-white">
                        <h2 className="text-lg font-bold text-[#0b2b57]">
                            Revenue Pipeline
                        </h2>
                        <button className="text-[#2563a9] font-semibold text-sm">
                            Total 312K
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between space-y-6">
                        <div className="w-full">
                            {[
                                {
                                    name: "Proposal Stage",
                                    color: "bg-purple-500",
                                    revenue: "118K",
                                    width: "80%",
                                },
                                {
                                    name: "Negotiation",
                                    color: "bg-orange-500",
                                    width: "60%",
                                    revenue: "98K",
                                },
                                {
                                    name: "Qualified Leads",
                                    color: "bg-yellow-500",
                                    width: "40%",
                                    revenue: "62K",
                                },
                                {
                                    name: "Closed Won",
                                    color: "bg-green-500",
                                    width: "25%",
                                    revenue: "34K",
                                },
                            ].map((item, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between mb-1.5 text-xs sm:text-sm">
                                        <span className="font-medium text-gray-700">
                                            {item.name}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {item.revenue}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full`}
                                            style={{ width: item.width }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className='text-xs font-bold text-gray-600 mb-2'>Conversion Overview</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                            <div className="relative flex items-center justify-center">
                                <svg
                                    width={radius * 2}
                                    height={radius * 2}
                                    className="-rotate-90"
                                >
                                    {data.map((item, index) => {
                                        const dash = (item.value / 100) * circumference;
                                        const circle = (
                                            <circle
                                                key={index}
                                                cx={radius}
                                                cy={radius}
                                                r={r}
                                                fill="none"
                                                stroke={item.color}
                                                strokeWidth={stroke}
                                                strokeDasharray={`${dash} ${circumference}`}
                                                strokeDashoffset={-offset}
                                                strokeLinecap="round"
                                            />
                                        );
                                        offset += dash;
                                        return circle;
                                    })}
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center leading-tight">
                                    <h1 className="text-sm font-bold text-gray-900">100%</h1>
                                    <p className='text-[9px] font-semibold text-gray-500'>RATE</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 p-2 w-full max-w-[180px]">
                                {data.map((item) => (
                                    <div
                                        key={item.status}
                                        className="text-xs flex items-center justify-between gap-2 w-full"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <p className="text-gray-700 font-medium">
                                                {item.status}
                                            </p>
                                        </div>
                                        <p className="text-gray-900 font-semibold">
                                            {item.value}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hotleads;
