import React, {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    collection,
    addDoc,
    Timestamp,
    setDoc,
    doc,
} from "firebase/firestore";

import { db } from '../lib/firebase';

import InputField from '../components/InputField';

import {
    User,
    Building2,
    CalendarDays,
    Flag,
    ClipboardList,
    PlusCircle,
    Users,
    Activity,
    Calendar,
    Phone,
    Mail,
    Locate,
    X
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Createemployee({ onClose }) {

    const navigate =
        useNavigate();

    const [employees, setEmployees] =
        useState({
            employeeName: '',
            employeeRole: '',
            contact: '',
            email: '',
            location: '',
            joinDate: '',
            notes: '',

        });

    const [task, setTask] =
        useState({

            company: '',

            title: '',

            assignedTo: '',

            assignedEmployee: '',

            priority: 'Medium',

            status: 'Pending',

            dueDate: '',

            employeeDepartment: '',

        });
    const [loading, setLoading] = useState(false);


    const addEmployees = async () => {
        try {
            setLoading(true);
            const docRef = await addDoc(collection(db, "employees"), {
                ...employees,
                createdAt: Timestamp.now(),
                isOnline: false,
                status: "Pending",
            });

            // await fetch("http://localhost:5000/api/email/invite", {
            await fetch("https://pearlscrm.onrender.com/api/email/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: docRef.id,
                    name: employees.employeeName,
                    email: employees.email,
                    role: employees.employeeRole,
                }),
            });

            alert("Invitation Sent");

            onClose();
            navigate("/employees");

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        finally {
            setLoading(false);
        }
    };
    //HANDLE EMPLOYEES 
    function handleEmployee(e) {
        setEmployees({
            ...employees,
            [e.target.name]: e.target.value,
        })
    }

    // HANDLE CHANGE

    const handleChange = (e) => {

        setTask({

            ...task,

            [e.target.name]:
                e.target.value,

        });

    };

    // ADD TASK

    const addTask =
        async () => {

            try {

                await addDoc(
                    collection(db, 'tasks'),
                    {

                        ...task,

                        createdAt:
                            new Date(),

                    }
                );

                alert('Task Added');

                navigate('/tasks');

            } catch (error) {

                console.log(error);

            }

        };

    const priorities = [

        'Low',

        'Medium',

        'High',

        'Urgent',

    ];

    return (

        <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-10 relative">
            <div className='absolute top-5 right-5 text-red-600 font-bold w-25 h-25 hover:bg-white rounded'>
                <X size={22} strokeWidth='3px' onClick={onClose} />
            </div>

            <InputField
                label="Employee Name"
                name="employeeName"
                value={employees.employeeName}
                onChange={handleEmployee}
                placeholder="Enter the Employee name..."
            />
            <InputField
                label="Employee Department"
                name="employeeDepartment"
                value={employees.employeeDepartment}
                onChange={handleEmployee}
                placeholder="Enter the Employee Department..."
            />

            <div className="mt-5">
                <InputField
                    label="Employee Role"
                    name="employeeRole"
                    value={employees.employeeRole}
                    onChange={handleEmployee}
                    placeholder="Enter the Employee role"
                    type='select'
                    options={[
                        {
                            value: "employee",
                            label: "Employee"
                        },
                        {
                            value: "admin",
                            label: "Admin"
                        },
                    ]}
                />


            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">

                <InputField
                    label="Contact Number"
                    name="contact"
                    value={employees.contact}
                    onChange={handleEmployee}
                    placeholder="Enter the Employee contact number"
                    Icon={Phone}
                    type='number'
                />

                <InputField
                    label="Email"
                    name='email'
                    value={employees.email}
                    onChange={handleEmployee}
                    placeholder="Enter the Employee email"
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
                    placeholder="Enter the Employee location"
                    Icon={Locate}
                />

                <InputField
                    label="Join Date"
                    name='joinDate'
                    value={employees.joinDate}
                    onChange={handleEmployee}
                    placeholder="0000-00-00"
                    Icon={Calendar}
                    type='date'
                />

            </div>
            <label className="font-bold text-[#0b2b57] mt-2">
                Employee Description
            </label>

            <textarea
                name='notes'
                value={employees.notes}
                onChange={handleEmployee}
                className="w-full h-40 p-4 rounded-xl mt-2"
            />
            <div className="border-t pt-8 flex gap-4">

                <button className="px-10 py-4 border rounded-xl bg-blue-700 text-white hover:bg-blue-600"
                    onClick={onClose}>
                    Cancel
                </button>

                <button
                    onClick={addEmployees}
                    disabled={loading}
                    className="flex-1 bg-blue-700 text-white rounded-xl hover:bg-blue-600">

                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending Invitation...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-5 h-5" />
                           + Add Employee
                        </>
                    )}

                </button>

            </div>

        </div>

    )

}