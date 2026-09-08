import React, { useState } from "react";
import { X, User, Phone, Mail, Building2, Locate, Calendar, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import useEmployees from "../Hooks/useEmployees";
import InputField from "./InputField";

export default function EditEmployeeModal({ employee, onClose, onSuccess }) {
  const { updateEmployee } = useEmployees();

  const empId = employee?._id || employee?.id || employee?.uid;
  const profile = employee?.profile || {};
  const bankDetails = profile.bankDetails || employee?.bankDetails || {};

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic
    employeeName: employee?.name || employee?.employeeName || "",
    employeeRole: employee?.role || employee?.employeeRole || "Employee",
    department: employee?.department || profile.department || employee?.employeeDepartment || "Engineering",
    contact: employee?.contact || employee?.phone || profile.phone || "",
    email: employee?.email || "",
    location: employee?.location || profile.workLocation || "",
    joinDate: employee?.joinDate ? new Date(employee.joinDate).toISOString().split("T")[0] : (profile.joiningDate ? new Date(profile.joiningDate).toISOString().split("T")[0] : ""),
    status: employee?.status || "Active",
    sme: Boolean(employee?.sme || employee?.isSME || profile?.sme),
    notes: employee?.notes || employee?.description || profile.description || "",

    // Personal Details
    dob: profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
    gender: profile.gender || "",
    emergencyNo: profile.emergencyNo || "",
    address: profile.address || "",
    empId: profile.empId || employee?.empId || "",

    // Bank Details
    accountHolderName: bankDetails.accountHolderName || "",
    bankName: bankDetails.bankName || "",
    branchName: bankDetails.branchName || "",
    accountNumber: bankDetails.accountNumber || "",
    ifscCode: bankDetails.ifscCode || "",
    accountType: bankDetails.accountType || "Savings",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeName.trim()) {
      alert("Employee name is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.employeeName.trim(),
        employeeName: formData.employeeName.trim(),
        role: formData.employeeRole === "admin" || formData.employeeRole === "Admin" ? "Admin" : "Employee",
        employeeRole: formData.employeeRole === "admin" || formData.employeeRole === "Admin" ? "Admin" : "Employee",
        department: formData.department.trim(),
        contact: formData.contact.trim(),
        phone: formData.contact.trim(),
        location: formData.location.trim(),
        workLocation: formData.location.trim(),
        joinDate: formData.joinDate,
        status: formData.status,
        sme: formData.sme,
        empId: formData.empId.trim(),
        notes: formData.notes,
        description: formData.notes,

        // Personal Details sub-object
        dob: formData.dob || undefined,
        gender: formData.gender,
        emergencyNo: formData.emergencyNo,
        address: formData.address,
        profile: {
          ...profile,
          empId: formData.empId.trim(),
          dob: formData.dob || undefined,
          gender: formData.gender,
          emergencyNo: formData.emergencyNo,
          address: formData.address,
          phone: formData.contact.trim(),
          department: formData.department.trim(),
          workLocation: formData.location.trim(),
          description: formData.notes,
          sme: formData.sme,
          bankDetails: {
            accountHolderName: formData.accountHolderName.trim(),
            bankName: formData.bankName.trim(),
            branchName: formData.branchName.trim(),
            accountNumber: formData.accountNumber.trim(),
            ifscCode: formData.ifscCode.trim(),
            accountType: formData.accountType,
          },
        },

        // Bank Details
        bankDetails: {
          accountHolderName: formData.accountHolderName.trim(),
          bankName: formData.bankName.trim(),
          branchName: formData.branchName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifscCode: formData.ifscCode.trim(),
          accountType: formData.accountType,
        },
      };

      const updated = await updateEmployee(empId, payload);
      alert("Employee details updated successfully!");

      if (onSuccess) {
        onSuccess(updated);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      alert(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#e9e7e2] rounded-[36px] p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar">
      {/* CLOSE BUTTON */}
      <button
        type="button"
        className="absolute top-6 right-6 text-red-600 font-bold p-2 hover:bg-white rounded-full transition cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      >
        <X size={22} strokeWidth="3px" />
      </button>

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0b2b57]">
          Edit Employee Details
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Update profile, personal, and banking information for {formData.employeeName || "Employee"}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-gray-300 pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === "basic"
              ? "bg-[#2563a9] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Basic Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === "personal"
              ? "bg-[#2563a9] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Personal Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === "bank"
              ? "bg-[#2563a9] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Bank Details
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* BASIC TAB */}
        {activeTab === "basic" && (
          <div className="space-y-5">
            <InputField
              label="Employee Name"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Enter full name"
              Icon={User}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                type="select"
                Icon={Building2}
                options={[
                  { value: "Engineering", label: "Engineering" },
                  { value: "Sales", label: "Sales" },
                  { value: "Design", label: "Design" },
                  { value: "HR Department", label: "HR Department" },
                  { value: "Finance", label: "Finance" },
                  { value: "Marketing", label: "Marketing" },
                  { value: "Operations", label: "Operations" },
                  { value: "IT Support", label: "IT Support" },
                ]}
              />

              <InputField
                label="Role"
                name="employeeRole"
                value={formData.employeeRole}
                onChange={handleChange}
                type="select"
                options={[
                  { value: "Employee", label: "Employee" },
                  { value: "Admin", label: "Admin" },
                ]}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter phone number"
                Icon={Phone}
                type="tel"
              />

              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                Icon={Mail}
                type="email"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Work Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Work Location"
                Icon={Locate}
              />

              <InputField
                label="Joining Date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                Icon={Calendar}
                type="date"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                type="select"
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Suspended", label: "Suspended" },
                ]}
              />

              <InputField
                label="Employee ID (Emp ID)"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                placeholder="e.g. EMP-1001"
              />
            </div>

            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-300">
              <input
                type="checkbox"
                id="editSme"
                name="sme"
                checked={formData.sme}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="editSme" className="text-sm font-semibold text-[#0b2b57] cursor-pointer">
                Subject Matter Expert (SME)
              </label>
            </div>

            <div>
              <label className="font-bold text-[#0b2b57] block mb-2">
                Notes & Description
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Employee notes..."
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}

        {/* PERSONAL DETAILS TAB */}
        {activeTab === "personal" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                type="date"
                Icon={Calendar}
              />

              <InputField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                type="select"
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "others", label: "Others" },
                ]}
              />
            </div>

            <InputField
              label="Emergency Contact Number"
              name="emergencyNo"
              value={formData.emergencyNo}
              onChange={handleChange}
              placeholder="Emergency contact number"
              Icon={Phone}
              type="tel"
            />

            <div>
              <label className="font-bold text-[#0b2b57] block mb-2">
                Residential Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full residential address..."
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}

        {/* BANK DETAILS TAB */}
        {activeTab === "bank" && (
          <div className="space-y-5">
            <InputField
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Name as per bank account"
              Icon={User}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank, SBI"
                Icon={Building2}
              />

              <InputField
                label="Branch Name"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Branch location"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Bank account number"
                Icon={CreditCard}
              />

              <InputField
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <InputField
              label="Account Type"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              type="select"
              options={[
                { value: "Savings", label: "Savings Account" },
                { value: "Current", label: "Current Account" },
                { value: "Salary", label: "Salary Account" },
              ]}
            />
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="border-t border-gray-300 pt-6 mt-8 flex gap-4">
          <button
            type="button"
            className="px-8 py-3 border border-gray-400 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition cursor-pointer font-medium"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2563a9] text-white py-3 rounded-xl hover:bg-[#1d4f88] transition font-medium cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
