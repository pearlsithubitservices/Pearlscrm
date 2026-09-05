const AttendanceReport = ({ records = [] }) => {
    const formatHours = (seconds) => {
        const totalSeconds = Number(seconds) || 0
        if (totalSeconds <= 0) return '0m'
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        return hours ? `${hours}h ${minutes}m` : `${minutes}m`
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 overflow-x-auto mx-4 border border-black/20">

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">
                    Monthly attendance report
                </h2>

                <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                </span>
            </div>

            <table className="w-full min-w-[900px] text-sm">
                <thead className="text-left text-gray-500">
                    <tr>
                        {["DATE", "STATUS", "CLOCK IN", "CLOCK OUT", "WORKING TIME"].map((h, i) => (
                            <th key={i} className="p-3">{h}</th>
                        ))}
                    </tr>
                </thead>

                <tbody className="text-gray-700">
                    {records.map((record) => (
                        <tr key={record._id || record.date} className="border-t">
                            <td className="p-3">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                            <td className="p-3 capitalize">{record.status || 'Absent'}</td>
                            <td className="p-3">{record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="p-3">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="p-3">{formatHours(record.workingHours)}</td>
                        </tr>
                    ))}
                    {!records.length && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No attendance records for this month.</td></tr>}
                </tbody>

                <tfoot>
                    <tr className="border-t">
                        <td colSpan="5" className="p-4 text-center font-bold">
                            Monthly Total = {formatHours(records.reduce((total, record) => total + (record.workingHours || 0), 0))}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default AttendanceReport