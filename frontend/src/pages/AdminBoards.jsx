import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  X,
  FileText,
  Loader,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api.js";

export default function AdminBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    boardName: "",
    description: "",
    boardCategory: "general",
    isPublic: false,
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedBoardForUpload, setSelectedBoardForUpload] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(null);

  // Fetch boards
  useEffect(() => {
    fetchBoards();
  }, [user]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(apiUrl("/employees"));
        if (response.ok) {
          const data = await response.json();
          setEmployees(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/boards?role=admin&userId=${user?._id || ""}`));
      if (response.ok) {
        const data = await response.json();
        setBoards(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedBoardForUpload(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl("/boards"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdBy: user?._id,
          createdByName: user?.name || "Admin",
          assignedTo: selectedEmployees,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBoards([...boards, data.data]);
        setShowCreateModal(false);
        setFormData({
          boardName: "",
          description: "",
          boardCategory: "general",
          isPublic: false,
        });
        setSelectedEmployees([]);
        if (!selectedBoardForUpload) {
          setSelectedBoardForUpload(data.data._id);
        }
      }
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Error creating board");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;

    try {
      const response = await fetch(apiUrl(`/boards/${boardId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedBoards = boards.filter((b) => b._id !== boardId);
        setBoards(updatedBoards);
        if (selectedBoardForUpload === boardId && updatedBoards.length > 0) {
          setSelectedBoardForUpload(updatedBoards[0]._id);
        } else if (updatedBoards.length === 0) {
          setSelectedBoardForUpload(null);
        }
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Error deleting board");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const boardId = selectedBoardForUpload || (boards.length > 0 ? boards[0]._id : null);
    if (!boardId) {
      alert("Please create a board first");
      return;
    }

    try {
      setUploadingFile(true);
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      formDataFile.append("uploadedBy", user?._id);
      formDataFile.append("uploadedByName", user?.name || "Admin");

      const response = await fetch(apiUrl(`/boards/${boardId}/upload`), {
        method: "POST",
        body: formDataFile,
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBoards = boards.map((b) =>
          b._id === boardId ? data.data : b
        );
        setBoards(updatedBoards);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setUploadingFile(false);
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId, boardId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(apiUrl(`/boards/${boardId}/file/${fileId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBoards = boards.map((b) =>
          b._id === boardId ? data.data : b
        );
        setBoards(updatedBoards);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";

    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateModified = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  // Collect all files from all boards
  const allFiles = boards.flatMap((board) =>
    (board.files || []).map((file) => ({
      ...file,
      boardId: board._id,
      boardName: board.boardName,
    }))
  );

  const filteredFiles = allFiles.filter(
    (file) =>
      file.fileName.toLowerCase().includes(search.toLowerCase()) ||
      file.boardName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedBoardForUpload || uploadingFile}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm"
            >
              <Plus className="w-4 h-4" />
              {uploadingFile ? "Creating..." : "Create"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700 text-sm"
            >
              + New Board
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 text-gray-600 text-sm">
            <Trash2 className="w-4 h-4" />
            Recycle Bin
          </button>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-sm font-semibold text-gray-700">My Board files</h2>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">
                {boards.length === 0 ? "No boards created yet" : "No files uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      File size
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      Created on
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      modified on
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatTime(file.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDateModified(file.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setShowFileMenu(
                                showFileMenu === file._id ? null : file._id
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {showFileMenu === file._id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <a
                                href={file.filePath}
                                download={file.fileName}
                                className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm"
                              >
                                Download
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file._id, file.boardId);
                                  setShowFileMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info message */}
          <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
            Files deleted to the Recycle Bin are kept for 30 days
          </div>
        </div>

        {/* Create Board Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Create Board</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateBoard} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Board Name *
                      </label>
                      <input
                        type="text"
                        value={formData.boardName}
                        onChange={(e) =>
                          setFormData({ ...formData, boardName: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="e.g., Sprint Planning"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Describe this board..."
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={formData.boardCategory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              boardCategory: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="general">General</option>
                          <option value="sprint">Sprint</option>
                          <option value="project">Project</option>
                          <option value="planning">Planning</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isPublic: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-700">Make Public</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Employees
                      </label>
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {employees.length === 0 ? (
                          <p className="text-gray-500">No employees available</p>
                        ) : (
                          <div className="space-y-2">
                            {employees.map((emp) => (
                              <label
                                key={emp._id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.some(
                                    (e) => e.userId === emp._id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedEmployees([
                                        ...selectedEmployees,
                                        {
                                          userId: emp._id,
                                          userName: emp.name,
                                          role: "viewer",
                                        },
                                      ]);
                                    } else {
                                      setSelectedEmployees(
                                        selectedEmployees.filter(
                                          (se) => se.userId !== emp._id
                                        )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm">{emp.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Board
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
