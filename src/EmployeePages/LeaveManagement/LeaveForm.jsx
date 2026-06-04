import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Building2,
    BadgeCheck,
    X,
} from "lucide-react";

import InputField from "../../components/InputField.jsx";
 

const LeaveApplicationForm = ({ onClose, onSave, editingRequest, onEdit }) => {
    const leaveOptions = [
        "Casual Leave",
        "Sick Leave",
        "Annual Leave",
        "Emergency Leave",
    ];

    const [formdetails, setFormdetails] = useState(editingRequest || {
        empId: "",
        fullname: "",
        department: "",
        managerId: "",
        managername: "",
        leaveTitle: "",
        leaveFrom: "",
        leaveTo: "",
        reason: "",
    });
    const formChange = (name, value) => {
        setFormdetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = () => {
        console.log(formdetails);
        alert('submitted Successfully....');
        if (editingRequest && editingRequest.id) {
            // Update existing request
            onSave((prev) => prev.map((req) => req.id === editingRequest.id ? { ...formdetails, id: editingRequest.id } : req));
        } else {
            // Add new request
            onSave((prev) => [{ ...formdetails, id: Date.now() }, ...prev]);
        }
        onClose();
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-screen overflow-y-auto no-scrollbar bg-[#f6f4ef] p-6"
        >
            <div className="relative max-w-6xl mx-auto bg-[#efede8] rounded-[28px] p-10 shadow-sm">

                <button
                    onClick={onClose}
                    className="absolute top-8 right-2 bg-red-600 text-white p-1 rounded hover:scale-105 transition"
                >
                    <X size={18} />
                </button>

                {/* Employee Details */}

                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-xs tracking-[3px] text-gray-500 uppercase whitespace-nowrap">
                        Employee Details
                    </h3>
                    <div className="h-px bg-gray-400 flex-1" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <InputField
                        label="Employee ID"
                        name="empId"
                        value={formdetails.empId}
                        onChange={(e)=>formChange("empId",e.target.value)}
                        placeholder="HRMS-7829-X"
                        Icon={BadgeCheck}
                    />

                    <InputField
                        label="Full Name"
                        name="fullname"
                        value={formdetails.fullname}
                        onChange={(e)=>formChange('fullname', e.target.value)}
                        placeholder="Alexander Mitchell"
                        Icon={User}
                    />

                    <InputField
                        label="Department"
                        name="department"
                        value={formdetails.department}
                        onChange={(e) => formChange("department", e.target.value)}
                        placeholder="Operations & Logistics"
                        Icon={Building2}
                    />

                    <InputField
                        label="Manager ID"
                        name="managerId"
                        value={formdetails.managerId}
                        onChange={(e) => formChange("managerId", e.target.value)}
                        placeholder="HRMS-7829990-X"
                        Icon={BadgeCheck}
                    />

                    <InputField
                        label="Manager Name"
                        name="managername"
                        value={formdetails.managername}
                        onChange={(e) => formChange("managername", e.target.value)}
                        placeholder="Senthil Kumar"
                        Icon={User}
                    />

                    <InputField
                        label="Leave Title"
                        name="leaveTitle"
                        value={formdetails.leaveTitle}
                        onChange={(e) => formChange("leaveTitle", e.target.value)}
                        placeholder="Select Leave Type"
                        type="text"
                       
                    />

                </div>

                {/* Leave Details */}

                <div className="flex items-center gap-4 my-8">
                    <h3 className="text-xs tracking-[3px] text-gray-500 uppercase whitespace-nowrap">
                        Leave Details
                    </h3>
                    <div className="h-px bg-gray-400 flex-1" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <InputField
                        label="From Date"
                        name="leaveFrom"
                        value={formdetails.leaveFrom}
                        onChange={(e) => formChange("leaveFrom", e.target.value)}
                        type="date"
                    />

                    <InputField
                        label="To Date"
                        name="leaveTo"
                        value={formdetails.leaveTo}
                        onChange={(e) => formChange("leaveTo", e.target.value)}
                        type="date"
                    />

                </div>

                {/* Reason */}

                <div className="mt-6">
                    <div className="flex justify-between mb-3">
                        <label className="font-bold text-[#0b2b57]">
                            Reason For Leave
                        </label>

                        <span className="text-xs text-gray-400">
                            {(formdetails.reason || "").length}/500
                        </span>
                    </div>

                    <textarea
                        rows={5}
                        maxLength={500}
                        value={formdetails.reason}
                        onChange={(e) => formChange("reason", e.target.value)}
                        placeholder="Please explain the reason for your leave request..."
                        className="w-full bg-white rounded-2xl border border-gray-200 p-5 resize-none outline-none"
                    />
                </div>

                {/* Buttons */}

                <div className="flex flex-col sm:flex-row gap-4 mt-10">

                    <button
                        onClick={onClose}
                        className="sm:w-[150px] h-[56px] border border-gray-400 rounded-2xl text-gray-600 font-medium hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        className="flex-1 h-[56px] bg-[#2568ad] text-white rounded-2xl font-semibold hover:bg-[#1f5a98] transition"
                        onClick={handleSubmit}
                    >
                        Submit Request
                    </button>

                </div>

            </div>
        </motion.div>
    );
};

export default LeaveApplicationForm;