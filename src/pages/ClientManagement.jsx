import React, {
    useState,
    useEffect,
} from "react";

import {
    Plus,
    Search,
    Users,
    Briefcase,
    AlertCircle,
    Activity,
} from "lucide-react";

import { motion } from "framer-motion";

import CreateClients from "./CreateClients.jsx";
import AnimateModals from "../components/Dashboard/AnimateModals.jsx";

import useClients from "../Hooks/useclients.js";
import useTaskfilter from "../Hooks/useTaskfilter.js";
import useProject from "../Hooks/useProject.js";

import { formatNumber } from "../Utils/formatNumber.js";
import LoadingPage from "../components/Dashboard/Loading.jsx";

import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api.js";

export default function ClientManagement() {
    const {
        clients,
        loading,
        fetchClients,
    } = useClients();

    const {
        getAll: getAllProjects,
    } = useProject();

    const navigate = useNavigate();

    // =========================================================
    // STATES
    // =========================================================

    const [projects, setProjects] = useState([]);
    const [payments, setPayments] = useState({});

    // ADD CLIENT MODAL
    const [open, setOpen] = useState(false);

    // SEARCH
    const [search, setSearch] = useState("");

    // PRIORITY TAB
    const [active, setActive] = useState(0);

    // =========================================================
    // FETCH PROJECTS
    // =========================================================

    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const projectsData = await getAllProjects();

                setProjects(
                    Array.isArray(projectsData)
                        ? projectsData
                        : []
                );
            } catch (error) {
                console.error(
                    "Error fetching projects:",
                    error
                );

                setProjects([]);
            }
        };

        fetchAllProjects();
    }, [getAllProjects]);

    // =========================================================
    // FETCH PAYMENTS
    // =========================================================

    useEffect(() => {
        const fetchAllPayments = async () => {
            if (!clients.length) {
                setPayments({});
                return;
            }

            try {
                const paymentsData = {};

                await Promise.all(
                    clients.map(async (client) => {
                        try {
                            const response = await fetch(
                                apiUrl(
                                    `/payment?clientId=${client._id}`
                                )
                            );

                            if (response.ok) {
                                const data =
                                    await response.json();

                                paymentsData[client._id] =
                                    Array.isArray(data)
                                        ? data
                                        : [];
                            } else {
                                paymentsData[client._id] = [];
                            }
                        } catch (error) {
                            console.error(
                                `Error fetching payments for client ${client._id}:`,
                                error
                            );

                            paymentsData[client._id] = [];
                        }
                    })
                );

                setPayments(paymentsData);
            } catch (error) {
                console.error(
                    "Error fetching payments:",
                    error
                );

                setPayments({});
            }
        };

        fetchAllPayments();
    }, [clients]);

    // =========================================================
    // OPEN PROJECT COUNT
    // =========================================================

    const getOpenProjectsCount = (
        clientId,
        clientCompany
    ) => {
        return projects.filter((project) => {
            const projectClientId =
                project.clientId;

            const projectCompany =
                project.company;

            return (
                (
                    projectClientId === clientId ||
                    projectCompany === clientCompany
                ) &&
                project.status?.toLowerCase() !==
                    "completed"
            );
        }).length;
    };

    // =========================================================
    // PAID AMOUNT
    // =========================================================

    const getPaidAmount = (clientId) => {
        const clientPayments =
            payments[clientId] || [];

        return clientPayments
            .filter(
                (item) =>
                    String(item.status).toLowerCase() ===
                    "paid"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.budget || 0),
                0
            );
    };

    // =========================================================
    // PENDING AMOUNT
    // =========================================================

    const getPendingAmount = (clientId) => {
        const clientPayments =
            payments[clientId] || [];

        return clientPayments
            .filter(
                (item) =>
                    String(item.status).toLowerCase() ===
                    "pending"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.budget || 0),
                0
            );
    };

    // =========================================================
    // PRIORITY FILTER BUTTONS
    // =========================================================

    const buttons = [
        "All",
        "Low",
        "Medium",
        "High",
    ];

    const filteredClients = useTaskfilter(
        clients,
        search,
        buttons[active]
    );

    // =========================================================
    // AVERAGE HEALTH SCORE
    // =========================================================

    const averageHealthScore = clients.length
        ? Math.round(
              clients.reduce(
                  (total, client) =>
                      total +
                      Number(
                          client.healthScore ??
                              client.health ??
                              0
                      ),
                  0
              ) / clients.length
          )
        : 0;

    // =========================================================
    // STATS
    // =========================================================

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
                    (total, client) =>
                        total +
                        Number(client.budget || 0),
                    0
                )
            ),
            icon: Briefcase,
        },
        {
            title: "Overdue Invoice",
            value: clients.filter((client) =>
                client.dueDate
                    ? new Date(client.dueDate) <
                      new Date()
                    : false
            ).length,
            icon: AlertCircle,
        },
        {
            title: "Avg Health Score",
            value: `${averageHealthScore}%`,
            icon: Activity,
        },
    ];

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="text-black max-h-screen overflow-y-auto no-scrollbar">

            {/* =====================================================
                TOPBAR
            ====================================================== */}

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

                <div className="flex items-center gap-3">

                    {/* ADD CLIENT */}

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300"
                    >
                        <Plus size={16} />
                        Add Client
                    </button>

                </div>
            </div>

            {/* =====================================================
                BODY
            ====================================================== */}

            <div className="p-8 bg-[#f3f0eb] min-h-screen">

                {/* =================================================
                    STATS
                ================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {stats.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={index}
                                whileHover={{
                                    scale: 1.03,
                                }}
                                className="bg-white border border-black/10 p-4 rounded-xl"
                            >
                                <div className="flex items-center justify-between mb-3">

                                    <div className="bg-gray-100 rounded w-10 h-10 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-[#0b2b57]" />
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
                        );
                    })}

                </div>

                {/* =================================================
                    CLIENT LIST HEADER
                ================================================== */}

                <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">

                    {/* TITLE */}

                    <div>
                        <h2 className="text-lg font-bold text-[#0b2b57]">
                            Client List
                        </h2>
                    </div>

                    {/* PRIORITY BUTTONS */}

                    <div className="flex gap-3">

                        {buttons.map(
                            (button, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() =>
                                        setActive(index)
                                    }
                                    className={`
                                        px-4
                                        rounded-xl
                                        font-medium
                                        transition-all

                                        ${
                                            active === index
                                                ? "bg-[#2563a9] text-white"
                                                : "text-gray-400 hover:bg-[#2563a9] hover:text-white"
                                        }
                                    `}
                                >
                                    {button}
                                </button>
                            )
                        )}

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
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search clients..."
                            className="w-full outline-none text-sm bg-gray-200"
                        />

                    </div>

                </div>

                {/* =================================================
                    CLIENT CARDS
                ================================================== */}

                {loading ? (
                    <LoadingPage />
                ) : (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="space-y-4"
                    >

                        {filteredClients.length > 0 ? (
                            filteredClients.map(
                                (client) => (
                                    <div
                                        key={client._id}
                                        className="bg-white border border-black/10 p-5 rounded cursor-pointer hover:shadow-md transition"
                                        onClick={() =>
                                            navigate(
                                                `/clientDetails/${client._id}`
                                            )
                                        }
                                    >

                                        {/* HEADER */}

                                        <div className="flex justify-between items-center">

                                            <div>
                                                <h3 className="text-lg font-bold text-[#0b2b57]">
                                                    {
                                                        client.companyName
                                                    }
                                                </h3>

                                                <p className="text-gray-500 text-sm">
                                                    {
                                                        client.headquarters
                                                    }
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-center">

                                                <div className="flex gap-2">

                                                    <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded">
                                                        {client.status ||
                                                            "Pending"}
                                                    </span>

                                                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded">
                                                        {client.priority ||
                                                            "No Priority"}
                                                    </span>

                                                </div>

                                                <div className="text-sm text-gray-400">
                                                    <p>
                                                        Renewal{" "}
                                                        {client.renewalDate
                                                            ? new Date(
                                                                  client.renewalDate
                                                              ).toLocaleDateString(
                                                                  "en-US",
                                                                  {
                                                                      month: "short",
                                                                      year: "numeric",
                                                                  }
                                                              )
                                                            : "N/A"}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                        {/* DETAILS */}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">

                                            {/* PAID */}

                                            <div>
                                                <p className="text-gray-500">
                                                    PAID
                                                </p>

                                                <p className="font-semibold text-green-600">
                                                    ₹{" "}
                                                    {formatNumber(
                                                        getPaidAmount(
                                                            client._id ||
                                                                client.id
                                                        )
                                                    )}
                                                </p>
                                            </div>

                                            {/* PENDING */}

                                            <div>
                                                <p className="text-gray-500">
                                                    PENDING
                                                </p>

                                                <p className="font-semibold text-red-500">
                                                    ₹{" "}
                                                    {formatNumber(
                                                        getPendingAmount(
                                                            client._id ||
                                                                client.id
                                                        )
                                                    )}
                                                </p>
                                            </div>

                                            {/* PROJECTS */}

                                            <div>
                                                <p className="text-gray-500">
                                                    PROJECTS
                                                </p>

                                                <p className="font-semibold">
                                                    {getOpenProjectsCount(
                                                        client._id ||
                                                            client.id,
                                                        client.companyName
                                                    )}{" "}
                                                    Open
                                                </p>
                                            </div>

                                            {/* HEALTH */}

                                            <div>
                                                <p className="text-gray-500">
                                                    HEALTH
                                                </p>

                                                <p className="font-semibold text-green-600">
                                                    {client.healthScore ??
                                                        client.health ??
                                                        0}
                                                    %
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

                                                    {client.managers?.length >
                                                    0 ? (
                                                        client.managers.map(
                                                            (
                                                                manager,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        index
                                                                    }
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

                                                                        ${
                                                                            index ===
                                                                            0
                                                                                ? "bg-purple-800"
                                                                                : index ===
                                                                                  1
                                                                                ? "bg-green-500"
                                                                                : "bg-purple-600"
                                                                        }
                                                                    `}
                                                                >
                                                                    {manager
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}

                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                                                        {manager ||
                                                                            "Unknown Manager"}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )
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
                                                    ₹{" "}
                                                    {formatNumber(
                                                        client.budget ||
                                                            0
                                                    )}
                                                </span>
                                            </h1>

                                        </div>

                                    </div>
                                )
                            )
                        ) : (
                            <div className="bg-white p-10 rounded text-center text-gray-500">
                                No Clients Found
                            </div>
                        )}

                    </motion.div>
                )}
            </div>

            {/* =====================================================
                CREATE CLIENT MODAL
            ====================================================== */}

            {open && (
                <AnimateModals>
                    <CreateClients
                        onClose={() =>
                            setOpen(false)
                        }
                        fetchClients={
                            fetchClients
                        }
                    />
                </AnimateModals>
            )}

        </div>
    );
}