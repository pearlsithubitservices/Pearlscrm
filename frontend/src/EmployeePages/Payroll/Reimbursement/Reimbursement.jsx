import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFinancialYear } from "../../../Utils/formatNumber";
import { useAuth } from "../../../context/AuthContext";
import usePolicies from "../../../Hooks/usePolicies";

export default function Reimbursement({ getclaims }) {
  const financialyear = getFinancialYear();
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const { policies: dbPolicies, loading: policiesLoading } = usePolicies();

  const userUid = user?.uid || user?.id || user?._id;
  const userEmpId = user?.profile?.empId || user?.empId;

  const claimsById = (claims || []).filter(
    (item) =>
      item.employee_uid === userUid ||
      item.employee_uid === userEmpId ||
      item.employee_uid?.toLowerCase() === user?.email?.toLowerCase() ||
      item.employeeId === userUid ||
      item.employeeId === userEmpId ||
      item.employeeName === user?.name ||
      item.employeeName === user?.profile?.name
  );
  const displayClaims = claimsById;

  const activePolicies = dbPolicies || [];

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        if (typeof getclaims === "function") {
          const res = await getclaims();
          const list = Array.isArray(res) ? res : res?.data || [];
          setClaims(list);
        }
      } catch (error) {
        console.error("Failed to fetch claims:", error);
      }
    };

    fetchClaims();
  }, [getclaims]);

  return (
    <div className="min-h-screen bg-[#efede8]">
      <div className="p-4 sm:p-8">

        {/* Claims */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              My reimbursement claims
            </h2>

            <span className="bg-slate-100 text-xs px-4 py-2 rounded-full font-semibold">
              STATUS
            </span>
          </div>

          <div className="mt-8 space-y-5">
            {displayClaims && displayClaims.length > 0 ? (
              displayClaims.map((claim, idx) => (
                <div
                  key={claim._id || claim.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2"
                >
                  <div>
                    <h3 className="font-bold text-xl text-[#0f2f58]">
                      {claim.claimType} - {claim.description || claim.summary}
                    </h3>

                    <p className="text-gray-400 mt-1 text-xs">
                      Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : "Recent"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold text-lg text-blue-700">₹{Number(claim.amount || 0).toLocaleString('en-IN')}</p>

                    <span
                      className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        claim.status?.toLowerCase() === "approved" || claim.status?.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-700"
                          : claim.status?.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {claim.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm italic text-center py-4">No reimbursement claims submitted yet.</p>
            )}
          </div>
        </motion.div>

        {/* Policies */}

        <div className="mt-10">
          <div className="bg-white border rounded-2xl p-5 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Reimbursement policies
            </h2>

            <span className="text-xl font-semibold text-gray-500">
              {financialyear}
            </span>
          </div>

          <div className="bg-white border rounded-2xl p-5 mt-4 overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {activePolicies.map((item, idx) => (
                  <tr
                    key={item._id || item.category || idx}
                    className="border"
                  >
                    <td className="p-4 text-xl font-semibold text-[#0f2f58] border">
                      {item.category || item.policyName || item.name}
                    </td>

                    <td className="p-4 text-center font-bold border">
                      {item.amount || item.limit || item.maxAmount || "As per policy"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}