import React, { useState } from 'react';
import InputField from '../components/InputField';
import { apiUrl } from '../config/api';
import {
    User,
    Building2,
    Calendar,
    IndianRupee,
    X,
    Loader2
} from 'lucide-react';

export default function Createinvoice({ onClose, onSuccess, initialData }) {
    const [invoice, setInvoice] = useState({
        clientName: initialData?.clientName || '',
        companyName: initialData?.companyName || '',
        issuedDate: initialData?.issuedDate ? new Date(initialData.issuedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        budget: initialData?.budget || '',
        status: initialData?.status || 'Pending',
        paymentDescription: initialData?.paymentDescription || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoice((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!invoice.clientName.trim()) {
            setError('Please enter Client Name');
            return;
        }
        if (!invoice.companyName.trim()) {
            setError('Please enter Company Name');
            return;
        }
        if (!invoice.issuedDate) {
            setError('Please select Issued Date');
            return;
        }
        if (!invoice.dueDate) {
            setError('Please select Due Date');
            return;
        }
        if (!invoice.budget || Number(invoice.budget) <= 0) {
            setError('Please enter a valid Budget / Amount');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const payload = {
                clientName: invoice.clientName.trim(),
                companyName: invoice.companyName.trim(),
                issuedDate: invoice.issuedDate,
                dueDate: invoice.dueDate,
                budget: Number(invoice.budget),
                status: invoice.status,
                paymentDescription: invoice.paymentDescription.trim(),
            };

            const url = initialData?._id ? apiUrl(`/payment/${initialData._id}`) : apiUrl('/payment');
            const method = initialData?._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save payment invoice');
            }

            if (onSuccess) {
                onSuccess(data.payment || data);
            }
            onClose();
        } catch (err) {
            console.error('Error submitting invoice:', err);
            setError(err.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-8 md:p-10 relative shadow-2xl">
            <div className='absolute top-5 right-5 text-red-600 font-bold p-2 hover:bg-white/80 cursor-pointer rounded-full transition-colors'>
                <X size={24} strokeWidth='3px' onClick={onClose} />
            </div>

            <h2 className="text-2xl font-bold text-[#0b2b57] mb-6">
                {initialData?._id ? 'Edit Payment Invoice' : 'Create New Invoice'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                    label="Client Name"
                    placeholder="Enter the Client name..."
                    Icon={User}
                    name="clientName"
                    value={invoice.clientName}
                    onChange={handleChange}
                />

                <InputField
                    label="Company Name"
                    placeholder="Enter the company name"
                    Icon={Building2}
                    name="companyName"
                    value={invoice.companyName}
                    onChange={handleChange}
                />

                <div className="grid md:grid-cols-2 gap-5">
                    <InputField
                        label="Issued Date"
                        placeholder="Select issued date"
                        Icon={Calendar}
                        type="date"
                        name="issuedDate"
                        value={invoice.issuedDate}
                        onChange={handleChange}
                    />

                    <InputField
                        label="Due Date"
                        placeholder="Select due date"
                        Icon={Calendar}
                        type="date"
                        name="dueDate"
                        value={invoice.dueDate}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <InputField
                        label="Budget / Amount (₹)"
                        placeholder="Enter amount (e.g. 50000)"
                        Icon={IndianRupee}
                        type="number"
                        name="budget"
                        value={invoice.budget}
                        onChange={handleChange}
                    />

                    <InputField
                        label="Status"
                        Icon={Calendar}
                        name="status"
                        value={invoice.status}
                        onChange={handleChange}
                        type="select"
                        options={[
                            "Paid",
                            "Pending",
                            "Overdue",
                            "Partial",
                            "Cancelled"
                        ]}
                    />
                </div>

                <div>
                    <label className="block font-bold text-[#0b2b57] mb-2">
                        Payment Description
                    </label>

                    <textarea
                        name="paymentDescription"
                        value={invoice.paymentDescription}
                        onChange={handleChange}
                        placeholder="Add optional notes or descriptions for this payment..."
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 outline-none bg-white text-gray-700 resize-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="border-t border-gray-300 pt-6 flex gap-4">
                    <button
                        type="button"
                        className="px-8 py-3.5 border rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#2563a9] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                {initialData?._id ? 'Updating...' : 'Saving Invoice...'}
                            </>
                        ) : (
                            <>
                                {initialData?._id ? 'Update Invoice' : '+ Add INVOICE'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}