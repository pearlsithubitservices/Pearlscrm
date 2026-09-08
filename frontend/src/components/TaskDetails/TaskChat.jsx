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
  MoreVertical
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

  // File select handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!messageText.trim() && !selectedFile) return;

    const attachments = [];
    if (selectedFile) {
      attachments.push({
        name: selectedFile.name,
        type: selectedFile.type,
        data: filePreview || null,
      });
    }

    const textToSend = messageText.trim();
    setMessageText("");
    clearFile();

    await sendMessage(textToSend, attachments);
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
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                isMine ? "bg-blue-700/60" : "bg-gray-100"
                              }`}
                            >
                              {att.data ? (
                                <img
                                  src={att.data}
                                  alt="Attachment"
                                  className="w-32 h-32 object-cover rounded-md"
                                />
                              ) : (
                                <>
                                  <FileText size={16} />
                                  <span className="truncate">{att.name || "Attachment"}</span>
                                </>
                              )}
                            </div>
                          ))}
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
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-800">
          <div className="flex items-center gap-2 truncate">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-8 h-8 object-cover rounded" />
            ) : (
              <FileText size={16} className="text-blue-600" />
            )}
            <span className="truncate font-medium">{selectedFile.name}</span>
          </div>
          <button onClick={clearFile} className="p-1 text-blue-500 hover:text-blue-700">
            <X size={14} />
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
    </div>
  );
}
