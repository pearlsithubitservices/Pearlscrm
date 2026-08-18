import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Send,
  Paperclip,
  Smile,
  Mic,
  Plus,
  MoreVertical,
  X,
  Users,
  Sparkles,
  Megaphone,
  Handshake,
  Video,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useChat from "../Hooks/chat.js";
import { apiUrl } from "../config/api.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { staticEmployees } from "../Utils/staticData.js";

import { requestNotificationPermission } from "../Utils/notificationResolver.js";

const TABS = ["Chats", "Task Chats", "Collabs"];

// Options shown in the "+" dropdown
const ADD_NEW_OPTIONS = [
  {
    key: "direct",
    label: "Direct Message",
    desc: "1-on-1 chat with an employee",
    icon: User,
  },
  {
    key: "group",
    label: "Group chat",
    desc: "Group discussions",
    icon: Users,
  },
  {
    key: "collab",
    label: "Collab",
    desc: "Collaborate with outside teams and guests",
    icon: Handshake,
  },
  {
    key: "video",
    label: "Video conference",
    desc: "Host video conferences with guests",
    icon: Video,
  },
];

export default function Messenger() {
  const { user } = useAuth();
  const userId = user?.uid || user?._id || user?.email || "admin";

  const [activeTab, setActiveTab] = useState("Chats");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [search, setSearch] = useState("");

  // "+" dropdown menu
  const [showAddMenu, setShowAddMenu] = useState(false);

  // New chat / group chat picker modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatMode, setNewChatMode] = useState("group"); // "group" | "collab" | "channel"
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [groupName, setGroupName] = useState("");

  const {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    sendMessage,
    createChat,
  } = useChat(userId, activeChatId);

  // Fetch employee directory on mount to display names
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Auto-select first available chat if none is selected
  useEffect(() => {
    if (!activeChatId && chats && chats.length > 0) {
      setActiveChatId(chats[0]._id);
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find((c) => c._id === activeChatId);

  // Helper to dynamically resolve chat participant/display name
  const getChatDisplayName = (c) => {
    if (!c) return "Chat";
    if (c.isGroup || (c.chatName && c.chatType !== "direct")) {
      return c.chatName || "Group Chat";
    }

    // Find participant that isn't current user
    const otherPart = c.participants?.find((p) => {
      const pId = typeof p === "object" ? (p._id || p.id || p.uid) : p;
      return pId && pId !== userId;
    });

    if (typeof otherPart === "object" && (otherPart?.employeeName || otherPart?.name || otherPart?.email)) {
      return otherPart.employeeName || otherPart.name || otherPart.email;
    }

    const otherId = typeof otherPart === "string" ? otherPart : (otherPart?._id || otherPart?.id || otherPart?.uid);
    const foundEmp = employees.find((emp) => (emp._id || emp.id || emp.uid) === otherId);
    if (foundEmp) {
      return foundEmp.employeeName || foundEmp.name || foundEmp.email || "Employee";
    }

    return c.chatName || (otherId ? (otherId.length > 15 ? "Employee Chat" : otherId) : "Direct Chat");
  };

  const otherParticipantName = getChatDisplayName(activeChat);

  // Helper to resolve detailed participant info (Name, Role, Email)
  const getParticipantDetails = (pIdOrObj) => {
    if (typeof pIdOrObj === "object" && (pIdOrObj.employeeName || pIdOrObj.name)) {
      return {
        name: pIdOrObj.employeeName || pIdOrObj.name,
        role: pIdOrObj.role || pIdOrObj.employeeRole || "Member",
        email: pIdOrObj.email || "",
      };
    }
    const id = typeof pIdOrObj === "string" ? pIdOrObj : (pIdOrObj?._id || pIdOrObj?.id || pIdOrObj?.uid);
    if (id === userId) {
      return { name: user?.name || user?.employeeName || "You", role: user?.role || "Admin", email: user?.email || "" };
    }
    const emp = employees.find((e) => (e._id || e.id || e.uid) === id);
    if (emp) {
      return {
        name: emp.employeeName || emp.name || emp.email || "Employee",
        role: emp.role || emp.employeeRole || "Employee",
        email: emp.email || "",
      };
    }
    return { name: id ? (id.length > 15 ? "Employee" : id) : "Member", role: "Member", email: "" };
  };

  const [toast, setToast] = useState(null);

  const showToastMessage = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Listen for incoming app notifications (from any module) to display toast banner
  useEffect(() => {
    const handleAppNotif = (e) => {
      const data = e.detail;
      if (data) {
        showToastMessage(`${data.title}: ${data.body}`, "info");
      }
    };
    window.addEventListener("appNotification", handleAppNotif);
    return () => window.removeEventListener("appNotification", handleAppNotif);
  }, []);

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    showToastMessage(res.message, res.status === "granted" ? "success" : "info");
  };

  const filteredChats = chats.filter((c) => {
    if (!c) return false;
    // 1. Filter by Active Tab
    if (activeTab === "Chats") {
      if (c.isGroup || c.chatType === "collab" || c.chatType === "task" || c.chatType === "group") {
        return false;
      }
    } else if (activeTab === "Collabs") {
      if (!c.isGroup && c.chatType !== "collab" && c.chatType !== "group") {
        return false;
      }
    } else if (activeTab === "Task Chats") {
      if (c.chatType !== "task") return false;
    }

    // 2. Filter by Search Query
    const name = getChatDisplayName(c) || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Automatically switch active chat when changing tabs if current chat isn't in current tab view
  useEffect(() => {
    if (filteredChats && filteredChats.length > 0) {
      const isCurrentInFiltered = filteredChats.some((c) => c._id === activeChatId);
      if (!isCurrentInFiltered) {
        setActiveChatId(filteredChats[0]._id);
      }
    } else if (filteredChats && filteredChats.length === 0) {
      setActiveChatId(null);
    }
  }, [activeTab, filteredChats?.length]);

  // FETCH EMPLOYEES (for picking who to start a chat with)
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      let list = [];

      // 1. Try MongoDB API
      try {
        const response = await fetch(apiUrl("/employees"));
        const result = await response.json();
        const apiList = Array.isArray(result) ? result : result.data || result.employees || [];
        if (apiList && apiList.length > 0) {
          list = apiList;
        }
      } catch (err) {
        console.log("MongoDB fetch employees error:", err);
      }

      // 2. Try Firestore DB if list is empty
      if (!list || list.length === 0) {
        try {
          const snapshot = await getDocs(collection(db, "employees"));
          const fbList = snapshot.docs.map((doc) => ({
            _id: doc.id,
            id: doc.id,
            ...doc.data(),
          }));
          if (fbList && fbList.length > 0) {
            list = fbList;
          }
        } catch (err) {
          console.log("Firestore fetch employees error:", err);
        }
      }

      // 3. Fallback to static employees if list is still empty
      if (!list || list.length === 0) {
        list = staticEmployees;
      }

      setEmployees(list);
    } catch (error) {
      console.log("Error in fetchEmployees:", error);
      setEmployees(staticEmployees);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle clicking one of the "+" dropdown options
  const handleAddOptionClick = async (key) => {
    setShowAddMenu(false);

    if (key === "direct" || key === "group" || key === "collab") {
      setNewChatMode(key);
      setSelectedEmployeeIds([]);
      setGroupName("");
      fetchEmployees();
      setShowNewChatModal(true);
      return;
    }

    if (key === "video") {
      alert("Video Conference starting... WebRTC audio/video call room generated.");
      return;
    }
  };

  const toggleEmployeeSelected = (empId) => {
    if (newChatMode === "direct") {
      setSelectedEmployeeIds([empId]);
    } else {
      setSelectedEmployeeIds((prev) =>
        prev.includes(empId)
          ? prev.filter((id) => id !== empId)
          : [...prev, empId]
      );
    }
  };

  const handleCreateChat = async () => {
    if (selectedEmployeeIds.length === 0 && newChatMode !== "channel") return;

    const isGroup = newChatMode === "group" || newChatMode === "collab" || newChatMode === "channel" || (newChatMode !== "direct" && selectedEmployeeIds.length > 1);
    const chatType = newChatMode === "collab" ? "collab" : newChatMode === "channel" ? "channel" : newChatMode === "direct" ? "direct" : isGroup ? "group" : "direct";
    
    // Resolve employee name for direct chat default title
    let resolvedChatName = groupName.trim();
    if (!resolvedChatName && newChatMode === "direct" && selectedEmployeeIds.length === 1) {
      const targetEmp = employees.find((e) => (e._id || e.id || e.uid) === selectedEmployeeIds[0]);
      resolvedChatName = targetEmp ? (targetEmp.employeeName || targetEmp.name) : "Direct Chat";
    }
    if (!resolvedChatName) {
      resolvedChatName = newChatMode === "collab" ? "Collab Project" : newChatMode === "channel" ? "Announcement Channel" : "Group Chat";
    }

    const participants = Array.from(new Set([userId || "admin", ...selectedEmployeeIds]));

    const newChat = await createChat({
      participants,
      chatName: resolvedChatName,
      isGroup,
      chatType,
    });

    setShowNewChatModal(false);

    if (newChat?._id) {
      setActiveChatId(newChat._id);
      if (chatType === "collab" || chatType === "group") setActiveTab("Collabs");
      else if (chatType === "channel") setActiveTab("Channels");
      else setActiveTab("Chats");
    }
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText.trim());
    setMessageText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
    <div className="flex flex-col h-[calc(100vh-100px)] bg-[#f4f2ec] rounded-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {user?.role === 'Admin' ? 'Admin Messenger' : 'Employee Messenger'}
          </h1>
          <p className="text-sm text-gray-500">
            Manage and Connecting Client and employees
          </p>
        </div>
        <button
          onClick={handleEnableNotifications}
          title="Enable Desktop Notifications"
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition relative"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-6 pt-3 bg-white border-b border-gray-200 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium transition ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Chat list */}
        <div className="w-80 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 p-3 border-b border-gray-100">
            <div className="flex items-center flex-1 gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find employee or chat..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
            <button
              onClick={() => setShowAddMenu((s) => !s)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative"
            >
              <Plus size={18} />

              {showAddMenu && (
                <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 text-left">
                  {ADD_NEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleAddOptionClick(opt.key)}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <opt.icon size={16} className="text-blue-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto page-scroll">
            {loadingChats && (
              <p className="text-center text-sm text-gray-400 py-6">
                Loading chats...
              </p>
            )}

            {!loadingChats && filteredChats.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">
                No chats yet. Start a new conversation.
              </p>
            )}

            {filteredChats.map((chat) => {
              const displayName = getChatDisplayName(chat);

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 ${
                    activeChatId === chat._id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {displayName}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {chat.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-emerald-50 to-blue-50">
          {!activeChat && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                Select a chat to start communicating
              </p>
            </div>
          )}

          {activeChat && (
            <>
              <div className="flex items-center justify-between px-5 py-3 bg-white/70 backdrop-blur border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                    {(otherParticipantName || "Chat").charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm">
                      {otherParticipantName}
                    </p>
                    {activeChat.isGroup ? (
                      <p className="text-[11px] text-gray-400">
                        {activeChat.participants?.length || 1} members
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> 
                        Active 1-on-1 Chat
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/60 text-gray-500">
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => setShowAbout((s) => !s)}
                    className={`p-2 rounded-lg transition ${
                      showAbout ? "bg-blue-100 text-blue-600" : "hover:bg-white/60 text-gray-500"
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 page-scroll">
                {loadingMessages && (
                  <p className="text-center text-sm text-gray-400">
                    Loading messages...
                  </p>
                )}

                {messages.map((msg) => {
                  const isMine = msg.senderId?._id === userId || msg.senderId === userId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip size={18} />
                </button>
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Smile size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Mic size={18} />
                </button>
                <button
                  onClick={handleSend}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* About Chat panel */}
        {showAbout && activeChat && (
          <div className="w-80 border-l border-gray-200 bg-white p-5 flex flex-col page-scroll overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <p className="font-semibold text-gray-900 text-base">About Chat</p>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Profile Header */}
            <div className="flex flex-col items-center mb-6 text-center border-b border-gray-100 pb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold uppercase mb-3 shadow-md">
                {otherParticipantName.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                {otherParticipantName}
              </h3>
              <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                {activeChat.chatType === "collab"
                  ? "Collab Project Room"
                  : activeChat.chatType === "channel"
                  ? "Announcement Channel"
                  : activeChat.isGroup
                  ? "Group Chat Room"
                  : "Direct 1-on-1 Chat"}
              </span>
            </div>

            {/* Members Section for Group / Collab */}
            {activeChat.isGroup && (
              <div className="mb-6 border-b border-gray-100 pb-5">
                <p className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-3">
                  Chat Members ({activeChat.participants?.length || 0})
                </p>
                <div className="space-y-2.5 max-h-48 overflow-y-auto page-scroll pr-1">
                  {activeChat.participants?.map((p, idx) => {
                    const info = getParticipantDetails(p);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {info.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {info.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {info.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details & Statistics */}
            <div className="space-y-3 border-b border-gray-100 pb-5 mb-5 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Messages:</span>
                <span className="font-medium text-gray-800">{messages.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created On:</span>
                <span className="font-medium text-gray-800">
                  {activeChat.createdAt
                    ? new Date(activeChat.createdAt).toLocaleDateString()
                    : "Active"}
                </span>
              </div>
            </div>

            {/* Shared Files & Media */}
            <div className="text-sm text-gray-500">
              <p className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">
                Shared Files & Media
              </p>
              <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                No external attachments shared in this conversation yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* New Chat / Group Chat picker modal */}
    {showNewChatModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <p className="font-semibold text-gray-900">
              {newChatMode === "direct"
                ? "Start Direct Message"
                : newChatMode === "collab"
                ? "New Collab Room"
                : newChatMode === "channel"
                ? "New Channel"
                : "New Group Chat"}
            </p>
            <button onClick={() => setShowNewChatModal(false)}>
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {newChatMode !== "direct" && (
            <div className="px-5 py-3 border-b border-gray-100">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={
                  newChatMode === "collab"
                    ? "Collab / Project name (e.g. Client Portal)"
                    : newChatMode === "channel"
                    ? "Channel name (e.g. Announcements)"
                    : "Group name (e.g. Sales Team)"
                }
                className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-3 page-scroll">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {newChatMode === "direct" ? "Select Employee to Message:" : "Select Participants:"}
            </p>

            {loadingEmployees && (
              <p className="text-sm text-gray-400 text-center py-4">
                Loading employee directory...
              </p>
            )}

            {!loadingEmployees && employees.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No employees found in directory.
              </p>
            )}

            {employees
              .filter((emp) => {
                const empId = emp._id || emp.id || emp.uid;
                return !userId || empId !== userId;
              })
              .map((emp) => {
                const empId = emp._id || emp.id || emp.uid;
                const empName = emp.employeeName || emp.name || emp.email || "Employee";
                const empSub = emp.role || emp.employeeRole || emp.email || "Employee";
                const isSelected = selectedEmployeeIds.includes(empId);

                return (
                  <div
                    key={empId}
                    onClick={() => toggleEmployeeSelected(empId)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition mb-1 border ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <input
                      type={newChatMode === "direct" ? "radio" : "checkbox"}
                      name="chat_employee_select"
                      checked={isSelected}
                      onChange={() => toggleEmployeeSelected(empId)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {empName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {empName}
                      </span>
                      {empSub && (
                        <span className="text-xs text-gray-400 truncate">
                          {empSub}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
            <button
              onClick={() => setShowNewChatModal(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChat}
              disabled={selectedEmployeeIds.length === 0}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {newChatMode === "direct" ? "Start 1-on-1 Chat" : "Create Chat"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Toast Notification Banner */}
    {toast && (
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 transition-all duration-300">
        <div
          className={`p-2 rounded-full ${
            toast.type === "error"
              ? "bg-red-500/20 text-red-400"
              : toast.type === "info"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          <Bell size={18} />
        </div>
        <div className="flex-1 pr-2 min-w-[200px]">
          <p className="text-xs font-semibold text-gray-200">System Notification</p>
          <p className="text-xs text-gray-300 mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <X size={14} />
        </button>
      </div>
    )}
    </>
  );
}