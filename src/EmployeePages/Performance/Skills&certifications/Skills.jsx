import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SquarePen, X } from 'lucide-react'
import AddSkillForm from './AddSkill';
import useSkillCertification from '../../../Hooks/useSkillCertification';


const Skills = () => {
    const [addForm, setAddForm] = useState(false);
    const { getById, getAll, deleteSkill } = useSkillCertification();
    const [Skills, setSkills] = useState([]);
    console.log(Skills);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await getAll();

            if (res?.success && res?.data?.length > 0) {
                setSkills(res.data[0].skills || []);
            } else {
                setSkills([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    //DELETE SKILL
    const handleDelete = async (skill_id) => {
        try {
            const employee_uid = "EMP001"; // replace with dynamic user id later

            const res = await deleteSkill(employee_uid, skill_id);
console.log(skill_id);
            if (res?.success) {
                fetchSkills(); // refresh list
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between"
            >
                <h1 className="text-4xl font-bold text-black">
                    My Skills & Proficiency
                </h1>

                <button className="flex items-center gap-2 bg-slate-100 px-5 py-2 rounded-xl text-gray-700 hover:bg-slate-200 transition"
                    onClick={() => setAddForm(true)}
                >
                    <SquarePen size={18} />
                    Add Skill
                </button>
            </motion.div>

            {/* Skills Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white mt-8 rounded-2xl border shadow-sm p-5"
            >
                <h2 className="text-2xl font-bold mb-6">
                    Technical skills
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    {Skills?.map((skill, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -3 }}
                            className="relative group rounded-xl p-4 shadow-md"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => handleDelete(skill._id)}
                                    className="text-red-600 hover:text-white hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {skill.name}
                                </h3>

                                <span
                                    className={`text-xl font-medium ${skill.color}`}
                                >
                                    {skill.level}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${skill.progress}%`,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.1,
                                    }}
                                    className="h-full bg-blue-600 rounded-full"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
                {addForm && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center ">
                        <AddSkillForm
                            fetchskills={fetchSkills}
                            onClose={() => setAddForm(false)} />
                    </div>
                )}
            </motion.div></>
    )
}

export default Skills