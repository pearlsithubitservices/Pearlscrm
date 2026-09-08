const AbsentReport = ({ records = [] }) => {
    const exceptionRecords = records.filter((record) => {
        const status = String(record.status || '').toLowerCase()
        return status === 'absent' || status === 'late' || status === 'late comer' || status === 'early logout'
    })

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mx-4 mb-6  border border-black/20">

            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Absent Report</h2>
                <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}
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
                    {exceptionRecords.map((record) => (
                        <tr key={record._id || record.date} className="border-t">
                            <td className="p-3">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                            <td className="p-3 capitalize">{record.status || 'Absent'}</td>
                            <td className="p-3">{record.workingHours ? `${Math.round(record.workingHours / 60)}m` : 'Full Day'}</td>
                            <td className="p-3">{record.location || '-'}</td>
                        </tr>
                    ))}
                    {!exceptionRecords.length && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No exceptions for this month.</td></tr>}
                </tbody>

            </table>
        </div>
    )
}

export default AbsentReport