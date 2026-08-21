import React, {
  Activity,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Phone,
  Users,
  IndianRupee,
  Globe,
  Calendar,
  Repeat,
  X,
  Mail,
} from "lucide-react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import InputField from "../components/InputField";
import { apiUrl } from "../config/api";

export default function CreateLead({ onClose, fetchleads }) {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [lead, setLead] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: "",
    budget: "",
    nextAction: "call",
    assignedTo: "",
    status: "New",
    priority: "Warm",
    followUpCount: 0,
    notes: "",
  });

  // FETCH EMPLOYEES
  useEffect(() => {
    fetchEmployees();
  }, []);

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
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setLead((prev) => ({
      ...prev,
      [name]:
        name === "followUpCount"
          ? Number(value)
          : value,
    }));
  };

  // ADD LEAD
  const addLead = async () => {
    try {
      console.log("Lead Data:", lead);

      const response = await fetch(
        apiUrl("/leads"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lead),
        }
      );

      const data = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add lead"
        );
      }

      fetchleads();

      alert("Lead Added Successfully");

      onClose();

      navigate("/leads");
    } catch (error) {
      console.error("Add Lead Error:", error);

      alert(
        error.message || "Failed To Add Lead"
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 rounded-[30px] md:rounded-[40px] bg-[#e9e7e2] relative max-h-[85vh] overflow-y-auto custom-scrollbar">

      {/* CLOSE */}
      <div className="absolute top-5 right-5">
        <button
          type="button"
          onClick={onClose}
          className="text-red-600 font-bold p-2 hover:bg-white rounded"
        >
          <X size={22} strokeWidth={3} />
        </button>
      </div>

      {/* FORM */}
      <div className="grid md:grid-cols-2 gap-5">

        <InputField
          label="Lead Name"
          name="name"
          value={lead.name}
          onChange={handleChange}
          placeholder="John Doe"
        />

        <InputField
          label="Company Name"
          name="company"
          value={lead.company}
          onChange={handleChange}
          placeholder="Innovatech"
        />

        <InputField
          label="Phone Number"
          name="phone"
          value={lead.phone}
          onChange={handleChange}
          placeholder="+1 555"
          Icon={Phone}
        />

        <InputField
          label="Email Address"
          name="email"
          value={lead.email}
          onChange={handleChange}
          placeholder="example@gmail.com"
          Icon={Mail}
          type="email"
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={lead.assignedTo}
          onChange={handleChange}
          placeholder="Agent"
          Icon={Users}
          type="select"
          options={employees.map((employee) => ({
            label: employee.name,
            value: employee.uid,
          }))}
        />

        <InputField
          label="Status"
          name="status"
          value={lead.status}
          onChange={handleChange}
          placeholder="New"
          Icon={Activity}
        />

        <InputField
          label="Source"
          name="source"
          value={lead.source}
          onChange={handleChange}
          placeholder="Website"
          Icon={Globe}
        />

        <InputField
          label="Budget"
          name="budget"
          value={lead.budget}
          onChange={handleChange}
          placeholder="₹0.00"
          Icon={IndianRupee}
        />

        <InputField
          label="Priority"
          name="priority"
          value={lead.priority}
          onChange={handleChange}
          placeholder="Warm"
        />

        <InputField
          label="Follow-up Count"
          name="followUpCount"
          value={lead.followUpCount}
          onChange={handleChange}
          placeholder="0"
          Icon={Repeat}
          type="number"
        />

        <InputField
          label="Next Action"
          name="nextAction"
          value={lead.nextAction}
          onChange={handleChange}
          placeholder="Follow-up call"
          Icon={Calendar}
        />

      </div>

      {/* DESCRIPTION */}
      <div className="mt-4">
        <label className="font-bold text-[#0b2b57]">
          Lead Description
        </label>

        <textarea
          name="notes"
          value={lead.notes}
          onChange={handleChange}
          placeholder="Enter lead description..."
          className="w-full h-40 p-4 rounded-xl mt-2"
        />
      </div>

      {/* BUTTONS */}
      <div className="border-t pt-8 mt-6 flex gap-4">

        <button
          type="button"
          onClick={onClose}
          className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={addLead}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl"
        >
          + Add Lead
        </button>

      </div>
    </div>
  );
}