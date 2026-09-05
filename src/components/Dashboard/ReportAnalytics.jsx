import { Check, Clock4, Mail, MoveUp, Phone } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from "recharts";
import { apiUrl } from '../../config/api.js';


const Hotleads = () => {
    const [selectedPeriod, setSelectedPeriod] =
        useState("thismonth");
    const [followups, setFollowups] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchFollowups = async () => {
            try {
                const response = await fetch(apiUrl('/followups'));
                if (!response.ok) throw new Error('Failed to fetch followups');
                const data = await response.json();
                setFollowups(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching followups:', error);
                setFollowups([]);
            }
        };

        const fetchTasks = async () => {
            try {
                const response = await fetch(apiUrl('/tasks'));
                if (!response.ok) throw new Error('Failed to fetch tasks');
                const data = await response.json();
                setTasks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
            }
        };

        const fetchLeads = async () => {
            try {
                const response = await fetch(apiUrl('/leads'));
                if (!response.ok) throw new Error('Failed to fetch leads');
                const data = await response.json();
                setLeads(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching leads for funnel:', error);
                setLeads([]);
            }
        };

        const fetchPayments = async () => {
            try {
                const response = await fetch(apiUrl('/payment'));
                if (!response.ok) throw new Error('Failed to fetch payments');
                const data = await response.json();
                setPayments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching payments:', error);
                setPayments([]);
            }
        };

        fetchFollowups();
        fetchTasks();
        fetchLeads();
        fetchPayments();
    }, []);

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const thisWeekFollowups = followups.filter((followup) => {
        const rawDate = followup?.createdAt || followup?.date || followup?.nextFollowupDate;
        if (!rawDate) return false;
        const date = new Date(rawDate);
        return !Number.isNaN(date.getTime()) && date >= oneWeekAgo && date <= now;
    });

    const emailFollowupsSent = thisWeekFollowups.filter((followup) =>
        /email|mail/i.test(followup?.type || '') || /email|mail/i.test(followup?.notes || '')
    ).length;

    const salesCallsLogged = thisWeekFollowups.filter((followup) =>
        /call|phone|sales/i.test(followup?.type || '') || /call|phone|sales/i.test(followup?.notes || '')
    ).length;

    const overdueFollowups = thisWeekFollowups.filter((followup) => {
        const isCompleted = Boolean(followup?.isCompleted) || String(followup?.status || '').toLowerCase() === 'completed';
        const nextFollowupDate = followup?.nextFollowupDate || followup?.date;
        if (isCompleted || !nextFollowupDate) return false;
        const date = new Date(nextFollowupDate);
        return !Number.isNaN(date.getTime()) && date < now;
    }).length;

    const completedFollowups = thisWeekFollowups.filter((followup) =>
        Boolean(followup?.isCompleted) || String(followup?.status || '').toLowerCase() === 'completed'
    ).length;

    const clampPercent = (value) => Math.min(100, Math.max(0, value));

    const emailRate = thisWeekFollowups.length
        ? clampPercent(Math.round((emailFollowupsSent / thisWeekFollowups.length) * 100))
        : 0;

    const salesRate = thisWeekFollowups.length
        ? clampPercent(Math.round((salesCallsLogged / thisWeekFollowups.length) * 100))
        : 0;

    const overdueRate = thisWeekFollowups.length
        ? clampPercent(Math.round((overdueFollowups / thisWeekFollowups.length) * 100))
        : 0;

    const followUpRate = thisWeekFollowups.length
        ? clampPercent(Math.round((completedFollowups / thisWeekFollowups.length) * 100))
        : 0;

    const taskCount = tasks.length;
    const completedTasks = tasks.filter((task) => String(task?.status || '').toLowerCase() === 'completed').length;
    const taskCompletionRate = taskCount ? clampPercent(Math.round((completedTasks / taskCount) * 100)) : 0;

    const followUpStats = [
        {
            icon: Mail,
            title: "E-mail Follow-ups Sent",
            avg: `Week total: ${thisWeekFollowups.length}`,
            percentage: emailRate,
            total: emailFollowupsSent
        },
        {
            icon: Phone,
            title: "Sales call logged",
            avg: `Calls this week: ${salesCallsLogged}`,
            percentage: salesRate,
            total: salesCallsLogged
        },
        {
            icon: Clock4,
            title: "Overdue follow-ups",
            avg: "Past due follow-ups",
            percentage: overdueRate,
            total: overdueFollowups
        },
        {
            icon: Check,
            title: "Follow ups Completed",
            avg: `${followUpRate}% on-time rate this week`,
            percentage: followUpRate,
            total: completedFollowups
        }
    ];

    const handleFullReport = () => {
        const summaryRows = [
            ["Section", "Metric", "Value"],
            ["Follow-up", "This week total", thisWeekFollowups.length],
            ["Follow-up", "Email follow-ups sent", emailFollowupsSent],
            ["Follow-up", "Sales calls logged", salesCallsLogged],
            ["Follow-up", "Overdue follow-ups", overdueFollowups],
            ["Follow-up", "Completed follow-ups", completedFollowups],
            ["Follow-up", "Completion rate", `${followUpRate}%`],
            ["Task", "Total tasks", taskCount],
            ["Task", "Completed tasks", completedTasks],
            ["Task", "Completion rate", `${taskCompletionRate}%`],
        ];

        const csv = summaryRows
            .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "crm-full-report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const leadFunnelStages = [
        { name: "New Leads", key: "new", color: "bg-purple-500" },
        { name: "contacted", key: "contacted", color: "bg-orange-500" },
        { name: "Qualified", key: "qualified", color: "bg-yellow-500" },
        { name: "Proposal", key: "proposal", color: "bg-green-500" },
        { name: "converted", key: "converted", color: "bg-green-500" },
    ];

    const leadStageCounts = leadFunnelStages.reduce((acc, stage) => {
        acc[stage.key] = leads.filter((lead) => {
            const status = String(lead?.status || "").trim().toLowerCase();
            if (stage.key === "new") {
                return status === "new" || status === "lead" || status === "fresh" || status === "";
            }
            if (stage.key === "contacted") {
                return status === "contacted" || status === "follow-up" || status === "in progress" || status === "pending";
            }
            if (stage.key === "qualified") {
                return status === "qualified" || status === "warm" || status === "active";
            }
            if (stage.key === "proposal") {
                return status === "proposal" || status === "negotiation" || status === "quote";
            }
            if (stage.key === "converted") {
                return status === "converted" || status === "won" || status === "closed" || status === "customer";
            }
            return false;
        }).length;
        return acc;
    }, {});

    const leadFunnelData = leadFunnelStages.map((stage) => {
        const count = leadStageCounts[stage.key] || 0;
        const maxCount = Math.max(1, ...Object.values(leadStageCounts));
        const width = leads.length ? Math.max(8, (count / maxCount) * 100) : 0;
        return { ...stage, count, width };
    });

    const validPayments = payments.filter((payment) =>
        String(payment?.status || '').toLowerCase() !== 'cancelled'
    );
    const monthdata = Array.from({ length: 12 }, (_, monthIndex) => ({
        month: new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'short' }),
        revenue: validPayments
            .filter((payment) => {
                const date = new Date(payment?.issuedDate || payment?.createdAt);
                return date.getFullYear() === new Date().getFullYear() && date.getMonth() === monthIndex;
            })
            .reduce((total, payment) => total + (Number(payment?.budget) || 0), 0),
    }));

    const currentYear = new Date().getFullYear();
    const yeardata = Array.from({ length: 6 }, (_, index) => {
        const year = currentYear - 5 + index;
        return {
            year: String(year),
            revenue: validPayments
                .filter((payment) => new Date(payment?.issuedDate || payment?.createdAt).getFullYear() === year)
                .reduce((total, payment) => total + (Number(payment?.budget) || 0), 0),
        };
    });

    return (

        <div className='min-h-screen bg-[#f3f0eb] '>

            <div >
                <div className='flex gap-10 items-center justify-between bg-[#f3f0eb]'>

                    <div className="flex flex-col items-center  justify-between h-[400px] w-[550px] bg-white  ml-8 rounded-xl border mt-8">
                        <div className="flex gap-18 items-center   justify-between w-full mb-4 mt-2 p-2">
                            <div>
                                <h2 className="text-xl font-bold  text-blue-700 tracking-wide">
                                    Monthly revenue overview
                                </h2>
                                <p className="text-sm text-gray-400">Track your clients revenue</p>
                            </div>
                            <div>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="bg-gray-200 text-black/80 rounded mr-2">
                                    <option value="thismonth"> This month</option>
                                    <option value="thisyear"> This year</option>
                                </select>
                            </div>
                        </div>

                        
                        <ResponsiveContainer width="100%" height="100%" >

                            <BarChart data={selectedPeriod === "thismonth" ? monthdata : yeardata}>

                                <CartesianGrid strokeDasharray="3 3" />
                                {selectedPeriod === "thismonth" ? <XAxis dataKey="month" /> : <XAxis dataKey="year" />}

                                <YAxis />
                                <Tooltip />


                                {/* Revenue → Blue */}
                                <Bar
                                    dataKey="revenue"
                                    fill="#ddead1"
                                    radius={[8, 8, 0, 0]}
                                />

                            </BarChart>

                        </ResponsiveContainer>
                        
                    </div>
                    <div
                        className="  rounded-2xl p-2 mr-2 "
                    >

                        {/* Main Content */}
                        <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-between relative  w-[300px] h-[390px] mt-6">

                            <div className='flex gap-12 items-center justify-between '>
                                <h1 className='text-blue-700 font-bold text-xl tracking-wide'>LEAD FUNNEL</h1>
                                <button
                                    onClick={handleFullReport}
                                    className='text-blue-700 underline tracking-wide cursor-pointer'>Full Report</button>

                            </div>
                            <div className="w-full   ">

                                {leadFunnelData.map((item, index) => (

                                    <div key={index} className="mb-6">

                                        <div className="flex justify-between mb-1 ">

                                            <span className="text-md text-black">
                                                {item.name}
                                            </span>

                                            <span className="text-black text-md">
                                                {item.count}
                                            </span>

                                        </div>

                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                                            <div
                                                className={`h-3 ${item.color} rounded-full`}
                                                style={{ width: `${item.width}%` }}
                                            />

                                        </div>

                                    </div>

                                ))}

                            </div>
                        </div>

                    </div>
                </div>



                <div className='flex  gap-10 items-center justify-between mt-8 bg-[#f3f0eb]  relative'>


                    {/** Follow up metrics */}
                    <div className='flex flex-col items-start justify-center gap-4 col-span-2'>
                        <div className='flex gap-10 items-center justify-between bg-white p-2 rounded-xl ml-8 border w-[550px]  mt-2'>
                            <h2 className='text-black font-bold text-sm md:text-md '>
                                FOLLOW-UP METRICS - This Week
                            </h2>

                            <button 
                                onClick={handleFullReport}
                                className='text-blue-700 underline cursor-pointer tracking-wide'>
                                Full Report
                            </button>
                        </div>
                        {followUpStats.map((ev, i) => (
                            <div
                                key={i}
                                className=' relative flex items-start justify-normal bg-white text-blue-950 gap-4 p-4 w-[550px] ml-8 rounded '>
                                <div className='w-10 h-10 text-blue-800 bg-blue-300 rounded-full p-2.5'>
                                    <ev.icon size={20} />
                                </div>
                                <div className='flex flex-col items-center justify-start'>
                                    <h3 className='text-blue-950 font-bold text-sm md:text-lg '>{ev.title}</h3>
                                    <p className='text-gray-400 text-sm tracking-tighter '>{ev.avg}</p>
                                </div>
                                <div className='ml-40 absolute top-4 right-1 '>
                                    <div className='flex  items-center justify-end  rounded-xl px-1 bg-green-400 text-blue-950'>
                                        <div></div>
                                        <div className='w-2 h-2 rounded-full bg-blue-950 mr-2'> </div>
                                        <MoveUp size={10} />
                                        <p>{ev.percentage}%</p>
                                    </div>
                                    <p className='text-blue-950 font-bold ml-4'>{ev.total}</p>
                                </div>
                            </div>
                        ))}


                    </div>
                    <div className=' flex flex-col  p-2 rounded-xl absolute right-2 top-0  '>
                        <div className='flex justify-between  bg-white w-[300px] rounded-xl p-2 '>
                            <h1 className='text-blue-700 font-bold text-xl tracking-wide'>Top Performers</h1>
                            <button
                                onClick={handleFullReport}
                                className='text-blue-700 underline tracking-wide cursor-pointer'>Full Report</button>

                        </div>
                        <div className=' flex flex-col gap-2 bg-white w-[300px] rounded-lg  mt-4 p-2'>
                            <div className='flex justify-between'>
                                <h3 className='text-blue-950 font-bold'>Suji</h3>
                                <div className='flex gap-2 items-center justify-end  rounded-xl px-1 bg-green-400 text-blue-950'>
                                    <div></div>
                                    <div className='w-2 h-2 rounded-full bg-blue-950'> </div>
                                    <MoveUp size={10} />
                                    <p>32%</p>
                                </div>

                            </div>
                            <div className='flex justify-between items-center'>
                                <h3 className='text-blue-950'>Task Score: <span className='text-blue-950 font-bold'>13/20</span> </h3>
                                <div className='bg-gray-300 rounded-xl w-[150px] h-2'>
                                    <div className='bg-blue-800 h-full rounded-xl' style={{ width: "30%" }}>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>


        </div>
    )
}
export default Hotleads