import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

const LeadsTable = () => {
  const [search, setSearch] = useState("");

 const [leadForm, setLeadForm] = useState({
  date: "",
  callAnswer: "",
  businessName: "",
  contactNumber: "",
  followGivenBy: "",
  location: "",
  actionsTaken: "",
  businessType: "",
  yearsInBusiness: "",
  mailId: "",
  suggestions: "",
  status: "New",
});


  const [leads, setLeads] = useState([
   {
  id: 1,
  date: "2026-06-05",
  callAnswer: "Answered",
  businessName: "Ponsankar Garments",
  contactNumber: "9876543210",
  followGivenBy: "Ragavi",
  location: "Karur",
  actionsTaken: "Quotation Sent",
  businessType: "Garments",
  yearsInBusiness: "10",
  mailId: "ponsankar@gmail.com",
  suggestions: "Follow up next week",
  status: "Interested",
}
  ]);

  const handleChange = (e) => {
    setLeadForm({
      ...leadForm,
      [e.target.name]: e.target.value,
    });
  };

  const addLead = () => {
   if (
 !leadForm.businessName ||
 !leadForm.contactNumber
) {
      alert("Please fill required fields");
      return;
    }

    const newLead = {
      id: Date.now(),
      ...leadForm,
    };

    setLeads([...leads, newLead]);

    setLeadForm({
  date: "",
  callAnswer: "",
  businessName: "",
  contactNumber: "",
  followGivenBy: "",
  location: "",
  actionsTaken: "",
  businessType: "",
  yearsInBusiness: "",
  mailId: "",
  suggestions: "",
  status: "New",
});
  };

  const deleteLead = (id) => {
    setLeads(
      leads.filter((lead) => lead.id !== id)
    );
  };

 const filteredLeads = leads.filter(
  (lead) =>
    lead.businessName
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    lead.contactNumber.includes(search)
);
 const getStatusColor = (status) => {
  switch (status) {
    case "Interested":
      return "bg-green-100 text-green-600";

    case "Follow Up":
      return "bg-yellow-100 text-yellow-600";

    case "Meeting Fixed":
      return "bg-orange-100 text-orange-600";

    case "Quotation Sent":
      return "bg-purple-100 text-purple-600";

    case "Converted":
      return "bg-blue-100 text-blue-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold text-[#0b2b57]">
            Leads Management
          </h2>

          <p className="text-gray-500">
            Add and manage marketing leads
          </p>
        </div>

        <Users
          size={30}
          className="text-blue-600"
        />
      </div>

      {/* ADD LEAD FORM */}

     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* <input
          type="text"
          name="leadName"
          placeholder="Lead Name"
          value={leadForm.leadName}
          onChange={handleChange}
          className="border rounded-xl p-3"
        /> */}
        <input
  type="date"
  name="date"
  value={leadForm.date}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="text"
  name="businessName"
  placeholder="Business Name"
  value={leadForm.businessName}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="text"
  name="contactNumber"
  placeholder="Contact Number"
  value={leadForm.contactNumber}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="text"
  name="followGivenBy"
  placeholder="Follow Given By"
  value={leadForm.followGivenBy}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="text"
  name="location"
  placeholder="Location"
  value={leadForm.location}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="text"
  name="businessType"
  placeholder="Business Type"
  value={leadForm.businessType}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="number"
  name="yearsInBusiness"
  placeholder="Years In Business"
  value={leadForm.yearsInBusiness}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<input
  type="email"
  name="mailId"
  placeholder="Mail ID"
  value={leadForm.mailId}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<select
  name="callAnswer"
  value={leadForm.callAnswer}
  onChange={handleChange}
  className="border rounded-xl p-3"
>
  <option value="">Call Answer</option>
  <option value="Answered">Answered</option>
  <option value="Not Answered">Not Answered</option>
  <option value="Busy">Busy</option>
  <option value="Call Back Later">Call Back Later</option>
</select>

<select
  name="status"
  value={leadForm.status}
  onChange={handleChange}
  className="border rounded-xl p-3"
>
  <option value="New">New</option>
  <option value="Interested">Interested</option>
  <option value="Follow Up">Follow Up</option>
  <option value="Meeting Fixed">Meeting Fixed</option>
  <option value="Quotation Sent">Quotation Sent</option>
  <option value="Converted">Converted</option>
</select>

<textarea
  name="actionsTaken"
  placeholder="Actions Taken"
  value={leadForm.actionsTaken}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

<textarea
  name="suggestions"
  placeholder="Suggestions"
  value={leadForm.suggestions}
  onChange={handleChange}
  className="border rounded-xl p-3"
/>

        {/* <input
          type="text"
          name="company"
          placeholder="Company"
          value={leadForm.company}
          onChange={handleChange}
          className="border rounded-xl p-3"
        /> */}

        {/* <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={leadForm.phone}
          onChange={handleChange}
          className="border rounded-xl p-3"
        /> */}

        {/* <input
          type="email"
          name="email"
          placeholder="Email"
          value={leadForm.email}
          onChange={handleChange}
          className="border rounded-xl p-3"
        /> */}

       <button
  onClick={addLead}
  className="bg-[#0b2b57] text-white rounded-xl h-[52px] flex items-center justify-center gap-2 font-semibold"
>
          <Plus size={18} />
          Add Lead
        </button>

      </div>

      {/* SEARCH */}

      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search Leads..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded-2xl pl-12 p-4"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

     <table className="w-full min-w-[1800px]">

 <thead>
  <tr className="border-b text-left">

    <th className="pb-4">Date</th>

    <th className="pb-4">Call Answer</th>

    <th className="pb-4">Business Name</th>

    <th className="pb-4">Contact Number</th>

    <th className="pb-4">Follow Given By</th>

    <th className="pb-4">Location</th>

    <th className="pb-4">Actions Taken</th>

    <th className="pb-4">Business Type</th>

    <th className="pb-4">Years In Business</th>

    <th className="pb-4">Mail ID</th>

    <th className="pb-4">Suggestions</th>

    <th className="pb-4">Status</th>

    <th className="pb-4">Action</th>

  </tr>
</thead>

          <tbody>

            {filteredLeads.map((lead) => (

              
<tr
  key={lead.id}
  className="border-b hover:bg-gray-50"
>
  <td className="py-4">{lead.date}</td>

  <td>{lead.callAnswer}</td>

  <td className="font-medium">
    {lead.businessName}
  </td>

  <td>{lead.contactNumber}</td>

  <td>{lead.followGivenBy}</td>

  <td>{lead.location}</td>

  <td>{lead.actionsTaken}</td>

  <td>{lead.businessType}</td>

  <td>{lead.yearsInBusiness}</td>

  <td>{lead.mailId}</td>

  <td>{lead.suggestions}</td>

  <td>
    <select
      value={lead.status}
      onChange={(e) =>
        setLeads(
          leads.map((item) =>
            item.id === lead.id
              ? {
                  ...item,
                  status: e.target.value,
                }
              : item
          )
        )
      }
      className={`border rounded-lg p-1 ${getStatusColor(
  lead.status
)}`}
    >
      <option>New</option>
      <option>Interested</option>
      <option>Follow Up</option>
      <option>Meeting Fixed</option>
      <option>Quotation Sent</option>
      <option>Converted</option>
    </select>
  </td>

  <td>
    <button
      onClick={() => deleteLead(lead.id)}
      className="text-red-500 hover:text-red-700"
    >
      <Trash2 size={18} />
    </button>
  </td>
</tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default LeadsTable;