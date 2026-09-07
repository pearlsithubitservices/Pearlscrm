import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SquarePen, X, Trash2 } from 'lucide-react'
import AddSkillForm from './AddSkill';
import useSkillCertification from '../../../Hooks/useSkillCertification';
import { useAuth } from '../../../context/AuthContext';

const levelColors = {
    'Beginner': 'text-blue-600',
    'Intermediate': 'text-yellow-600',
    'Advanced': 'text-orange-600',
    'Expert': 'text-green-600'
};

const levelBgColors = {
    'Beginner': 'bg-blue-50',
    'Intermediate': 'bg-yellow-50',
    'Advanced': 'bg-orange-50',
    'Expert': 'bg-green-50'
};

const Skills = () => {
    const [addForm, setAddForm] = useState(false);
    const { getById, getAll, deleteSkill } = useSkillCertification();
    const [Skills, setSkills] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await getAll();
            const currentEmployeeId = user?.uid || user?._id || user?.id || user?.email || "";

            const skillById = res?.data?.filter(
                (item) => String(item.employee_uid) === String(currentEmployeeId)
            );

            if (skillById?.length > 0) {
                setSkills(skillById[0]?.skills || []);
            } else {
                setSkills([]);
            }

        } catch (error) {
            console.log(error);
        }
    };

    //DELETE SKILL
    const handleDelete = async (skill_id) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                const employee_uid = user?.uid;

                const res = await deleteSkill(employee_uid, skill_id);
                if (res?.success) {
                    await fetchSkills();
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between mb-8 mx-6"
            >
                <div>
                    <h1 className="text-4xl font-bold text-[#0B2B57]">
                        My Skills & Proficiency
                    </h1>
                    <p className="text-gray-500 mt-2">Showcase your professional capabilities</p>
                </div>

                <button 
                    className="flex items-center gap-2 bg-[#0B5DB5] text-white px-6 py-3 rounded-xl hover:bg-[#0945A0] transition shadow-sm"
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
                className="bg-white mx-6 rounded-2xl border border-gray-200 shadow-sm p-8 mb-8"
            >
                <h2 className="text-2xl font-bold text-[#0B2B57] mb-8">
                    Technical Skills
                </h2>

                {Skills?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No skills added yet. Add your first skill!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {Skills?.map((skill, index) => (
                            <motion.div
                                key={skill._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="relative group rounded-2xl p-6 border border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition"
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(skill._id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-lg"
                                    title="Delete skill"
                                >
                                    <Trash2 size={18} className="text-red-600" />
                                </button>

                                {/* Skill Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-[#0B2B57] pr-8">
                                        {skill.name}
                                    </h3>

                                    <span
                                        className={`text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                                            levelBgColors[skill.level] || levelBgColors['Beginner']
                                        } ${skill.color || levelColors[skill.level] || levelColors['Beginner']}`}
                                    >
                                        {skill.level}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Proficiency</span>
                                        <span className={`text-sm font-bold ${skill.color || levelColors[skill.level] || levelColors['Beginner']}`}>
                                            {skill.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${skill.progress}%`,
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                delay: index * 0.1,
                                                ease: "easeOut"
                                            }}
                                            className={`h-full rounded-full ${skill.color?.replace('text', 'bg') || 'bg-blue-600'}`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Add Skill Modal */}
            {addForm && (
                <AddSkillForm
                    fetchskills={fetchSkills}
                    onClose={() => setAddForm(false)}
                />
            )}
        </>
    )
}

export default Skills