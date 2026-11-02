import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Download,
  FileText,
  Laptop,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DEPARTMENTS } from "../data/departments";
import {
  createHRRecord,
  deleteHRRecord,
  downloadHRDocument,
  getHRAnalytics,
  getHREmployees,
  getHRRecords,
  getEmployeeKpi,
  updateHRRecord,
} from "../services/hrApi";

const MODULES = [
  {
    id: "recruitment",
    label: "Recruitment",
    icon: BriefcaseBusiness,
    fields: [
      { name: "candidateName", label: "Candidate name", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "jobTitle", label: "Position", required: true },
      { name: "department", label: "Department", type: "select", options: ["", ...DEPARTMENTS] },
      { name: "source", label: "Source" },
      { name: "notes", label: "Recruiter notes", type: "textarea" },
    ],
    statuses: ["New", "Screening", "Interview", "Offer", "Hired", "Rejected"],
  },
  {
    id: "lifecycle",
    label: "Onboarding & Offboarding",
    icon: ClipboardList,
    fields: [
      { name: "employeeName", label: "Employee", required: true, type: "employee" },
      { name: "processType", label: "Process", required: true, type: "select", options: ["Onboarding", "Offboarding"] },
      { name: "dueDate", label: "Due date", required: true, type: "date" },
      { name: "owner", label: "Task owner" },
      { name: "checklist", label: "Checklist / notes", type: "textarea" },
    ],
    statuses: ["Not started", "In progress", "Completed", "Cancelled"],
  },
  {
    id: "document",
    label: "Employee Documents",
    icon: FileText,
    fields: [
      { name: "employeeName", label: "Employee", required: true, type: "employee" },
      { name: "category", label: "Document type", required: true, type: "select", options: ["Identity", "Employment", "Education", "Payroll", "Policy acknowledgement", "Other"] },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "file", label: "File", required: true, type: "file" },
    ],
    statuses: ["Current", "Expiring", "Expired"],
  },
  {
    id: "probation",
    label: "Probation Tracking",
    icon: CalendarClock,
    fields: [
      { name: "employeeName", label: "Employee", required: true, type: "employee" },
      { name: "startDate", label: "Start date", required: true, type: "date" },
      { name: "endDate", label: "Probation end date", required: true, type: "date" },
      { name: "performanceRating", label: "Latest KPI rating", type: "rating", readonly: true },
      { name: "recommendation", label: "Review recommendation", type: "select", options: ["", "Confirm", "Extend", "Unsuccessful"] },
      { name: "notes", label: "Manager notes", type: "textarea" },
    ],
    statuses: ["In progress", "Review due", "Confirmed", "Extended", "Unsuccessful"],
  },
  {
    id: "grievance",
    label: "Grievance Management",
    icon: ShieldAlert,
    fields: [
      { name: "employeeName", label: "Employee", required: true, type: "employee" },
      { name: "category", label: "Category", required: true, type: "select", options: ["Workplace conduct", "Compensation", "Harassment", "Safety", "Workload", "Other"] },
      { name: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
      { name: "assignedTo", label: "Assigned HR owner" },
      { name: "description", label: "Case details", required: true, type: "textarea" },
    ],
    statuses: ["Open", "Under review", "Resolved", "Closed"],
  },
  {
    id: "asset",
    label: "Asset Management",
    icon: Laptop,
    fields: [
      { name: "assetName", label: "Asset name", required: true },
      { name: "assetTag", label: "Asset tag / serial", required: true },
      { name: "category", label: "Category", required: true, type: "select", options: ["Laptop", "Mobile", "Access card", "Peripheral", "Other"] },
      { name: "assignedEmployee", label: "Assigned employee", type: "employee" },
      { name: "assignedDate", label: "Assigned date", type: "date" },
      { name: "condition", label: "Condition", type: "select", options: ["New", "Good", "Fair", "Needs repair"] },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    statuses: ["Available", "Assigned", "Under repair", "Returned", "Retired"],
  },
  {
    id: "salaryRevision",
    label: "KPI & Salary Revision",
    icon: BadgeCheck,
    fields: [
      { name: "employeeName", label: "Employee", required: true, type: "employee" },
      { name: "currentSalary", label: "Current basic salary", type: "number" },
      { name: "performanceRating", label: "Average KPI rating (out of 5)", type: "rating", readonly: true },
      { name: "proposedBasicSalary", label: "Proposed basic salary", required: true, type: "number" },
      { name: "proposedGrossSalary", label: "Proposed gross salary", type: "number" },
      { name: "proposedNetSalary", label: "Proposed net salary", type: "number" },
      { name: "effectiveDate", label: "Effective date", required: true, type: "date" },
      { name: "rationale", label: "Revision rationale", type: "textarea" },
    ],
    statuses: ["Pending", "Approved", "Rejected"],
  },
];

const EMPTY_ANALYTICS = {
  headcount: 0,
  openPositions: 0,
  probationDue: 0,
  openGrievances: 0,
  pendingSalaryRevisions: 0,
  assignedAssets: 0,
  documentExpiry: 0,
};

const getInitialForm = (module) => ({
  ...Object.fromEntries(module.fields.map((field) => [field.name, ""])),
  status: module.statuses[0],
});

const getEmployeeIdentifier = (employee) =>
  employee?.employeeId || employee?.id || employee?._id || "";

const fetchWorkspaceData = async () => {
  const [recordResponse, employeeResponse, analyticsResponse] = await Promise.all([
    getHRRecords(),
    getHREmployees(),
    getHRAnalytics(),
  ]);
  return {
    records: recordResponse.data?.data || [],
    employees: employeeResponse.data?.data || [],
    analytics: { ...EMPTY_ANALYTICS, ...(analyticsResponse.data?.data || {}) },
  };
};

export default function HRManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedModule = searchParams.get("module") || "overview";
  const activeModule = MODULES.some((module) => module.id === requestedModule)
    ? requestedModule
    : "overview";
  const setActiveModule = (module) => {
    setSearchParams(module === "overview" ? {} : { module });
  };
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModule, setFormModule] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);

  const applyWorkspaceData = useCallback((workspace) => {
    setRecords(workspace.records);
    setEmployees(workspace.employees);
    setAnalytics(workspace.analytics);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      applyWorkspaceData(await fetchWorkspaceData());
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load HR workspace");
    } finally {
      setLoading(false);
    }
  }, [applyWorkspaceData]);

  useEffect(() => {
    let active = true;
    const loadInitialWorkspace = async () => {
      try {
        const workspace = await fetchWorkspaceData();
        if (active) applyWorkspaceData(workspace);
      } catch (error) {
        if (active) toast.error(error.response?.data?.message || "Unable to load HR workspace");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitialWorkspace();
    return () => {
      active = false;
    };
  }, [applyWorkspaceData]);

  const selectedModule = MODULES.find((module) => module.id === activeModule);
  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesModule = activeModule === "overview" || record.module === activeModule;
      const searchable = [
        record.title,
        record.employeeName,
        record.status,
        ...Object.values(record.details || {}),
      ].join(" ").toLowerCase();
      return matchesModule && (!query || searchable.includes(query));
    });
  }, [activeModule, records, search]);

  const openCreateForm = () => {
    if (!selectedModule) return;
    setEditingRecord(null);
    setForm(getInitialForm(selectedModule));
    setFile(null);
    setFormModule(selectedModule);
  };

  const openEditForm = (record) => {
    const module = MODULES.find((item) => item.id === record.module);
    if (!module) return;
    setEditingRecord(record);
    setForm({ ...getInitialForm(module), ...record.details, status: record.status });
    setFile(null);
    setFormModule(module);
  };

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const selectEmployee = async (employeeField, employeeId) => {
    const employee = employees.find((item) => getEmployeeIdentifier(item) === employeeId);
    setForm((previous) => ({
      ...previous,
      [employeeField.name]: employee?.employeeName || "",
      employeeId: employeeId || "",
      employeeEmail: employee?.email || "",
      ...(formModule?.id === "asset"
        ? { status: employeeId ? "Assigned" : "Available" }
        : {}),
    }));

    if (formModule?.id !== "salaryRevision" || !employeeId) return;
    setKpiLoading(true);
    try {
      const { data } = await getEmployeeKpi(employeeId);
      const performanceRating = data.data?.averageRating;
      setForm((previous) => ({
        ...previous,
        performanceRating: performanceRating == null ? "" : Number(performanceRating).toFixed(2),
        currentSalary: employee?.salary?.basicSalary ?? employee?.profile?.salary?.basicSalary ?? "",
      }));
      if (performanceRating == null) {
        toast("No saved performance review was found for this employee.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load the employee KPI rating");
    } finally {
      setKpiLoading(false);
    }
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!formModule) return;
    setSaving(true);
    try {
      const { status, ...details } = form;
      if (editingRecord) {
        await updateHRRecord(editingRecord._id, { details });
      } else {
        await createHRRecord(formModule.id, { ...details, status }, file);
      }
      toast.success(editingRecord ? "HR record updated" : "HR record created");
      setFormModule(null);
      setEditingRecord(null);
      await loadWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save HR record");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (record, status) => {
    try {
      await updateHRRecord(record._id, { status });
      toast.success(record.module === "salaryRevision" && status === "Approved"
        ? "Salary revision approved and applied"
        : "Status updated");
      await loadWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update record status");
    }
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) return;
    try {
      await deleteHRRecord(record._id);
      toast.success("HR record deleted");
      await loadWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete HR record");
    }
  };

  const downloadDocument = async (record) => {
    try {
      await downloadHRDocument(record._id, record.details?.fileName || record.title);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to download employee document");
    }
  };

  const renderField = (field) => {
    const value = form[field.name] ?? "";
    const commonClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500";
    if (field.type === "employee") {
      return (
        <select
          required={field.required}
          value={form.employeeId || ""}
          onChange={(event) => selectEmployee(field, event.target.value)}
          className={commonClass}
        >
          <option value="">Select an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={getEmployeeIdentifier(employee)}>
              {employee.employeeName} ({employee.email})
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "file") {
      return (
        <input
          type="file"
          required={field.required && !editingRecord}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className={commonClass}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          value={value}
          required={field.required}
          onChange={(event) => updateField(field.name, event.target.value)}
          className={commonClass}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>{option || "Select"}</option>
          ))}
        </select>
      );
    }
    if (field.type === "textarea") {
      return (
        <textarea
          value={value}
          required={field.required}
          onChange={(event) => updateField(field.name, event.target.value)}
          className={`${commonClass} min-h-24 resize-y`}
          rows={3}
        />
      );
    }
    if (field.type === "rating") {
      return (
        <div className="relative">
          <input type="text" value={kpiLoading ? "Loading KPI..." : (value || "No saved review")} readOnly className={`${commonClass} bg-slate-50`} />
          {!field.readonly && (
            <input type="hidden" value={value} onChange={(event) => updateField(field.name, event.target.value)} />
          )}
        </div>
      );
    }
    return (
      <input
        type={field.type || "text"}
        value={value}
        required={field.required}
        readOnly={field.readonly}
        min={field.type === "number" ? 0 : undefined}
        step={field.type === "number" ? "0.01" : undefined}
        onChange={(event) => updateField(field.name, event.target.value)}
        className={`${commonClass} ${field.readonly ? "bg-slate-50" : ""}`}
      />
    );
  };

  const metricCards = [
    ["Employee headcount", analytics.headcount, Users],
    ["Open recruitment", analytics.openPositions, BriefcaseBusiness],
    ["Probation reviews due", analytics.probationDue, CalendarClock],
    ["Open grievances", analytics.openGrievances, ShieldAlert],
    ["Pending salary revisions", analytics.pendingSalaryRevisions, BadgeCheck],
    ["Assigned assets", analytics.assignedAssets, Laptop],
    ["Documents expiring", analytics.documentExpiry, FileText],
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-7 lg:px-9">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Human Resources</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">HR Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage the employee journey, records, and workforce insights.</p>
        </div>
        {selectedModule && (
          <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Plus size={17} /> Add {selectedModule.label}
          </button>
        )}
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveModule("overview")} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${activeModule === "overview" ? "bg-blue-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
          HR Analytics
        </button>
        {MODULES.map((module) => (
          <button key={module.id} onClick={() => setActiveModule(module.id)} className={`inline-flex whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${activeModule === module.id ? "bg-blue-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
            <module.icon size={16} /> {module.label}
          </button>
        ))}
      </div>

      {activeModule === "overview" && (
        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(([label, value, Icon]) => (
            <article key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Icon size={18} /></span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{loading ? "—" : value}</p>
            </article>
          ))}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-slate-900">{selectedModule?.label || "Recent HR activity"}</h2>
            <p className="mt-1 text-xs text-slate-500">{visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"}</p>
          </div>
          <label className="relative block sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search HR records" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
          </label>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading HR records...</div>
        ) : visibleRecords.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-700">No records yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a record to start tracking this part of the employee lifecycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Record</th>
                  <th className="px-5 py-3 font-semibold">Employee / details</th>
                  <th className="px-5 py-3 font-semibold">Module</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRecords.map((record) => {
                  const module = MODULES.find((item) => item.id === record.module);
                  const employeeSummary = record.employeeName || record.details?.candidateName || record.details?.assignedEmployee || record.details?.assetTag || "—";
                  return (
                    <tr key={record._id} className="hover:bg-slate-50/70">
                      <td className="max-w-xs px-5 py-4 font-medium text-slate-900">{record.title}</td>
                      <td className="px-5 py-4 text-slate-600">{employeeSummary}</td>
                      <td className="px-5 py-4 text-slate-600">{module?.label || record.module}</td>
                      <td className="px-5 py-4">
                        <select aria-label={`Status for ${record.title}`} value={record.status} onChange={(event) => changeStatus(record, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                          {module?.statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">{new Date(record.updatedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {record.module === "document" && (
                            <button onClick={() => downloadDocument(record)} title="Download document" className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><Download size={16} /></button>
                          )}
                          <button onClick={() => openEditForm(record)} title="Edit record" className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">Edit</button>
                          <button onClick={() => removeRecord(record)} title="Delete record" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setFormModule(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="hr-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 id="hr-form-title" className="font-semibold text-slate-900">{editingRecord ? "Edit" : "Add"} {formModule.label}</h2>
                <p className="mt-1 text-xs text-slate-500">HR workspace access is restricted to HR administrators.</p>
              </div>
              <button onClick={() => setFormModule(null)} aria-label="Close form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={saveRecord} className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {formModule.fields.map((field) => (
                  <label key={field.name} className={`block space-y-1.5 text-sm font-medium text-slate-700 ${field.type === "textarea" || field.type === "file" ? "sm:col-span-2" : ""}`}>
                    {field.label}{field.required && <span className="text-red-600"> *</span>}
                    {renderField(field)}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setFormModule(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving || kpiLoading} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : editingRecord ? "Save changes" : "Create record"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
