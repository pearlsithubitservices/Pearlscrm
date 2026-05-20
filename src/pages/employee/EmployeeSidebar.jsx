import {
  LayoutDashboard,
  ClipboardList,
  Users,
  PhoneCall,
  LogOut
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  signOut
} from 'firebase/auth';

import {
  auth
} from '../../lib/firebase';
import { Clock3 } from 'lucide-react';

export default function EmployeeSidebar({
  currentUser
}) {

  const navigate =
    useNavigate();

  const logout = async () => {

    await signOut(auth);

    navigate('/login');

  };

  return (

    <div className="w-[280px] bg-[#0f1725] border-r border-white/10 p-6 flex flex-col justify-between">

      <div>

        <h1 className="text-3xl font-black mb-10 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">

          Pearls CRM

        </h1>

        <div className="space-y-4">

          <button
            onClick={() =>
              navigate('/employee-dashboard')
            }
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all"
          >

            <LayoutDashboard className="w-5 h-5" />

            Dashboard

          </button>

          <button
            onClick={() =>
              navigate('/employee/tasks')
            }
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all"
          >

            <ClipboardList className="w-5 h-5" />

            Tasks

          </button>
          <button
  onClick={() =>
    navigate('/attendance')
  }
  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all"
>

  <Clock3 className="w-5 h-5" />

  Attendance

</button>

          <button
            onClick={() =>
              navigate('/employee/leads')
            }
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all"
          >

            <Users className="w-5 h-5" />

            Leads

          </button>

          <button
            onClick={() =>
              navigate('/employee/followups')
            }
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all"
          >

            <PhoneCall className="w-5 h-5" />

            Followups

          </button>

        </div>

      </div>

      <div>

        <div className="bg-white/5 rounded-2xl p-4 mb-4">

          <p className="text-sm text-gray-400">

            Logged in as

          </p>

          <h2 className="font-bold mt-1">

            {currentUser?.name ||
              'Employee'}

          </h2>

        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
        >

          <LogOut className="w-5 h-5" />

          Logout

        </button>

      </div>

    </div>

  );

}