import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MessageSquare,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Check,
  MoreVertical,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useChat from "../../Hooks/chat";

export default function TaskChat({ task, taskId: propTaskId, taskTitle: propTaskTitle }) {
  const { user } = useAuth();
  const currentUserId = user?.uid || user?._id || user?.email || "admin";
  const currentUserName = user?.name || user?.employeeName || (user?.role === "Admin" ? "Admin" : "Employee");

  const taskId = propTaskId || task?.id || task?._id || "task_general";
  const taskTitle = propTaskTitle || task?.title || task?.taskName || `Task #${taskId}`;

  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  // Edit Message state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    messages,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteChat,
    getOrCreateTaskChat,
  } = useChat(currentUserId, activeChat?._id);

  // Initialize or fetch the task chat room
  useEffect(() => {
    let isMounted = true;
    async function initTaskChat() {
      if (!taskId) return;
      const chat = await getOrCreateTaskChat(taskId, taskTitle);
      if (isMounted && chat) {
        setActiveChat(chat);
      }
    }
    initTaskChat();
    return () => {
      isMounted = false;
    };
  }, [taskId, taskTitle]);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // File select handler for all file types (images, pdf, doc, etc.)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!messageText.trim() && !selectedFile) return;

    let attachments = [];
    if (selectedFile) {
      let dataUrl = filePreview;
      if (!dataUrl) {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(selectedFile);
        });
      }

      attachments.push({
        name: selectedFile.name,
        size: selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "",
        type: selectedFile.type,
        data: dataUrl,
        url: dataUrl,
      });
    }

    const textToSend = messageText.trim();
    setMessageText("");
    clearFile();

    await sendMessage(textToSend, attachments);
  };

  const handleOpenImage = (dataUrl, name) => {
    if (!dataUrl) return;
    setActiveImagePreview({ url: dataUrl, name: name || "Image Attachment" });
  };

  const handleDownloadFile = (dataUrl, name) => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = (dataUrl) => {
    if (!dataUrl) return;
    if (dataUrl.startsWith("data:")) {
      try {
        const parts = dataUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        return;
      } catch (e) {
        console.error("Blob open error:", e);
      }
    }
    window.open(dataUrl, "_blank");
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || "");
  };

  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    await editMessage(msgId, editText);
    setEditingMessageId(null);
    setEditText("");
  };

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(msgId);
    }
  };

  const handleDeleteChat = async () => {
    if (activeChat?._id && window.confirm("Are you sure you want to delete this entire chat room?")) {
      await deleteChat(activeChat._id);
      setActiveChat(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/30 rounded-lg backdrop-blur-sm border border-blue-400/30">
            <MessageSquare size={18} className="text-blue-300" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide flex items-center gap-2">
              Task Collaboration Chat
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Live Sync
              </span>
            </h3>
            <p className="text-xs text-blue-200/80 truncate max-w-xs md:max-w-md">
              {taskTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task?.status && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
              {task.status}
            </span>
          )}
          {activeChat && (
            <button
              onClick={handleDeleteChat}
              title="Delete Entire Chat Room"
              className="p-1.5 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/40 transition border border-red-500/30"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 bg-[#f8fafc]">
        {loadingMessages && (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">
            Loading task chat messages...
          </div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-medium text-gray-600">No task messages yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Start discussing task progress, asking questions, or sharing updates with your team.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine =
            msg.senderId?._id === currentUserId ||
            msg.senderId === currentUserId ||
            msg.senderId === user?.email;

          const senderName =
            typeof msg.senderId === "object"
              ? msg.senderId?.name || msg.senderId?.employeeName || "User"
              : msg.senderId === currentUserId
              ? currentUserName
              : typeof msg.senderId === "string" && msg.senderId.includes("@")
              ? msg.senderId.split("@")[0].charAt(0).toUpperCase() + msg.senderId.split("@")[0].slice(1)
              : "Employee";

          const isEditingThis = editingMessageId === msg._id;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"} group`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-gray-600">
                  {isMine ? "You" : senderName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.isEdited && (
                  <span className="text-[9px] text-blue-500 font-medium">(edited)</span>
                )}
              </div>

              <div className="flex items-center gap-1 max-w-md relative">
                {/* Actions for sender */}
                {isMine && !isEditingThis && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0">
                    <button
                      onClick={() => handleStartEdit(msg)}
                      title="Edit Message"
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-200 rounded transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      title="Delete Message"
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-200 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-tr-xs"
                      : "bg-white text-gray-800 rounded-tl-xs border border-gray-100"
                  }`}
                >
                  {isEditingThis ? (
                    <div className="flex items-center gap-1 min-w-[200px]">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 text-sm bg-blue-700 text-white px-2 py-1 rounded outline-none border border-blue-400"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(msg._id)}
                        className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : msg.text && msg.text.startsWith("TASK_CARD:") ? (
                    (() => {
                      let card = {};
                      try {
                        card = JSON.parse(msg.text.replace("TASK_CARD:", ""));
                      } catch (e) {
                        card = { title: "Task", status: "Pending", createdBy: "Admin", assignee: "Member", deadline: "-", description: msg.text };
                      }
                      return (
                        <div className="w-80 sm:w-96 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden my-1 text-left font-sans text-gray-900">
                          {/* Card Header Title */}
                          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-base tracking-tight">
                              {card.title || "Task"}
                            </h3>
                          </div>

                          {/* Card Details Body */}
                          <div className="px-5 py-3.5 space-y-2 text-xs text-gray-700">
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-semibold text-gray-900">Status :</span>
                              <span className="col-span-2 font-medium text-gray-600">{card.status || "Pending"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-semibold text-gray-900">Created by :</span>
                              <span className="col-span-2 font-medium text-gray-600">{card.createdBy || "Admin"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-semibold text-gray-900">Assignee :</span>
                              <span className="col-span-2 font-medium text-gray-600">{card.assignee || "Jennie"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-semibold text-gray-900">Deadline :</span>
                              <span className="col-span-2 font-medium text-gray-600">{card.deadline || "7/13/2026 7:00 pm"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-start">
                              <span className="font-semibold text-gray-900">Description :</span>
                              <span className="col-span-2 font-medium text-gray-600 leading-relaxed">{card.description || "-"}</span>
                            </div>
                          </div>

                          {/* Card Footer Time */}
                          <div className="px-5 pb-3.5 flex justify-end">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <>
                      {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((att, idx) => {
                            const rawUrl = typeof att === "string" ? att : (att?.data || att?.url);
                            let attName = typeof att === "string" ? "" : att?.name;
                            const attType = typeof att === "string" ? "" : att?.type;
                            const attSize = typeof att === "string" ? "" : att?.size;

                            if (!attName || attName === "Attachment") {
                              if (rawUrl && typeof rawUrl === "string" && !rawUrl.startsWith("data:")) {
                                const parts = rawUrl.split("/");
                                attName = decodeURIComponent(parts[parts.length - 1] || "File");
                              }
                            }
                            if (!attName) attName = "File Attachment";

                            const ext = attName.includes(".") ? attName.split(".").pop().toLowerCase() : "";
                            const isImg =
                              attType?.startsWith("image/") ||
                              (rawUrl && rawUrl.startsWith("data:image/")) ||
                              /\.(jpg|jpeg|png|gif|webp)$/i.test(attName);

                            return isImg && rawUrl ? (
                              <div
                                key={idx}
                                className="relative group/img rounded-xl overflow-hidden border border-white/20 max-w-xs cursor-pointer shadow-xs mt-1 bg-black/5"
                                onClick={() => handleOpenImage(rawUrl, attName)}
                              >
                                <img
                                  src={rawUrl}
                                  alt={attName}
                                  className="max-h-56 w-full object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenImage(rawUrl, attName);
                                    }}
                                    className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition cursor-pointer shadow-md"
                                    title="Preview Image"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadFile(rawUrl, attName);
                                    }}
                                    className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition cursor-pointer shadow-md"
                                    title="Download Image"
                                  >
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <a
                                key={idx}
                                href={rawUrl || "#"}
                                download={attName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs max-w-xs ${
                                  isMine
                                    ? "bg-blue-700/70 border-blue-500/40 text-white hover:bg-blue-700"
                                    : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${isMine ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>
                                  <FileText size={16} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="truncate font-semibold text-xs leading-tight">{attName}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 opacity-80 text-[10px]">
                                    {ext && <span className="uppercase font-extrabold px-1 py-0.2 rounded bg-black/10 text-[9px]">{ext}</span>}
                                    {attSize && <span>{attSize}</span>}
                                  </div>
                                </div>
                                <div className={`p-1.5 rounded-lg shrink-0 ${isMine ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-200/80 text-gray-700 hover:bg-gray-200"}`}>
                                  <Download size={13} />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Banner */}
      {selectedFile && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-t border-blue-100 text-xs text-blue-900 shadow-inner">
          <div className="flex items-center gap-2.5 truncate">
            {selectedFile.type?.startsWith("image/") && filePreview ? (
              <img src={filePreview} alt="Preview" className="w-9 h-9 object-cover rounded-lg shadow-xs" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-200/70 text-blue-700 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
            )}
            <div className="truncate">
              <span className="truncate font-bold block text-xs">{selectedFile.name}</span>
              <span className="text-[10px] text-blue-600 font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
              </span>
            </div>
          </div>
          <button onClick={clearFile} className="p-1.5 text-blue-500 hover:text-red-600 hover:bg-blue-100 rounded-lg transition cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-2 p-3 bg-white border-t border-gray-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach File / Image"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <Paperclip size={18} />
        </button>

        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type task message or update..."
          className="flex-1 bg-gray-100 hover:bg-gray-100/80 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-blue-500 transition"
        />

        <button
          onClick={handleSend}
          disabled={!messageText.trim() && !selectedFile}
          className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm shrink-0"
        >
          <Send size={16} />
        </button>
      </div>

      {/* FULL SCREEN IMAGE LIGHTBOX MODAL */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveImagePreview(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white py-2 px-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 truncate">
              <ImageIcon size={18} className="text-blue-400 shrink-0" />
              <span className="font-semibold text-sm truncate">
                {activeImagePreview.name || "Image Preview"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenInNewTab(activeImagePreview.url)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Open in new tab"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">New Tab</span>
              </button>
              <button
                onClick={() => handleDownloadFile(activeImagePreview.url, activeImagePreview.name)}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Download"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setActiveImagePreview(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-600/80 text-white transition cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div
            className="flex-1 flex items-center justify-center p-2 w-full max-w-5xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImagePreview.url}
              alt={activeImagePreview.name || "Preview"}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
            />
          </div>

          {/* Bottom Caption */}
          <div
            className="text-xs text-gray-300 font-medium py-1 px-4 bg-white/10 rounded-full backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            Click anywhere outside or press X to close
          </div>
        </div>
      )}
    </div>
  );
}
