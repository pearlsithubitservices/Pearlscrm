import {
  ClipboardList,
  Users,
  PhoneCall,
  LogOut
} from 'lucide-react';

import { signOut } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';

import { auth } from '../lib/firebase';

export default function EmployeeSidebar({
  activeTab,
  setActiveTab,
  currentUser
}) {

  const navigate = useNavigate();

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate('/login');

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="w-[280px] bg-[#0f1725] border-r border-white/10 p-6 flex flex-col justify-between">

      <div>

        {/* LOGO */}

        <div className="mb-12">

          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">

            Pearls CRM

          </h1>

          <p className="text-gray-500 mt-2 text-sm">

            Employee Workspace

          </p>

        </div>

        {/* PROFILE */}

        <div className="bg-white/5 rounded-3xl p-5 border border-white/10 mb-10">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-xl font-bold mb-4">

            {
              currentUser?.displayName
                ?.charAt(0)
                ?.toUpperCase() || 'U'
            }

          </div>

          <h2 className="font-bold text-lg">

            {
              currentUser?.displayName ||
              'Loading...'
            }

          </h2>

          <p className="text-gray-500 text-sm">

            {
              currentUser?.email ||
              'Please wait'
            }

          </p>

        </div>

        {/* MENU */}

        <div className="space-y-3">

          <button
            onClick={() =>
              setActiveTab('tasks')
            }
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >

            <ClipboardList className="w-5 h-5" />

            Tasks

          </button>

          <button
            onClick={() =>
              setActiveTab('leads')
            }
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >

            <Users className="w-5 h-5" />

            Leads

          </button>

          <button
            onClick={() =>
              setActiveTab('followups')
            }
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              activeTab === 'followups'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >

            <PhoneCall className="w-5 h-5" />

            Followups

          </button>

        </div>

      </div>
<button
  onClick={handleLogout}
  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/20 transition-all duration-300"
>

  <LogOut className="w-5 h-5" />

  Logout

</button>

    </div>

  );

}