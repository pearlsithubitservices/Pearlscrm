import React, { useState, useEffect } from 'react'
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
const Employeecomp = () => {

    const [employees, setEmployees] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    // FETCH LEADS

    const fetchLeads =
        async () => {

            try {

                setLoading(true);
                const response =
                    await fetch(
                        'https://pearlscrm.onrender.com/api/leads'
                    );

                const data =
                    await response.json();

                setLeads(data);

            } catch (error) {

                console.log(error);

            }
            finally {
                setLoading(false);  //👈 stop loading no matter what
            }

        };

    // FETCH EMPLOYEES

    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(db, 'employees'),

                (snapshot) => {

                    const employeeList = [];

                    snapshot.forEach((docItem) => {

                        employeeList.push({

                            id: docItem.id,

                            ...docItem.data(),

                        });

                    });

                    setEmployees(employeeList);

                }

            );

        return () => unsubscribe();

    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading data...</p>
            </div>
        );
    }

    return (
        <div
            className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            bg-[#f3f0eb]
          "
        >

            {/* TABLE */}

            <div className="md:col-span-2 p-2">

                <div
                    className="           
                rounded-xl        
                overflow-hidden
                ml-6  "
                >

                    <div
                        className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-5
                  bg-white
                  border border-gray-200 rounded-xl
                  h-10
                  mb-8
                  text-[#0b2b57]
                  text-lg
                "
                    >

                        <h2 className=" text-lg font-bold  text-[#0b2b57]">
                            Employee Activity
                        </h2>

                        <button className="text-[#2563a9] font-semibold">
                            5 Online
                        </button>

                    </div>

                    <div className="overflow-x-auto rounded bg-white text-black  p-8">
                        <div >
                            <div className='flex justify-between items-center '>
                                <p className='text-[#0b2b57] text-xl font-bold'> Employee</p>
                                <p className='font-semibold'>Leads</p>
                                <p className='font-semibold'> Progress</p>
                            </div>
                            {employees ? (employees.slice(0, 5).map((data) => (

                                <div key={data._id} className='flex  justify-between mt-4 gap-2 items-center font-sans'>
                                    <div className='flex  gap-2'>
                                        <div className="w-12 h-12 bg-red-300 rounded-full flex items-center justify-center font-bold">
                                            {(data.name || "")
                                                .split(" ")
                                                .map(v => v[0])
                                                .join("")
                                                .toUpperCase()}
                                        </div>
                                        <div className='w-fit '>
                                            <p className='font-semibold text-black'>{data.name}</p>
                                            <p className='text-sm text-gray-400 '>{data.role}</p>

                                        </div>
                                    </div>

                                    <p className='text-sm text-gray-400  items-center '>42 Leads</p>

                                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{ width: "70%" }}
                                        />
                                    </div>
                                </div>
                            ))) :

                                (<p className='text-black'>NoData</p>)}

                        </div>

                    </div>

                </div>

            </div>

            {/* RIGHT PANEL */}
            {/**PENDING QUOTATIONS */}
            <div
                className="  rounded-2xl p-2 mr-2 "
            >

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border rounded-xl p-2 bg-white">

                    <h2 className="text-lg font-bold text-[#0b2b57] ">
                        Pending Quotations
                    </h2>

                    <button className="text-[#2563a9] font-semibold">
                        View all
                    </button>

                </div>

                {/* Main Content */}

                <div className="overflow-hidden rounded bg-white text-black p-5">
                    <table className="w-full border">

                        <thead className="bg-gray-50">
                            <tr className="text-[#0b2b57]">
                                <th className="text-left p-3 border-r">Company</th>
                                <th className="text-left p-3 border-r">Budget</th>
                                <th className="text-left p-3 w-28">Status</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm">
                            {leads.slice(0, 5).map((lead) => (
                                <tr key={lead._id} className="border-t">

                                    <td className="p-3 border-r">
                                        <h2 className="font-bold text-sm">
                                            {lead.company}
                                        </h2>

                                        <p className="text-gray-400 text-xs">
                                            {lead.name}
                                        </p>
                                    </td>

                                    <td className="p-3 border-r">
                                        ₹10,000
                                    </td>

                                    <td className=" w-28 p-1 border-black">
                                        <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs w-10 h-2">
                                            urgent
                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            </div>

        </div>
    )
}

export default Employeecomp