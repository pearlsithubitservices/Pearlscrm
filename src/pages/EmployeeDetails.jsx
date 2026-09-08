import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Mail,
  Notebook,
  Phone,
  Trash2,
  Power,
} from "lucide-react";

import Employeehome from "../components/EmployeeDetails/Employeehome";
import EmployeePerformancePage from "../components/EmployeeDetails/EmployeePerformance";
import EmployeeWork from "../components/EmployeeDetails/EmployeeWork";
import EmployeeActivity from "../components/EmployeeDetails/EmployeeActivity";
import EmployeeNotes from "../components/EmployeeDetails/EmployeeNotes";
import EditEmployeeModal from "../components/EditEmployeeModal";
import AnimateModals from "../components/Dashboard/AnimateModals";
import { useNavigate, useParams } from "react-router-dom";
import useEmployees from "../Hooks/useEmployees";
import api from "../lib/api";

const extractSal = (o) => {
  if (!o) return {};
  const s1 = o.salary && typeof o.salary === "object" ? o.salary : {};
  const s2 = o.profile?.salary && typeof o.profile?.salary === "object" ? o.profile.salary : {};
  return {
    ...s1,
    ...s2,
    basicSalary: s2.basicSalary ?? s1.basicSalary ?? o.basicSalary,
    grossSalary: s2.grossSalary ?? s1.grossSalary ?? o.grossSalary,
    netSalary: s2.netSalary ?? s1.netSalary ?? o.netSalary,
    allowances: (s2.allowances && Object.keys(s2.allowances).length > 0 ? s2.allowances : null) ??
                (s1.allowances && Object.keys(s1.allowances).length > 0 ? s1.allowances : null) ??
                s2.allowances ?? s1.allowances ?? o.profile?.allowances ?? o.allowances,
    deductions: (s2.deductions && Object.keys(s2.deductions).length > 0 ? s2.deductions : null) ??
                (s1.deductions && Object.keys(s1.deductions).length > 0 ? s1.deductions : null) ??
                s2.deductions ?? s1.deductions ?? o.profile?.deductions ?? o.deductions,
  };
};

const formatMapForInput = (map) => {
  if (!map) return "";
  if (typeof map === "string") return map.trim();
  if (typeof map === "number") return String(map);
  if (Array.isArray(map)) {
    return map
      .map((item) => {
        if (!item) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          const k = item.name || item.label || item.title || item.type || item.key;
          const v = item.amount ?? item.value ?? item.val ?? item.amt;
          return k && v !== undefined ? `${k}: ${v}` : "";
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }
  if (map instanceof Map) {
    return Array.from(map.entries()).map(([k, v]) => `${k}: ${v}`).join(", ");
  }
  if (typeof map === "object") {
    return Object.entries(map)
      .filter(([k, v]) => k && v !== undefined && v !== null && typeof v !== "object")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return String(map);
};

const EmployeeDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { employees, refetch: fetchEmployees, toggleEmployeeStatus, deleteEmployee } = useEmployees();

  const currentEmployee = employees?.find((item) => (
    String(item.id) === String(id) ||
    String(item._id) === String(id) ||
    String(item.uid) === String(id) ||
    String(item.originalEmployeeId) === String(id) ||
    String(item.originalUserId) === String(id) ||
    String(item.empId)?.toLowerCase() === String(id)?.toLowerCase() ||
    String(item.email)?.toLowerCase() === String(id)?.toLowerCase()
  ));

  const [directEmployee, setDirectEmployee] = useState(null);

  const fetchSingleEmployee = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/employees/${id}`);
      if (res.data?.data) {
        setDirectEmployee(res.data.data);
      } else if (res.data && !res.data.message) {
        setDirectEmployee(res.data);
      }
    } catch (_) {}
  }, [id]);

  useEffect(() => {
    fetchSingleEmployee();
  }, [fetchSingleEmployee]);

  const effectiveEmployee = useMemo(() => {
    if (!directEmployee) return currentEmployee;
    if (!currentEmployee) return directEmployee;
    return {
      ...directEmployee,
      ...currentEmployee,
      profile: {
        ...(directEmployee.profile || {}),
        ...(currentEmployee.profile || {}),
      },
      salary: {
        ...(directEmployee.salary || directEmployee.profile?.salary || {}),
        ...(currentEmployee.salary || currentEmployee.profile?.salary || {}),
      },
    };
  }, [directEmployee, currentEmployee]);

  const employeeStatus = effectiveEmployee?.status || effectiveEmployee?.employeeStatus || "Active";
  const [editingSalary, setEditingSalary] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [description, setDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ basicSalary: "", grossSalary: "", netSalary: "", allowances: "", deductions: "" });

  const employeeSalaryKey = useMemo(() => {
    const sal = extractSal(effectiveEmployee);
    return JSON.stringify({
      id: effectiveEmployee?._id || effectiveEmployee?.id || id,
      b: sal.basicSalary,
      g: sal.grossSalary,
      n: sal.netSalary,
      a: sal.allowances,
      d: sal.deductions,
    });
  }, [effectiveEmployee, id]);

  useEffect(() => {
    if (editingSalary) return;

    const sal = extractSal(effectiveEmployee);
    setSalaryForm({
      basicSalary: sal.basicSalary !== undefined && sal.basicSalary !== null ? sal.basicSalary : "",
      grossSalary: sal.grossSalary !== undefined && sal.grossSalary !== null ? sal.grossSalary : "",
      netSalary: sal.netSalary !== undefined && sal.netSalary !== null ? sal.netSalary : "",
      allowances: formatMapForInput(sal.allowances),
      deductions: formatMapForInput(sal.deductions),
    });
  }, [employeeSalaryKey, editingSalary]);

  const rawDescription = effectiveEmployee?.profile?.description || effectiveEmployee?.description || effectiveEmployee?.notes || "";

  useEffect(() => {
    if (editingDescription) return;
    setDescription(rawDescription);
  }, [rawDescription, editingDescription]);

  const updateDescription = async () => {
    setSavingDescription(true);
    try {
      await api.put(`/auth/users/${id}/description`, { description });
      alert("Employee description updated successfully");
      await fetchEmployees();
      await fetchSingleEmployee();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update description");
    } finally {
      setSavingDescription(false);
    }
  };

  const updateSalary = async (event) => {
    event.preventDefault();
    setSavingSalary(true);
    try {
      const parseFlexible = (value, defaultKey = "Allowance") => {
        if (!value && value !== 0) return {};
        if (typeof value === "number") return value > 0 ? { [defaultKey]: value } : {};
        if (typeof value === "object" && !Array.isArray(value)) {
          const out = {};
          Object.entries(value).forEach(([k, v]) => {
            if (k && String(k).trim()) {
              const num = Number(String(v).replace(/[^0-9.]/g, "")) || 0;
              if (num > 0) out[String(k).trim()] = num;
            }
          });
          return out;
        }
        const str = String(value).trim();
        if (!str || str === "{}" || str === "[]") return {};

        const cleanNum = str.replace(/[^0-9.]/g, "");
        if (cleanNum && !str.includes(":") && !str.includes("=") && !str.includes("-")) {
          const n = Number(cleanNum) || 0;
          return n > 0 ? { [defaultKey]: n } : {};
        }

        const out = {};
        const items = str.split(/;|\n|,\s*(?=[A-Za-z])/);
        items.forEach((item) => {
          const trimmed = item.trim();
          if (!trimmed) return;
          const match = trimmed.match(/^([^:=0-9]+)\s*[:=\-]?\s*([₹$\s]*[0-9,]+(\.[0-9]+)?.*)$/);
          if (match) {
            const k = match[1].trim();
            const v = Number(match[2].replace(/[^0-9.]/g, "")) || 0;
            if (k && v > 0) out[k] = v;
          } else {
            const n = Number(trimmed.replace(/[^0-9.]/g, "")) || 0;
            if (n > 0) out[defaultKey] = n;
          }
        });
        return Object.keys(out).length > 0 ? out : (Number(cleanNum) > 0 ? { [defaultKey]: Number(cleanNum) } : {});
      };

      const targetId = effectiveEmployee?._id || effectiveEmployee?.id || id;
      const payload = {
        basicSalary: Number(String(salaryForm.basicSalary).replace(/[^0-9.]/g, "")) || 0,
        grossSalary: Number(String(salaryForm.grossSalary).replace(/[^0-9.]/g, "")) || 0,
        netSalary: Number(String(salaryForm.netSalary).replace(/[^0-9.]/g, "")) || 0,
        allowances: parseFlexible(salaryForm.allowances, "Allowance"),
        deductions: parseFlexible(salaryForm.deductions, "Deduction"),
      };

      try {
        await api.put(`/auth/users/${targetId}/salary`, payload);
      } catch (err) {
        console.warn("Retrying salary update via /employees endpoint...", err);
        await api.put(`/employees/${targetId}/salary`, payload);
      }

      try {
        await api.put(`/employees/${targetId}`, {
          salary: payload,
          profile: { salary: payload },
        });
      } catch (_) {}

      setEditingSalary(false);
      await fetchEmployees();
      await fetchSingleEmployee();
      alert("Salary details updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update salary");
    } finally {
      setSavingSalary(false);
    }
  };

  const tabs = ["overview", "performance", "assigned work", "activity", "notes"];
  const [button, setButton] = useState('');

  const buttons = [
    { label: "Call", icon: Phone },
    { label: "E Mail", icon: Mail },
    { label: "Notes", icon: Notebook },
  ];

  const handleAction = (label) => {
    setButton(label);

    const phone =
      currentEmployee?.profile?.phone ||
      currentEmployee?.phone ||
      currentEmployee?.contact ||
      currentEmployee?.contactNumber ||
      "";

    const email = currentEmployee?.email || currentEmployee?.profile?.email || "";

    if (label === "Call") {
      if (phone) {
        window.location.href = `tel:${phone}`;
      } else {
        alert("No phone number available for this employee.");
      }
      return;
    }

    if (label === "E Mail" || label === "Email") {
      if (email) {
        const empName = currentEmployee?.name || currentEmployee?.employeeName || "Employee";
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Follow-up with ${empName}`)}`;
      } else {
        alert("No email address available for this employee.");
      }
      return;
    }

    if (label === "Notes") {
      setActiveTab("notes");
      return;
    }
  };

  return (
    <div className="p-6 bg-[#efede8] max-h-screen overflow-y-auto no-scrollbar">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-4 w-full min-w-0">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase flex-shrink-0">
            {(effectiveEmployee?.name || effectiveEmployee?.employeeName || "?")[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              {effectiveEmployee?.name || effectiveEmployee?.employeeName || "Employee"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {effectiveEmployee?.role || effectiveEmployee?.employeeRole || "Employee"}
            </p>
            {(effectiveEmployee?.email || effectiveEmployee?.department) && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                {[effectiveEmployee.department, effectiveEmployee.email].filter(Boolean).join(" • ")}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {buttons.map((btn, i) => {
                const isActive = (btn.label === "Notes" && activeTab === "notes") || button === btn.label;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction(btn.label)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition cursor-pointer ${isActive
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                  >
                    <btn.icon size={16} />
                    {btn.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT STATUS & ACTIONS */}
        <div className="flex w-full lg:w-auto flex-col gap-3 lg:items-end flex-shrink-0">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${employeeStatus === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              {employeeStatus}
            </span>

            {/* EDIT PROFILE */}
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>

            {/* TOGGLE STATUS */}
            <button
              type="button"
              onClick={async () => {
                const nextAction = employeeStatus === "Suspended" ? "Activate" : "Suspend";
                if (window.confirm(`${nextAction} this employee?`)) {
                  try {
                    await toggleEmployeeStatus(currentEmployee?.id || currentEmployee?._id || id);
                    fetchEmployees();
                  } catch (err) {
                    alert(err.message || "Failed to toggle status");
                  }
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${employeeStatus === "Suspended"
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
            >
              <Power size={14} />
              {employeeStatus === "Suspended" ? "Activate" : "Suspend"}
            </button>

            {/* DELETE EMPLOYEE */}
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure you want to permanently delete this employee? This action cannot be undone."
                  )
                ) {
                  try {
                    await deleteEmployee(currentEmployee?.id || currentEmployee?._id || id);
                    alert("Employee deleted successfully.");
                    navigate("/employees");
                  } catch (err) {
                    alert(err.message || "Failed to delete employee");
                  }
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 mt-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm capitalize transition-all cursor-pointer font-medium ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {activeTab === "overview" && (
          <>
            <Employeehome
              employees={effectiveEmployee}
              editableDescription={editingDescription}
              descriptionValue={description}
              onDescriptionChange={(event) => setDescription(event.target.value)}
              onDescriptionSave={async () => {
                await updateDescription();
                setEditingDescription(false);
              }}
              savingDescription={savingDescription}
              onDescriptionEdit={() => setEditingDescription(true)}
              onEditProfile={() => setIsEditingProfile(true)}
            />

            {/* SALARY SECTION */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 mt-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-700">Salary Updates</h3>
                  <p className="text-sm text-gray-500">Update this employee's stored salary details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingSalary) {
                      const sal = extractSal(effectiveEmployee);
                      setSalaryForm({
                        basicSalary: sal.basicSalary !== undefined && sal.basicSalary !== null ? sal.basicSalary : "",
                        grossSalary: sal.grossSalary !== undefined && sal.grossSalary !== null ? sal.grossSalary : "",
                        netSalary: sal.netSalary !== undefined && sal.netSalary !== null ? sal.netSalary : "",
                        allowances: formatMapForInput(sal.allowances),
                        deductions: formatMapForInput(sal.deductions),
                      });
                    }
                    setEditingSalary((value) => !value);
                  }}
                  className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm cursor-pointer hover:bg-blue-800 transition"
                >
                  {editingSalary ? "Cancel" : "Edit Salary"}
                </button>
              </div>

              {editingSalary && (
                <form onSubmit={updateSalary} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  {[
                    ["basicSalary", "Basic Salary"],
                    ["grossSalary", "Gross Salary"],
                    ["netSalary", "Net Salary"],
                  ].map(([name, label]) => (
                    <label key={name} className="text-sm text-gray-600">
                      {label}
                      <input
                        required={name === "basicSalary"}
                        type="number"
                        min="0"
                        value={salaryForm[name] ?? ""}
                        onChange={(event) => {
                          const val = event.target.value;
                          setSalaryForm((prev) => ({ ...prev, [name]: val }));
                        }}
                        className="mt-1 w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
                      />
                    </label>
                  ))}

                  {[
                    ["allowances", "Allowances"],
                    ["deductions", "Deductions"],
                  ].map(([name, label]) => (
                    <label key={name} className="text-sm text-gray-600 md:col-span-3">
                      {label} <span className="text-gray-400">(name: amount, comma separated)</span>
                      <input
                        value={salaryForm[name] ?? ""}
                        onChange={(event) => {
                          const val = event.target.value;
                          setSalaryForm((prev) => ({ ...prev, [name]: val }));
                        }}
                        className="mt-1 w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
                        placeholder="Travel: 1000, Meal: 500"
                      />
                    </label>
                  ))}

                  <button
                    disabled={savingSalary}
                    type="submit"
                    className="md:col-span-3 justify-self-end px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition cursor-pointer disabled:opacity-50"
                  >
                    {savingSalary ? "Saving..." : "Save Salary"}
                  </button>
                </form>
              )}
            </section>
          </>
        )}

        {activeTab === "performance" && <EmployeePerformancePage employee={effectiveEmployee} />}

        {activeTab === "assigned work" && <EmployeeWork employee={effectiveEmployee} />}

        {activeTab === "activity" && <EmployeeActivity employee={effectiveEmployee} />}

        {activeTab === "notes" && (
          <EmployeeNotes
            employee={effectiveEmployee}
            employeeId={id}
            onNoteUpdated={async () => {
              fetchEmployees();
              fetchSingleEmployee();
            }}
          />
        )}
      </motion.div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && effectiveEmployee && (
        <AnimateModals>
          <EditEmployeeModal
            employee={effectiveEmployee}
            onClose={() => setIsEditingProfile(false)}
            onSuccess={() => {
              fetchEmployees();
              fetchSingleEmployee();
              setIsEditingProfile(false);
            }}
          />
        </AnimateModals>
      )}
    </div>
  );
};

export default EmployeeDetails;