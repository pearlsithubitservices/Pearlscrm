import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Building2,
    BadgeCheck,
    X,
} from "lucide-react";

import InputField from "../../components/InputField.jsx";
import useLeave from '../../Hooks/useLeave.js'
import { useAuth } from "../../context/AuthContext";


const LeaveApplicationForm = ({ onClose, onSave, editingRequest, onEdit }) => {


    const leaveOptions = [
        "Casual Leave",
        "Sick Leave",
        "Annual Leave",
        "Emergency Leave",
    ];


    const initialDetails =
        editingRequest && typeof editingRequest === "object"
            ? { ...editingRequest }
            : {
                  employeeName: "",
                  employeeId: "",
                  department: "",
                  managerId: "",
                  managerName: "",
                  leaveTitle: "",
                  leaveType: "",
                  leaveFrom: "",
                  leaveTo: "",
                  leaveReason: "",
              };

    const [formdetails, setFormdetails] = useState(initialDetails);
    const { user } = useAuth();

    useEffect(() => {
        if (!editingRequest && user) {
            setFormdetails((previous) => ({
                ...previous,
                employeeId: user.profile?.empId || user.empId || user.id || user.uid || user._id || "",
                employeeName: user.name || "",
                department: user.industry || "General",
            }));
        }
    }, [editingRequest, user]);

    useEffect(() => {
        if (editingRequest && typeof editingRequest === "object") {
            setFormdetails({ ...editingRequest });
        } else if (editingRequest === true && onEdit && typeof onEdit === "object") {
            // view-only mode with provided details via onEdit
            setFormdetails({ ...onEdit });
        }
    }, [editingRequest, onEdit]);


    const { submitLeave, updateLeave, loading, error, leaves, getLeaves } = useLeave();
    const isViewOnly = editingRequest === true;
    const isEditing = editingRequest && typeof editingRequest === "object" && (editingRequest.id || editingRequest._id);
    const formChange = (name, value) => {
        setFormdetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async () => {
        try {
            let result;
            if (isEditing) {
                result = await updateLeave(editingRequest.id || editingRequest._id, formdetails);
            } else {
                result = await submitLeave(formdetails);
            }

            if (!result.success) {
                throw new Error(result.error);
            }

            alert(isEditing ? "Leave Request Updated Successfully" : "Leave Request Submitted Successfully");
            getLeaves();

            if (isEditing) {
                // update local list
                onSave((prev) =>
                    prev.map((req) => ((req.id || req._id) === (editingRequest.id || editingRequest._id) ? { ...formdetails, id: editingRequest.id || editingRequest._id } : req))
                );
            } else {
                onSave((prev) => [
                    {
                        ...result.data.leave,
                        id: result.data.leave?._id,
                    },
                    ...prev,
                ]);
            }


            onClose();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

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
                        name="employeeId"
                        value={formdetails.employeeId}
                        //onChange={(e) => formChange("employeeId", e.target.value)}
                        disabled={isViewOnly}
                        Icon={BadgeCheck}
                    />

                    <InputField
                        label="Full Name"
                        name="employeeName"
                        value={formdetails.employeeName}
                        onChange={(e) => formChange('employeeName', e.target.value)}
                        disabled={isViewOnly}
                        Icon={User}
                    />

                    <InputField
                        label="Department"
                        name="department"
                        value={formdetails.department}
                        onChange={(e) => formChange("department", e.target.value)}
                        disabled={isViewOnly}
                        Icon={Building2}
                    />

                    <InputField
                        label="Manager ID"
                        name="managerId"
                        value={formdetails.managerId}
                        onChange={(e) => formChange("managerId", e.target.value)}
                        disabled={isViewOnly}
                        Icon={BadgeCheck}
                    />

                    <InputField
                        label="Manager Name"
                        name="managerName"
                        value={formdetails.managerName}
                        onChange={(e) => formChange("managerName", e.target.value)}
                        disabled={isViewOnly}
                        Icon={User}
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
                        label="Leave Title"
                        name="leaveTitle"
                        value={formdetails.leaveTitle}
                        onChange={(e) => formChange("leaveTitle", e.target.value)}
                        disabled={isViewOnly}
                        type="text"
                    />

                    <InputField
                        label="Leave Type"
                        name="leaveType"
                        value={formdetails.leaveType}
                        onChange={(e) => formChange("leaveType", e.target.value)}
                        disabled={isViewOnly}
                        type="select"
                        options={[
                            { value: "annual", label: "Annual Leave" },
                            { value: "sick", label: "Sick Leave" },
                            { value: "personal", label: "Personal Leave" },
                        ]}

                    />

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <InputField
                        label="From Date"
                        name="leaveFrom"
                        value={formdetails.leaveFrom}
                        onChange={(e) => formChange("leaveFrom", e.target.value)}
                        disabled={isViewOnly}
                        type="date"
                    />

                    <InputField
                        label="To Date"
                        name="leaveTo"
                        value={formdetails.leaveTo}
                        onChange={(e) => formChange("leaveTo", e.target.value)}
                        disabled={isViewOnly}
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
                            {(formdetails.leaveReason || "").length}/500
                        </span>
                    </div>

                    <textarea
                        rows={5}
                        maxLength={500}
                        name="leaveReason"
                        value={formdetails.leaveReason}
                        onChange={(e) => formChange("leaveReason", e.target.value)}
                        disabled={isViewOnly}
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

                    {!isViewOnly && (
                        <button
                            className="flex-1 h-[56px] bg-[#2568ad] text-white rounded-2xl font-semibold hover:bg-[#1f5a98] transition"
                            onClick={handleSubmit}
                        >
                            {isEditing ? "Update Request" : "Submit Request"}
                        </button>
                    )}

                </div>

            </div>
        </motion.div>
    );
};

export default LeaveApplicationForm;