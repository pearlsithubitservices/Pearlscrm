import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import InputField from "../components/InputField.jsx";

import {
  Calendar,
  IndianRupee,
  X
} from "lucide-react";

import { apiUrl } from "../config/api.js";
import useEmployees from "../Hooks/useEmployees.js";

export default function ProjectForm({ onClose, fetchProjects }) {
  const { employees } = useEmployees();
  const [project, setProject] = useState({
    company: "",
    companylocation: "",
    title: "",
    description: "",
    members: [],
    assignedDate: "",
    dueDate: "",
    leader: "",
    budget: "",
    status: "In Progress",
    priority: "Medium",
    progress: 0,
  });

  // EMPLOYEE MAP
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const eKey = emp._id || emp.id || emp.uid;
      if (eKey) map[eKey] = emp;
    });
    return map;
  }, [employees]);

  // ADD PROJECT
  const handleAddProject = async () => {
    if (!project.title.trim()) {
      alert("Please enter a project title");
      return;
    }

    try {
      const response = await fetch(apiUrl("/projects"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(project)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Project Added Successfully");
        if (fetchProjects) await fetchProjects();
        onClose();
      } else {
        alert(data.message || "Error adding project");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add project. Please try again.");
    }
  };

  const handleChange = (e) => {

    setProject({
      ...project,
      [e.target.name]: e.target.value
    });

  };

  return (

    <div className="max-w-5xl mx-auto bg-[#e9e7e2] p-10 rounded-[40px] relative">

      {/* CLOSE BUTTON */}

      <div className="absolute top-5 right-5 text-red-600 hover:bg-white rounded">

        <X
          size={22}
          strokeWidth={3}
          onClick={onClose}
        />

      </div>

      <div className="space-y-5">

        {/* COMPANY */}

        <InputField
          label="Company Name"
          name="company"
          value={project.company}
          onChange={handleChange}
          placeholder="Company"
        />

        <InputField
          label="Company Location"
          name="companylocation"
          value={project.companylocation}
          onChange={handleChange}
          placeholder="Company Location"
        />

        {/* TITLE */}

        <InputField
          label="Project Title"
          name="title"
          value={project.title}
          onChange={handleChange}
          placeholder="Project title"
        />

        {/* DESCRIPTION */}

        <label className="font-bold text-[#0b2b57]">
          Project Description
        </label>

        <textarea
          name="description"
          value={project.description}
          onChange={handleChange}
          className="w-full h-40 rounded-xl p-4"
        />

        {/* PROJECT MEMBERS */}

        <div>

          <label className="font-bold text-[#0b2b57]">
            Add Project Members (From Database)
          </label>

          <div className="bg-white rounded-xl p-3 border relative">

            {/* SELECT EMPLOYEE */}

            <select
              value=""
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) return;

                const employee = employeeMap[selectedId];
                if (!employee) return;

                const empUid = employee._id || employee.id || employee.uid;
                const empName = employee.name || employee.employeeName || employee.email;

                if (project.members.some((m) => (m.uid || m._id || m.id) === empUid)) {
                  return;
                }

                setProject((prev) => ({
                  ...prev,
                  members: [
                    ...prev.members,
                    {
                      uid: empUid,
                      _id: empUid,
                      id: empUid,
                      name: empName,
                      role: "Developer",
                      progress: 0,
                    },
                  ],
                }));
              }}
              className="
                w-full
                border
                rounded-lg
                p-2
                outline-none
              "
            >

              <option value="">
                Select Employee...
              </option>

              {employees.map((emp) => {
                const eId = emp._id || emp.id || emp.uid;
                const eName = emp.name || emp.employeeName || emp.email;
                return (
                  <option key={eId} value={eId}>
                    {eName}
                  </option>
                );
              })}
            </select>

            {/* SELECTED MEMBERS */}

            <div className="flex flex-wrap gap-2 mt-4">
              {project.members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span>{member.name}</span>

                  <select
                    value={member.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        leader: newRole === "Leader" ? member.name : prev.leader,
                        members: prev.members.map((m) =>
                          m.uid === member.uid
                            ? {
                              ...m,
                              role: newRole,
                            }
                            : m
                        ),
                      }));
                    }}
                    className="border rounded px-2 py-0.5 text-xs bg-white text-gray-700 outline-none"
                  >
                    <option value="Leader">Leader</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Tester">Tester</option>
                    <option value="Manager">Manager</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        members: prev.members.filter(
                          (m) => m.uid !== member.uid
                        ),
                      }))
                    }
                    className="hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* DATES */}

        <div className="grid md:grid-cols-2 gap-5">

          <InputField
            label="Assigned Date"
            name="assignedDate"
            value={project.assignedDate}
            onChange={handleChange}
            type="date"
            Icon={Calendar}
          />

          <InputField
            label="Due Date"
            name="dueDate"
            value={project.dueDate}
            onChange={handleChange}
            type="date"
            Icon={Calendar}
          />

        </div>

        {/* LEADER + BUDGET */}

        <div className="grid md:grid-cols-2 gap-5">

          <InputField
            label="Project Leader"
            name="leader"
            value={project.leader}
            onChange={(e) => {
              const selectedLeaderName = e.target.value;
              setProject((prev) => {
                const updatedMembers = [...prev.members];
                const empObj = employees.find(
                  (emp) => (emp.name || emp.employeeName || emp.email) === selectedLeaderName
                );
                if (empObj) {
                  const empUid = empObj._id || empObj.id || empObj.uid;
                  const exists = updatedMembers.some(
                    (m) => (m.uid || m._id || m.id) === empUid
                  );
                  if (!exists) {
                    updatedMembers.push({
                      uid: empUid,
                      _id: empUid,
                      id: empUid,
                      name: empObj.name || empObj.employeeName || empObj.email,
                      role: "Leader",
                      progress: 0,
                    });
                  }
                }
                return {
                  ...prev,
                  leader: selectedLeaderName,
                  members: updatedMembers,
                };
              });
            }}
            placeholder="Select Leader"
            type="select"
            options={employees.map((emp) => {
              const eName = emp.name || emp.employeeName || emp.email;
              return {
                label: eName,
                value: eName,
              };
            })}
          />

          <InputField
            label="Budget"
            name="budget"
            value={project.budget}
            onChange={handleChange}
            placeholder="₹0.00"
            Icon={IndianRupee}
            type="number"
          />

        </div>

        {/* BUTTONS */}

        <div className="border-t pt-8 flex gap-4">

          <button
            className="
              px-10
              py-4
              border
              rounded-xl
              bg-blue-700
              text-white
            "
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleAddProject}
            className="
              flex-1
              bg-blue-700
              text-white
              rounded-xl
            "
          >
            + Add Project
          </button>

        </div>

      </div>

    </div>

  );

}