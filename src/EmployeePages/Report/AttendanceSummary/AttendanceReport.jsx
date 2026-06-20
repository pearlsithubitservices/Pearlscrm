import React from 'react'

const AttendanceReport = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 overflow-x-auto mx-4 border border-black/20">

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">
                    Monthly attendance report
                </h2>

                <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    May 2025
                </span>
            </div>

            <table className="w-full min-w-[900px] text-sm">
                <thead className="text-left text-gray-500">
                    <tr>
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "TOTAL"].map((h, i) => (
                            <th key={i} className="p-3">{h}</th>
                        ))}
                    </tr>
                </thead>

                <tbody className="text-gray-700">
                    {[1, 2, 3, 4].map((row) => (
                        <tr key={row} className="border-t">
                            <td className="p-3">01<br />8h 40m</td>
                            <td className="p-3">02<br />8h 40m</td>
                            <td className="p-3">03<br />8h 40m</td>
                            <td className="p-3">04<br />8h 40m</td>
                            <td className="p-3">05<br />8h 40m</td>
                            <td className="p-3">07<br />8h 40m</td>
                            <td className="p-3">-</td>
                            <td className="p-3 font-bold">67h 33m</td>
                        </tr>
                    ))}
                </tbody>

                <tfoot>
                    <tr className="border-t">
                        <td colSpan="8" className="p-4 text-center font-bold">
                            Monthly Total = 139h 39m
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default AttendanceReport