import { motion } from "framer-motion";
import { useState } from "react";
import EnrollmentModal from "./EnrollmentModal";
import { Delete, DeleteIcon, LucideDelete, Trash2 } from "lucide-react";
import useCourse from "../../../Hooks/useCourse";

export default function CourseCard({ title, tag, time, level, src, id = '0', provider = "", }) {
    const [showform, setShowform] = useState(false);
    const { deleteCourse } = useCourse()
    const [data, setData] = useState({
        id: id,
        title: title,
        tag: tag,
        time: time,
        level: level,
        src: src,
        provider: provider,

    });
    console.log(data);

    return (
        <>
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm p-4"
            >
                <div className="h-30  bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-3">
                    <img src={src} alt="aws" className="w-full h-full object-cover" />
                </div>



                <h3 className="font-semibold mt-2 text-2xl leading-2 tracking-tight">{data.title}</h3>

                <p className="text-md text-gray-500 mt-1 ">
                   {data.provider || "AWS"} • {data.time} • {data.level}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            {data.tag}
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button className=" h-[30px] w-[70px] bg-green-600 hover:bg-green-800  text-white text-sm py-1 rounded-lg"
                            onClick={() => setShowform(true)}
                        >
                            Enroll
                        </button>
                        <button><Trash2 onClick={async () => { await deleteCourse(id) }} /></button>
                    </div>
                </div>


            </motion.div>
            {showform && (
                <div>
                    <EnrollmentModal
                        data={data}
                        isOpen={showform}
                        onClose={() => setShowform(false)}
                    />
                </div>
            )}
        </>
    );
}