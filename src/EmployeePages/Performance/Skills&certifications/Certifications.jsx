import { SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AddCertification from "./AddCertification";
import useSkillCertification from "../../../Hooks/useSkillCertification";
import { useAuth } from "../../../context/AuthContext";

const Certifications = () => {
    const [addForm, setAddForm] = useState(false);

    const { getAll, deleteCertification } = useSkillCertification();
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // ================= FETCH DATA =================
    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAll();
            const currentEmployeeId = user?.uid || user?._id || user?.id || user?.email || "";
            const userData = res?.data?.filter(
                (item) => String(item.employee_uid) === String(currentEmployeeId)
            );

            if (res?.data && userData?.length > 0) {
                setCertifications(userData[0]?.certifications || []);
            } else {
                setCertifications([]);
            }
        } catch (err) {
            setError("Failed to load certifications");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (certId) => {
        if (window.confirm('Are you sure you want to delete this certification?')) {
            try {
                const res = await deleteCertification(user?.uid, certId);
                if (res?.success) {
                    await fetchCertifications();
                }
            } catch (err) {
                setError("Failed to delete certification");
                console.error(err);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white mx-6 rounded-2xl border border-gray-200 shadow-sm p-8 mb-8"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0B2B57]">Certifications</h2>
                        <p className="text-gray-500 mt-2">Professional certifications and credentials</p>
                    </div>

                    <button
                        className="flex items-center gap-2 bg-[#0B5DB5] text-white px-6 py-3 rounded-xl hover:bg-[#0945A0] transition shadow-sm"
                        onClick={() => setAddForm(true)}
                    >
                        <SquarePen size={18} />
                        Add Certificate
                    </button>
                </div>

                {/* ERROR STATE */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        {error}
                    </div>
                )}

                {/* LOADING STATE */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5DB5]"></div>
                        <p className="ml-4 text-gray-500">Loading certifications...</p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && certifications?.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <SquarePen className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No certifications yet</p>
                        <p className="text-gray-400 mt-2">Add your professional certifications to showcase your credentials</p>
                    </div>
                )}

                {/* CERTIFICATIONS LIST */}
                {!loading && certifications?.length > 0 && (
                    <div className="space-y-4">
                        {certifications.map((cert, index) => (
                            <motion.div
                                key={cert._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -2 }}
                                className="relative group border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition"
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(cert._id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-lg"
                                    title="Delete certification"
                                >
                                    <Trash2 size={18} className="text-red-600" />
                                </button>

                                {/* Certificate Image if available */}
                                {cert.image && (
                                    <div className="mb-4">
                                        <img
                                            src={`http://localhost:5000${cert.image}`}
                                            alt={cert.title}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Certificate Info */}
                                <h3 className="text-2xl font-bold text-[#0B2B57] mb-2">
                                    {cert.title}
                                </h3>

                                <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold">Issuer:</span>
                                        <span className="text-[#0B5DB5]">{cert.issuer || "N/A"}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold">Issued:</span>
                                        <span>{cert.issued ? new Date(cert.issued).toLocaleDateString('en-GB') : "N/A"}</span>
                                    </p>
                                    {cert.credentialId && (
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold">Credential ID:</span>
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{cert.credentialId}</span>
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* MODAL */}
            {addForm && (
                <AddCertification
                    onClose={() => setAddForm(false)}
                    fetchCertifications={fetchCertifications}
                />
            )}
        </>
    );
};

export default Certifications;