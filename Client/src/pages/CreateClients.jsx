import { motion } from "framer-motion";
import InputField from "../components/InputField.jsx";
import {
    Globe,
    Phone,
    Mail,
    Users,
    IndianRupee,
    Calendar,
    X,
    MapPin,
    Flag,
    ActivityIcon
} from "lucide-react";
import { useState } from "react";
import { apiUrl } from "../config/api.js";

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

    const addClient = async () => {
        try {
            const response = await fetch(apiUrl("/clients"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(client)
            });
            const data = await response.json();
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

    const handleAddMember = (e) => {
        if (e.key === "Enter" && client.managerinput.trim()) {
            e.preventDefault();
            if (!client.managers.includes(client.managerinput.trim())) {
                setClient({
                    ...client,
                    managers: [...client.managers, client.managerinput.trim()],
                    managerinput: ""
                });
            }
        }
    };

    const removeMember = (member) => {
        setClient({
            ...client,
            managers: client.managers.filter((m) => m !== member)
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-[#e9e7e2] rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll"
        >
            <button
                onClick={onClose}
                className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white rounded-full transition-colors'
                aria-label="Close"
            >
                <X size={22} strokeWidth={2.5} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-[#0b2b57] mb-6 pr-8">
                Create New Client
            </h2>

            <div className="space-y-4 sm:space-y-5">
                <InputField
                    label="Company Name"
                    name="companyName"
                    onChange={handleChange}
                    value={client.companyName}
                    placeholder="e.g. Innovatech Solutions"
                />

                <InputField
                    label="Company Website"
                    name="website"
                    onChange={handleChange}
                    value={client.website}
                    placeholder="https://example.com"
                    Icon={Globe}
                />

                <InputField
                    label="Project Name"
                    name="projectName"
                    onChange={handleChange}
                    value={client.projectName}
                    placeholder="e.g. Redesign onboarding flow"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <InputField
                        label="Contact Number"
                        name="contactNumber"
                        onChange={handleChange}
                        value={client.contactNumber}
                        placeholder="+1 (555) 000-0000"
                        Icon={Phone}
                        type='phone'
                    />

                    <InputField
                        label="Email Address"
                        name="email"
                        onChange={handleChange}
                        value={client.email}
                        placeholder="contact@company.com"
                        Icon={Mail}
                        type="email"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                        label="Headquarters Location"
                        name="headquarters"
                        onChange={handleChange}
                        value={client.headquarters}
                        placeholder="e.g. New York, USA"
                        Icon={MapPin}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <InputField
                        label="No. of Employees"
                        name="employees"
                        onChange={handleChange}
                        value={client.employees}
                        placeholder="150"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                        <label className="font-bold text-[#0b2b57] text-sm block mb-1">
                            Add Managers
                        </label>
                        <div className="bg-white border border-gray-300 rounded-xl p-3 min-h-[50px]">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {client.managers.map((manager) => (
                                    <div
                                        key={manager}
                                        className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                                    >
                                        {manager}
                                        <button
                                            type="button"
                                            onClick={() => removeMember(manager)}
                                        >
                                            <X size={12} />
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
                                placeholder="Type manager name & press Enter"
                                className="w-full outline-none text-sm bg-transparent"
                            />
                        </div>
                    </div>

                    <InputField
                        label="Founded Date"
                        placeholder="YYYY-MM-DD"
                        name="foundeddate"
                        value={client.foundeddate}
                        onChange={handleChange}
                        Icon={Calendar}
                        type='date'
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <InputField
                        label="Project Start Date"
                        name="projectstartdate"
                        onChange={handleChange}
                        value={client.projectstartdate}
                        placeholder="YYYY-MM-DD"
                        Icon={Calendar}
                        type='date'
                    />

                    <InputField
                        label="Due Date"
                        name="duedate"
                        onChange={handleChange}
                        value={client.duedate}
                        placeholder="YYYY-MM-DD"
                        Icon={Calendar}
                        type='date'
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    <label className="font-bold text-[#0b2b57] text-sm block mb-2">
                        Project Description
                    </label>
                    <textarea
                        name="projectnotes"
                        value={client.projectnotes}
                        onChange={handleChange}
                        placeholder="Enter project notes or description..."
                        className="w-full h-32 rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={addClient}
                        className="flex-1 py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        + Add To Clients
                    </button>
                </div>
            </div>
        </motion.div>
    );
}