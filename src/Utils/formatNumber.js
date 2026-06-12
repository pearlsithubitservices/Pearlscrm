export const formatNumber = (num) => {
    if (num < 1000) return num;

    return (num / 1000)
        .toFixed(1)
        .replace(".0", "") + "K";
};

export const getFinancialYear = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1; // January = 1
    const monthName = today.toLocaleString("en-US", {
        month: "short",
    });

    // Financial Year in India: April to March
    if (month >= 4) {
        return `${monthName} ${year}-${String(year + 1).slice(-2)}`;
    } else {
        return `FY ${year - 1}-${String(year).slice(-2)}`;
    }
};
