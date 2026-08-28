
import React, {
  useState,
  useEffect,

} from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  X,
  User2,
  BadgeDollarSign,
  Globe,
  Upload,
  Users,
  Briefcase,
  AlertCircle,
  Activity,
  Filter,
  Bell,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  IdCardIcon,
  UserMinus,
  UserMinus2,
  UserCheck,
  Pin
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence, easeOut } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';

import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';
import Createemployee from './Createemployee';
import AnimateModals from '../components/Dashboard/AnimateModals';
import useEmployees from '../Hooks/useEmployees';
import { db } from '../lib/firebase';


export default function ClientManagement() {

  const [active, setActive] = useState(0);
  const buttons = ["All", "Sales", "Engineering", "Design"];
  //const [employees, setEmployees] = useState([]);
  const { employees, deleteEmployee, toggleEmployeeStatus } = useEmployees();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const filteredEmployees = (employees || []).filter((employee) => {
    const profile = employee.profile || {};
    const name = employee.name || employee.employeeName || "";
    const employeeId = profile.empId || employee.empId || employee.id || "";
    const role = employee.role || employee.employeeRole || profile.designation || "";
    const department = employee.department || profile.department || "";
    const matchesSearch = [name, employeeId, role, department, employee.email]
      .join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = active === 0 || department.toLowerCase() === buttons[active].toLowerCase();
    return matchesSearch && matchesDepartment;
  });
  const currentFiles = filteredEmployees.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredEmployees.length / filesPerPage);


  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Employee Performance",
      value: "48%",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Active Tasks",
      value: "12",
      icon: Activity,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "ON Leave",
      value: "20",
      icon: UserMinus,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const projects = [
    {
      name: "TechFlow CRM Implementation",
      company: "TechFlow Solutions",
      status: "Active",
      type: "onTrack",

    },
    {
      name: "TechFlow CRM Implementation",
      company: "TechFlow Solutions",
      status: "Active",
      type: "AtRisk",

    }
  ];
  const [users, setUsers] = useState();
  

  // const sortedUsers = [...users]?.sort((a, b) => {
  //   const aTime = a.createdAt?.seconds || 0;
  //   const bTime = b.createdAt?.seconds || 0;

  //   return bTime - aTime; // Newest first
  // });

  
  // useEffect(() => {
  //   const deleteUserByEmail = async () => {
  //     try {
  //       const snapshot = await getDocs(collection(db, "users"));

  //       const userDoc = snapshot.docs.find(
  //         (doc) => doc.data().email === "vishnuravichandran007@gmail.com"
  //       );

  //       if (!userDoc) {
  //         console.log("User not found");
  //         return;
  //       }

  //       await deleteDoc(doc(db, "users", userDoc.id));

  //       console.log("User deleted successfully");
  //     } catch (error) {
  //       console.error("Error deleting user:", error);
  //     }
  //   };

  //   deleteUserByEmail();
  // }, []);


  const fetchUsers = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));

      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers()

  }, []);


  return (
    <div className="text-black max-h-screen overflow-y-auto no-scrollbar">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Employee Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your Employee
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
          >
            <Plus size={16} />
            Add Employee
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Filter size={18} className='text-white' />
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Bell size={18} className='text-white' />
          </button>



        </div>

      </div>

      {/* BODY */}
      <div className="p-8 bg-[#f3f0eb] min-h-screen">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((item, i) => (
            < motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-black/10 p-4 rounded-xl"
            >

              <div className="flex items-center justify-between mb-3">

                <div className="bg-gray-100 rounded w-10 h-10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                  ↑ 8.4%
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-[#0b2b57]">
                {item.value}
              </h2>

            </motion.div>
          ))}

        </div>

        {/* PROJECT SECTION HEADER */}
        <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">
          <div>
            <h2 className="text-lg font-bold text-[#0b2b57]">
              Employee List
            </h2>
          </div>
          <div className="flex gap-3">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`px-4  rounded-xl font-medium transition-all
                                  ${active === index
                    ? "bg-[#2563a9] text-white"
                    : "text-gray-400  hover:bg-[#2563a9] hover:text-white"
                  }`}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-full lg:w-[300px]">

            <Search size={16} className="text-black" />

            <input
              placeholder="Search employees..."
              className="w-full outline-none text-sm bg-gray-200"
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
            />

          </div>

        </div>

        {/* EMPLOYEE TABLE */}

        {loading ?
          <div className='w-full h-screen items-center'>
            <LoadingPage />
          </div> :
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto bg-white border border-black/10 rounded">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#082f57] text-white text-xs uppercase tracking-wide">
                <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Emp ID</th><th className="px-5 py-4">Activity</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">SME</th><th className="px-5 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentFiles.map((employee) => {
                  const profile = employee.profile || {};
                  const employeeId = profile.empId || employee.empId || employee.id || employee._id;
                  const status = employee.status || "Active";
                  const activity = employee.isOnline ? "Online" : status;
                  const role = employee.role || employee.employeeRole || profile.designation || "Employee";
                  const sme = employee.sme || employee.isSME || employee.subjectMatterExpert || profile.sme;
                  return <tr key={employee.id || employee._id} className="hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/employeeDetails/${employee.id || employee._id}`)}>
                    <td className="px-5 py-4 font-semibold text-[#0b2b57]">{employee.name || employee.employeeName || "No Name"}</td>
                    <td className="px-5 py-4 text-gray-600">{employeeId || "Not assigned"}</td>
                    <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs ${activity === "Online" || activity === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{activity}</span></td>
                    <td className="px-5 py-4 text-gray-600">{role}</td>
                    <td className="px-5 py-4 text-gray-600">{typeof sme === "boolean" ? (sme ? "Yes" : "No") : sme || "Not assigned"}</td>
                    <td className="px-5 py-4 text-right"><div className="flex justify-end gap-3"><button type="button" className={`text-xs font-semibold ${status === "Suspended" ? "text-green-700" : "text-orange-700"}`} onClick={async (event) => { event.stopPropagation(); if (window.confirm(`${status === "Suspended" ? "Activate" : "Suspend"} this employee?`)) { try { await toggleEmployeeStatus(employee.id || employee._id); } catch (error) { alert(error.message); } } }}>{status === "Suspended" ? "Activate" : "Suspend"}</button><button type="button" className="text-red-600 hover:text-red-800" aria-label={`Delete ${employee.name || "employee"}`} onClick={async (event) => { event.stopPropagation(); if (window.confirm("Are you sure you want to delete this employee?")) await deleteEmployee(employee.id || employee._id); }}><X size={18} /></button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
            {!currentFiles.length && <p className="p-8 text-center text-gray-500">No employees found.</p>}
          </motion.div>
        }
        <div>
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages
            }
          />
        </div>

      </div>

      {/**Add Employee Modal */}
      {open && (
        <AnimateModals>
          <Createemployee onClose={() => setOpen(false)} />
        </AnimateModals>
      )}

    </div>
  );


}
