import React, { useEffect, useState } from 'react'
import Loading from '../Dashboard/Loading'
const Hotleads = () => {
    const [leads,
        setLeads] =
        useState([]);

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchLeads()

    }, []);

    //CIRCLE

    const data = [
        { value: 40, color: "#a855f7", status: "In Progress" },
        { value: 25, color: "#f97316", status: "Lost" },
        { value: 20, color: "#eab308", status: "New" },
        { value: 15, color: "#22c55e", status: "Converted" },
    ];


    const radius = 35;
    const stroke = 6;

    const r = radius - stroke / 2;

    const circumference = 2 * Math.PI * r;

    let offset = 0;

    // FETCH LEADS

    const fetchLeads =
        async () => {

            try {

                const response =
                    await fetch(
                        'https://pearlscrm.onrender.com/api/leads'
                    );

                const data =
                    await response.json();

                setLeads(data);

            } catch (error) {

                console.log(error);

            }

            finally {
                setLoading(false);
            }

        };


    return (
        <>
            <div
                className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            bg-[#f3f0eb]
          "
            >

                {/* TABLE */}

                <div className="lg:col-span-2 p-2">

                    <div
                        className="               
                rounded-xl        
                overflow-hidden
                ml-6  "
                    >

                        <div
                            className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-5
                  bg-white
                  border border-gray-200 rounded-xl
                  h-10
                  mb-8
                  text-[#0b2b57]
                  text-lg
                "
                        >

                            <h2 className=" text-lg font-bold  text-[#0b2b57]">
                                Hot leads
                            </h2>

                            <button className="text-[#2563a9] font-semibold">
                                View all
                            </button>

                        </div>

                        <div className="overflow-x-auto rounded bg-white text-black  p-8">

                            <table className="w-full border ">

                                <thead className="bg-gray-50 ">

                                    <tr className='text-[#0b2b57] ' >

                                        <th className="text-left p-2  border-r">
                                            LEADS
                                        </th>

                                        <th className="text-left p-2 border-r">
                                            FOLLOW-UP
                                        </th>

                                        <th className="text-left p-2 border-r">
                                            LEAD TEMP
                                        </th>

                                        <th className="text-left p-2 border-r">
                                            BUDGET
                                        </th>

                                    </tr>

                                </thead>

                                {loading ?
                                    (
                                        <tbody>

                                            <tr>

                                                <td colSpan={4} className="p-6 text-center">
                                                    <Loading />
                                                </td>

                                            </tr>

                                        </tbody>)
                                    : (<tbody className='border-r text-sm '>

                                        {leads .slice(0, 5).map((lead) => (

                                            <tr
                                                key={lead._id}
                                                className="border-t"
                                            >

                                                <td className="p-4 border-r" >

                                                    <h2 className="font-bold ml-4">
                                                        {lead.company}
                                                    </h2>

                                                    <p className="text-gray-400 text-sm ml-4 ">
                                                        {lead.name}
                                                    </p>

                                                </td>

                                                <td className="p-1 border-r ml-4">
                                                    TechNova
                                                </td>

                                                <td className="p-1 border-r">

                                                    <span
                                                        className="
                              bg-red-100
                              text-red-500
                              px-4
                              py-2
                              rounded-full
                              text-sm
                            "
                                                    >

                                                        🔴 High

                                                    </span>

                                                </td>

                                                <td className="p-5">
                                                    {lead.budget || "$120,000"}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>)
                                }

                            </table>

                        </div>

                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div
                    className="  rounded-2xl p-2 mr-2 "
                 >

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 border rounded-xl p-2 bg-white">

                        <h2 className="text-lg font-bold text-[#0b2b57] ">
                            Revenue Pipeline
                        </h2>

                        <button className="text-[#2563a9] font-semibold">
                            Total $312K
                        </button>

                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded p-5 flex flex-col items-center justify-between relative">

                        {/* Left Side */}
                        <div className="w-full   ">

                            {[
                                {
                                    name: "Proposal Stage",
                                    color: "bg-purple-500",
                                    revenue: "118K",
                                    width: "80%",
                                },
                                {
                                    name: "Negotiation",
                                    color: "bg-orange-500",
                                    width: "60%",
                                    revenue: "98K",
                                },
                                {
                                    name: "Qualified Leads",
                                    color: "bg-yellow-500",
                                    width: "40%",
                                    revenue: "62K",
                                },
                                {
                                    name: "Closed Won",
                                    color: "bg-green-500",
                                    width: "25%",
                                    revenue: "34K",
                                },
                            ].map((item, index) => (

                                <div key={index} className="mb-6">

                                    <div className="flex justify-between mb-2">

                                        <span className="text-md text-black">
                                            {item.name}
                                        </span>

                                        <span className="text-black text-md">
                                            ${item.revenue}
                                        </span>

                                    </div>

                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                                        <div
                                            className={`h-3 ${item.color} rounded-full`}
                                            style={{ width: item.width }}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>
                        <div>
                            <p className='text-[10px] font-bold tracking-wide text-black mr-40 w-[110px] '>Conversion Overview</p>
                        </div>
                        {/* Down Side Circle */}
                        <div className="relative flex items-center justify-between gap-15 w-full h-fit    ">

                            <svg
                                width={radius * 2}
                                height={radius * 2}
                                className="-rotate-90"
                            >

                                {data.map((item, index) => {

                                    const dash =
                                        (item.value / 100) * circumference;

                                    const circle = (
                                        <circle
                                            key={index}
                                            cx={radius}
                                            cy={radius}
                                            r={r}
                                            fill="none"
                                            stroke={item.color}
                                            strokeWidth={stroke}
                                            strokeDasharray={`${dash} ${circumference}`}
                                            strokeDashoffset={-offset}
                                            strokeLinecap="round"
                                        />
                                    );

                                    offset += dash;

                                    return circle;
                                })}

                            </svg>


                            {/* Center Text */}
                            <div className="absolute flex flex-col items-center justify-center leading-tight ml-3">

                                <h1 className="text-lg font-bold text-black">
                                    100%
                                </h1>

                                <p className='text-[10px] font-semibold tracking-wide text-black'>RATE</p>

                            </div>
                            <div
                                className="flex flex-col gap-3 p-3 w-full max-w-[180px]  rounded-xl "
                            >

                                {data.map((item) => (

                                    <div
                                        key={item.value}
                                        className=" text-sm flex items-center justify-between  gap-4 w-full "
                                    >

                                        {/* LEFT */}

                                        <div className="flex items-center gap-2">

                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            />

                                            <p className="text-black">
                                                {item.status}
                                            </p>

                                        </div>

                                        {/* RIGHT */}

                                        <p
                                            className=" text-black font-semibold min-w-[45px] text-right"
                                        >
                                            {item.value}%
                                        </p>

                                    </div>

                                ))}

                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </>
    )
}

export default Hotleads