import { motion } from 'framer-motion'
import { Bell, Camera, LogOut, Upload } from 'lucide-react';
import { useState } from 'react';
import Document from './PersonalDetails/Document.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import PersonalDetails from './PersonalDetails/PersonalDetails.jsx';
import JobSalary from './BankDetails/JobSalary.jsx';
import Accountinformation from './BankDetails/Accountinformation.jsx';
import Verification from './BankDetails/Verification.jsx';
import { uploadAvatar } from '../../services/profileApi';

export default function EmployeeProfile() {

  const [activeTab, setActiveTab] = useState("personal");
  const [startEditing, setStartEditing] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');

  const { user, logout, fetchCurrentUser } = useAuth();
  const profile = user?.profile || {};
  const displayName = `${user?.firstName || user?.name?.split(' ')[0] || 'Employee'} ${user?.lastName || user?.name?.split(' ').slice(1).join(' ') || ''}`.trim();
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarSaving(true);
    setAvatarMessage('');
    try {
      const { data } = await uploadAvatar(file);
      await fetchCurrentUser();
      setAvatarMessage(data.message || 'Avatar updated successfully');
    } catch (error) {
      setAvatarMessage(error.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarSaving(false);
      event.target.value = '';
    }
  };
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

            <div className="relative shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={`${displayName} avatar`} className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-blue-100 bg-blue-100 text-[#0b2b57] flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#0b2b57] text-white flex items-center justify-center cursor-pointer hover:bg-[#164785] transition" title="Upload profile avatar">
                <Camera size={17} />
              </label>
              <input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} disabled={avatarSaving} />
            </div>

            <div className="flex-1 text-center lg:text-left">

              <h1 className="text-2xl font-bold text-[#0b2b57]">
                {displayName}
              </h1>

              <p className="text-gray-500 mt-1">
                {profile.designation || 'Designation not assigned'}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">

                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                  Active Employee
                </span>

                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  Employee ID: {profile.empId || 'Not Assigned'}
                </span>

              </div>

            </div>

            {avatarMessage && <p className="text-sm text-gray-500 text-center lg:text-left">{avatarSaving ? 'Uploading...' : avatarMessage}</p>}

            <button
              onClick={() => {
                setActiveTab("personal");
                setStartEditing(true);
              }}
              className="px-5 py-3 rounded-xl bg-[#0b2b57] text-white flex items-center gap-2 hover:bg-[#164785] transition"
            >

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
              <PersonalDetails key={startEditing ? "editing" : "viewing"} startEditing={startEditing} />

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