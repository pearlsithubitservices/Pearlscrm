import React from "react";

const Skeleton = () => {
  return (
    <div className="bg-white border rounded-xl p-4 h-[300px] overflow-hidden no-scrollbar animate-pulse">
      <table className="w-full min-w-[900px]">
        <thead className="sticky top-0 bg-white z-20">
          <tr className="border-b">
            {[
              "MONTH",
              "GROSS",
              "DEDUCTIONS",
              "NET SALARY",
              "DATE",
              "STATUS",
              "ACTION",
            ].map((_, index) => (
              <th key={index} className="py-4 px-4 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              <td className="py-5 px-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-5 w-28 bg-gray-200 rounded"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              </td>

              <td className="py-5 px-4">
                <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Skeleton;