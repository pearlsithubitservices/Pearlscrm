import { motion } from "framer-motion";

import InputField from "../components/InputField.jsx";

import {
    Globe,
    Phone,
    Mail,
    Users,
    IndianRupee,
    Calendar,
    User,
    X,
    MapPin,
    Flag,
    FlagOff,
    ActivityIcon
} from "lucide-react";
import { Activity, useState } from "react";


export default function ClientForm({ onClose }) {

    const [client, setClient] = useState({
        companyName: "",
        projectName: "",
        website: "",
        contactNumber: "",
        email: "",
        revenue: "",
        headquarters: "",
        employees: "",
        budget: "",
        managerinput: "",
        managers: [],
        projectstartdate: "",
        duedate: "",
        projectnotes: "",
        foundeddate: "",
        priority: "",
        status: ""
    });

    //ADD CLIENT
    const addClient = async () => {
        try {
            console.log("Adding client:", client);
            const response = await fetch("http://localhost:5000/api/clients",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(client)
                });
            const data = await response.json();
            console.log("Client added:", data);
            if (response.ok) {
                alert("Client Added Successfully");
                onClose();
            }

        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    function handleChange(e) {
        setClient({
            ...client,
            [e.target.name]: e.target.value
        });
    }

    const handleManager = (e) => {
        setClient({
            ...client,
            [e.target.name]: e.target.value
        });
    };
    // Add member when Enter pressed
    const handleAddMember = (e) => {

        if (e.key === "Enter" && client.managerinput.trim()) {
            e.preventDefault();

            if (
                !client.managers.includes(
                    client.managerinput
                )
            ) {
                setClient({
                    ...client,
                    managers: [
                        ...client.managers,
                        client.managerinput
                    ],
                    managerinput: ""
                });
            }
        }
    };
    const removeMember = (member) => {
        setClient({
            ...client,
            managers: client.managers.filter(
                (m) => m !== member
            )
        });
    };
    return (

        <motion.div
            initial={{
                opacity: 0,
                y: 50
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            className="max-w-5xl mx-auto mt-5 bg-[#e9e7e2] rounded-[40px] p-10 relative"

        >
            <div className='absolute top-5 right-5 text-red-600 font-bold w-25 h-25 hover:bg-white rounded'>
                <X size={22} strokeWidth='3px' onClick={onClose} />
            </div>

            <div className="flex items-center gap-5 mb-8 ">

                <p className="text-gray-400 tracking-[2px] mt-8 text-sm">
                    CLIENT DETAILS
                </p>
                <div className="flex-1 h-[1px] bg-gray-400 mt-8" />
            </div>


            <div className="space-y-6">

                <InputField
                    label="Company Name"
                    name="companyName"
                    onChange={handleChange}
                    value={client.companyName}
                    placeholder="e.g Redesign onboarding flow"
                />

                <InputField
                    label="Company Website"
                    name="website"
                    onChange={handleChange}
                    value={client.website}
                    placeholder="Website"
                    Icon={Globe}
                />
                <InputField
                    label="Project Name"
                    name="projectName"
                    onChange={handleChange}
                    value={client.projectName}
                    placeholder="e.g Redesign onboarding flow"
                />

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Contact Number"
                        name="contactNumber"
                        onChange={handleChange}
                        value={client.contactNumber}
                        placeholder="+1(555)000"
                        Icon={Phone}
                        type='phone'
                    />

                    <InputField
                        label="Email Address"
                        name="email"
                        onChange={handleChange}
                        value={client.email}
                        placeholder="abc@gmail.com"
                        Icon={Mail}
                        type="email"
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Annual Revenue"
                        name="revenue"
                        onChange={handleChange}
                        value={client.revenue}
                        placeholder="₹1,00,00,000"
                        Icon={IndianRupee}
                        type="number"
                    />

                    <InputField
                        label="HeadQuarters Location"
                        name="headquarters"
                        onChange={handleChange}
                        value={client.headquarters}
                        placeholder="e.g New York"
                        Icon={MapPin}
                    />



                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="No of Employees"
                        name="employees"
                        onChange={handleChange}
                        value={client.employees}
                        placeholder="156"
                        Icon={Users}
                    />

                    <InputField
                        label="Contract Budget"
                        name="budget"
                        onChange={handleChange}
                        value={client.budget}
                        placeholder="₹0.00"
                        Icon={IndianRupee}
                        type="number"
                    />

                </div>



                <div className="grid md:grid-cols-2 gap-5 ">
                    <div>
                        <label className="font-bold text-[#0b2b57] ">
                            Add Managers
                        </label>
                        <div className="bg-white rounded-xl p-3  h-15 mt-2">

                            <div className="flex flex-wrap gap-2 mb-2">

                                {client.managers.map((manager) => (

                                    <div
                                        key={manager}
                                        className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full"
                                    >
                                        {manager}

                                        <button
                                            onClick={() =>
                                                removeMember(manager)
                                            }
                                        >
                                            <X size={14} />
                                        </button>

                                    </div>

                                ))}

                            </div>

                            <input
                                type="text"
                                value={client.managerinput}

                                onChange={(e) =>
                                    setClient({
                                        ...client,
                                        managerinput: e.target.value
                                    })
                                }
                                onKeyDown={handleAddMember}
                                placeholder="Type manager name and press Enter"
                                className="w-full outline-none"
                            />

                        </div>
                    </div>

                    <InputField
                        label="Founded Date"
                        placeholder="May 15"
                        name="foundeddate"
                        value={client.foundeddate}
                        onChange={handleChange}
                        Icon={Calendar}
                        type='date'
                    />

                </div>
                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Project Start Date"
                        name="projectstartdate"
                        onChange={handleChange}
                        value={client.projectstartdate}
                        placeholder="May 15"
                        Icon={Calendar}
                        type='date'
                    />

                    <InputField
                        label="Due Date"
                        name="duedate"
                        onChange={handleChange}
                        value={client.duedate}
                        placeholder="May 15"
                        Icon={Calendar}
                        type='date'
                    />

                </div>
                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Priority"
                        name="priority"
                        onChange={handleChange}
                        value={client.priority}
                        placeholder="Select Priority"
                        Icon={Flag}
                        type="select"
                        options={[
                            { value: "High", label: "High" },
                            { value: "Medium", label: "Medium" },
                            { value: "Low", label: "Low" }
                        ]}
                    />

                    <InputField
                        label="Status"
                        name="status"
                        onChange={handleChange}
                        value={client.status}
                        placeholder="Select Status"
                        Icon={ActivityIcon}
                        type="select"
                        options={[
                            { value: "New", label: "New" },
                            { value: "Interested", label: "Interested" },
                            { value: "Converted", label: "Converted" },
                            { value: "Lost", label: "Lost" }
                        ]}
                    />

                </div>

               

                <div>

                    <label className="font-bold text-[#0b2b57]">
                        Project Description
                    </label>

                    <textarea
                        name="projectnotes"
                        value={client.projectnotes}
                        onChange={handleChange}
                        className="w-full h-40 mt-3 rounded-xl border p-4 resize-none"
                    />

                </div>

                <div className="border-t pt-8 flex gap-4">

                    <button className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white"
                        onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        onClick={addClient}
                        className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl">

                        + Add To Clients

                    </button>

                </div>

            </div>

        </motion.div>

    )

}