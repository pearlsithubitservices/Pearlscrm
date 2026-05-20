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

        <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-10 relative">
            <div className='absolute top-5 right-5 text-red-600 font-bold w-25 h-25 hover:bg-white rounded'>
                <X size={22} strokeWidth='3px' onClick={onClose} />
            </div>

            <InputField
                label="Employee Name"
                placeholder="Enter the Employee name..."
            />

            <div className="mt-5">
                <InputField
                    label="Employee Role"
                    placeholder="Enter the Employee role"
                />


            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">

                <InputField
                    label="Contact Number"
                    placeholder="Enter the Employee contact number"
                    Icon={Phone}
                />

                <InputField
                    label="Email"
                    placeholder="Enter the Employee email"
                    Icon={Mail}
                />

            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-5">

                <InputField
                    label="Location"
                    placeholder="Enter the Employee location"
                    Icon={Locate}
                />

                <InputField
                    label="Join Date"
                    placeholder="0000-00-00"
                    Icon={Calendar}
                    type='date'
                />

            </div>
            <label className="font-bold text-[#0b2b57] mt-2">
                Employee Description
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

                    + Add Employee

                </button>

            </div>

        </div>

    )

}