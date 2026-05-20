import React, { useState } from "react";

import InputField from "../components/InputField.jsx";

import {
  Users,
  Calendar,
  IndianRupee,
  X
} from "lucide-react";

export default function ProjectForm({ onClose }) {

  const [project, setProject] = useState({
    company: "",
    companylocation: "",
    title: "",
    description: "",
    members: [],
    memberInput: "",
    assignedDate: "",
    dueDate: "",
    leader: "",
    budget: ""
  });

  //ADD PROJECT

  const handleAddProject = async () => {
    try {
      console.log("Adding project:", project);
      const response = await fetch("http://localhost:5000/api/projects", 
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(project)
      });
      const data = await response.json();
      
      console.log("Response from server:", data);
      

      if (response.ok) {
        console.log("Project added successfully:", data);
        alert("Project Added Successfully");
        onClose();
      } else {
        console.error("Error adding project:", data.message);
      }
    } 
    catch (error) {
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

  // Add member when Enter pressed
  const handleAddMember = (e) => {

    if (e.key === "Enter" && project.memberInput.trim()) {
      e.preventDefault();

      if (
        !project.members.includes(
          project.memberInput
        )
      ) {
        setProject({
          ...project,
          members: [
            ...project.members,
            project.memberInput
          ],
          memberInput: ""
        });
      }
    }
  };

  const removeMember = (member) => {
    setProject({
      ...project,
      members: project.members.filter(
        (m) => m !== member
      )
    });
  };

  return (

    <div className="max-w-5xl mx-auto bg-[#e9e7e2] p-10 rounded-[40px] relative">

      <div className="absolute top-5 right-5 text-red-600 hover:bg-white rounded">
        <X
          size={22}
          strokeWidth={3}
          onClick={onClose}
        />
      </div>

      <div className="space-y-5">

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

        <InputField
          label="Project Title"
          name="title"
          value={project.title}
          onChange={handleChange}
          placeholder="Project title"
        />

        

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

          <div className="bg-white rounded-xl p-3">

            <div className="flex flex-wrap gap-2 mb-2">

              {project.members.map((member) => (

                <div
                  key={member}
                  className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full"
                >
                  {member}

                  <button
                    onClick={() =>
                      removeMember(member)
                    }
                  >
                    <X size={14} />
                  </button>

                </div>

              ))}

            </div>

            <input
              type="text"
              value={project.memberInput}
              onChange={(e) =>
                setProject({
                  ...project,
                  memberInput: e.target.value
                })
              }
              onKeyDown={handleAddMember}
              placeholder="Type member name and press Enter"
              className="w-full outline-none"
            />

          </div>

        </div>

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

        <div className="grid md:grid-cols-2 gap-5">

          <InputField
            label="Project Leader"
            name="leader"
            value={project.leader}
            onChange={handleChange}
            placeholder="Leader"
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

        <div className="border-t pt-8 flex gap-4">

          <button
            className="px-10 py-4 border rounded-xl bg-blue-700 text-white"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleAddProject}
            className="flex-1 bg-blue-700 text-white rounded-xl"
          >
            + Add Project
          </button>

        </div>

      </div>

    </div>

  );
}