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
    Users,
    Activity,
    Calendar,
    X
} from 'lucide-react';

export default function Createinvoice({ onClose }) {

    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    const [invoice, setInvoice] = useState({
        clientName: '',
        company: '',
        issuedDate: '',
        dueDate: '',
        budget: '',
        status: 'Pending',
        description: '',
    });

    const handleChange = (e) => {
        setInvoice({
            ...invoice,
            [e.target.name]: e.target.value,
        });
    };

    const addInvoice = async () => {
        try {
            await addDoc(
                collection(db, 'invoices'),
                {
                    ...invoice,
                    createdAt: new Date(),
                }
            );

            alert('Invoice Added Successfully');
            onClose();
            navigate('/payments');
        } catch (error) {
            console.log(error);
            alert('Failed to add invoice');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-[#e9e7e2] rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll">
            <button
                onClick={onClose}
                className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white rounded-full transition-colors'
                aria-label="Close"
            >
                <X size={22} strokeWidth={2.5} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-[#0b2b57] mb-6 pr-8">
                Create New Invoice
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField
                    label="Client Name"
                    name="clientName"
                    value={invoice.clientName}
                    onChange={handleChange}
                    placeholder="Enter Client name..."
                />

                <InputField
                    label="Company Name"
                    name="company"
                    value={invoice.company}
                    onChange={handleChange}
                    placeholder="Enter company name..."
                />

                <InputField
                    label="Issued Date"
                    name="issuedDate"
                    value={invoice.issuedDate}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                    Icon={Users}
                    type='date'
                />

                <InputField
                    label="Due Date"
                    name="dueDate"
                    value={invoice.dueDate}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                    Icon={Users}
                    type='date'
                />

                <InputField
                    label="Budget"
                    name="budget"
                    value={invoice.budget}
                    onChange={handleChange}
                    placeholder="₹0.00"
                    Icon={Activity}
                />

                <InputField
                    label="Status"
                    name="status"
                    value={invoice.status}
                    onChange={handleChange}
                    placeholder="Pending"
                    Icon={Calendar}
                    type='select'
                    options={[
                        "Paid",
                        "Pending",
                        "Overdue",
                        "Partial",
                        "Cancelled"
                    ]}
                />
            </div>

            <div className="mt-4">
                <label className="font-bold text-[#0b2b57] text-sm sm:text-base block mb-2">
                    Payment Description
                </label>

                <textarea
                    name="description"
                    value={invoice.description}
                    onChange={handleChange}
                    placeholder="Enter invoice details or line items..."
                    className="w-full h-32 p-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">
                <button
                    className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button
                    onClick={addInvoice}
                    className="flex-1 py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                    + Add Invoice
                </button>
            </div>
        </div>
    );
}