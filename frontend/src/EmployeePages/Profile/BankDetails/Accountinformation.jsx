import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../../components/InputField";
import { Eye, EyeOff } from "lucide-react";
import { getProfile, updateProfile } from "../../../services/profileApi";
import { useAuth } from "../../../context/AuthContext";

export default function AccountInformation() {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showAccount, setShowAccount] = useState(false);
    const [showConfirmAccount, setShowConfirmAccount] = useState(false);
    const { fetchCurrentUser } = useAuth();

    const [form, setForm] = useState({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        accountType: "",
        branchName: "",
    });

    useEffect(() => {
        getProfile().then(({ data }) => {
            const bank = data.user?.profile?.bankDetails || {};
            setForm((previous) => ({
                ...previous,
                ...bank,
                branchName: bank.branchName || bank.bankBranchAddress || "",
                confirmAccountNumber: bank.accountNumber || "",
            }));
        }).catch((error) => setMessage({ type: "error", text: error.response?.data?.message || "Failed to load bank details" }));
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        if (!isEditing) {
            setIsEditing(true);
            setMessage({ type: "", text: "" });
            return;
        }
        if (form.accountNumber !== form.confirmAccountNumber) {
            setMessage({ type: "error", text: "Account numbers do not match" });
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const { confirmAccountNumber, ...bankDetails } = form;
            await updateProfile({ bankDetails });
            await fetchCurrentUser();
            setIsEditing(false);
            setMessage({ type: "success", text: "Bank details updated successfully" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update bank details" });
        } finally {
            setSaving(false);
        }
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
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-blue-900 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:scale-105 transition duration-300 disabled:opacity-60 disabled:hover:scale-100"
                >
                    {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </button>
            </div>
            {message.text && <p className={`mb-4 text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>{message.text}</p>}

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
                        name="branchName"
                        type="textarea"
                        value={form.branchName}
                        onChange={handleChange}
                        placeholder="Enter Branch Address"
                        disabled={!isEditing}
                    />
                </div>
            </div>
        </motion.div>
    );
}