import React from 'react'

const AbsentReport = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mx-4 mb-6  border border-black/20">

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Absent Report</h2>
                <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    May 2025
                </span>
            </div>

            <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Reason</th>
                    </tr>
                </thead>

                <tbody>
                    {[
                        { d: "Jun 03", t: "Absent", time: "Full Day", r: "Traffic delay" },
                        { d: "Jun 05", t: "Late", time: "33m", r: "Not recorded" },
                        { d: "Jun 11", t: "Absent", time: "Full Day", r: "Medical" },
                        { d: "Jun 17", t: "Early exit", time: "01h", r: "Personal" },
                    ].map((item, i) => (
                        <tr key={i} className="border-t">
                            <td className="p-3">{item.d}</td>
                            <td className="p-3">{item.t}</td>
                            <td className="p-3">{item.time}</td>
                            <td className="p-3">{item.r}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    )
}

export default AbsentReport