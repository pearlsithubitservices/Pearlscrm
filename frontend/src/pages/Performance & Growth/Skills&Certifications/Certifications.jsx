import { motion } from "framer-motion";
import { Award, Download, Eye, EyeClosed, EyeOff } from "lucide-react";
import { useParams } from "react-router-dom";
import useSkillCertification from "../../../Hooks/useSkillCertification";
import { useEffect, useState } from "react";



export default function Certifications({ employeeId, employee }) {
    const params = useParams();
    const empId = employeeId || employee?.uid || employee?.id || employee?._id || params.id;
    const { getAll } = useSkillCertification();
    const [skillsAndCertifications, setSkillsAndCertifications] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentskillsAndCertifications = useMemo(() => {
        return skillsAndCertifications.filter(
            (item) =>
                String(item.employee_uid || "") === String(empId || "") ||
                String(item.employeeId || "") === String(empId || "") ||
                String(item.id || "") === String(empId || "")
        );
    }, [skillsAndCertifications, empId]);

    const fetchSkillsAndCertifications = async () => {
        if (!empId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getAll(empId);
            setSkillsAndCertifications(Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : []));
        } catch (error) {
            console.error("Error fetching skills and certifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkillsAndCertifications();
    }, [empId]);

    return (
        <section className=" py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-6xl mx-auto bg-[#faf9f7] border border-gray-300 rounded-2xl p-5 shadow-sm"
            >
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-md px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-blue-700" />
                        <h2 className="text-2xl md:text-4xl font-bold text-black">
                            Certifications
                        </h2>
                    </div>

                    <div className="bg-[#E8EEF7] px-5 py-3 rounded-xl text-gray-600 font-semibold text-lg">
                        {currentskillsAndCertifications[0]?.certifications?.length || 0} Certificates
                    </div>
                </div>

                {/* Cards */}
                <div className="mt-6 space-y-6">
                    {currentskillsAndCertifications[0]?.certifications?.length ? (
                        currentskillsAndCertifications[0]?.certifications?.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.08,
                                    duration: 0.4,
                                }}
                                whileHover={{
                                    y: -4,
                                    scale: 1.01,
                                }}
                                className="bg-white rounded-xl border border-gray-200 shadow-md p-5 cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-[#1C3D63]">
                                            {item.title}
                                        </h3>

                                        <p className="mt-2 text-gray-500 text-sm md:text-base">
                                            {item?.issuer}
                                            {item.issued && (
                                                <>
                                                    <span className="mx-2">·</span>
                                                    <span>issued {item.issued}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            disabled={!item.image}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!item.image) return;
                                                window.open(item.image, "_blank");
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-medium transition-all duration-200 ${item.image
                                                ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 cursor-pointer"
                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <Download size={18} />
                                            {item.image ? "Download" : "No Document"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.image) setSelectedCertificate(item);
                                            }}
                                            disabled={!item.image}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200 ${item.image
                                                ? "bg-[#0E5BA8] text-white hover:bg-[#0B4B8A] hover:shadow-lg active:scale-95 cursor-pointer"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                                }`}
                                        >
                                            {item.image ? <Eye size={18} /> : <EyeOff size={18} />}
                                            {item.image ? "View" : "No Document"}
                                        </button>
                                    </div>
                                </div>

                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-200">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                                <Award size={28} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">No Certifications Uploaded</h4>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                Professional credentials and certificates for this employee will appear here once uploaded.
                            </p>
                        </div>
                    )}
                </div>
                {selectedCertificate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setSelectedCertificate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5"
                        >
                            <button
                                onClick={() => setSelectedCertificate(null)}
                                className="absolute top-4 right-4 text-white bg-red-700 w-5 h-5  hover:bg-white  hover:text-red-500 "
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold mb-4">
                                {selectedCertificate.title}
                            </h2>

                            {selectedCertificate.image?.endsWith(".pdf") ? (
                                <iframe
                                    // src={`http://localhost:5000${selectedCertificate.image}`}
                                    src={`http://pearlscrm.onrender.com${selectedCertificate.image}`}
                                    className="w-full h-[700px] rounded-xl"
                                    title="Certificate"
                                />
                            ) : (
                                <img
                                    // src={`http://localhost:5000${selectedCertificate.image}`}
                                    src={`http://pearlscrm.onrender.com${selectedCertificate.image}`}
                                    alt={selectedCertificate.title}
                                    className="w-full max-h-[700px] object-contain rounded-xl"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </section>
    );
}