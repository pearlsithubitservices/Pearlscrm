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
console.log("first employee:", employees[0]);
console.log("name:", employees[0]?.name);
  // FETCH EMPLOYEES
  const fetchEmployees = async () => {

    try {

      const snapshot = await getDocs(
        collection(db, "employees")
      );

      const employeeList = [];

      snapshot.forEach((doc) => {

        employeeList.push({
          id: doc.id,
          ...doc.data(),
        });

      });

      setEmployees(employeeList);
      console.log("employees:", employeeList);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // EMPLOYEE MAP
  const employeeMap = useMemo(() => {

    const map = {};

    employees.forEach((emp) => {
      map[emp.id] = emp;
    });

    return map;

  }, [employees]);

  // ADD PROJECT
  const handleAddProject = async () => {

    try {

      console.log("Adding project:", project);

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(project)
        }
      );

      const data = await response.json();

      console.log("Response from server:", data);

      if (response.ok) {

        console.log(
          "Project added successfully:",
          data
        );

        alert("Project Added Successfully");

        onClose();

      } else {

        console.error(
          "Error adding project:",
          data.message
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Failed to add project. Please try again."
      );

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
            Add Project Members
          </label>

          <div className="bg-white rounded-xl p-3 border relative">

            {/* SELECT EMPLOYEE */}

            <select
              value=""
              onChange={(e) => {

                const selectedId =
                  e.target.value;

                if (!selectedId) return;

                // Prevent duplicates
                const employee = employeeMap[selectedId];

                if (!employee) return;

                // Prevent duplicates
                if (
                  project.members.some(
                    (member) => member.uid === employee.uid
                  )
                ) {
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
              className="
                w-full
                border
                rounded-lg
                p-2
                outline-none
              "
            >

              <option value="">
                Select Employee
              </option>

              {employees.map((emp) => (

                <option
                  key={emp.id}
                  value={emp.id}
                >

                 {JSON.stringify(emp.name)}

                </option>

              ))}

            </select>

            {/* SELECTED MEMBERS */}

            <div className="flex flex-wrap gap-2 mt-4">
              {project.members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  <span>{member.name}</span>

                  <select
                    value={member.role}
                    onChange={(e) => {
                      setProject((prev) => ({
                        ...prev,
                        members: prev.members.map((m) =>
                          m.uid === member.uid
                            ? {
                              ...m,
                              role: e.target.value,
                            }
                            : m
                        ),
                      }));
                    }}
                    className="border rounded px-2 py-1 text-sm bg-white"
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
                    className="hover:text-red-500"
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
            onChange={handleChange}
            placeholder="Leader"
            type="select"
            options={employees.map((emp) => ({
              label: emp.name,
              value: emp.uid,
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