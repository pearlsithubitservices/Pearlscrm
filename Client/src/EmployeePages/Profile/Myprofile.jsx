import { motion } from 'framer-motion'
import { Bell, Building2, ChevronRight, FolderOpen, LogOut, Upload, User } from 'lucide-react';
import InputField from '../../components/InputField';
import { useState } from 'react';
import Document from './PersonalDetails/Document.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import PersonalDetails from './PersonalDetails/PersonalDetails.jsx';
import JobSalary from './BankDetails/JobSalary.jsx';
import Accountinformation from './BankDetails/Accountinformation.jsx';
import Verification from './BankDetails/Verification.jsx';

export default function EmployeeProfile() {

  const [activeTab, setActiveTab] = useState("personal");

  const { user, logout } = useAuth();
  const sections = [
    {
      title: "Personal Information",
      icon: User,
      color: "bg-blue-100 text-blue-600",
      items: [
        "Profile Details",
        "Contact Information",
        "Emergency Contact",
      ],
    },
    {
      title: "Job & Organization Details",
      icon: Building2,
      color: "bg-purple-100 text-purple-600",
      items: [
        "Designation",
        "Department",
        "Reporting Manager",
        "Work Location",
      ],
    },
    {
      title: "Documents",
      icon: FolderOpen,
      color: "bg-green-100 text-green-600",
      items: [
        "PAN Card",
        "Aadhaar Card",
        "Certificates",
        "Other Documents",
      ],
    },

  ];



  return (
    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb]">

      {/* TOP HEADER */}
      <div className="sticky top-0 z-0 bg-white border-b shadow-sm">
        <div className=" flex justify-between items-center px-6 md:px-10 h-20">
          <h1 className="text-2xl font-bold text-[#0b2b57] flex flex-col">
            <span> User Information</span><span className=" font-small text-gray-500 text-[10px] tracking-tighter">User Profile Overview</span>
          </h1>
          <div className="flex items-center gap-4">
            <Bell size={30} className="text-white rounded-lg p-1 bg-blue-700 hover:scale-105 transition" />
            <LogOut size={30} className="text-white rounded-lg p-1 bg-red-600 hover:scale-105 transition" onClick={() => logout()} />
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="p-4 md:p-8">

        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">

            <img
              src="https://i.pravatar.cc/200"
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />

            <div className="flex-1 text-center lg:text-left">

              <h1 className="text-2xl font-bold text-[#0b2b57]">
                Deepan Raj
              </h1>

              <p className="text-gray-500 mt-1">
                Senior CRM Executive
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">

                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                  Active Employee
                </span>

                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  Employee ID: EMP001
                </span>

              </div>

            </div>

            <button className="px-5 py-3 rounded-xl bg-[#0b2b57] text-white flex items-center gap-2 hover:bg-[#164785] transition">

              <Upload size={18} />

              Update Profile

            </button>

          </div>
        </motion.div>

        <div className="flex min-w-full flex-row gap-6 p-1 px-4 h-10  items-center justify-center tracking-wider bg-white  rounded-lg cursor-pointer ">
          <div className={activeTab === "personal" ? "p-4 rounded-lg h-8 flex items-center justify-center bg-[#2563a9] text-white  w-full" : "p-4 flex justify-center rounded-lg text-[#2563a9] w-full hover:scale-105 hover:bg-blue-100 h-8 items-center transition duration-200"} onClick={() => setActiveTab("personal")}>
            <h3>Personal Details</h3>
          </div>
          <div className={activeTab === "job" ? "p-4 rounded-lg  h-8 items-center w-full bg-[#2563a9] text-white flex justify-center" : "p-4 rounded-lg  w-full flex justify-center text-[#2563a9] hover:scale-105 hover:bg-blue-100 transition duration-200 h-8  items-center"} onClick={() => setActiveTab("job")}>
            <h3>Bank Details</h3>
          </div>
        </div>


        {
          activeTab === "personal" ? (
            <>
              {/* Personal Details */}
              <PersonalDetails />

              {/* Documents Section */}
              <div className="mt-6 rounded-3xl ">
                <Document />
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-3xl">
             <div className="mt-6"> <Accountinformation/></div>
              <div className="mt-6"><Verification/></div>
              <div className="mt-6"><JobSalary/></div>
            </div>
          )
        }

        {/* QUICK ACTIONS 
        <div className="mt-6 bg-white rounded-3xl border shadow-sm p-6">

          <h2 className="text-xl font-bold text-[#0b2b57] mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <button className="border rounded-2xl p-4 hover:bg-slate-50">
              Edit Profile
            </button>

            <button className="border rounded-2xl p-4 hover:bg-slate-50">
              Upload Document
            </button>

            <button className="border rounded-2xl p-4 hover:bg-slate-50">
              Change Password
            </button>

            <button className="border rounded-2xl p-4 hover:bg-slate-50">
              Contact HR
            </button>

          </div>

        </div>*/}

      </div>

    </div >
  );
}