import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white">

      

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-6 text-2xl font-bold text-[#023167]"
      >
        Loading Content...
      </motion.h1>

      {/* Small Dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.2,
            }}
            className="w-3 h-3 bg-[#2563a9] rounded-full"
          />
        ))}
      </div>
    </div>
  );
}