import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../../components/InputField";
import { Eye, EyeOff } from "lucide-react";

export default function AccountInformation() {
    const [showAccount, setShowAccount] = useState(false);
    const [showConfirmAccount, setShowConfirmAccount] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        accountType: "",
        bankBranchAddress: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        // Save Data
        console.log(form);

        // API Call Here
        // await updateAccountInfo(form);

        setIsEditing(false);
    };

    const fields = [
        {
            label: "Account Holder Name",
            name: "accountHolderName",
            placeholder: "Enter Account Holder Name",
        },
        {
            label: "Bank Name",
            name: "bankName",
            placeholder: "Enter Bank Name",
        },
        {
            label: "Account Number",
            name: "accountNumber",
            type: showAccount ? "text" : "password",
            placeholder: "Enter Account Number",
            icon: showAccount ? Eye : EyeOff,
            onIconClick: () => setShowAccount((prev) => !prev),
        },
        {
            label: "Confirm Account Number",
            name: "confirmAccountNumber",
            type: showConfirmAccount ? "text" : "password",
            placeholder: "Confirm Account Number",
            icon: showConfirmAccount ? Eye : EyeOff,
            onIconClick: () => setShowConfirmAccount((prev) => !prev),
        },
        {
            label: "IFSC Code",
            name: "ifscCode",
            placeholder: "HDFC0001234",
        },
        {
            label: "Account Type",
            name: "accountType",
            type: "select",
            placeholder: "Select Account Type",
            options: [
                {
                    label: "Savings Account",
                    value: "Savings Account",
                },
                {
                    label: "Current Account",
                    value: "Current Account",
                },
                {
                    label: "Salary Account",
                    value: "Salary Account",
                },
            ],
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border shadow-sm p-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57]">
                    Bank Account Information
                </h2>

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                >
                    {isEditing ? "Save Info" : "Update Info"}
                </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {fields.map((field) => (
                    <div key={field.name} >
                        <InputField
                            {...field}
                            value={form[field.name]}
                            onChange={handleChange}
                            disabled={!isEditing}
                            Icon={field.icon}
                            
                        />

                        


                    </div>
                ))}

                <div className="lg:col-span-2">
                    <InputField
                        label="Bank Branch Address"
                        name="bankBranchAddress"
                        type="textarea"
                        value={form.bankBranchAddress}
                        onChange={handleChange}
                        placeholder="Enter Branch Address"
                        disabled={!isEditing}
                    />
                </div>
            </div>
        </motion.div>
    );
}