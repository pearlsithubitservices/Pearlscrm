export const getAttendanceStatus = (
  checkIn,
  checkOut
) => {

  if (!checkIn)
    return {
      status: "Absent",
      color: "bg-red-100 text-red-600",
    };

  const inTime = new Date(checkIn);
  const outTime = checkOut
    ? new Date(checkOut)
    : null;

  const officeStart = 9.3; // 9:30 AM

  const loginHour =
    inTime.getHours() +
    inTime.getMinutes() / 60;

  if (loginHour > 10) {
    return {
      status: "Late Comer",
      color: "bg-yellow-100 text-yellow-600",
    };
  }

  if (outTime) {

    const worked =
      (outTime - inTime) /
      (1000 * 60 * 60);

    if (worked < 4) {
      return {
        status: "Half Day",
        color: "bg-purple-100 text-purple-600",
      };
    }

    if (worked < 8) {
      return {
        status: "Early Logout",
        color: "bg-orange-100 text-orange-600",
      };
    }
  }

  return {
    status: "Present",
    color: "bg-green-100 text-green-600",
  };
};