import { motion } from "framer-motion";

import InputField from "../components/InputField.jsx";

import {
    Globe,
    Phone,
    Mail,
    Users,
    IndianRupee,
    Calendar,
    User
} from "lucide-react";

export default function ClientForm({ onClose }) {

    return (

        <motion.div
            initial={{
                opacity: 0,
                y: 50
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            className="max-w-5xl mx-auto mt-5 bg-[#e9e7e2] rounded-[40px] p-10"
        >

            <div className="flex items-center gap-5 mb-8">

                <p className="text-gray-400 tracking-[4px] text-sm">
                    CLIENT DETAILS
                </p>

                <div className="flex-1 h-[1px] bg-gray-400" />

            </div>


            <div className="space-y-6">

                <InputField
                    label="Company Name"
                    placeholder="e.g Redesign onboarding flow"
                />

                <InputField
                    label="Company Website"
                    placeholder="Website"
                    Icon={Globe}
                />

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Contact Number"
                        placeholder="+1(555)000"
                        Icon={Phone}
                    />

                    <InputField
                        label="Email Address"
                        placeholder="abc@gmail.com"
                        Icon={Mail}
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="No of Employees"
                        placeholder="156"
                        Icon={Users}
                    />

                    <InputField
                        label="Contract Budget"
                        placeholder="₹0.00"
                        Icon={IndianRupee}
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Manager Name"
                        placeholder="Leader Name"
                        Icon={User}
                    />

                    <InputField
                        label="Founded Date"
                        placeholder="May 15"
                        Icon={Calendar}
                    />

                </div>

                <div>

                    <label className="font-bold text-[#0b2b57]">
                        Project Description
                    </label>

                    <textarea
                        className="w-full h-40 mt-3 rounded-xl border p-4 resize-none"
                    />

                </div>

                <div className="border-t pt-8 flex gap-4">

                    <button className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white" 
                    onClick={onClose}>
                        Cancel
                    </button>

                    <button className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl">

                        + Add To Clients

                    </button>

                </div>

            </div>

        </motion.div>

    )

}