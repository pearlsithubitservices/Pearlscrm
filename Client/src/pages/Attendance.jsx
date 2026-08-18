import React, {
  useEffect,
  useState
} from 'react';

import axios from 'axios';

import {
  Play,
  Pause,
  LogOut,
  Coffee,
  Clock3,
  CalendarDays,
  TrendingUp,
  Activity,
  UserCheck,
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext';
import { apiUrl } from "../config/api.js";

export default function Attendance() {
  const { user } = useAuth();

  const [isWorking, setIsWorking] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loginTime, setLoginTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // TIMER
  useEffect(() => {
    let interval;
    if (isWorking && !isBreak) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, isBreak]);

  // FORMAT TIME
  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // LOGIN / CLOCK IN
  const handleLogin = async () => {
    try {
      const response = await axios.post(
        apiUrl("/attendance/login"),
        {
          employee_uid: user?.uid,
          employee_name: user?.displayName || user?.email,
        }
      );

      if (response.data?.attendanceId) {
        localStorage.setItem('attendanceId', response.data.attendanceId);
      }
      setIsWorking(true);
      setLoginTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.log(error);
      setIsWorking(true);
      setLoginTime(new Date().toLocaleTimeString());
    }
  };

  // BREAK
  const handleBreak = async () => {
    setIsBreak(true);
  };

  // RESUME
  const handleResume = async () => {
    setIsBreak(false);
  };

  // LOGOUT / CLOCK OUT
  const handleLogout = async () => {
    try {
      const attendanceId = localStorage.getItem('attendanceId');
      if (attendanceId) {
        await axios.post(apiUrl('/attendance/logout'), {
          attendanceId,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsWorking(false);
      setIsBreak(false);
      localStorage.removeItem('attendanceId');
    }
  };

  // DUMMY HISTORY
  useEffect(() => {
    setAttendanceHistory([
      {
        date: 'May 17',
        login: '09:00 AM',
        logout: '06:00 PM',
        hours: '8h 20m',
      },
      {
        date: 'May 16',
        login: '09:12 AM',
        logout: '06:11 PM',
        hours: '7h 48m',
      },
      {
        date: 'May 15',
        login: '08:55 AM',
        logout: '05:58 PM',
        hours: '8h 02m',
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* MAIN */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-[#0f172a]">
              Attendance Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Welcome back, {user?.displayName || 'Employee'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 w-fit">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-[#0f172a] text-sm md:text-base">
              {new Date().toDateString()}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
              <Clock3 className="w-10 h-10 text-blue-500" />
              <span className="text-green-500 text-sm font-semibold">
                Live
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">
              Working Hours
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a]">
              {formatTime()}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
              <Activity className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-gray-500 text-sm mb-2">
              Status
            </p>
            <h2 className="text-2xl lg:text-3xl font-black text-[#0f172a]">
              {isWorking ? (isBreak ? 'Break' : 'Online') : 'Offline'}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-gray-500 text-sm mb-2">
              Weekly Hours
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a]">
              42h
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
              <UserCheck className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-gray-500 text-sm mb-2">
              Login Time
            </p>
            <h2 className="text-2xl lg:text-3xl font-black text-[#0f172a]">
              {loginTime || '--:--'}
            </h2>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PANEL */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">
                  Attendance
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Track your work hours
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl text-xs font-semibold ${
                  isWorking
                    ? isBreak
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {isWorking ? (isBreak ? 'On Break' : 'Online') : 'Offline'}
              </div>
            </div>

            {/* TIMER */}
            <div className="bg-[#0f172a] rounded-3xl text-center py-10 mb-8">
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-wider">
                {formatTime()}
              </h1>
              <p className="text-gray-400 mt-3 text-sm">
                Today's Work Timer
              </p>
            </div>

            {/* BUTTONS */}
            <div className="space-y-4">
              {!isWorking && (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>Clock In</span>
                </button>
              )}

              {isWorking && !isBreak && (
                <button
                  onClick={handleBreak}
                  className="w-full flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  <Coffee className="w-5 h-5" />
                  <span>Start Break</span>
                </button>
              )}

              {isWorking && isBreak && (
                <button
                  onClick={handleResume}
                  className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  <Pause className="w-5 h-5" />
                  <span>Resume Work</span>
                </button>
              )}

              {isWorking && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Clock Out</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#0f172a]">
                  Attendance History
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Recent attendance logs
                </p>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-4 font-semibold">Date</th>
                    <th className="pb-4 font-semibold">Login</th>
                    <th className="pb-4 font-semibold">Logout</th>
                    <th className="pb-4 font-semibold">Hours</th>
                    <th className="pb-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceHistory.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50">
                      <td className="py-4 font-semibold text-[#0f172a]">
                        {item.date}
                      </td>
                      <td className="py-4 text-gray-600">{item.login}</td>
                      <td className="py-4 text-gray-600">{item.logout}</td>
                      <td className="py-4 font-bold text-[#0f172a]">
                        {item.hours}
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-600 text-xs font-semibold">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
