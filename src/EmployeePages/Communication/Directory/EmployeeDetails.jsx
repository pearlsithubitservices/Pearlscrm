import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Building2, Briefcase, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDetails({onClose}) {
    const navigate=useNavigate();
    const employee = {
        id: "EMP-8291",
        firstName: "Vishnu",
        lastName: "Ravichandran",
        department: "Engineering",
        role: "Sr. Frontend Dev",
        email: "vishn.j@company.com",
        phone: "+91 9876543210",
        location: "Coimbatore",
        workMode: "WFH",
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
    };

    const Field = ({ label, value }) => (
        <div>
            <p className="text-xs font-semibold tracking-[3px] uppercase text-slate-400 mb-3">
                {label}
            </p>

            <div className="h-14 flex items-center px-4 rounded-2xl border border-slate-200 bg-white text-[#123861] text-xl font-medium">
                {value}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-[420px] h-[580px] overflow-y-auto no-scrollbar bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
        >
            <X size={20} className="absolute top-1 right-1 bg-red-500 text-white rounded-xl hover:scale-105 transition-transform duration-150 cursor-pointer"
            onClick={onClose}/>
            {/* Profile Header */}
            <div className="p-8">
                <div className="bg-gradient-to-r from-[#f0e1df] via-[#e8ebf2] to-[#d6e1f6] rounded-2xl p-5 flex flex-col items-center">
                    <img
                        src={employee.image}
                        alt=""
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />

                    <div className="mt-3 px-4 py-1 rounded-lg bg-white/40 backdrop-blur-sm">
                        <span className="font-medium text-[#123861] text-sm">
                            ID : #{employee.id}
                        </span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-4 pb-4">
                <h3 className="text-xl font-bold text-slate-700 mb-4">
                    Employee Details
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium">
                            {employee.firstName} {employee.lastName}
                        </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Department</span>
                        <span>{employee.department}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Role</span>
                        <span>{employee.role}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Location</span>
                        <span>{employee.location}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Work Mode</span>
                        <span>{employee.workMode}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Phone</span>
                        <span>{employee.phone}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="text-blue-600 text-sm">
                            {employee.email}
                        </span>
                    </div>
                </div>

                <button className="w-full mt-5 py-3 rounded-xl bg-[#1f5fa8] text-white font-medium hover:bg-[#174b85] transition">
                    Send Email
                </button>
            </div>
        </motion.div>
    );
}