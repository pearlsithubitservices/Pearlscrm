import React, { useState, useMemo } from "react";
import { ArrowRight, Plus, FileText } from "lucide-react";
import { motion } from "framer-motion";
import usePayments from "../../Hooks/usePayments";
import Createinvoice from "../../pages/Createinvoice";
import AnimateModals from "../Dashboard/AnimateModals";

const ClientPayment = ({ client, clientId, clientName, companyName }) => {
  const { payments, loading, fetchPayments } = usePayments();
  const [openModal, setOpenModal] = useState(false);

  // Client info normalization
  const targetClientName = client?.name || client?.clientName || clientName || "";
  const targetCompanyName = client?.companyName || companyName || "";

  // Filter payments for this client
  const clientPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    if (!targetClientName && !targetCompanyName && !clientId) return payments;

    return payments.filter((p) => {
      if (clientId && p.clientId === clientId) return true;
      const compMatch =
        targetCompanyName &&
        p.companyName &&
        p.companyName.toLowerCase().includes(targetCompanyName.toLowerCase());
      const nameMatch =
        targetClientName &&
        p.clientName &&
        p.clientName.toLowerCase().includes(targetClientName.toLowerCase());
      return compMatch || nameMatch;
    });
  }, [payments, targetClientName, targetCompanyName, clientId]);

  // Compute summary stats
  const { total, paid, pending } = useMemo(() => {
    let totalAmt = 0;
    let paidAmt = 0;
    let pendingAmt = 0;

    clientPayments.forEach((p) => {
      const budgetVal = Number(p.budget) || 0;
      totalAmt += budgetVal;
      if ((p.status || "").toLowerCase() === "paid") {
        paidAmt += budgetVal;
      } else {
        pendingAmt += budgetVal;
      }
    });

    return { total: totalAmt, paid: paidAmt, pending: pendingAmt };
  }, [clientPayments]);

  return (
    <div className="w-full min-h-screen rounded-2xl bg-[#f5f2ec] overflow-hidden">
      {/* CONTENT */}
      <div className="p-5">
        {/* PAYMENT SUMMARY */}
        <div className="mt-2">
          <p className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            PAYMENT SUMMARY
          </p>

          <div className="grid grid-cols-3 gap-3">
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#dfe9ff] p-3 border border-blue-200"
            >
              <p className="text-[10px] font-bold text-[#16345f]">TOTAL</p>
              <h3 className="text-lg font-bold text-[#16345f] mt-1">
                ₹ {total.toLocaleString("en-IN")}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#e7f7d8] p-3 border border-green-200"
            >
              <p className="text-[10px] font-bold text-[#2f6d2f]">PAID</p>
              <h3 className="text-lg font-bold text-[#2f6d2f] mt-1">
                ₹ {paid.toLocaleString("en-IN")}
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#ffe5df] p-3 border border-red-200"
            >
              <p className="text-[10px] font-bold text-[#e05b45]">PENDING</p>
              <h3 className="text-lg font-bold text-[#e05b45] mt-1">
                ₹ {pending.toLocaleString("en-IN")}
              </h3>
            </motion.div>
          </div>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              PAYMENT HISTORY
            </p>

            <button
              onClick={() => setOpenModal(true)}
              className="px-3 py-1.5 rounded-md bg-[#2563a9] text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
            >
              <Plus size={12} />
              Add Payment
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-gray-500">
              Loading payment history...
            </div>
          ) : clientPayments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-black/5">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No payment history found</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add Payment" to record a new invoice or payment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientPayments.map((item, i) => (
                <motion.div
                  key={item._id || i}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl p-4 border border-black/5 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#16345f]">
                      {item.paymentDescription || item.companyName || "Payment Invoice"}
                    </h3>

                    <p className="text-[11px] text-gray-400 mt-1">
                      Issued: {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString("en-IN") : "-"} | Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <h3 className="text-base font-bold text-gray-800">
                      ₹ {(Number(item.budget) || 0).toLocaleString("en-IN")}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-[2px] rounded-full text-[10px] font-semibold ${
                          (item.status || "").toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : (item.status || "").toLowerCase() === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : (item.status || "").toLowerCase() === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>

                      <div className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-gray-400">
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {openModal && (
        <AnimateModals>
          <Createinvoice
            onClose={() => setOpenModal(false)}
            onSuccess={fetchPayments}
            initialData={{
              clientName: targetClientName,
              companyName: targetCompanyName,
            }}
          />
        </AnimateModals>
      )}
    </div>
  );
};

export default ClientPayment;