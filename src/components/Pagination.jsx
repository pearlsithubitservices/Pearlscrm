import React from "react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "lucide-react";

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">

      {/* PREVIOUS */}
      <button
        onClick={() =>
          setCurrentPage(currentPage - 1)
        }
        disabled={currentPage === 1}
        className="
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-lg
          text-blue-700
          disabled:text-gray-300
        "
      >
        <ArrowLeftCircleIcon size={20} />
      </button>

      {/* PAGE NUMBERS */}
      {[...Array(totalPages)].map((_, index) => (

        <button
          key={index}
          onClick={() =>
            setCurrentPage(index + 1)
          }
          className={`
            w-10
            h-10
            rounded-lg
            font-semibold
            transition-all
            ${
              currentPage === index + 1
                ? "bg-[#2563a9] text-white"
                : "text-gray-500 hover:bg-gray-200"
            }
          `}
        >
          {index + 1}
        </button>

      ))}

      {/* NEXT */}
      <button
        onClick={() =>
          setCurrentPage(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-lg
          text-blue-700
          disabled:text-gray-300
        "
      >
        <ArrowRightCircleIcon size={20} />
      </button>

    </div>
  );
};

export default Pagination;