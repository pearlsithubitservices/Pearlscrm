<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { ArrowRight, Plus, FileText } from "lucide-react";
=======
import React from "react";
import {
  Building2,
  ArrowRight,
  Pencil,
} from "lucide-react";
>>>>>>> 4db2783c071fc54f8e9a38ba2245e4ee7d3831fb
import { motion } from "framer-motion";

const ClientPayment = () => {
  const payments = [
    {
      title: "Q2 2024 — Enterprise license",
      date: "Jun 1, 2024",
      amount: "₹ 30,000",
    },
    {
      title: "Q2 2024 — Enterprise license",
      date: "Mar 1, 2024",
      amount: "₹ 30,000",
    },
    {
      title: "P1 2024 — Enterprise license",
      date: "Jun 1, 2024",
      amount: "₹ 30,000",
    },
  ];

  return (
    <div className="w-full min-h-screen rounded-2xl bg-[#f5f2ec]  overflow-hidden ">

      {/* CONTENT */}
      <div className="p-5">

        
        

        {/* PAYMENT SUMMARY */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-gray-400 mb-3">
            PAYMENT SUMMARY
          </p>

          <div className="grid grid-cols-3 gap-3">
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#dfe9ff] p-3"
            >
              <p className="text-[10px] font-bold text-[#16345f]">
                TOTAL
              </p>

              <h3 className="text-lg font-bold text-[#16345f] mt-1">
                ₹ 1,20,000
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#e7f7d8] p-3"
            >
              <p className="text-[10px] font-bold text-[#2f6d2f]">
                PAID
              </p>

              <h3 className="text-lg font-bold text-[#2f6d2f] mt-1">
                ₹ 60,000
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#ffe5df] p-3"
            >
              <p className="text-[10px] font-bold text-[#e05b45]">
                PENDING
              </p>

              <h3 className="text-lg font-bold text-[#e05b45] mt-1">
                ₹ 60,000
              </h3>
<<<<<<< HEAD
=======
import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api.js";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ClientPayment = ({ clientId, clientName, companyName }) => {
  const [payments, setPayments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientId: clientId || "",
    clientName: clientName || "",
    companyName: companyName || "",
    issuedDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    budget: "",
    status: "Pending",
    paymentDescription: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      clientId: clientId || "",
      clientName: clientName || "",
      companyName: companyName || "",
    }));
  }, [clientId, clientName, companyName]);

  const fetchPayments = async () => {
    if (!clientId) {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/payment?clientId=${clientId}`));
      const data = await response.json();
      if (response.ok) {
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [clientId]);

  const summary = useMemo(() => {
    const total = payments.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const paid = payments
      .filter((item) => String(item.status).toLowerCase() === "paid")
      .reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const pending = payments
      .filter((item) => String(item.status).toLowerCase() !== "paid")
      .reduce((sum, item) => sum + Number(item.budget || 0), 0);

    return { total, paid, pending };
  }, [payments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        clientId,
        clientName: clientName || form.clientName,
        companyName: companyName || form.companyName,
        budget: Number(form.budget || 0),
      };

      const response = await fetch(apiUrl("/payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsFormOpen(false);
        setForm({
          clientId: clientId || "",
          clientName: clientName || "",
          companyName: companyName || "",
          issuedDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          budget: "",
          status: "Pending",
          paymentDescription: "",
        });
        await fetchPayments();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <div className="w-full min-h-screen rounded-2xl bg-[#f5f2ec] overflow-hidden">
      <div className="p-5">
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-gray-400 mb-3">PAYMENT SUMMARY</p>

          <div className="grid grid-cols-3 gap-3">
            <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#dfe9ff] p-3">
              <p className="text-[10px] font-bold text-[#16345f]">TOTAL</p>
              <h3 className="text-lg font-bold text-[#16345f] mt-1">{currencyFormatter.format(summary.total)}</h3>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#e7f7d8] p-3">
              <p className="text-[10px] font-bold text-[#2f6d2f]">PAID</p>
              <h3 className="text-lg font-bold text-[#2f6d2f] mt-1">{currencyFormatter.format(summary.paid)}</h3>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#ffe5df] p-3">
              <p className="text-[10px] font-bold text-[#e05b45]">PENDING</p>
              <h3 className="text-lg font-bold text-[#e05b45] mt-1">{currencyFormatter.format(summary.pending)}</h3>
>>>>>>> 67372ebb86f6fcf512b5e6ec4e15a21394e5e599
=======
>>>>>>> 4db2783c071fc54f8e9a38ba2245e4ee7d3831fb
            </motion.div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
<<<<<<< HEAD
<<<<<<< HEAD
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
=======
            <p className="text-[10px] font-semibold text-gray-400">
>>>>>>> 4db2783c071fc54f8e9a38ba2245e4ee7d3831fb
              PAYMENT HISTORY
            </p>

            <button className="px-2 py-1 rounded-md bg-white border border-black/10 text-[10px] text-gray-500">
              Add Payment
            </button>
          </div>

<<<<<<< HEAD
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
=======
            <p className="text-[10px] font-semibold text-gray-400">PAYMENT HISTORY</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-2 py-1 rounded-md bg-white border border-black/10 text-[10px] text-gray-500 hover:bg-[#2563a9] hover:text-white"
            >
              <span className="inline-flex items-center gap-1"><Plus size={12} /> Add Payment</span>
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-500">Loading invoices...</div>
            ) : payments.length > 0 ? (
              payments.map((item, i) => (
                <motion.div key={item._id || i} whileHover={{ scale: 1.01 }} className="bg-white rounded-xl p-4 border border-black/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#16345f]">{item.paymentDescription || `${item.companyName} invoice`}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "N/A"} - Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "N/A"}
>>>>>>> 67372ebb86f6fcf512b5e6ec4e15a21394e5e599
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
<<<<<<< HEAD
                    <h3 className="text-base font-bold text-gray-800">
                      ₹ {(Number(item.budget) || 0).toLocaleString()}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-[2px] rounded-full text-[10px] font-semibold ${
                          (item.status || "").toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : (item.status || "").toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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
              clientName: client?.name || client?.clientName || "",
              companyName: client?.companyName || "",
            }}
          />
        </AnimateModals>
=======
                    <h3 className="text-lg font-bold text-green-600">{currencyFormatter.format(Number(item.budget || 0))}</h3>

                    <div className="flex items-center gap-1 mt-1">
                      <span className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${
                        String(item.status).toLowerCase() === "paid"
                          ? "bg-green-100 text-green-600"
                          : String(item.status).toLowerCase() === "overdue"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.status || "Pending"}
                      </span>

                      <button className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-gray-400">
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-4 border border-black/5 text-sm text-gray-500">No invoices available for this client yet.</div>
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#e9e7e2] p-6 relative">
            <button className="absolute right-5 top-5 text-red-600" onClick={() => setIsFormOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-[#0b2b57] mb-5">Add Invoice</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Client Name</span>
                <input name="clientName" value={form.clientName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Company Name</span>
                <input name="companyName" value={form.companyName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Issued Date</span>
                <input type="date" name="issuedDate" value={form.issuedDate} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Due Date</span>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Amount</span>
                <input type="number" name="budget" value={form.budget} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="partial">Partial</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-gray-700">Payment Description</span>
              <textarea name="paymentDescription" value={form.paymentDescription} onChange={handleChange} rows={4} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none resize-none" />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-[#2563a9] text-white">Save Invoice</button>
            </div>
          </div>
        </div>
>>>>>>> 67372ebb86f6fcf512b5e6ec4e15a21394e5e599
      )}
=======
          <div className="space-y-3">
            {payments.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl p-4 border border-black/5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#16345f]">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {item.date}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <h3 className="text-lg font-bold text-green-600">
                    {item.amount}
                  </h3>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-2 py-[2px] rounded-full bg-green-100 text-green-600 text-[10px] font-medium">
                      Paid
                    </span>

                    <button className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-gray-400">
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
>>>>>>> 4db2783c071fc54f8e9a38ba2245e4ee7d3831fb
    </div>
  );
};

export default ClientPayment;