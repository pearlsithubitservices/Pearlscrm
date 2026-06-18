import { SquarePen } from 'lucide-react';
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import AddCertification from './AddCertification';
const certifications = [
    {
        title: "AWS Solutions Architect certification",
        issuer: "Amazon Web Services",
        issued: "Apr 2026",
    },
    {
        title: "Meta Frontend Developer",
        issuer: "Meta",
        issued: "Jun 2024",
    },
    {
        title: "Google IT Support Professional",
        issuer: "Google",
        issued: "Jan 2023",
    },
    {
        title: "Certified Scrum Master (CSM)",
        issuer: "Scrum Alliance",
        issued: "Mar 2023",
    },
];

const Certifications = () => {
    const [addForm, setAddForm]=useState(false);
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white mt-8 rounded-2xl border shadow-sm p-5"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        Certifications
                    </h2>

                    <button className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-xl text-gray-700 hover:bg-slate-200 transition"
                    onClick={()=>setAddForm(true)}>
                        <SquarePen
                            size={18} />
                        Add Certificate
                    </button>
                </div>

                <div className="space-y-5">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            className="border rounded-xl p-5 shadow-sm"
                        >
                            <h3 className="text-2xl text-slate-900 font-medium">
                                {cert.title}
                            </h3>

                            <p className="text-gray-500 text-xl mt-2">
                                {cert.issuer} • Issued {cert.issued}
                            </p>
                        </motion.div>
                    ))}
                </div>
                {addForm && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center ">
                        <AddCertification
                            onClose={() => setAddForm(false)} />
                    </div>
                )}
            </motion.div></>
    )
}

export default Certifications