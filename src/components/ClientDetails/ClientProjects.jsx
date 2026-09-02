import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api.js";

const ClientProjects = ({ clientId, clientName, companyName }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [createData, setCreateData] = useState({
    title: "",
    company: clientName || companyName || "",
    companylocation: "",
    description: "",
    status: "In Progress",
    priority: "Medium",
    progress: 0,
    assignedDate: "",
    dueDate: "",
    budget: "",
  });
  const [editData, setEditData] = useState({
    title: "",
    company: "",
    companylocation: "",
    description: "",
    status: "In Progress",
    priority: "Medium",
    progress: 0,
    dueDate: "",
    budget: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl("/projects"));
      if (!response.ok) return;

      const data = await response.json();
      const allProjects = Array.isArray(data) ? data : [];

      const filtered = allProjects.filter((project) => {
        const projectClientId = project?.clientId ? String(project.clientId) : "";
        const projectCompany = project?.company || "";
        const companyMatch =
          projectCompany === clientName ||
          projectCompany === companyName ||
          projectCompany === (clientName || companyName);

        return projectClientId === String(clientId || "") || companyMatch;
      });

      setProjects(filtered);
    } catch (error) {
      console.error("Error fetching client projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [clientId, clientName, companyName]);

  const summary = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((project) => {
      const status = (project?.status || "").toLowerCase();
      return status === "in progress" || status === "pending" || status === "on hold";
    }).length;
    const completed = projects.filter((project) => (project?.status || "").toLowerCase() === "completed").length;

    return { total, active, completed };
  }, [projects]);

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return;
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    try {
      const response = await fetch(apiUrl(`/projects/${projectId}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete project");
        return;
      }

      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Something went wrong while deleting the project.");
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditData({
      title: project?.title || "",
      company: project?.company || clientName || companyName || "",
      companylocation: project?.companylocation || "",
      description: project?.description || "",
      status: project?.status || "In Progress",
      priority: project?.priority || "Medium",
      progress: Number(project?.progress || 0),
      dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : "",
      budget: project?.budget || "",
    });
    setIsEditOpen(true);
  };

  const openCreateModal = () => {
    setCreateData({
      title: "",
      company: clientName || companyName || "",
      companylocation: "",
      description: "",
      status: "In Progress",
      priority: "Medium",
      progress: 0,
      assignedDate: "",
      dueDate: "",
      budget: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateProject = async () => {
    if (!createData.title?.trim()) {
      alert("Please enter a project title.");
      return;
    }

    if (!createData.company?.trim()) {
      alert("Please enter a company name.");
      return;
    }

    try {
      const payload = {
        ...createData,
        clientId: clientId || "",
        company: createData.company.trim(),
        companylocation: createData.companylocation?.trim() || "Main Office",
        title: createData.title.trim(),
        description: createData.description?.trim() || "",
        progress: Number(createData.progress) || 0,
        budget: Number(createData.budget) || 0,
        assignedDate: createData.assignedDate || undefined,
        dueDate: createData.dueDate || undefined,
        members: [],
      };

      const response = await fetch(apiUrl("/projects"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create project");
      }

      setIsCreateOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.message || "Something went wrong while creating the project.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(apiUrl(`/projects/${selectedProject._id || selectedProject.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedProject,
          ...editData,
          clientId: clientId || selectedProject.clientId || "",
          progress: Number(editData.progress) || 0,
          budget: Number(editData.budget) || 0,
          dueDate: editData.dueDate || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update project");
      }

      setIsEditOpen(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error.message || "Something went wrong while updating the project.");
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#f6f3ee] p-5 shadow-xl border border-black/5">
      <div className="mt-5">
        <p className="text-[11px] font-semibold text-gray-400 mb-3">PROJECTS SUMMARY</p>

        <div className="grid grid-cols-3 gap-3">
          <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#dfe9ff] p-3">
            <p className="text-[10px] font-bold text-[#1d3557]">TOTAL</p>
            <h3 className="text-2xl font-bold text-[#1d3557] mt-1">{summary.total}</h3>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#e8f4d9] p-3">
            <p className="text-[10px] font-bold text-[#3f6b2a]">ACTIVE</p>
            <h3 className="text-2xl font-bold text-[#3f6b2a] mt-1">{summary.active}</h3>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="rounded-lg bg-[#ffe3de] p-3">
            <p className="text-[10px] font-bold text-[#c95040]">FINISH</p>
            <h3 className="text-2xl font-bold text-[#c95040] mt-1">{summary.completed}</h3>
          </motion.div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400">PROJECT HISTORY</p>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-200 text-[10px] text-gray-600 hover:bg-gray-300"
          >
            <Plus size={12} />
            Add Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <LoaderCircle className="animate-spin mr-2" size={16} />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-500">
            No projects found for this client.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((item) => {
              const projectProgress = Number(item?.progress || 0);
              const projectStatus = item?.status || "In Progress";
              const statusClass =
                projectStatus.toLowerCase() === "completed"
                  ? "text-green-600"
                  : projectStatus.toLowerCase() === "pending"
                    ? "text-yellow-600"
                    : "text-blue-600";

              return (
                <motion.div
                  key={item?._id || item?.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl p-4 border border-black/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1d3557] text-sm">{item?.title || "Untitled Project"}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {item?.description || "No project description added yet."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Edit project"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(item?._id || item?.id)}
                        className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 gap-3">
                    <p className="text-[11px] flex items-center gap-2 flex-wrap">
                      <span className="text-gray-400">
                        {item?.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString()} - ` : "No due date - "}
                      </span>
                      <span className={`font-semibold ${statusClass}`}>{projectStatus}</span>
                    </p>

                    <p className="text-xs font-bold text-[#1d3557]">{projectProgress}%</p>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${projectProgress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {item?.companylocation || "Location not specified"}
                    </span>
                    <span className="font-semibold text-slate-600">{item?.priority || "Medium"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-[#0b2b57]">Add Project</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-red-500 p-1">
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
              <div>
                <label className="block mb-1">Project Title</label>
                <input
                  type="text"
                  value={createData.title}
                  onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                  placeholder="CRM Implementation"
                />
              </div>

              <div>
                <label className="block mb-1">Company / Client</label>
                <input
                  type="text"
                  value={createData.company}
                  onChange={(e) => setCreateData({ ...createData, company: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Location</label>
                <input
                  type="text"
                  value={createData.companylocation}
                  onChange={(e) => setCreateData({ ...createData, companylocation: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                  placeholder="Main Office"
                />
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={createData.status}
                  onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Priority</label>
                <select
                  value={createData.priority}
                  onChange={(e) => setCreateData({ ...createData, priority: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Hot">Hot</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Warm">Warm</option>
                  <option value="Low">Low</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={createData.progress}
                  onChange={(e) => setCreateData({ ...createData, progress: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Assigned Date</label>
                <input
                  type="date"
                  value={createData.assignedDate}
                  onChange={(e) => setCreateData({ ...createData, assignedDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Due Date</label>
                <input
                  type="date"
                  value={createData.dueDate}
                  onChange={(e) => setCreateData({ ...createData, dueDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1">Budget</label>
                <input
                  type="number"
                  value={createData.budget}
                  onChange={(e) => setCreateData({ ...createData, budget: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2.5 rounded-lg bg-[#2563a9] text-white hover:bg-blue-700 text-xs font-semibold shadow-md"
              >
                Create Project
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-[#0b2b57]">Edit Project</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-red-500 p-1">
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
              <div>
                <label className="block mb-1">Project Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Company / Client</label>
                <input
                  type="text"
                  value={editData.company}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Location</label>
                <input
                  type="text"
                  value={editData.companylocation}
                  onChange={(e) => setEditData({ ...editData, companylocation: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Priority</label>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Hot">Hot</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Warm">Warm</option>
                  <option value="Low">Low</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.progress}
                  onChange={(e) => setEditData({ ...editData, progress: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Due Date</label>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1">Budget</label>
                <input
                  type="number"
                  value={editData.budget}
                  onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                  className="w-full border rounded-lg p-2.5 outline-none font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-lg bg-[#2563a9] text-white hover:bg-blue-700 text-xs font-semibold shadow-md"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientProjects;