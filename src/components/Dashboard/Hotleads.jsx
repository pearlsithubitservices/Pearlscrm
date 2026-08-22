import React, { useEffect, useState } from 'react';
import Loading from '../Dashboard/Loading';
import { apiUrl } from '../../config/api';

const Hotleads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const safeLeads = Array.isArray(leads) ? leads : [];
    const totalLeads = safeLeads.length;

    const statusCounts = {
        new: 0,
        contacted: 0,
        interested: 0,
        converted: 0,
    };

    safeLeads.forEach((lead) => {
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

    useEffect(() => {
        fetchLeads();
    }, []);

    // CIRCLE CHART DATA
    const data = [
        {
            value: Number(statusPercentage.new) || 25,
            color: "#eab308",
            status: "New",
        },
        {
            value: Number(statusPercentage.contacted) || 30,
            color: "#3b82f6",
            status: "Contacted",
        },
        {
            value: Number(statusPercentage.interested) || 25,
            color: "#a855f7",
            status: "Interested",
        },
        {
            value: Number(statusPercentage.converted) || 20,
            color: "#22c55e",
            status: "Converted",
        },
    ];

    const radius = 35;
    const stroke = 6;
    const r = radius - stroke / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    // DYNAMIC FETCH LEADS
    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl('/leads'));
            if (response.ok) {
                const data = await response.json();
                const leadList = Array.isArray(data) ? data : data.data || [];
                setLeads(leadList);
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.log("Hotleads fetch error:", error);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = safeLeads.filter((lead) => (lead?.priority?.toLowerCase() === "hot"));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f3f0eb] px-4 sm:px-8 py-2">
            {/* TABLE */}
            <div className="lg:col-span-2">
                <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl mb-4 text-[#0b2b57] text-lg shadow-sm">
                        <h2 className="text-base font-bold text-[#0b2b57]">
                            Hot Leads
                        </h2>
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                            {filteredLeads.length} Urgent
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl bg-white text-black max-h-[470px] min-h-[350px] overflow-y-auto p-6 shadow-sm border border-gray-200">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[#0b2b57] sticky top-0 z-10 border-b border-gray-200 text-xs font-bold uppercase">
                                <tr>
                                    <th className="p-3">LEAD</th>
                                    <th className="p-3">COMPANY</th>
                                    <th className="p-3">PRIORITY</th>
                                    <th className="p-3">BUDGET</th>
                                </tr>
                            </thead>

                            {loading ? (
                                <tbody>
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center">
                                            <Loading />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody className="text-xs divide-y divide-gray-100">
                                    {filteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-400 font-medium">
                                                No hot leads found at the moment.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLeads.slice(0, 8).map((lead) => (
                                            <tr key={lead._id || lead.id} className="hover:bg-gray-50 transition">
                                                <td className="p-3 font-semibold text-gray-900">
                                                    {lead.name || lead.leadName || "Lead"}
                                                </td>
                                                <td className="p-3 text-gray-500">
                                                    {lead.company || lead.email || "Tech Corp"}
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold">
                                                        🔥 Hot
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-gray-800">
                                                    {lead.budget ? `₹${lead.budget}` : "₹120,000"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                    <h2 className="text-base font-bold text-[#0b2b57]">
                        Revenue Pipeline
                    </h2>
                    <span className="text-xs font-bold text-[#2563a9] bg-blue-50 px-3 py-1 rounded-full">
                        Total 312K
                    </span>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col items-center justify-between">
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
                                color: "bg-emerald-500",
                                width: "25%",
                                revenue: "34K",
                            },
                        ].map((item, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between mb-1.5 text-xs font-semibold text-gray-700">
                                    <span>{item.name}</span>
                                    <span className="text-gray-900 font-bold">{item.revenue}</span>
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

                    <div className="w-full mt-4 pt-4 border-t border-gray-100">
                        <p className='text-xs font-bold text-gray-800 mb-3'>Conversion Overview</p>
                        
                        {/* Down Side Circle */}
                        <div className="relative flex items-center justify-between gap-4 w-full">
                            <div className="relative flex items-center justify-center shrink-0">
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
                                <div className="absolute flex flex-col items-center justify-center">
                                    <h1 className="text-xs font-bold text-gray-900">100%</h1>
                                    <p className='text-[8px] font-semibold text-gray-500'>RATE</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1">
                                {data.map((item) => (
                                    <div key={item.status} className="text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-gray-600 font-medium">{item.status}</span>
                                        </div>
                                        <span className="text-gray-900 font-bold text-[11px]">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hotleads;