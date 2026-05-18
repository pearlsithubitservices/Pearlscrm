import InputField from "../components/InputField.jsx";

import {
    Users,
    Calendar,
    IndianRupee
}
    from "lucide-react";

export default function ProjectForm({onClose}) {

    return (

        <div className="max-w-5xl mx-auto bg-[#e9e7e2] p-10 rounded-[40px]">

            <div className="space-y-5">

                <InputField
                    label="Company Name"
                    placeholder="Company"
                />

                <InputField
                    label="Project Title"
                    placeholder="Project title"
                />

                <label className="font-bold text-[#0b2b57]">
                    Project Description
                </label>

                <textarea
                    className="w-full h-40 rounded-xl p-4"
                />

                <InputField
                    label="Add Project Members"
                    placeholder="suresh, vishnu..."
                    Icon={Users}
                />

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Assigned Date"
                        placeholder="May 15"
                        Icon={Calendar}
                    />

                    <InputField
                        label="Due Date"
                        placeholder="May 15"
                        Icon={Calendar}
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <InputField
                        label="Project Leader"
                        placeholder="Leader"
                    />

                    <InputField
                        label="Budget"
                        placeholder="₹0.00"
                        Icon={IndianRupee}
                    />

                </div>
                <div className="border-t pt-8 flex gap-4">

                    <button className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl">

                        + Add  Project

                    </button>

                </div>

            </div>

        </div>

    )

}