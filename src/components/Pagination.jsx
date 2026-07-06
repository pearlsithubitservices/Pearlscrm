import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3, 4, 5);

      if (totalPages > 6) {
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="border-t border-gray-200 py-5 flex justify-center">

      <div className="flex items-center gap-2">

        {/* Previous */}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="text-gray-400 hover:text-[#173D6A] disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Page Numbers */}

        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="px-2 text-gray-500"
            >
              ...
            </span>
          ) : (
            <motion.button
              key={page}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition
                ${
                  currentPage === page
                    ? "bg-[#E8F0FE] text-[#3B82F6]"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {page}
            </motion.button>
          )
        )}

        {/* Next */}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="text-gray-400 hover:text-[#173D6A] disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </motion.button>

      </div>

    </div>
  );
};

export default Pagination;