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

    // Show all pages if <= 7
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // First page
    pages.push(1);

    // Left dots
    if (currentPage > 4) {
      pages.push("left-dots");
    }

    // Start & End
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right dots
    if (currentPage < totalPages - 3) {
      pages.push("right-dots");
    }

    // Last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div className="border-t border-gray-200 py-5 flex justify-center">
      <div className="flex items-center gap-2">

        {/* Previous */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </motion.button>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === "left-dots" || page === "right-dots") {
            return (
              <span
                key={page}
                className="w-8 text-center text-gray-500"
              >
                ...
              </span>
            );
          }

          return (
            <motion.button
              key={`${page}-${index}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition
                ${
                  currentPage === page
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {page}
            </motion.button>
          );
        })}

        {/* Next */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </motion.button>

      </div>
    </div>
  );
};

export default Pagination;