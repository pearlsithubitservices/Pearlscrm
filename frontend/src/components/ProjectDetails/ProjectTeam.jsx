import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, UserPlus } from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";
import { apiUrl } from "../../config/api";

export default function CRMTeamPage({ projects, fetchProjects }) {
  const { employees } = useEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [memberRole, setMemberRole] = useState("Developer");

  const currentProject = projects[0] || {};

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const eKey = employee._id || employee.uid || employee.id;
      if (eKey) map[eKey] = employee;
      return map;
    }, {});
  }, [employees]);

  const handleAddMember = async () => {
    if (!selectedEmpId || !currentProject._id) return;

    const empObj = employeeMap[selectedEmpId];
    const empUid = empObj?._id || empObj?.uid || selectedEmpId;
    const empName = empObj?.name || empObj?.employeeName || empObj?.email || "Member";

    const newMemberObj = {
      uid: empUid,
      _id: empUid,
      id: empUid,
      name: empName,
      role: memberRole,
      progress: 0,
    };

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}/member`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemberObj),
      });

      if (res.ok) {
        setSelectedEmpId("");
        if (fetchProjects) fetchProjects();
      } else {
        alert("Failed to add team member");
      }
    } catch (err) {
      console.error("Error adding member to project:", err);
    }
  };

  const handleRemoveMember = async (memberUid) => {
    if (!currentProject._id || !memberUid) return;

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}/member/${memberUid}`), {
        method: "DELETE",
      });

      if (res.ok && fetchProjects) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Error removing member from project:", err);
    }
  };

  const colors = ["bg-[#4611A7]", "bg-[#39B88A]", "bg-[#A100D6]", "bg-blue-600", "bg-orange-500"];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[1500px] rounded-[30px] overflow-hidden bg-[#F5F3EF]"
      >
        {/* Content */}
        <div className="px-8 py-8">
          {/* Labels */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="uppercase text-sm md:text-base font-semibold tracking-wide text-[#919191]">
              Team Members ({currentProject?.members?.length || 0})
            </h3>
          </div>

          {/* Team Cards */}
          <div className="space-y-4">
            {Array.isArray(currentProject?.members) && currentProject.members.length > 0 ? (
              currentProject.members.map((member, index) => {
                const mUid = typeof member === "object" ? member.uid || member._id || member.id : member;
                const mName = typeof member === "object" ? member.name : (employeeMap[mUid]?.name || String(member));
                const mRole = typeof member === "object" ? member.role || "Team Member" : "Developer";
                const initial = (mName || "M").charAt(0).toUpperCase();

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-[#FAFAFA] rounded-2xl px-5 py-5 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-lg shadow-2xs`}
                      >
                        {initial}
                      </div>

                      {/* Name & Role */}
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-[#062C5B] leading-none">
                          {mName}
                        </h4>
                        <p className="mt-1 text-xs md:text-sm text-[#8E8E8E] font-medium">
                          {mRole}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(mUid)}
                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                      title="Remove Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                No team members assigned to this project yet.
              </div>
            )}
          </div>

          {/* Add Team */}
          <div className="mt-10 border-t pt-6 border-gray-200">
            <h3 className="uppercase text-sm font-semibold tracking-wide text-[#919191] mb-4">
              Add Team Member
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full sm:w-1/2 p-3 border rounded-xl outline-none text-sm bg-gray-50"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => {
                  const eId = emp._id || emp.uid || emp.id;
                  return (
                    <option key={eId} value={eId}>
                      {emp.name || emp.employeeName || emp.email}
                    </option>
                  );
                })}
              </select>

              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full sm:w-1/3 p-3 border rounded-xl outline-none text-sm bg-gray-50"
              >
                <option value="Leader">Leader</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Tester">Tester</option>
                <option value="Manager">Manager</option>
              </select>

              <button
                onClick={handleAddMember}
                disabled={!selectedEmpId}
                className="w-full sm:w-auto px-6 py-3 bg-[#2663FF] hover:bg-[#1E54E5] disabled:opacity-50 transition text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Add Member</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}