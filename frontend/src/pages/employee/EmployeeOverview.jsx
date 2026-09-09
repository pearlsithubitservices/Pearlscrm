import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart3, BriefcaseBusiness, UserRound } from "lucide-react";
import Employeehome from "../../components/EmployeeDetails/Employeehome";
import EmployeePerformancePage from "../../components/EmployeeDetails/EmployeePerformance";
import EmployeeWork from "../../components/EmployeeDetails/EmployeeWork";
import EmployeeActivity from "../../components/EmployeeDetails/EmployeeActivity";
import useEmployees from "../../Hooks/useEmployees";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const tabs = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "assigned work", label: "Assigned Work", icon: BriefcaseBusiness },
  { id: "activity", label: "Activity", icon: Activity },
];

export default function EmployeeOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);
  const { user } = useAuth();
  const { employees, loading } = useEmployees();

  const currentEmployee = employees?.find((employee) => {
    const userIds = [user?.uid, user?.id, user?._id, user?.email].filter(Boolean).map(String);
    const employeeIds = [employee.uid, employee.id, employee._id, employee.email].filter(Boolean).map(String);
    return employeeIds.some((employeeId) => userIds.includes(employeeId));
  }) || user;

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading your profile...</div>;
  }

  const displayName = currentEmployee?.name || currentEmployee?.employeeName || user?.displayName || "Employee";
  const role = currentEmployee?.role || currentEmployee?.employeeRole || "Employee";
  const currentDescription = currentEmployee?.profile?.description || currentEmployee?.description || currentEmployee?.notes || "";

  const openDescriptionEditor = () => {
    setDescription(currentDescription);
    setEditingDescription(true);
  };

  const updateDescription = async () => {
    setSavingDescription(true);
    try {
      await api.put("/profile/description", { description });
      setEditingDescription(false);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update description");
    } finally {
      setSavingDescription(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0eb] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">{displayName}</h1>
              <p className="text-sm text-gray-500 mt-1">{role}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2" role="tablist" aria-label="Employee overview sections">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${activeTab === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {activeTab === "overview" && (
            <Employeehome
              employees={currentEmployee}
              editableDescription={editingDescription}
              descriptionValue={description}
              onDescriptionChange={(event) => setDescription(event.target.value)}
              onDescriptionSave={updateDescription}
              savingDescription={savingDescription}
              onDescriptionEdit={openDescriptionEditor}
            />
          )}
          {activeTab === "performance" && <EmployeePerformancePage employee={currentEmployee} />}
          {activeTab === "assigned work" && <EmployeeWork employee={currentEmployee} canManage={false} />}
          {activeTab === "activity" && <EmployeeActivity employee={currentEmployee} />}
        </motion.div>
      </div>
    </div>
  );
}