import { motion } from "framer-motion";

export default function CourseCard({ title, tag, time, level, src }) {
    
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm p-4"
        >
            <div className="h-30  bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-3">
                <img src={src} alt="aws" className="w-full h-full object-cover" />
            </div>



            <h3 className="font-semibold mt-2 text-2xl leading-2 tracking-tight">{title}</h3>

            <p className="text-md text-gray-500 mt-1 ">
                {time} • {level}
            </p>
            <div className="flex items-center justify-between mt-2">
                <div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        {tag}
                    </span>
                </div>
                <button className="mt-3 h-[30px] w-[70px] bg-green-600 hover:bg-green-800  text-white text-sm py-1 rounded-lg">
                    Enroll
                </button>
            </div>
        </motion.div>
    );
}