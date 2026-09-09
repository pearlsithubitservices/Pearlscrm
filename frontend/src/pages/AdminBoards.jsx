import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Upload,
  Trash2,
  X,
  Download,
  FileText,
  Users,
  Eye,
  Edit,
  Archive,
  AlertCircle,
  Loader,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api.js";

export default function AdminBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBoardDetail, setShowBoardDetail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    boardName: "",
    description: "",
    boardCategory: "general",
    isPublic: false,
    assignedTo: [],
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Fetch boards
  useEffect(() => {
    fetchBoards();
  }, []);

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
          assignedTo: [],
        });
        setSelectedEmployees([]);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;

    try {
      const response = await fetch(apiUrl(`/boards/${boardId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setBoards(boards.filter((b) => b._id !== boardId));
        setShowBoardDetail(false);
        setSelectedBoard(null);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBoard) return;

    try {
      setUploadingFile(true);
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      formDataFile.append("uploadedBy", user?._id);
      formDataFile.append("uploadedByName", user?.name || "Admin");

      const response = await fetch(apiUrl(`/boards/${selectedBoard._id}/upload`), {
        method: "POST",
        body: formDataFile,
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBoards = boards.map((b) =>
          b._id === selectedBoard._id ? data.data : b
        );
        setBoards(updatedBoards);
        setSelectedBoard(data.data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(
        apiUrl(`/boards/${selectedBoard._id}/file/${fileId}`),
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedBoards = boards.map((b) =>
          b._id === selectedBoard._id ? data.data : b
        );
        setBoards(updatedBoards);
        setSelectedBoard(data.data);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const filteredBoards = boards.filter(
    (board) =>
      board.boardName.toLowerCase().includes(search.toLowerCase()) ||
      board.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const iconClass = "w-5 h-5";
    switch (fileType) {
      case "spreadsheet":
        return "📊";
      case "presentation":
        return "📈";
      case "image":
        return "🖼️";
      case "pdf":
        return "📄";
      default:
        return "📋";
    }
  };

  if (loading && boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Boards</h1>
            <p className="text-gray-600 mt-2">Manage sprint planning and project boards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Board
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Boards Grid */}
        {filteredBoards.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No boards found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <motion.div
                key={board._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => {
                  setSelectedBoard(board);
                  setShowBoardDetail(true);
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {board.boardName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {board.boardCategory}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {board.isPublic && (
                        <Eye className="w-4 h-4 text-green-600" title="Public" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {board.description || "No description"}
                  </p>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{board.files?.length || 0} files</span>
                      </div>
                      {board.assignedTo?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {board.assignedTo.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Board Detail Modal */}
        <AnimatePresence>
          {showBoardDetail && selectedBoard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowBoardDetail(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedBoard.boardName}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedBoard.description}</p>
                  </div>
                  <button
                    onClick={() => setShowBoardDetail(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Files</h3>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingFile ? "Uploading..." : "Upload"}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {selectedBoard.files && selectedBoard.files.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBoard.files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-lg">
                                {getFileIcon(file.fileType)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {file.fileName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.fileSize)} • Uploaded by{" "}
                                  {file.uploadedByName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={file.filePath}
                                download
                                className="p-2 hover:bg-white rounded-lg transition"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-600" />
                              </a>
                              <button
                                onClick={() => handleDeleteFile(file._id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No files uploaded yet</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                      onClick={() => handleDeleteBoard(selectedBoard._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Board
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                          <span className="text-sm text-gray-700">
                            Make Public (visible to all employees)
                          </span>
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
