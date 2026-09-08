import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    User,
    Building2,
    X,
    Calendar,
    Clock,
    Briefcase,
} from "lucide-react";

import InputField from "../../components/InputField.jsx";
import useLeave from '../../Hooks/useLeave.js';
import { useAuth } from "../../context/AuthContext";
import useEmployees from "../../Hooks/useEmployees";

const LeaveApplicationForm = ({ onClose, onSave, editingRequest, onEdit }) => {
    const { user } = useAuth();
    const { employees = [] } = useEmployees();
    const { submitLeave, updateLeave, loading, error, getLeaves } = useLeave();

    const [formdetails, setFormdetails] = useState({
        employeeName: "",
        employeeId: "",
        department: "",
        managerId: "",
        managerName: "",
        leaveTitle: "",
        leaveType: "Annual Leave",
        leaveFrom: "",
        leaveTo: "",
        leaveReason: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const isViewOnly = editingRequest === true;
    const isEditing = editingRequest && typeof editingRequest === "object" && (editingRequest.id || editingRequest._id);

    // Populate current logged-in employee details
    useEffect(() => {
        if (!editingRequest && user) {
            setFormdetails((prev) => ({
                ...prev,
                employeeId: user.profile?.empId || user.empId || user.id || user.uid || user._id || "",
                employeeName: user.name || "",
                department: user.industry || user.department || "General",
            }));
        }
    }, [editingRequest, user]);

    // Populate when editing
    useEffect(() => {
        if (editingRequest && typeof editingRequest === "object") {
            setFormdetails({
                ...editingRequest,
                // normalize leave type label if needed
                leaveType: editingRequest.leaveType || "Annual Leave",
            });
        }
    }, [editingRequest]);

    // Manager dropdown options
    const managerOptions = useMemo(() => {
        const currentEmpId = formdetails.employeeId;
        const potentialManagers = (employees || []).filter(
            (e) => String(e.uid || e._id || e.id) !== String(currentEmpId)
        );
        const source = potentialManagers.length > 0 ? potentialManagers : employees;
        return (source || []).map((m) => ({
            value: m.name || m.employeeName,
            label: `${m.name || m.employeeName} (${m.role || "Manager"})`,
            id: m.uid || m._id || m.id || m.empId || "",
        }));
    }, [employees, formdetails.employeeId]);

    const formChange = (name, value) => {
        setFormdetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleManagerSelect = (e) => {
        const val = e.target.value;
        const found = managerOptions.find((m) => m.value === val);
        setFormdetails((prev) => ({
            ...prev,
            managerName: val,
            managerId: found?.id || prev.managerId || "",
        }));
    };

    // Calculate duration in days
    const calculatedDuration = useMemo(() => {
        if (!formdetails.leaveFrom || !formdetails.leaveTo) return 0;
        const from = new Date(formdetails.leaveFrom);
        const to = new Date(formdetails.leaveTo);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0;
        return Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    }, [formdetails.leaveFrom, formdetails.leaveTo]);

    const handleSubmit = async () => {
        setFormError("");

        if (!formdetails.leaveTitle.trim()) {
            setFormError("Please enter a leave title.");
            return;
        }
        if (!formdetails.leaveFrom || !formdetails.leaveTo) {
            setFormError("Please select both start and end dates.");
            return;
        }
        if (new Date(formdetails.leaveTo) < new Date(formdetails.leaveFrom)) {
            setFormError("End date cannot be earlier than start date.");
            return;
        }
        if (!formdetails.leaveReason.trim()) {
            setFormError("Please state a reason for your leave request.");
            return;
        }

        try {
            setSubmitting(true);
            const activeEmpId = formdetails.employeeId || user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id || "";
            const activeEmpName = formdetails.employeeName || user?.name || "";
            const activeDept = formdetails.department || user?.industry || user?.department || "General";

            const payload = {
                ...formdetails,
                employeeId: activeEmpId,
                employeeName: activeEmpName,
                department: activeDept,
                leaveDays: calculatedDuration || 1,
            };

            let result;
            if (isEditing) {
                result = await updateLeave(editingRequest.id || editingRequest._id, payload);
            } else {
                result = await submitLeave(payload);
            }

            if (!result.success) {
                throw new Error(result.error || "Failed to submit leave request");
            }

            getLeaves();

            if (onSave) {
                if (isEditing) {
                    onSave((prev) =>
                        prev.map((req) =>
                            ((req.id || req._id) === (editingRequest.id || editingRequest._id)
                                ? { ...formdetails, id: editingRequest.id || editingRequest._id }
                                : req)
                        )
                    );
                } else if (result.data?.leave) {
                    onSave((prev) => [result.data.leave, ...prev]);
                }
            }

            onClose();
        } catch (err) {
            console.error(err);
            setFormError(err.message || "Failed to submit leave request.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-screen overflow-y-auto no-scrollbar bg-black/40 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="relative max-w-4xl w-full bg-[#efede8] rounded-[28px] p-8 md:p-10 shadow-xl border border-white/40 max-h-[90vh] overflow-y-auto no-scrollbar">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                {/* Form Title */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0B2B57]">
                        {isEditing ? "Edit Leave Request" : isViewOnly ? "View Leave Request" : "Apply for Leave"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Submit your time-off request for review and approval
                    </p>
                </div>

                {/* Error Banner */}
                {formError && (
                    <div className="mb-6 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-semibold">
                        {formError}
                    </div>
                )}

                {/* Employee Details Section */}
                <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xs tracking-[3px] text-gray-500 uppercase whitespace-nowrap font-bold">
                        Employee & Manager Information
                    </h3>
                    <div className="h-px bg-gray-300 flex-1" />
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    <InputField
                        label="Full Name"
                        name="employeeName"
                        value={formdetails.employeeName}
                        onChange={(e) => formChange("employeeName", e.target.value)}
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
                        label="Reporting Manager"
                        name="managerName"
                        value={formdetails.managerName}
                        onChange={handleManagerSelect}
                        disabled={isViewOnly}
                        type="select"
                        Icon={Briefcase}
                        options={managerOptions}
                    />
                </div>

                {/* Leave Details Section */}
                <div className="flex items-center gap-4 my-8">
                    <h3 className="text-xs tracking-[3px] text-gray-500 uppercase whitespace-nowrap font-bold">
                        Leave Details
                    </h3>
                    <div className="h-px bg-gray-300 flex-1" />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <InputField
                        label="Leave Title"
                        placeholder="e.g. Family Vacation, Fever Recovery..."
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
                            { value: "Annual Leave", label: "Annual Leave" },
                            { value: "Sick Leave", label: "Sick Leave" },
                            { value: "Casual Leave", label: "Casual Leave" },
                            { value: "Emergency Leave", label: "Emergency Leave" },
                        ]}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField
                        label="From Date"
                        name="leaveFrom"
                        value={formdetails.leaveFrom ? formdetails.leaveFrom.split("T")[0] : ""}
                        onChange={(e) => formChange("leaveFrom", e.target.value)}
                        disabled={isViewOnly}
                        type="date"
                        Icon={Calendar}
                    />

                    <InputField
                        label="To Date"
                        name="leaveTo"
                        value={formdetails.leaveTo ? formdetails.leaveTo.split("T")[0] : ""}
                        onChange={(e) => formChange("leaveTo", e.target.value)}
                        disabled={isViewOnly}
                        type="date"
                        Icon={Calendar}
                    />
                </div>

                {/* Duration Badge */}
                {calculatedDuration > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-[#0B2B57] font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                            Total Duration: {calculatedDuration} {calculatedDuration === 1 ? "day" : "days"}
                        </span>
                    </div>
                )}

                {/* Reason */}
                <div className="mt-6">
                    <div className="flex justify-between mb-2">
                        <label className="font-bold text-[#0b2b57] text-sm">
                            Reason for Leave
                        </label>
                        <span className="text-xs text-gray-400">
                            {(formdetails.leaveReason || "").length}/500
                        </span>
                    </div>

                    <textarea
                        rows={4}
                        maxLength={500}
                        placeholder="Please provide details regarding your leave request..."
                        name="leaveReason"
                        value={formdetails.leaveReason}
                        onChange={(e) => formChange("leaveReason", e.target.value)}
                        disabled={isViewOnly}
                        className="w-full bg-white rounded-2xl border border-gray-300 p-4 resize-none outline-none text-sm text-gray-700"
                    />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="sm:w-[130px] h-[50px] border border-gray-400 rounded-2xl text-gray-700 font-semibold hover:bg-gray-200 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    {!isViewOnly && (
                        <button
                            type="button"
                            disabled={submitting}
                            className="flex-1 h-[50px] bg-[#2568ad] text-white rounded-2xl font-semibold hover:bg-[#1f5a98] transition cursor-pointer disabled:opacity-50"
                            onClick={handleSubmit}
                        >
                            {submitting
                                ? "Saving..."
                                : isEditing
                                ? "Update Request"
                                : "Submit Request"}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LeaveApplicationForm;