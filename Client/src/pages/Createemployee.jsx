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

        });


    
    const addEmployees = async () => {
        try {
            await addDoc(collection(db, "employees"), {
                ...employees,
                createdAt: Timestamp.now(),
                isOnline: false,
            });

            alert("Employee added successfully");

            onClose();
            navigate("/employees");

        } catch (error) {
            console.error(error);
            alert("Failed to add employee");
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

        <div className="w-full max-w-4xl mx-auto bg-[#e9e7e2] rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll">
            <button
                onClick={onClose}
                className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white rounded-full transition-colors'
                aria-label="Close"
            >
                <X size={22} strokeWidth={2.5} />
            </button>

            <InputField
                label="Employee Name"
                name="employeeName"
                value={employees.employeeName}
                onChange={handleEmployee}
                placeholder="Enter the Employee name..."
            />

            <div className="mt-5">
                <InputField
                    label="Employee Role"
                    name="employeeRole"
                    value={employees.employeeRole}
                    onChange={handleEmployee}
                    placeholder="Enter the Employee role"
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
            <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">

                <button className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                    onClick={onClose}>
                    Cancel
                </button>

                <button
                    onClick={addEmployees}
                    className="flex-1 py-3 px-6 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors">

                    + Add Employee

                </button>

            </div>

        </div>

    )

}