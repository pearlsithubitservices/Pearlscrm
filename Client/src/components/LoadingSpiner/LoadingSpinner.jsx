import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-12 h-12 bg-black rounded-xl"
      />
    </div>
  );
}