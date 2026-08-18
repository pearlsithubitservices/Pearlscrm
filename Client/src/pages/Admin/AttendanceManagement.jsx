import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Search,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  CalendarDays,
  Users,
  TimerReset,
  Bell,
} from 'lucide-react';
import useAttendance from '../../Hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import useLeave from '../../Hooks/useLeave';
import useEmployees from '../../Hooks/useEmployees';
import { staticAttendance, staticHolidays } from '../../Utils/staticData';

export default function AttendanceManagement() {

  const [employeesdetails, setEmployeesdetails] = useState(staticAttendance);
  const { employees } = useEmployees();

  const { user } = useAuth();

  const { getHolidays, holidays } = useLeave();

  useEffect(() => {
    getHolidays();
  }, []);

  const employeeMap = useMemo(() => {
    const defaultMap = {
      emp_1: "Ragavi M",
      emp_2: "Karthik Raja",
      emp_3: "Priya Sharma",
      emp_4: "Suresh Kumar",
    };
    if (!employees || employees.length === 0) return defaultMap;
    return employees.reduce((map, employee) => {
      map[employee.uid || employee.id] = employee.name;
      return map;
    }, defaultMap);
  }, [employees]);

  const { getAttendance } = useAttendance();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getAttendance();
        if (Array.isArray(res) && res.length > 0) {
          setEmployeesdetails(res);
        } else {
          setEmployeesdetails(staticAttendance);
        }
      } catch (err) {
        console.log(err);
        setEmployeesdetails(staticAttendance);
      }
    };
    fetchAttendance();
  }, []);

  const safeDetails = Array.isArray(employeesdetails) && employeesdetails.length > 0
    ? employeesdetails
    : staticAttendance;

  const safeHolidays = Array.isArray(holidays) && holidays.length > 0
    ? holidays
    : staticHolidays;

  const onlineEmployees = safeDetails.filter(
    (emp) => emp?.attendanceState?.toLowerCase() === "working"
  );

  const breakEmployees = safeDetails.filter(
    (emp) => emp?.attendanceState?.toLowerCase() === "break"
  );

  const offlineEmployees = safeDetails.filter(
    (emp) => emp?.attendanceState?.toLowerCase() === "clocked_out" || emp?.attendanceState?.toLowerCase() === "offline"
  );

  return (
    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f1f5f9] p-4 sm:p-6 md:p-8">

      {/* TOP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-[#0f172a]">
            Attendance Management
          </h1>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">
            Monitor employee attendance & productivity
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-3 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">

        {/* ONLINE */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3">
            <LogIn className="w-8 h-8 text-green-500" />
            <span className="text-green-500 font-bold text-xs">LIVE</span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Online Employees</p>
          <h2 className="text-3xl font-black text-[#0f172a] mt-1">
            {onlineEmployees.length}
          </h2>
        </div>

        {/* BREAK */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3">
            <Coffee className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">On Break</p>
          <h2 className="text-3xl font-black text-[#0f172a] mt-1">
            {breakEmployees.length}
          </h2>
        </div>

        {/* OFFLINE */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Offline Employees</p>
          <h2 className="text-3xl font-black text-[#0f172a] mt-1">
            {offlineEmployees.length}
          </h2>
        </div>

        {/* TOTAL */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Total Employees</p>
          <h2 className="text-3xl font-black text-[#0f172a] mt-1">
            {safeDetails.length}
          </h2>
        </div>

        {/* HOLIDAYS */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-3">
            <CalendarDays className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">Upcoming Holidays</p>
          <h2 className="text-xl font-black text-[#0f172a] mt-1">
            {safeHolidays[0]?.holidayDate ? new Date(safeHolidays[0].holidayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Aug 15"}
          </h2>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

        {/* EMPLOYEE TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-[700px] overflow-y-auto no-scrollbar">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#0f172a]">
                Live Attendance
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                Realtime employee monitoring
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto responsive-table-container">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-4 font-semibold">Employee</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Login Time</th>
                  <th className="pb-4 font-semibold">Location</th>
                  <th className="pb-4 font-semibold">Photo</th>
                </tr>
              </thead>

              <tbody>
                {safeDetails.map((employee, idx) => {
                  const empName = employeeMap[employee.employee_uid || employee.uid] || `Employee ${idx + 1}`;
                  const stateStr = (employee?.attendanceState || "offline").toLowerCase();

                  return (
                    <tr
                      key={employee._id || employee.id || idx}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                    >
                      {/* EMPLOYEE */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0f172a]">
                              {empName}
                            </h3>
                            <p className="text-gray-400 text-xs">
                              {employee.role || "Employee"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-4">
                        <span className={`
                          px-3 py-1 rounded-2xl text-xs font-semibold
                          ${stateStr === 'working'
                            ? 'bg-green-100 text-green-600'
                            : stateStr === 'break'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-500'
                          }
                        `}>
                          {stateStr === "working" ? "Online" : stateStr === "break" ? "Break" : "Offline"}
                        </span>
                      </td>

                      {/* LOGIN */}
                      <td className="py-4 font-semibold text-[#0f172a]">
                        {employee.clockIn ? new Date(employee.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00 AM"}
                      </td>

                      {/* LOCATION */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          Chennai
                        </div>
                      </td>

                      {/* PHOTO */}
                      <td className="py-4">
                        <img
                          src={employee.login_photo || `https://i.pravatar.cc/100?img=${idx + 1}`}
                          alt=""
                          className="w-10 h-10 rounded-2xl object-cover"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6 md:space-y-8">

          {/* TIMESHEET */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#0f172a]">
                Overall Timesheet
              </h2>
              <TimerReset className="w-5 h-5 text-blue-500" />
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-gray-500">Today's Work</p>
                  <p className="font-bold">38h 22m</p>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-blue-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-gray-500">Weekly Attendance</p>
                  <p className="font-bold">92%</p>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* HOLIDAYS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[450px] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#0f172a]">
                Upcoming Holidays
              </h2>
              <Bell className="w-5 h-5 text-orange-500" />
            </div>

            <div className="space-y-4">
              {safeHolidays.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="font-bold text-[#0f172a] text-xs sm:text-sm">
                      {item?.holidayName || "Holiday"}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {item?.holidayDate ? new Date(item.holidayDate).toLocaleDateString('en-GB') : "Upcoming"}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-2xl bg-purple-100 text-purple-600 text-xs font-semibold">
                    {item?.holidayType || "General"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
