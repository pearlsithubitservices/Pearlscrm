import React, { useMemo } from 'react'
import { motion } from "framer-motion";
import { Phone } from 'lucide-react';
import useEmployees from '../../Hooks/useEmployees';
const FollowupOverview = ({ followups, fetchfollowups }) => {
  console.log(followups);
  const { employees } = useEmployees();

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.uid] = employee.name;
      return map;
    }, {});
  }, [employees]);
  const info = [
    ["EMAIL", followups?.email, true],
    ["PHONE", followups?.phone],
    ["TYPE", followups?.type],
    ["ASSIGNED TO", employeeMap[followups?.assignedTo]],
    ["FOLLOW- UP", "Today"],
    ["FOLLOW- UP - COUNT", followups?.followupCount],
    ["FOLLOW-UP-TIME", followups?.followupTime],
  ];

  return (
    <div className="p-6">

      <h1 className="text-xs font-bold tracking-wide text-[#999]">
        FOLLOW- UP INFORMATIONS
      </h1>

      <div className="grid grid-cols-2 gap-4 mt-5">

        {info.map(([title, value, blue], i) => (

          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-5 border border-[#ebe7df]"
          >

            <p className="text-xs font-bold text-[#999]">
              {title}
            </p>

            <h1
              className={`mt-2 text-2xl font-medium ${blue
                ? "text-[#3167dc]"
                : "text-[#0b2d59]"
                }`}
            >
              {value}
            </h1>

          </motion.div>

        ))}

      </div>

      {/* REMINDER */}

      <div className="mt-10">

        <h1 className="text-xs font-bold tracking-wide text-[#999]">
          FOLLOW- UP REMAINDER
        </h1>

        <motion.div
          whileHover={{ y: -2 }}
          className="mt-5 bg-white rounded-xl border border-[#ebe7df] p-5 flex items-center justify-between"
        >

          <div>

            <h1 className="text-2xl font-bold text-[#0b2d59]">
              Upcoming · Today · 10:30 AM
            </h1>

            <p className="text-[#999] mt-1">
              Call scheduled
            </p>

          </div>

          <button className="px-5 py-3 rounded-md bg-[#3167dc] text-white text-sm font-medium">
            Mark as done
          </button>

        </motion.div>

      </div>

    </div>
  )
}

export default FollowupOverview