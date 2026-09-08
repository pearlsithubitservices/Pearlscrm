const calculateAttendanceStatus = (
    clockIn,
    clockOut,
    workingHours = 0
) => {
    if (!clockIn) {
        return "absent";
    }

    const inTime = new Date(clockIn);
    const officeStartMinutes = 9 * 60 + 30; // 9:30 AM
    const officeEndMinutes = 18 * 60;       // 6:00 PM

    const inMinutes = inTime.getHours() * 60 + inTime.getMinutes();

    // 1. Half Day rule (worked less than 4 hours after clocking out)
    if (clockOut && workingHours > 0 && workingHours < 4 * 3600) {
        return "half day";
    }

    // 2. Late Comer rule (Clock-in after 9:30 AM)
    if (inMinutes > officeStartMinutes) {
        return "late comer";
    }

    // 3. Early Logout rule (Clock-out before 6:00 PM)
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
