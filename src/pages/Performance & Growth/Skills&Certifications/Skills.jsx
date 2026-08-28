import { motion } from "framer-motion";
import { ChevronDown, Code2, Search, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSkillCertification from "../../../Hooks/useSkillCertification";

const skills = [
    {
        name: "React.js",
        level: "Expert",
        value: 95,
        color: "text-green-600",
    },
    {
        name: "Node.js",
        level: "Advanced",
        value: 78,
        color: "text-orange-500",
    },
    {
        name: "Python",
        level: "Intermediate",
        value: 45,
        color: "text-amber-500",
    },
    {
        name: "AWS",
        level: "Intermediate",
        value: 48,
        color: "text-amber-500",
    },
    {
        name: "Docker",
        level: "Advanced",
        value: 88,
        color: "text-orange-500",
    },
];

export default function Skills() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");

    const { id } = useParams();
    const { getAll, } = useSkillCertification();
    const [skillsAndCertifications, setSkillsAndCertifications] = useState([]);


    const currentskillsAndCertifications = skillsAndCertifications.filter(
        (item) => item.employee_uid === id
    );
    console.log(currentskillsAndCertifications[0]?.skills);

    const fetchSkillsAndCertifications = async () => {
        try {
            const data = await getAll(id);
            setSkillsAndCertifications(data.data);


        } catch (error) {
            console.error("Error fetching skills and certifications:", error);
        }
    };

    useEffect(() => {
        fetchSkillsAndCertifications();
    }, [id]);
    return (
        <section className="w-full  py-5 px-4">
            <motion.div
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-4"
            >

                {/* Title */}

                <h1 className="text-2xl font-bold text-black">
                    Skills & Proficiency
                </h1>

                {/* Right */}

                <div className="flex flex-wrap items-center gap-4">

                    {/* Search */}



                    {/* Add Button */}

                    <motion.p
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="
              h-12
              px-6
              rounded-xl
              bg-[#E9EEF9]
              text-[#334155]
              font-semibold
              flex
              items-center
               gap-2
             "

                    >

                        {currentskillsAndCertifications[0]?.skills?.length || 0} Total
                    </motion.p>

                </div>

            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8"
            >
                {/* Heading */}
                <div className="flex items-center gap-2 mb-7">
                    <Code2 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">
                        Technical skills
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {currentskillsAndCertifications[0]?.skills?.map((skill, index) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.08,
                            }}
                            whileHover={{
                                y: -4,
                                scale: 1.02,
                            }}
                            className="bg-white border border-gray-200 rounded-xl shadow-md px-5 py-4"
                        >
                            {/* Title */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {skill.name}
                                </h3>

                                <span
                                    className={`text-xl font-medium ${skill.color}`}
                                >
                                    {skill.level}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.progress}%` }}
                                    transition={{
                                        duration: 1,
                                        delay: index * 0.15,
                                    }}
                                    className="h-full rounded-full bg-blue-600"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}