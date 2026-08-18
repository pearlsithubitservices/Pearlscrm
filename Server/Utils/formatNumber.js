const FULL_DAY_SECONDS = 8 * 60 * 60;
const HALF_DAY_SECONDS = 4 * 60 * 60;

const calculateAttendanceStatus = (clockIn, clockOut, workingHours = 0) => {
  if (!clockIn) return "absent";
  if (!clockOut) return "present";

  const totalWorkingSeconds = Number(workingHours) || 0;

  if (totalWorkingSeconds >= FULL_DAY_SECONDS) return "present";
  if (totalWorkingSeconds >= HALF_DAY_SECONDS) return "half_day";

  return "absent";
};

module.exports = {
  calculateAttendanceStatus,
};
