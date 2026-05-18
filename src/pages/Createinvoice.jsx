import React, {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    collection,
    getDocs,
    addDoc,
} from 'firebase/firestore';

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
    Calendar
} from 'lucide-react';

export default function CreateTask({ onClose }) {

    const navigate =
        useNavigate();

    const [employees, setEmployees] =
        useState([]);

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

    useEffect(() => {

        fetchEmployees();

    }, []);

    // FETCH EMPLOYEES

    const fetchEmployees =
        async () => {

            try {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            'employees'
                        )
                    );

                const employeeList = [];

                snapshot.forEach((doc) => {

                    employeeList.push({

                        id: doc.id,

                        ...doc.data(),

                    });

                });

                setEmployees(employeeList);

            } catch (error) {

                console.log(error);

            }

        };

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

        <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-10">

            <InputField
                label="Client Name"
                placeholder="Enter the Client name..."
            />

            <div className="mt-5">
                <InputField
                    label="Company Name"
                    placeholder="Enter the company name"
                />


            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">

                <InputField
                    label="Issued Date"
                    placeholder="0000-00-00"
                    Icon={Users}
                />

                <InputField
                    label="Due Date"
                    placeholder="0000-00-00"
                    Icon={Users}
                />

            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">

                <InputField
                    label="Budget"
                    placeholder="INR 0.000"
                    Icon={Activity}
                />

                <InputField
                    label="Status"
                    placeholder="paid"
                    Icon={Calendar}
                />

            </div>
            <label className="font-bold text-[#0b2b57] mt-2">
                Payment Description
            </label>

            <textarea
                className="w-full h-40 p-4 rounded-xl mt-2"
            />
            <div className="border-t pt-8 flex gap-4">

                <button className="px-10 py-4 border rounded-xl bg-blue-700 text-white hover:bg-blue-600"
                    onClick={onClose}>
                    Cancel
                </button>

                <button className="flex-1 bg-blue-700 text-white rounded-xl hover:bg-blue-600">

                    + Add Task

                </button>

            </div>

        </div>

    )

}