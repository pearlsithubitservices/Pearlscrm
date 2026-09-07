import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from '../lib/firebase';
import InputField from '../components/InputField';
import {
    User,
    Building2,
    Calendar,
    Phone,
    Mail,
    Locate,
    X,
    Loader2
} from 'lucide-react';
import useEmployees from '../Hooks/useEmployees';
import { apiUrl } from '../config/api';

export default function Createemployee({ onClose, onSuccess }) {
    const navigate = useNavigate();
    const { createEmployee } = useEmployees();

    const [employees, setEmployees] = useState({
        employeeName: '',
        employeeDepartment: 'Engineering',
        employeeRole: 'employee',
        contact: '',
        email: '',
        location: '',
        joinDate: new Date().toISOString().split('T')[0],
        notes: '',
        sme: false,
    });

    const [loading, setLoading] = useState(false);

    function handleEmployee(e) {
        const { name, value, type, checked } = e.target;
        setEmployees((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    const addEmployees = async (e) => {
        if (e) e.preventDefault();

        if (!employees.employeeName.trim()) {
            alert("Please enter the employee name.");
            return;
        }

        if (!employees.email.trim()) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!employees.contact.trim()) {
            alert("Please enter a contact number.");
            return;
        }

        try {
            setLoading(true);

            // 1. Create in MongoDB via hook / endpoint
            const created = await createEmployee({
                employeeName: employees.employeeName.trim(),
                employeeRole: employees.employeeRole === 'admin' ? 'Admin' : 'Employee',
                department: employees.employeeDepartment.trim(),
                contact: employees.contact.trim(),
                email: employees.email.trim().toLowerCase(),
                location: employees.location.trim(),
                joinDate: employees.joinDate,
                notes: employees.notes.trim(),
                sme: employees.sme,
                status: "Active",
            });

            const employeeId = created?._id || created?.id;

            // 2. Dual-sync to Firebase Firestore (best effort)
            try {
                if (db) {
                    await addDoc(collection(db, "employees"), {
                        ...employees,
                        mongoId: employeeId,
                        createdAt: Timestamp.now(),
                        isOnline: false,
                        status: "Active",
                    });
                }
            } catch (fbErr) {
                console.warn("Firestore sync optional warning:", fbErr);
            }

            // 3. Send Invitation Email
            try {
                await fetch(apiUrl("/email/invite"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: employeeId,
                        name: employees.employeeName.trim(),
                        email: employees.email.trim().toLowerCase(),
                        role: employees.employeeRole === 'admin' ? 'Admin' : 'Employee',
                        department: employees.employeeDepartment.trim(),
                        origin: window.location.origin,
                    }),
                });
            } catch (mailErr) {
                console.warn("Invitation email sending warning:", mailErr);
            }

            alert("Employee created and invitation sent successfully!");

            if (onSuccess) {
                onSuccess(created);
            }
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            alert(error.message || "Failed to create employee");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-10 relative">
            <button
                type="button"
                className='absolute top-5 right-5 text-red-600 font-bold p-2 hover:bg-white rounded-full transition cursor-pointer'
                onClick={onClose}
                aria-label="Close modal"
            >
                <X size={22} strokeWidth='3px' />
            </button>

            <h2 className="text-2xl font-bold text-[#0b2b57] mb-6">
                Add New Employee
            </h2>

            <form onSubmit={addEmployees}>
                <InputField
                    label="Employee Name"
                    name="employeeName"
                    value={employees.employeeName}
                    onChange={handleEmployee}
                    placeholder="Enter the employee name..."
                    Icon={User}
                />

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField
                        label="Employee Department"
                        name="employeeDepartment"
                        value={employees.employeeDepartment}
                        onChange={handleEmployee}
                        placeholder="Select or enter department"
                        Icon={Building2}
                        type="select"
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
                        label="Employee Role"
                        name="employeeRole"
                        value={employees.employeeRole}
                        onChange={handleEmployee}
                        placeholder="Enter the employee role"
                        type='select'
                        options={[
                            { value: "employee", label: "Employee" },
                            { value: "admin", label: "Admin" },
                        ]}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField
                        label="Contact Number"
                        name="contact"
                        value={employees.contact}
                        onChange={handleEmployee}
                        placeholder="Enter contact number"
                        Icon={Phone}
                        type='tel'
                    />

                    <InputField
                        label="Email"
                        name='email'
                        value={employees.email}
                        onChange={handleEmployee}
                        placeholder="Enter email address"
                        Icon={Mail}
                        type='email'
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField
                        label="Location"
                        name='location'
                        value={employees.location}
                        onChange={handleEmployee}
                        placeholder="Work location (e.g. Remote, Chennai)"
                        Icon={Locate}
                    />

                    <InputField
                        label="Join Date"
                        name='joinDate'
                        value={employees.joinDate}
                        onChange={handleEmployee}
                        Icon={Calendar}
                        type='date'
                    />
                </div>

                {/* SME Checkbox */}
                <div className="mt-5 flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-300">
                    <input
                        type="checkbox"
                        id="smeCheckbox"
                        name="sme"
                        checked={employees.sme}
                        onChange={handleEmployee}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="smeCheckbox" className="text-sm font-semibold text-[#0b2b57] cursor-pointer">
                        Subject Matter Expert (SME)
                    </label>
                </div>

                <div className="mt-5">
                    <label className="font-bold text-[#0b2b57] block mb-2">
                        Employee Notes / Description
                    </label>
                    <textarea
                        name='notes'
                        value={employees.notes}
                        onChange={handleEmployee}
                        placeholder="Add any initial notes or background info..."
                        className="w-full h-32 p-4 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="border-t border-gray-300 pt-6 mt-6 flex gap-4">
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
                                Saving & Sending Invitation...
                            </>
                        ) : (
                            "+ Add Employee"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}