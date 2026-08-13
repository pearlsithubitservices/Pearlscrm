
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BadgeIndianRupee,
  MessageSquare,
  Users,
  Briefcase,
  ClipboardList,
  LogOut,
  Bell,
  Megaphone,
  MessageCircleMore,
  Building2,
  ClipboardCheck,
  Search,
  ChevronDown,
  Mail,
  MapPin,
  CircleHelp,
  PenSquare,
} from "lucide-react";
import EmployeeDetails from "./EmployeeDetails";
import useEmployees from "../../../Hooks/useEmployees";


export default function CompanyDirectory() {

  const filterdata = [
    { name: "All Department", value: "all" },
    { name: "Engineeing", value: "Engineering Team" },
    { name: "Design Team", value: "Design Team" },
    { name: "HR Department", value: "HR Department" },
    { name: "Finance Team", value: "finance" },
    { name: "Sales Team", value: "Sales Team" },
    { name: "Operations Team", value: "operations" },
  ];



  const employee = [
    {
      name: "Sarah Chen",
      role: "Principal Engineer",
      dept: "Engineering Team",
      email: "sarah.c@nexus.com",
      location: "San Francisco, CA",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
      status: "bg-green-500",
      id: "NX-402",
    },
    {
      name: "Marcus Aris",
      role: "Senior UI Designer",
      dept: "Design Team",
      email: "m.aris@nexus.com",
      location: "London, UK",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      status: "bg-slate-400",
      id: "NX-381",
    },
    {
      name: "Elena",
      role: "HR Manager",
      dept: "HR Department",
      email: "elena.w@nexus.com",
      location: "San Francisco, CA",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
      status: "bg-green-500",
      id: "NX-112",
    },
    {
      name: "Tariq Khan",
      role: "Marketing Lead",
      dept: "Sales Team",
      email: "t.khan@nexus.com",
      location: "Dubai, UAE",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300",
      status: "bg-yellow-400",
      id: "NX-519",
    },
  ];
  const { employees } = useEmployees();
  console.log(employees[0]);
  const [activeTab, setACtiveTab] = useState("all");
  const [employeesdata, setEmployeesdata] = useState();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const handleTab = (department) => {
    setACtiveTab(department);

    if (department === "all") {
      setEmployeesdata(employees);
      return;
    }
    console.log(department);

    const filtered = employees.filter(
      (emp) => emp.dept === department
    );

    setEmployeesdata(filtered);
  };

  const handledetails = (id) => {
    setShowDetails(true);

    const emp = employees.find((e) => e.id === id);
    setSelectedEmployee(emp);
  };
  return (
    <div className="min-h-screen bg-[#efede8] flex">



      {/* CONTENT */}
      <main className="flex-1">
        {/* DIRECTORY */}
        <div className="bg-[#efede8] rounded-2xl  p-3">
          <div className="flex justify-between items-center bg-white p-1 rounded-lg">
            <h2 className="text-2xl font-bold">
              Company Directory
            </h2>

            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
                <Search size={18} />
                <input
                  placeholder="Search Project..."
                  className="bg-transparent outline-none"
                />
              </div>

              <button className="flex items-center gap-2 border rounded-xl px-4 overflow-hidden">
                <select
                  value={activeTab}
                  onChange={(e) => handleTab(e.target.value)}
                  placeholder="Select Department"
                  className=" w-full appearance-none rounded-xl bg-white px-4 py-3 pr-10 text-slate-700 shadow-sm outline-none transition-all duration-200      
                       hover:border-slate-400 cursor-pointer">
                  {filterdata.map((item, i) => (
                    <option
                      key={i}
                      value={item.value}
                      onClick={() => handleTab(item.value)}>{item.name}</option>
                  ))}
                </select>

              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-6">
            {employees.length > 0 ? employees.map((emp, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white border rounded-2xl p-5 shadow-sm cursor-pointer"
                onClick={() => handledetails(emp.uid)}
              >
                <div className="flex justify-between">
                  <div className="relative">
                    {/* <img
                      src={emp.image}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover"
                    /> */}
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md">
                      {emp.name.charAt(0).toUpperCase()}
                    </span>
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${emp.status}`}
                    />
                  </div>

                  <span className="text-slate-500">
                    ID: {emp.id.slice(0, 5)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1f5fa8] mt-4 ">
                  {emp.name}
                </h3>

                <p className="font-bold">{emp.role}</p>
                <p className="text-slate-500">{emp.dept}</p>

                <div className="space-y-3 mt-5">
                  <div className="flex items-start gap-2 w-full">
                    <Mail size={16} className="shrink-0 mt-1" />

                    <span className="break-words whitespace-normal min-w-0  h-[50px]">
                      {emp.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {emp.location||"Chennai-60001"}
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button className="flex-1 bg-blue-100 text-slate-700 py-2 rounded-xl hover:bg-blue-500 hover:text-slate-100">
                    Email
                  </button>

                  <button className="flex-1 border py-2 rounded-xl  hover:bg-slate-200 ">
                    Profile
                  </button>
                </div>
              </motion.div>
            )) :

              <div className="w-full h-[100px] items-center flex justify-center font-bold ml-80">

                <p> No Employees Data Found</p>
              </div>}
          </div>
          {showDetails && (
            <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <EmployeeDetails
                empId={selectedEmployee}
                onClose={() => setShowDetails(false)} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

