import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AddCertification from "./AddCertification";
import useSkillCertification from "../../../Hooks/useSkillCertification";
import { useAuth } from "../../../context/AuthContext";

const Certifications = () => {
    const [addForm, setAddForm] = useState(false);

    const { getAll, data, loading, error } = useSkillCertification();
    const [certifications, setCertifications] = useState([]);
    const { user } = useAuth();
    console.log(certifications);

    // ================= FETCH DATA =================
    useEffect(() => {
        const fetchCertifications = async () => {
            const res = await getAll();
            const userData = res?.data?.filter(
                (item) => item.employee_uid === user?.uid
            );


            // assuming backend structure: { data: [...] }
            if (res?.data) {
                setCertifications(userData[0]?.certifications || []);
            }
        };

        fetchCertifications();
    }, []);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white mt-8 rounded-2xl border shadow-sm p-5"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Certifications</h2>

                    <button
                        className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-xl text-gray-700 hover:bg-slate-200 transition"
                        onClick={() => setAddForm(true)}
                    >
                        <SquarePen size={18} />
                        Add Certificate
                    </button>
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <p className="text-gray-500">Loading certifications...</p>
                )}

                {/* ERROR */}
                {error && (
                    <p className="text-red-500">{error}</p>
                )}

                {/* LIST */}
                <div className="space-y-5">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert._id || index}
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

                {/* MODAL */}
                {addForm && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                        <AddCertification onClose={() => setAddForm(false)} />
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default Certifications;