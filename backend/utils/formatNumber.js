const calculateAttendanceStatus = (
    clockIn,
    clockOut,
    workingHours = 0
) => {
    if (!clockIn) {
        return "absent";
    }

    const inTime = new Date(clockIn);
    const officeStartMinutes = 9 * 60 + 30;
    const officeEndMinutes = 18 * 60;

    const inMinutes = inTime.getHours() * 60 + inTime.getMinutes();

    if (clockOut && workingHours > 0 && workingHours < 4 * 3600) {
        return "half day";
    }

    if (inMinutes > officeStartMinutes) {
        return "late comer";
    }

    if (clockOut) {
        const outTime = new Date(clockOut);
        const outMinutes = outTime.getHours() * 60 + outTime.getMinutes();
        if (outMinutes < officeEndMinutes) {
            return "early logout";
        }
    }

    return "present";
};

module.exports = { calculateAttendanceStatus };
