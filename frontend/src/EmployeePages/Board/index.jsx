import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  FileText,
  Loader,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { apiUrl } from "../../config/api.js";

export default function EmployeeBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showBoardDetail, setShowBoardDetail] = useState(false);

  // Fetch boards
  useEffect(() => {
    fetchBoards();
  }, [user]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        apiUrl(`/boards?role=employee&userId=${user?._id || ""}`)
      );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Project Boards</h1>
          <p className="text-gray-600 mt-2">
            View and download files from project boards
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 mb-8">
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
            <p className="text-gray-600">
              {boards.length === 0
                ? "No boards available yet"
                : "No boards match your search"}
            </p>
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
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {board.boardName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 capitalize">
                        {board.boardCategory}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {board.isPublic ? (
                        <Eye className="w-4 h-4 text-green-600" title="Public" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" title="Private" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {board.description || "No description"}
                  </p>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{board.files?.length || 0} files</span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <p>Created by: {board.createdByName || "Admin"}</p>
                    <p>Updated: {formatDate(board.updatedAt)}</p>
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
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b sticky top-0 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedBoard.boardName}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {selectedBoard.description || "No description provided"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Created by:</span>{" "}
                          {selectedBoard.createdByName || "Admin"}
                        </div>
                        <div>
                          <span className="font-semibold">Category:</span>{" "}
                          <span className="capitalize">{selectedBoard.boardCategory}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Created:</span>{" "}
                          {formatDate(selectedBoard.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Files ({selectedBoard.files?.length || 0})
                    </h3>

                    {selectedBoard.files && selectedBoard.files.length > 0 ? (
                      <div className="space-y-3">
                        {selectedBoard.files.map((file) => (
                          <motion.div
                            key={file._id}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">
                                {getFileIcon(file.fileType)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {file.fileName}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {formatFileSize(file.fileSize)} • Uploaded by{" "}
                                  {file.uploadedByName}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(file.createdAt)}
                                </p>
                              </div>
                            </div>
                            <a
                              href={file.filePath}
                              download={file.fileName}
                              className="ml-4 p-2 hover:bg-white rounded-lg transition flex-shrink-0"
                              title="Download file"
                            >
                              <Download className="w-5 h-5 text-blue-600 hover:text-blue-700" />
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No files in this board yet</p>
                      </div>
                    )}
                  </div>

                  {selectedBoard.assignedTo && selectedBoard.assignedTo.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Board Members
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBoard.assignedTo.map((member) => (
                          <div
                            key={member.userId}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {member.userName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t bg-gray-50 sticky bottom-0">
                  <button
                    onClick={() => setShowBoardDetail(false)}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
