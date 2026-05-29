import React, {
    useState
} from 'react';

import {
    Plus,
    Search,
    Users,
    Briefcase,
    AlertCircle,
    Activity,
    Filter,
    Bell
} from 'lucide-react';

import { motion } from 'framer-motion';

import CreateClients from './CreateClients.jsx';
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';

import useClients from "../Hooks/useclients.js";
import useTaskfilter from '../Hooks/useTaskfilter.js';

import { formatNumber } from '../Utils/formatNumber.js';
import LoadingPage from '../components/Dashboard/Loading.jsx';
import { Navigate, useNavigate } from 'react-router-dom';


export default function ClientManagement() {

    const { clients, loading } = useClients();
    console.log(clients);
   

    const [active, setActive] = useState(0);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const navigate=useNavigate();

    const buttons = ["All", "Low", "Medium", "High"];

    const filteredClients =
        useTaskfilter(
            clients,
            search,
            buttons[active]
        );

    // STATS

    const stats = [
        {
            title: "Total Clients",
            value: clients.length,
            icon: Users,
        },
        {
            title: "Portfolio Value",
            value: formatNumber(
                clients.reduce(
                    (acc, client) =>
                        acc + Number(client.budget || 0),
                    0
                )
            ),
            icon: Briefcase,
        },
        {
            title: "Overdue Invoice",
            value: clients.filter((client) =>
                client.dueDate
                    ? new Date(client.dueDate) < new Date()
                    : false
            ).length,
            icon: AlertCircle,
        },
        {
            title: "Avg Health Score",
            value: "24%",
            icon: Activity,
        }
    ];

    return (

        <div className="text-black">

            {/* TOPBAR */}

            <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

                {/* LEFT */}

                <div>

                    <h1 className="text-2xl text-[#023167] font-bold">
                        Client Management
                    </h1>

                    <p className="text-gray-400 mt-1 text-sm">
                        Track and manage your clients
                    </p>

                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
                    >

                        <Plus size={16} />

                        Add Client

                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">

                        <Filter
                            size={18}
                            className='text-white'
                        />

                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">

                        <Bell
                            size={18}
                            className='text-white'
                        />

                    </button>

                </div>

            </div>

            {/* BODY */}

            <div className="p-8 bg-[#f3f0eb] min-h-screen">

                {/* STATS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {stats.map((item, i) => (

                        <motion.div
                            key={i}
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

                {/* HEADER */}

                <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">

                    <div>

                        <h2 className="text-lg font-bold text-[#0b2b57]">
                            Client List
                        </h2>

                    </div>

                    {/* FILTER BUTTONS */}

                    <div className="flex gap-3">

                        {buttons.map((btn, index) => (

                            <button
                                key={index}
                                onClick={() => setActive(index)}
                                className={`
                                    px-4
                                    rounded-xl
                                    font-medium
                                    transition-all
                                    ${active === index
                                        ? "bg-[#2563a9] text-white"
                                        : "text-gray-400 hover:bg-[#2563a9] hover:text-white"
                                    }
                                `}
                            >

                                {btn}

                            </button>

                        ))}

                    </div>

                    {/* SEARCH */}

                    <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-[350px]">

                        <Search
                            size={16}
                            className="text-black"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search clients..."
                            className="w-full outline-none text-sm bg-gray-200"
                        />

                    </div>

                </div>

                {/* CLIENT CARDS */}

                {loading ? (<div><LoadingPage /></div>) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >

                        {filteredClients.length > 0 ? (

                            filteredClients.map((p) => (

                                <div
                                    key={p._id}
                                    className="bg-white border border-black/10 p-5 rounded"
                                    onClick={()=>navigate(`/clientDetails/${p._id}`)}
                                >

                                    {/* HEADER */}

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <h3 className="text-lg font-bold text-[#0b2b57]">
                                                {p.companyName}
                                            </h3>

                                            <p className="text-gray-500 text-sm">
                                                {p.headquarters}
                                            </p>

                                        </div>

                                        <div className='flex flex-col items-center'>

                                            <div className="flex gap-2">

                                                <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded">

                                                    {p.status || "Pending"}

                                                </span>

                                                <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded">

                                                    {p.priority || "No Priority"}

                                                </span>

                                            </div>

                                            <div className='text-sm text-gray-400'>

                                                <p>
                                                    Renewal Dec 2024
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* DETAILS */}

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">

                                        <div>

                                            <p className="text-gray-500">
                                                PAID
                                            </p>

                                            <p className="font-semibold text-green-600">
                                                ₹ {formatNumber(p.paid || 0)}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500">
                                                PENDING
                                            </p>

                                            <p className="font-semibold text-red-500">
                                                ₹ {formatNumber(p.pending || 0)}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500">
                                                PROJECTS
                                            </p>

                                            <p className="font-semibold">
                                                2 Open
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500">
                                                HEALTH
                                            </p>

                                            <p className="font-semibold text-green-600">
                                                {p.health || "23%"}
                                            </p>

                                        </div>

                                    </div>

                                    {/* BOTTOM */}

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-10">

                                        {/* MANAGERS */}

                                        <div className="flex items-center gap-4 flex-wrap">

                                            <h1 className="text-xl font-bold text-[#2563a9]">

                                                Account Managers :

                                            </h1>

                                            <div className="flex -space-x-3">

                                                {p.managers?.length > 0 ? (

                                                    p.managers.map((item, index) => (

                                                        <div
                                                            key={index}
                                                            className={`
                                                            relative
                                                            group
                                                            w-14
                                                            h-14
                                                            rounded-full
                                                            text-[12px]
                                                            cursor-pointer
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-white
                                                            font-bold
                                                            border-4
                                                            border-white
                                                            ${index === 0
                                                                    ? "bg-purple-800"
                                                                    : index === 1
                                                                        ? "bg-green-500"
                                                                        : "bg-purple-600"
                                                                }
                                                        `}
                                                        >

                                                            {item?.charAt(0).toUpperCase()}

                                                            {/* TOOLTIP */}

                                                            <div
                                                                className="
                                                                absolute
                                                                -top-10
                                                                left-1/2
                                                                -translate-x-1/2
                                                                bg-black
                                                                text-white
                                                                text-xs
                                                                px-3
                                                                py-1
                                                                rounded-md
                                                                opacity-0
                                                                group-hover:opacity-100
                                                                transition-all
                                                                duration-300
                                                                whitespace-nowrap
                                                                pointer-events-none
                                                                z-50
                                                                shadow-lg
                                                            "
                                                            >

                                                                {item || "Unknown Manager"}

                                                            </div>

                                                        </div>

                                                    ))

                                                ) : (

                                                    <div className="text-gray-400 text-sm">

                                                        No Managers

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                        {/* CONTRACT VALUE */}

                                        <h1 className="text-md lg:text-lg">

                                            Contract Value :

                                            <span className="font-bold text-lg text-[#2563a9] ml-2">

                                                ₹ {formatNumber(p.budget || 0)}

                                            </span>

                                        </h1>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <div className="bg-white p-10 rounded text-center text-gray-500">

                                No Clients Found

                            </div>

                        )}

                    </motion.div>
                )}

            </div>

            {/* MODAL */}

            {open && (

                <AnimateModals>

                    <CreateClients
                        onClose={() => setOpen(false)}
                    />

                </AnimateModals>

            )}

        </div>

    );

}