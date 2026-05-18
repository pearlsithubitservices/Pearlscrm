
import React, {
  useState,
  useEffect
} from 'react';

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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';


export default function ClientManagement() {

  const [active, setActive] = useState(0);
  const buttons = ["All", "Sales", "Engineering", "Design"];
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]=useState(true);

  //PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = employees?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(employees?.length / filesPerPage);

  const stats = [
    {
      title: "Total Employees",
      value: "50",
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


  // EMPLOYEES

  useEffect(() => {
    const fetchEmployees =
      async () => {

        try {

          const snapshot =
            await getDocs(
              collection(db, 'employees')
            );

          const employeeList = [];

          snapshot.forEach((doc) => {

            employeeList.push({
              id: doc.id,
              ...doc.data(),
            });

          });

          setEmployees(employeeList);

        } catch (error) {

          console.log(error);

        }

        finally{
          setLoading(false);
        }


      };

    fetchEmployees();


  }, []);





  return (
    <div className="text-black">

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
            onClick={() => navigate('/create-client')}
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
              initial={{opacity:0, y:50}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.6, ease:easeOut}}
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
          <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-[350px]">

            <Search size={16} className="text-black" />

            <input
              placeholder="Search project..."
              className="w-full outline-none text-sm bg-gray-200"
            />

          </div>

        </div>

        {/* PROJECT CARDS */}

        {loading ?
          <div className='w-full h-screen items-center'>
            <LoadingPage />
          </div> :
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">

            {currentFiles.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-black/10 p-5 rounded"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="text-lg font-bold text-[#0b2b57]">
                      {p.name || "No Name"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Role: {p.role || "No Employee"}
                    </p>
                  </div>

                  <div className='flex flex-col items-center'>
                    <div className="flex gap-2">
                      <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded">
                        {p.status || "Active"}
                      </span>

                      <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded">
                        {p.type || "AtRisk"}
                      </span>
                    </div>

                  </div>

                </div>

                {/* DETAILS */}
                <div className=" flex  gap-8 mt-4 text-sm">

                  <div className="flex flex-col md:flex-row md:items-center gap-5">

                    <h1 className="text-xl text-yellow-600 min-w-fit">
                      Performance
                    </h1>

                    <div className="w-[500px] h-2 bg-gray-200 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: "60%",
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-blue-500 rounded-full"
                      />

                    </div>

                  </div>
                  <div className='ml-40 flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <MessageSquareText size={18} className='text-gray-400' /><p>2</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Paperclip size={18} className='text-gray-400' /><p>2</p>
                    </div>
                  </div>
                </div>

                {/** Bottom */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ">

                  <div className="flex items-center  flex-wrap gap-3">

                    <h1 className="text-xl font-bold text-black">
                      Task Score:
                    </h1>

                    <div className="font-bold  text-[#2563a9]">

                      13/15

                    </div>

                  </div>

                  <h1 className="text-md lg:text-lg">

                    <div className='flex items-center font-bold text-black'><Pin size={20} className='rotate-45' /></div>

                  </h1>

                </div>

              </div>
            ))}

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
    </div>
  );


}
