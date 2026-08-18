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

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../lib/firebase.js";
import { apiUrl } from "../config/api.js";

export default function ProjectForm({ onClose }) {
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
  });

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "employees"));
      const employeeList = [];
      snapshot.forEach((doc) => {
        employeeList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setEmployees(employeeList);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp;
    });
    return map;
  }, [employees]);

  const handleAddProject = async () => {
    try {
      const response = await fetch(
        apiUrl("/projects"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(project)
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Project Added Successfully");
        onClose();
      } else {
        console.error("Error adding project:", data.message);
      }
    } catch (error) {
      console.log(error);
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
    <div className="w-full max-w-4xl mx-auto bg-[#e9e7e2] rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll">
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white rounded-full transition-colors'
        aria-label="Close"
      >
        <X size={22} strokeWidth={2.5} />
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-[#0b2b57] mb-6 pr-8">
        Create New Project
      </h2>

      <div className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <InputField
            label="Company Name"
            name="company"
            value={project.company}
            onChange={handleChange}
            placeholder="Company Name"
          />

          <InputField
            label="Company Location"
            name="companylocation"
            value={project.companylocation}
            onChange={handleChange}
            placeholder="Company Location"
          />
        </div>

        <InputField
          label="Project Title"
          name="title"
          value={project.title}
          onChange={handleChange}
          placeholder="Project Title"
        />

        <div>
          <label className="font-bold text-[#0b2b57] text-sm block mb-2">
            Project Description
          </label>
          <textarea
            name="description"
            value={project.description}
            onChange={handleChange}
            placeholder="Enter project description..."
            className="w-full h-32 rounded-xl p-4 border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="font-bold text-[#0b2b57] text-sm block mb-2">
            Add Project Members
          </label>
          <div className="bg-white rounded-xl p-3 border border-gray-300 space-y-3">
            <select
              value=""
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) return;
                const employee = employeeMap[selectedId];
                if (!employee) return;
                if (project.members.some((member) => member.uid === employee.uid)) {
                  return;
                }
                setProject((prev) => ({
                  ...prev,
                  members: [
                    ...prev.members,
                    {
                      uid: employee.uid,
                      name: employee.name,
                      role: "Developer",
                      progress: 0,
                    },
                  ],
                }));
              }}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none bg-white"
            >
              <option value="">Select Employee to Add</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 pt-1">
              {project.members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-medium"
                >
                  <span>{member.name}</span>
                  <select
                    value={member.role}
                    onChange={(e) => {
                      setProject((prev) => ({
                        ...prev,
                        members: prev.members.map((m) =>
                          m.uid === member.uid
                            ? { ...m, role: e.target.value }
                            : m
                        ),
                      }));
                    }}
                    className="border border-blue-300 rounded px-1.5 py-0.5 text-xs bg-white text-gray-800"
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
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <InputField
            label="Project Leader"
            name="leader"
            value={project.leader}
            onChange={handleChange}
            placeholder="Select Leader"
            type="select"
            options={employees.map((emp) => ({
              label: emp.name,
              value: emp.uid || emp.name,
            }))}
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

        <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddProject}
            className="flex-1 py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            + Add Project
          </button>
        </div>
      </div>
    </div>
  );
}