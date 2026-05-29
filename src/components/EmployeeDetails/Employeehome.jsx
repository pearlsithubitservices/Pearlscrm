import React from "react";
import { motion } from "framer-motion";
import {
    Phone,
    Mail,
    MessageCircle,
    User,
    CalendarDays,
    Briefcase,
} from "lucide-react";

export default function LeadDetails({ employees }) {

    const contactInfo = [
        {
            title: "EMAIL",
            value: employees?.email || "Not Available",
            icon: Mail,
            color: "text-blue-500",
            bg: "bg-blue-100",
        },
        {
            title: "PHONE",
            value: employees?.phone || "Not Available",
            icon: Phone,
            color: "text-green-500",
            bg: "bg-green-100",
        },

        {
            title: "LOCATION",
            value: employees?.assignedTo || "Ragavi M",
            icon: User,
            color: "text-orange-500",
            bg: "bg-orange-100",
        },
        {
            title: "JOINING DATE",
            value: employees?.followUp || "Today",
            icon: CalendarDays,
            color: "text-pink-500",
            bg: "bg-pink-100",
        },

    ];

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 30,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="min-h-screen bg-[#efede8] p-5"
        >

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}



                {/* DEAL VALUE */}

                <div className="mt-8">

                    <h3
                        className="
            font-bold
            text-gray-400
            mb-4
            "
                    >
                        Employee Description
                    </h3>

                    <motion.div
                        whileHover={{
                            scale: 1.01,
                        }}
                        className="
            bg-[#efede8]
            rounded-3xl
            p-6
            shadow-sm
            border border-black/40
            "
                    >

                        <div className="w-full h-[100px] ">

                            <div>

                                <h1
                                    className="
                  text-xl
                  
                  text-[#082f57]
                  "
                                >
                                    {employees?.notes || "oihwehdo"}
                                </h1>
                            </div>
                        </div>

                    </motion.div>

                </div>

                {/* CONTACT INFO */}

                <div className="mt-10">

                    <h3
                        className="
            font-bold
            text-gray-400
            mb-5
            "
                    >
                        EMPLOYEE INFORMATION
                    </h3>


                    <div className="flex flex-col items-start  justify-between ">
                        <div className="flex  gap-4 items-start justify-between ">
                            <div className="flex flex-col gap-2 w-[400px]  p-2  rounded-lg bg-white/80 items-start justify-between">
                                <h1 className="ml-4">EMAIL</h1>
                                <p className="ml-6 text-blue-700">abc@gmail.com</p>
                            </div>
                            <div className=" flex flex-col gap-2 w-[400px]    p-2  rounded-lg bg-white/80 items-start justify-between">
                                <h1>PHONE</h1>
                                <p className="text-blue-700">9345790345</p>
                            </div>
                        </div>
                        <div className="flex  gap-4 items-start justify-between  mt-12">
                            <div className="flex flex-col gap-2 w-[400px]  p-2  rounded-lg bg-white/80 items-start justify-between">
                                <h1 className="ml-4">LOCATION</h1>
                                <p className="ml-6 text-blue-700">Chennai</p>
                            </div>
                            <div className=" flex flex-col gap-2 w-[400px]    p-2  rounded-lg bg-white/80 items-start justify-between">
                                <h1>JOINING DATE</h1>
                                <p className="text-blue-700">00-00-0000</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h1 className="font-semibold">PERFORMANCE</h1>

                        <div className="w-full bg-white p-4 rounded-lg mt-3">
                            <h5 className="text-sm text-gray-500">
                                Performance Progress 65%
                            </h5>

                            {/* BAR BACKGROUND */}
                            <div className="w-full h-2 mt-4 bg-gray-300 rounded-lg overflow-hidden">

                                {/* FILL */}
                                <div className="h-full w-[65%] bg-blue-500 rounded-lg" />

                            </div>
                        </div>
                    </div>


                </div>

            </div>



        </motion.div>
    );
}