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
    const [active, setActive] = useState(0);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

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
        <div className="text-black max-h-screen overflow-y-auto page-scroll w-full">

            {/* TOPBAR */}
            <div className="w-full bg-white border-b border-black/10 px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* LEFT */}
                <div>
                    <h1 className="text-xl md:text-2xl text-[#023167] font-bold">
                        Client Management
                    </h1>

                    <p className="text-gray-400 mt-0.5 text-xs md:text-sm">
                        Track and manage your clients
                    </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 flex-wrap">

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-semibold rounded-lg hover:bg-[#1d508b] transition-all shadow-sm shrink-0"
                    >
                        <Plus size={16} />
                        Add Client
                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
                        <Filter
                            size={18}
                            className='text-white'
                        />
                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
                        <Bell
                            size={18}
                            className='text-white'
                        />
                    </button>

                </div>

            </div>

            {/* BODY */}
            <div className="p-4 sm:p-6 md:p-8 bg-[#f3f0eb] min-h-screen">

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {stats.map((item, i) => (

                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white border border-black/10 p-4 sm:p-5 rounded-xl shadow-sm"
                        >

                            <div className="flex items-center justify-between mb-3">

                                <div className="bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center">

                                    <item.icon className="w-5 h-5 text-[#0b2b57]" />

                                </div>

                                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">

                                    ↑ 8.4%

                                </span>

                            </div>

                            <p className="text-xs sm:text-sm text-gray-500">
                                {item.title}
                            </p>

                            <h2 className="text-2xl sm:text-3xl font-bold text-[#0b2b57]">
                                {item.value}
                            </h2>

                        </motion.div>

                    ))}

                </div>

                {/* SUBHEADER & FILTERS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 md:mt-8 mb-4 border border-gray-200 bg-white p-3 sm:p-4 rounded-xl shadow-sm">

                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0b2b57]">
                            Client List
                        </h2>
                    </div>

                    {/* FILTER BUTTONS */}
                    <div className="flex flex-wrap gap-2">

                        {buttons.map((btn, index) => (

                            <button
                                key={index}
                                onClick={() => setActive(index)}
                                className={`
                                    px-3
                                    py-1.5
                                    text-xs
                                    sm:text-sm
                                    rounded-xl
                                    font-medium
                                    transition-all
                                    ${active === index
                                        ? "bg-[#2563a9] text-white"
                                        : "text-gray-500 hover:bg-[#2563a9] hover:text-white"
                                    }
                                `}
                            >

                                {btn}

                            </button>

                        ))}

                    </div>

                    {/* SEARCH */}
                    <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg w-full md:w-72">

                        <Search
                            size={16}
                            className="text-gray-500 shrink-0"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search clients..."
                            className="w-full outline-none text-sm bg-transparent text-gray-800"
                        />

                    </div>

                </div>

                {/* CLIENT CARDS */}
                {loading ? (<div className="w-full min-h-[300px] flex items-center justify-center"><LoadingPage /></div>) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >

                        {filteredClients.length > 0 ? (

                            filteredClients.map((p) => (

                                <div
                                    key={p._id}
                                    className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/clientDetails/${p._id}`)}
                                >

                                    {/* HEADER */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-[#0b2b57] truncate">
                                                {p.companyName}
                                            </h3>

                                            <p className="text-gray-500 text-xs sm:text-sm">
                                                {p.headquarters}
                                            </p>
                                        </div>

                                        <div className='flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2'>

                                            <div className="flex gap-2">

                                                <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded font-medium">

                                                    {p.status || "Pending"}

                                                </span>

                                                <span className="bg-green-100 text-green-600 text-xs px-2.5 py-1 rounded font-medium">

                                                    {p.priority || "No Priority"}

                                                </span>

                                            </div>

                                            <div className='text-xs text-gray-400'>
                                                <p>
                                                    Renewal Dec 2024
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    {/* DETAILS */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-gray-100 text-xs sm:text-sm">

                                        <div>

                                            <p className="text-gray-500 text-xs">
                                                PAID
                                            </p>

                                            <p className="font-semibold text-green-600">
                                                ₹ {formatNumber(p.paid || 0)}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500 text-xs">
                                                PENDING
                                            </p>

                                            <p className="font-semibold text-red-500">
                                                ₹ {formatNumber(p.pending || 0)}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500 text-xs">
                                                PROJECTS
                                            </p>

                                            <p className="font-semibold">
                                                2 Open
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-500 text-xs">
                                                HEALTH
                                            </p>

                                            <p className="font-semibold text-green-600">
                                                {p.health || "23%"}
                                            </p>

                                        </div>

                                    </div>

                                    {/* BOTTOM */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100 text-xs sm:text-sm">

                                        {/* MANAGERS */}
                                        <div className="flex items-center gap-3 flex-wrap">

                                            <h1 className="font-bold text-[#2563a9]">
                                                Account Managers :
                                            </h1>

                                            <div className="flex -space-x-2">

                                                {p.managers?.length > 0 ? (

                                                    p.managers.map((item, index) => (

                                                        <div
                                                            key={index}
                                                            className={`
                                                            relative
                                                            group
                                                            w-10
                                                            h-10
                                                            rounded-full
                                                            text-[11px]
                                                            cursor-pointer
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-white
                                                            font-bold
                                                            border-2
                                                            border-white
                                                            shadow-sm
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
                                                                -top-9
                                                                left-1/2
                                                                -translate-x-1/2
                                                                bg-black
                                                                text-white
                                                                text-xs
                                                                px-2.5
                                                                py-1
                                                                rounded-md
                                                                opacity-0
                                                                group-hover:opacity-100
                                                                transition-all
                                                                duration-200
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

                                                    <div className="text-gray-400 text-xs">
                                                        No Managers
                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                        {/* CONTRACT VALUE */}
                                        <div className="text-right sm:text-left">
                                            <span>Contract Value :</span>
                                            <span className="font-bold text-sm sm:text-base text-[#2563a9] ml-2">
                                                ₹ {formatNumber(p.budget || 0)}
                                            </span>
                                        </div>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <div className="bg-white p-8 rounded-xl text-center text-gray-500 border border-gray-200">
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