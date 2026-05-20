import React, {
  useEffect,
  useState
} from 'react';

import axios from 'axios';

import {
  Search,
  Clock3,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  CalendarDays,
  Users,
  TimerReset,
  Bell,
} from 'lucide-react';

export default function AttendanceManagement() {

  const [employees, setEmployees] =
    useState([]);

  // FETCH EMPLOYEES

  const fetchEmployees =
    async () => {

      try {

        const response =
          await axios.get(
            'http://localhost:5000/api/attendance/active'
          );

        setEmployees(
          response.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  // AUTO REFRESH

  useEffect(() => {

    fetchEmployees();

    const interval =
      setInterval(() => {

        fetchEmployees();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  // STATUS COUNTS

  const onlineEmployees =
    employees.filter(
      (emp) =>
        emp.status === 'Online'
    );

  const breakEmployees =
    employees.filter(
      (emp) =>
        emp.status === 'Break'
    );

  const offlineEmployees =
    employees.filter(
      (emp) =>
        emp.status === 'Offline'
    );

  return (

    <div className="min-h-screen bg-[#f1f5f9] p-8">

      {/* TOP */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-black text-[#0f172a]">

            Attendance Management

          </h1>

          <p className="text-gray-500 mt-2">

            Monitor employee attendance &
            productivity

          </p>

        </div>

        {/* SEARCH */}

        <div className="relative w-[350px]">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Search employees..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 outline-none shadow-sm"
          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

        {/* ONLINE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <LogIn className="w-10 h-10 text-green-500" />

            <span className="text-green-500 font-bold text-sm">

              LIVE

            </span>

          </div>

          <p className="text-gray-500 text-sm">

            Online Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {onlineEmployees.length}

          </h2>

        </div>

        {/* BREAK */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <Coffee className="w-10 h-10 text-yellow-500" />

          </div>

          <p className="text-gray-500 text-sm">

            On Break

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {breakEmployees.length}

          </h2>

        </div>

        {/* OFFLINE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <LogOut className="w-10 h-10 text-red-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Offline Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {offlineEmployees.length}

          </h2>

        </div>

        {/* TOTAL */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <Users className="w-10 h-10 text-blue-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Total Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {employees.length}

          </h2>

        </div>

        {/* HOLIDAYS */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <CalendarDays className="w-10 h-10 text-purple-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Upcoming Holidays

          </p>

          <h2 className="text-2xl font-black text-[#0f172a] mt-2">

            May 25

          </h2>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* EMPLOYEE TABLE */}

        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black text-[#0f172a]">

                Live Attendance

              </h2>

              <p className="text-gray-500 mt-1">

                Realtime employee monitoring

              </p>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-100 text-left text-gray-500 text-sm">

                  <th className="pb-4 font-semibold">

                    Employee

                  </th>

                  <th className="pb-4 font-semibold">

                    Status

                  </th>

                  <th className="pb-4 font-semibold">

                    Login Time

                  </th>

                  <th className="pb-4 font-semibold">

                    Location

                  </th>

                  <th className="pb-4 font-semibold">

                    Photo

                  </th>

                </tr>

              </thead>

              <tbody>

                {employees.map((employee) => (

                  <tr
                    key={employee._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                  >

                    {/* EMPLOYEE */}

                    <td className="py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">

                          {
                            employee.employee_name?.[0]
                          }

                        </div>

                        <div>

                          <h3 className="font-bold text-[#0f172a]">

                            {employee.employee_name}

                          </h3>

                          <p className="text-gray-500 text-sm">

                            Employee

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="py-5">

                      <span className={`
                        px-4 py-2 rounded-2xl text-sm font-semibold
                        ${
                          employee.status === 'Online'
                            ? 'bg-green-100 text-green-600'
                            : employee.status === 'Break'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-500'
                        }
                      `}>

                        {employee.status}

                      </span>

                    </td>

                    {/* LOGIN */}

                    <td className="py-5 font-semibold text-[#0f172a]">

                      {
                        new Date(
                          employee.login_time
                        ).toLocaleTimeString()
                      }

                    </td>

                    {/* LOCATION */}

                    <td className="py-5">

                      <div className="flex items-center gap-2 text-gray-600">

                        <MapPin className="w-4 h-4 text-blue-500" />

                        Coimbatore

                      </div>

                    </td>

                    {/* PHOTO */}

                    <td className="py-5">

                      <img
                        src={
                          employee.login_photo ||
                          'https://i.pravatar.cc/100'
                        }
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover"
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="space-y-8">

          {/* TIMESHEET */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-black text-[#0f172a]">

                Overall Timesheet

              </h2>

              <TimerReset className="w-6 h-6 text-blue-500" />

            </div>

            <div className="space-y-5">

              <div>

                <div className="flex justify-between mb-2">

                  <p className="text-gray-500">

                    Today's Work

                  </p>

                  <p className="font-bold">

                    38h 22m

                  </p>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div className="h-full w-[75%] bg-blue-500 rounded-full"></div>

                </div>

              </div>

              <div>

                <div className="flex justify-between mb-2">

                  <p className="text-gray-500">

                    Weekly Attendance

                  </p>

                  <p className="font-bold">

                    92%

                  </p>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div className="h-full w-[92%] bg-green-500 rounded-full"></div>

                </div>

              </div>

            </div>

          </div>

          {/* HOLIDAYS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-black text-[#0f172a]">

                Upcoming Holidays

              </h2>

              <Bell className="w-6 h-6 text-orange-500" />

            </div>

            <div className="space-y-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-[#0f172a]">

                    Memorial Day

                  </h3>

                  <p className="text-gray-500 text-sm">

                    Monday, May 25

                  </p>

                </div>

                <span className="px-4 py-2 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold">

                  Holiday

                </span>

              </div>

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-[#0f172a]">

                    Company Meetup

                  </h3>

                  <p className="text-gray-500 text-sm">

                    June 12

                  </p>

                </div>

                <span className="px-4 py-2 rounded-2xl bg-blue-100 text-blue-600 text-sm font-semibold">

                  Event

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}