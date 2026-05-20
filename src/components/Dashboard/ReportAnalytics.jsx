import { Check, Clock4, Mail, MoveUp, Phone } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from "recharts";


const Hotleads = () => {
    const [selectedPeriod, setSelectedPeriod] =
        useState("thismonth");
    const monthdata = [
        { month: "Jan", revenue: 20000, target: 15000 },
        { month: "Feb", revenue: 30000, target: 25000 },
        { month: "Mar", revenue: 25000, target: 20000 },
        { month: "Apr", revenue: 45000, target: 35000 },
        { month: "May", revenue: 35000, target: 30000 },
        { month: "Jun", revenue: 50000, target: 40000 }
    ];

    const yeardata = [
        { year: "2020", revenue: 250000, target: 220000 },
        { year: "2021", revenue: 320000, target: 300000 },
        { year: "2022", revenue: 410000, target: 380000 },
        { year: "2023", revenue: 530000, target: 500000 },
        { year: "2024", revenue: 620000, target: 580000 },
        { year: "2025", revenue: 750000, target: 700000 }
    ];

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

                                {/* Target → Red */}
                                <Bar
                                    dataKey="target"
                                    fill="#2563a9"
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
                                <button className='text-blue-700 underline tracking-wide cursor-pointer'>Full Report</button>

                            </div>
                            <div className="w-full   ">

                                {[
                                    {
                                        name: "New Leads",
                                        color: "bg-purple-500",
                                        revenue: "118K",
                                        progress: "80%",
                                    },
                                    {
                                        name: "contacted",
                                        color: "bg-orange-500",
                                        progress: "60%",
                                        revenue: "98K",
                                    },
                                    {
                                        name: "Qualified",
                                        color: "bg-yellow-500",
                                        progress: "40%",
                                        revenue: "62K",
                                    },
                                    {
                                        name: "Proposal",
                                        color: "bg-green-500",
                                        progress: "25%",
                                        revenue: "34K",
                                    },
                                    {
                                        name: "converted",
                                        color: "bg-green-500",
                                        progress: "45%",
                                        revenue: "34K",
                                    },
                                ].map((item, index) => (

                                    <div key={index} className="mb-6">

                                        <div className="flex justify-between mb-1 ">

                                            <span className="text-md text-black">
                                                {item.name}
                                            </span>

                                            <span className="text-black text-md">
                                                {item.width}
                                            </span>

                                        </div>

                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                                            <div
                                                className={`h-3 ${item.color} rounded-full`}
                                                style={{ width: item.progress }}
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

                            <button className='text-blue-700 underline cursor-pointer tracking-wide'>
                                Full Report
                            </button>
                        </div>
                        {[
                            {
                                icon: Mail, title: "E-mail Follow-ups Sent", avg: "Avg response time: 3.2 hrs", percentage: "3", total: "142"

                            },
                            {
                                icon: Phone, title: "Sales call logged", avg: " Avg call duration: 11 min", percentage: "3", total: "142"

                            },
                            {
                                icon: Clock4, title: "Overdue follow-ups", avg: "Oldest: 4 days overdue", percentage: "3", total: "142"

                            },
                            {
                                icon: Check, title: "Follow ups Completed", avg: "89% on-time rate this week", percentage: "3", total: "142"

                            }
                        ].map((ev, i) => (
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
                            <button className='text-blue-700 underline tracking-wide cursor-pointer'>Full Report</button>

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