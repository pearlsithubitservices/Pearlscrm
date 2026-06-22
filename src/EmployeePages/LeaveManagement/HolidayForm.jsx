import React, { useState } from "react";
import { Calendar, Upload, Plus, X } from "lucide-react";

const HolidayForm = ({onClose}) => {
  const [holidayData, setHolidayData] = useState({
    holidayName: "",
    holidayDate: "",
    holidayType: "Public",
    description: "",
  });

  const [excelFile, setExcelFile] = useState(null);

  const handleChange = (e) => {
    setHolidayData({
      ...holidayData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/holidays",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(holidayData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Holiday Added");

        setHolidayData({
          holidayName: "",
          holidayDate: "",
          holidayType: "Public",
          description: "",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBulkUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel file");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", excelFile);

      const response = await fetch(
        "http://localhost:5000/api/holidays/bulk-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`${data.count} holidays imported`);
        setExcelFile(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="relative bg-white rounded-3xl shadow-sm border  p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2B57]">
              Company Holidays
            </h1>
            <X size={20} className="bg-red-500 text-white rounded" onClick={() => onClose()}/>

            <p className="text-gray-500 mt-1">
              Add individual holidays or upload holidays in bulk.
            </p>
          </div>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white cursor-pointer hover:bg-green-700">
            <Upload size={18} />
            Bulk Upload

            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
          </label>
        </div>

        {excelFile && (
          <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
            <span>{excelFile.name}</span>

            <button
              onClick={handleBulkUpload}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Upload File
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Holiday Name
            </label>

            <input
              type="text"
              name="holidayName"
              value={holidayData.holidayName}
              onChange={handleChange}
              placeholder="Enter holiday name"
              className="w-full border rounded-xl px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Holiday Date
            </label>

            <input
              type="date"
              name="holidayDate"
              value={holidayData.holidayDate}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Holiday Type
            </label>

            <select
              name="holidayType"
              value={holidayData.holidayType}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="Public">Public</option>
              <option value="Festival">Festival</option>
              <option value="National">National</option>
              <option value="Optional">Optional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={holidayData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#0B2B57] text-white px-6 py-3 rounded-xl hover:opacity-90"
            >
              <Plus size={18} />
              Add Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayForm;