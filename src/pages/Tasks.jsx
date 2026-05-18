import React, {
  useState,
  useEffect
} from 'react';

import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  User2,
  Bell,
  Filter,
  TrendingUp,
  CheckCheck,
  CalendarArrowDown,
  Calendar1,
  MessageSquareText,
  Paperclip,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';

export default function Tasks() {
  const [tasks, setTasks] =
    useState([]);


  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = tasks.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(tasks.length / filesPerPage);


  const today = new Date();

  const [active, setActive] = useState(0);

  const buttons = ["All", "High", "Medium", "Low"];

  const navigate = useNavigate();


  console.log(tasks);
  const [search, setSearch] =
    useState('');
  const [employees, setEmployees] =
    useState([]);

  useEffect(() => {

    // TASKS REALTIME

    const unsubscribe =
      onSnapshot(

        collection(db, 'tasks'),

        (snapshot) => {

          const taskList = [];

          snapshot.forEach((doc) => {

            taskList.push({
              id: doc.id,
              ...doc.data(),
            });

          });

          setTasks(taskList);

        }

      );



    // EMPLOYEES

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
          setLoading(false);             //SetLoading false stop loading
        }

      };

    fetchEmployees();

    return () => unsubscribe();

  }, []);

 

  const getStatusStyle = (
    status
  ) => {

    switch (status) {

      case 'Completed':

        return 'bg-green-100 text-green-700';

      case 'In Progress':

        return 'bg-blue-100 text-blue-700';

      default:

        return 'bg-orange-100 text-orange-700';

    }

  };

  const filteredTasks =
    tasks.filter((task) =>

      task.company
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      task.assignedEmployee
        ?.toLowerCase()
        .includes(search.toLowerCase())
        .includes(
          search.toLowerCase()
        )

    );

  const stats = [
    { icon: User2, label: "Total Tasks", value: 50 },
    { icon: TrendingUp, label: "In Progress", value: 48 },
    { icon: CheckCheck, label: "Completed", value: 12 },
    { icon: CalendarArrowDown, label: "Overdue", value: 24 },
  ];





  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex  items-center justify-between bg-white p-4 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-[#023167] ">Tasks Management</h2>
            <p className="text-[10px] ml-6 text-gray-500">
              Track and manage your Tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/create-lead')}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
            >
              <Plus size={16} />
              Add Tasks
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Filter size={18} className='text-white' />
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Bell size={18} className='text-white' />
            </button>

          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6 bg-[#f3f0eb]">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl border"
              >
                <div className='bg-gray-200  rounded w-8 h-8'>
                  <s.icon className="w-8 h-8 text-black p-2" />
                </div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <h2 className="text-2xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}

          </div>

          {/* TASK HEADER */}
          <div className="mt-6 bg-white p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className=" font-bold text-xl text-[#0b2b57]"  >
              <p>Tasks List</p>
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

            <div className="flex items-center border bg-gray-200 rounded px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-black" />
              <input
                className="ml-2 w-full outline-none text-sm bg-gray-200"
                placeholder="Search Lead.."
              />
            </div>

          </div>

          {/* TASK LIST */}
          <div className="space-y-5 mt-5">

            {loading ?
              <div className='h-screen '>
                <LoadingPage />
              </div> :
              currentFiles?.map((task, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5 md:p-7
                "
                >

                  {/* TOP */}

                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                    {/* LEFT */}

                    <div>

                      <h1 className="text-sm md:text-xl font-bold text-[#082f57]">
                        {task.assignedEmployee
                        }
                      </h1>

                      <p className="mt-1 text-lg md:text-xl">
                        {task.title || " Redesign onboarding flow for enterprise clients"}
                      </p>

                    </div>

                    {/* RIGHT */}

                    <div className="flex flex-col items-start xl:items-end gap-4">

                      <div className="flex items-center gap-3 flex-wrap">

                        <div
                          className={`
                          ${task.statusColor}
                          px-4
                          py-2
                          rounded-full
                          text-sm
                          bg-blue-100
                          text-blue-500
                        `}
                        >
                          ● {task.status}
                        </div>

                        <div
                          className={`
                          ${task.priorityColor}
                          px-4
                          py-2
                          rounded-full
                          text-sm
                          bg-red-200
                          text-red-600
                        `}
                        >
                          ● {task.priority}
                        </div>

                      </div>

                      <p className="text-gray-500 text-md mr-2">
                        Assigned by : Ragavi
                      </p>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div>

                    <div className="flex flex-col md:flex-row md:items-center gap-5">

                      <h1 className="text-xl text-yellow-600 min-w-fit">
                        Overall progress
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

                  </div>

                  {/* BOTTOM */}

                  <div className="flex flex-wrap items-center justify-end gap-5  text-gray-500">

                    <div
                      className={`
                      flex items-center gap-2 text-lg
                      ${task.dueDate > today
                          ? "text-orange-500"
                          : "text-gray-500"
                        }
                    `}
                    >

                      <Calendar1 size={18} />
                      {task.dueDate || "0000-00-00"}

                    </div>

                    <div className="flex items-center gap-2 text-lg">

                      <MessageSquareText size={18} />
                      4

                    </div>

                    <div className="flex items-center gap-2 text-lg">

                      <Paperclip size={18} />
                      2

                    </div>

                  </div>

                </motion.div>

              ))}

          </div>
          {/**PAGINATION */}
          {loading ? " " :
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          }
        </div>
      </div>
    </div>
  );

}