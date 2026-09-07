export const formatNumber = (num) => {
    if (num < 1000) return num;

    return (num / 1000)
        .toFixed(1)
        .replace(".0", "") + "K";
};

export const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
        return `₹${(value / 1_000_000_000).toFixed(1)}B`;
    }

    if (value >= 1_000_000) {
        return `₹${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
        return `₹${(value / 1_000).toFixed(1)}K`;
    }

    return `₹${value}`;
};

export const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // January = 1

    // Financial Year in India: April 1 to March 31
    if (month >= 4) {
        return `FY ${year}–${String(year + 1).slice(-2)}`;
    } else {
        return `FY ${year - 1}–${String(year).slice(-2)}`;
    }
};

export const formatDateTimeLocal = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const timezoneOffset = d.getTimezoneOffset() * 60000;

    return new Date(d - timezoneOffset)
        .toISOString()
        .slice(0, 16);
};

export const calculateAttendanceStatus = (
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

export const formatMonthYear = (dateString) => {
    const date = new Date(dateString);

    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = date.getFullYear();

    return `${month}-${year}`;
};


