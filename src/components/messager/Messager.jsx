import React, { useState, useEffect, useRef } from "react";
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
  User,
  Users,
  MessageSquare,
  Handshake,
  UserPlus,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCheck,
  Star,
  ChevronRight,
  Clock,
  Camera,
  Lock,
  FileText,
  Download,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useChat from "../../Hooks/chat.js";
import useEmployees from "../../Hooks/useEmployees";
import { apiUrl } from "../../config/api.js";
import CollabCreateView from "./CollabCreateView";
import AccessPermissionsModal from "./AccessPermissionsModal";

const TABS = ["Chats", "Task Chats", "Collabs"];

export default function Messenger() {
  const { user } = useAuth();
  const userDisplayName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : null);

  const userEmail = user?.email || "";
  const userDbId = user?._id || user?.id || user?.uid || "";

  const userId = userDbId || userEmail || userDisplayName || "admin";
  const { employees: hookEmployees } = useEmployees();

  const [activeTab, setActiveTab] = useState("Chats");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [showTaskHistoryModal, setShowTaskHistoryModal] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [search, setSearch] = useState("");

  // Collab Creation & Access Permissions UI states (Matching User Images 1 & 2)
  const [isCreatingCollab, setIsCreatingCollab] = useState(false);
  const [collabDescriptionInput, setCollabDescriptionInput] = useState("");
  const [showAccessPermissions, setShowAccessPermissions] = useState(false);

  // Access Permissions Settings (Matching User Image 1)
  const [collabOwner, setCollabOwner] = useState(userDisplayName || "Vishnu");
  const [collabHistoryNewMembers, setCollabHistoryNewMembers] = useState("yes");
  const [collabUsersInvite, setCollabUsersInvite] = useState("All members");
  const [collabAllowGuests, setCollabAllowGuests] = useState("yes");
  const [collabUsersPost, setCollabUsersPost] = useState("All members");
  const [collabUsersViewTasks, setCollabUsersViewTasks] = useState("All members");

  // File Attachment & Sending States & Handlers
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        const isImage = file.type.startsWith("image/");
        const newAttachment = {
          id: "att_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type,
          isImage,
          url: base64Url,
          fileObj: file,
        };

        setSelectedFiles((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveAttachment = (id) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Delayed reveal for Delete & History details in About Chat panel
  useEffect(() => {
    if (showAbout) {
      const timer = setTimeout(() => {
        setActionsVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setActionsVisible(false);
    }
  }, [showAbout]);

  // Plus Dropdown Menu State
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef(null);

  // Modal States for Chat Creation
  const [activeModal, setActiveModal] = useState(null); // 'direct' | 'group' | 'task' | 'collab' | 'add_member' | 'confirm_delete_chat'

  // Dynamic Data lists fetched from DB
  const [employeeList, setEmployeeList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Sync hook employees into employeeList
  useEffect(() => {
    if (hookEmployees && hookEmployees.length > 0) {
      setEmployeeList((prev) => {
        const map = new Map();
        prev.forEach((item) => {
          if (item) map.set(String(item._id || item.id || item.email).toLowerCase(), item);
        });
        hookEmployees.forEach((item) => {
          if (item) map.set(String(item.id || item._id || item.uid || item.email).toLowerCase(), item);
        });
        return Array.from(map.values());
      });
    }
  }, [hookEmployees]);

  // Message Editing State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Form Inputs for Modals
  const [groupNameInput, setGroupNameInput] = useState("");
  const [collabNameInput, setCollabNameInput] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [modalSearch, setModalSearch] = useState("");

  const {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    unreadCounts,
    inAppToast,
    dismissToast,
    sendMessage,
    editMessage,
    deleteMessage,
    createChat,
    deleteChat,
    getOrCreateTaskChat,
    addParticipantToChat,
  } = useChat(userId, activeChatId);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of message list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-dismiss in-app toast banner after 5 seconds
  useEffect(() => {
    if (inAppToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [inAppToast, dismissToast]);

  // Dynamic Fetch employees & users from Backend API & Firestore DB
  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingModalData(true);
      const combined = [];
      const seenKeys = new Set();

      // 1. Fetch from Backend API `/employees`
      try {
        const res = await fetch(apiUrl("/employees"));
        if (res.ok) {
          const data = await res.json();
          const apiList = Array.isArray(data) ? data : data.data || data.employees || [];
          apiList.forEach((emp) => {
            const key = String(emp.email || emp._id || emp.id || emp.uid || "").toLowerCase();
            if (key && !seenKeys.has(key)) {
              combined.push(emp);
              seenKeys.add(key);
            }
          });
        }
      } catch (e) {
        console.log("API employees fetch error:", e);
      }

      // 2. Fetch from Backend API `/auth/users`
      try {
        const resUsers = await fetch(apiUrl("/auth/users"));
        if (resUsers.ok) {
          const userData = await resUsers.json();
          const rawUsers = Array.isArray(userData) ? userData : (userData?.data || []);
          rawUsers.forEach((u) => {
            const key = String(u.email || u._id || u.id || "").toLowerCase();
            if (key && !seenKeys.has(key)) {
              combined.push(u);
              seenKeys.add(key);
            }
          });
        }
      } catch (e) {
        console.log("API users fetch error:", e);
      }

      setEmployeeList(combined);
    } catch (err) {
      console.error("Error fetching dynamic employees:", err);
    } finally {
      setLoadingModalData(false);
    }
  };

  const fetchTasks = async () => {
    try {
      let list = [];
      try {
        const res = await fetch(apiUrl("/tasks"));
        if (res.ok) {
          const data = await res.json();
          const apiTasks = Array.isArray(data) ? data : data.data || [];
          if (apiTasks && apiTasks.length > 0) list = apiTasks;
        }
      } catch (e) {
        console.log("API tasks fetch error:", e);
      }
      setTaskList(list);
    } catch (err) {
      console.error("Error fetching dynamic tasks:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChat = chats.find((c) => c._id === activeChatId);

  // Helper to resolve employee NAME dynamically (NEVER MASK REAL USERNAMES LIKE employee21)
  const getEmployeeName = (empId) => {
    if (!empId) return "User";

    if (typeof empId === "object") {
      const nameInObj = empId.employeeName || empId.name || empId.displayName || empId.username || empId.employeeId;
      if (nameInObj && nameInObj.trim()) return nameInObj.trim();
    }

    const empStr = typeof empId === "object"
      ? (empId._id || empId.id || empId.uid || empId.email || empId.employeeId)
      : empId;

    if (!empStr) return "User";

    if (empStr === userId || empStr === user?.email || empStr === user?.uid) {
      return user?.displayName || user?.name || user?.employeeName || (user?.email ? user.email.split("@")[0] : "Me");
    }

    if (empStr === "admin" || String(empStr).toLowerCase() === "admin") return "Admin";

    const targetStr = String(empStr).toLowerCase();

    const found = employeeList.find((e) => {
      if (!e) return false;
      const eId = String(e._id || e.id || e.uid || e.employeeId || "").toLowerCase();
      const eEmail = String(e.email || "").toLowerCase();
      const eName = String(e.employeeName || e.name || e.displayName || e.username || "").toLowerCase();

      return (
        (eId && eId === targetStr) ||
        (eEmail && eEmail === targetStr) ||
        (eName && eName === targetStr) ||
        (eEmail && targetStr.includes(eEmail)) ||
        (eEmail && eEmail.includes(targetStr))
      );
    });

    if (found) {
      const nameVal = found.employeeName || found.name || found.displayName || found.username || found.employeeId;
      if (nameVal && nameVal.trim()) return nameVal.trim();

      if (found.email) {
        const prefix = found.email.split("@")[0];
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }

    if (typeof empStr === "string" && empStr.includes("@")) {
      const prefix = empStr.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    // Return custom username strings like "employee21" directly!
    // ONLY mask 24-character hexadecimal MongoDB ObjectIDs
    if (typeof empStr === "string") {
      const isMongoHexId = /^[0-9a-fA-F]{24}$/.test(empStr);
      if (!isMongoHexId) {
        return empStr;
      }
    }

    return "User";
  };

  const otherParticipant =
    activeChat?.participants?.find((p) => {
      const pStr = typeof p === "object" ? (p._id || p.id || p.uid || p.email || p.name) : String(p);
      const lowerP = String(pStr).toLowerCase();
      const lowerUser = String(userId).toLowerCase();
      const lowerEmail = String(user?.email || "").toLowerCase();
      const lowerId = String(user?._id || user?.id || "").toLowerCase();
      const lowerName = String(userDisplayName || "").toLowerCase();

      return (
        lowerP !== lowerUser &&
        lowerP !== lowerEmail &&
        lowerP !== lowerId &&
        lowerP !== lowerName
      );
    }) || activeChat?.participants?.[0];

  // Filter chats by tab and search
  const filteredChats = chats.filter((c) => {
    if (activeTab === "Chats") {
      if (c.chatType === "task" || c.chatType === "collab" || c.taskId) return false;
    } else if (activeTab === "Task Chats") {
      if (c.chatType !== "task" && !c.taskId) return false;
    } else if (activeTab === "Collabs") {
      if (c.chatType !== "collab") return false;
    }

    const otherEmp = c.participants?.find((p) => {
      const pStr = typeof p === "object" ? (p._id || p.id || p.uid || p.email || p.name) : String(p);
      const lowerP = String(pStr).toLowerCase();
      const lowerUser = String(userId).toLowerCase();
      const lowerEmail = String(user?.email || "").toLowerCase();
      const lowerId = String(user?._id || user?.id || "").toLowerCase();
      const lowerName = String(userDisplayName || "").toLowerCase();

      return (
        lowerP !== lowerUser &&
        lowerP !== lowerEmail &&
        lowerP !== lowerId &&
        lowerP !== lowerName
      );
    }) || c.participants?.[0];

    const name = c.isGroup ? c.chatName : getEmployeeName(otherEmp);
    return (name || "").toLowerCase().includes(search.toLowerCase());
  });

  // Auto-select first room when tab changes or current room is not in current view
  useEffect(() => {
    if (filteredChats && filteredChats.length > 0) {
      const exists = filteredChats.some((c) => c._id === activeChatId);
      if (!exists) {
        setActiveChatId(filteredChats[0]._id);
      }
    } else {
      setActiveChatId(null);
    }
  }, [activeTab, filteredChats.length]);

  const handleSend = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    const textToSend = messageText.trim();
    const filesToUpload = [...selectedFiles];

    setMessageText("");
    setSelectedFiles([]);

    let attachmentsToSend = [];

    // 1. Upload raw files to backend Multer + Cloudinary endpoint FIRST
    const rawFiles = filesToUpload.filter((f) => f.fileObj);
    if (rawFiles.length > 0) {
      try {
        const formData = new FormData();
        rawFiles.forEach((f) => formData.append("files", f.fileObj));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const uploadRes = await fetch(apiUrl("/messages/upload"), {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const uploadResult = await uploadRes.json();
        if (uploadResult.success && Array.isArray(uploadResult.data) && uploadResult.data.length > 0) {
          attachmentsToSend = uploadResult.data;
        }
      } catch (err) {
        console.log("Cloudinary upload fallback:", err);
      }
    }

    // Fallback to local Data URLs if Cloudinary upload failed/timed out
    if (attachmentsToSend.length === 0 && filesToUpload.length > 0) {
      attachmentsToSend = filesToUpload.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
      }));
    }

    // 2. Call sendMessage EXACTLY ONCE!
    await sendMessage(textToSend, attachmentsToSend);
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    await editMessage(msgId, editingText.trim());
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDeleteChatRoom = async () => {
    if (!activeChatId) return;
    await deleteChat(activeChatId);
    setActiveChatId(null);
    setActiveModal(null);
    setShowAbout(false);
  };

  const handleStartDirectChat = async (targetEmp) => {
    const participantKeys = Array.from(
      new Set(
        [
          userId,
          user?.email,
          targetEmp._id,
          targetEmp.id,
          targetEmp.uid,
          targetEmp.email,
        ].filter(Boolean)
      )
    );
    const targetEmpName = targetEmp.employeeName || targetEmp.name || targetEmp.email || "Employee";

    try {
      const newChat = await createChat({
        participants: participantKeys,
        chatName: targetEmpName,
        isGroup: false,
        chatType: "direct",
      });

      if (newChat?._id) {
        setActiveChatId(newChat._id);
        setActiveTab("Chats");
      }
      setActiveModal(null);
      setModalSearch("");
    } catch (err) {
      console.error("Error creating direct chat:", err);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupNameInput.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (selectedEmpIds.length === 0) {
      alert("Please select at least one team member");
      return;
    }
    try {
      const newChat = await createChat({
        participants: [userId, ...selectedEmpIds],
        chatName: groupNameInput.trim(),
        isGroup: true,
        chatType: "group",
      });
      if (newChat?._id) {
        setActiveChatId(newChat._id);
        setActiveTab("Chats");
      }
      setGroupNameInput("");
      setSelectedEmpIds([]);
      setActiveModal(null);
    } catch (err) {
      console.error("Error creating group chat:", err);
    }
  };

  const handleSelectTaskChat = async (task) => {
    try {
      const chat = await getOrCreateTaskChat(task._id || task.id, task.title || task.taskName);
      if (chat?._id) {
        setActiveChatId(chat._id);
        setActiveTab("Task Chats");
      }
      setActiveModal(null);
    } catch (err) {
      console.error("Error creating task chat:", err);
    }
  };

  const handleCreateCollab = async () => {
    if (!collabNameInput.trim()) {
      alert("Please enter a collab room name");
      return;
    }
    try {
      const newChat = await createChat({
        participants: [userId, ...selectedEmpIds],
        chatName: collabNameInput.trim(),
        isGroup: true,
        chatType: "collab",
      });
      if (newChat?._id) {
        setActiveChatId(newChat._id);
        setActiveTab("Collabs");
      }
      setCollabNameInput("");
      setSelectedEmpIds([]);
      setActiveModal(null);
    } catch (err) {
      console.error("Error creating collab:", err);
    }
  };

  const handleAddMember = async (empId) => {
    if (!activeChat?._id) return;
    try {
      await addParticipantToChat(activeChat._id, empId);
      setActiveModal(null);
    } catch (err) {
      console.error("Error adding participant:", err);
    }
  };

  const toggleEmpSelection = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Dynamic In-App Toast Banner */}
      {inAppToast && (
        <div className="absolute top-16 right-8 z-50 bg-white/95 backdrop-blur-md border border-blue-200 rounded-2xl shadow-xl p-3.5 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1D61E7] flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
            💬
          </div>
          <div className="text-xs min-w-[150px] max-w-[240px]">
            <p className="font-bold text-gray-900 truncate">
              {getEmployeeName(inAppToast.senderId)}
            </p>
            <p className="text-gray-500 text-[11px] truncate mt-0.5">
              {inAppToast.text}
            </p>
          </div>
          <button
            onClick={dismissToast}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200/80">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Messenger & Collaboration
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Real-time cross-team communication
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full bg-[#1D61E7] text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 cursor-pointer">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex gap-8 px-6 pt-3 bg-white border-b border-gray-200/80 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold transition-all relative cursor-pointer ${activeTab === tab
                ? "text-[#1D61E7]"
                : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1D61E7] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Body Grid */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar: Chat List */}
        <div className="w-80 flex flex-col border-r border-gray-200/80 bg-white">
          {/* Search & Plus Button */}
          <div className="flex items-center gap-2 p-3.5 border-b border-gray-100 relative">
            <div className="flex items-center flex-1 gap-2 bg-[#F1F5F9] rounded-2xl px-3.5 py-2 border border-gray-100">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team or chat..."
                className="bg-transparent outline-none text-xs flex-1 text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>

            <div className="relative" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu((prev) => !prev)}
                className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#1D61E7] border border-blue-100 transition cursor-pointer"
              >
                <Plus size={18} />
              </button>

              {showPlusMenu && (
                <div className="absolute left-0 top-12 z-50 w-72 bg-white rounded-2xl border border-gray-100 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      setModalSearch("");
                      fetchEmployees();
                      setActiveModal("direct");
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 text-[#1D61E7] group-hover:bg-blue-100 transition">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Direct Message
                      </p>
                      <p className="text-[11px] text-gray-400 font-normal">
                        1-on-1 chat with team member
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      setSelectedEmpIds([]);
                      setGroupNameInput("");
                      fetchEmployees();
                      setActiveModal("group");
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Group Chat
                      </p>
                      <p className="text-[11px] text-gray-400 font-normal">
                        Group discussions
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      setModalSearch("");
                      fetchTasks();
                      setActiveModal("task");
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Task Chat
                      </p>
                      <p className="text-[11px] text-gray-400 font-normal">
                        Discuss a specific task
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      setSelectedEmpIds([]);
                      setCollabNameInput("");
                      setCollabDescriptionInput("");
                      setIsCreatingCollab(true);
                      setActiveTab("Collabs");
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                      <Handshake size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Collab</p>
                      <p className="text-[11px] text-gray-400 font-normal">
                        Cross-team collaboration
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loadingChats && (
              <p className="text-center text-xs text-gray-400 py-6">
                Loading chats...
              </p>
            )}

            {!loadingChats && filteredChats.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8 px-4">
                <p className="font-semibold text-gray-600 mb-1">No chats in {activeTab}</p>
                <p>Click the + icon to start a new chat!</p>
              </div>
            )}

            {filteredChats.map((chat) => {
              const otherEmpId = chat.participants?.find((p) => {
                const pStr = typeof p === "object" ? (p._id || p.id || p.uid || p.email) : p;
                return pStr !== userId && pStr !== user?.email && pStr !== user?.uid;
              });
              const displayName = chat.isGroup
                ? chat.chatName
                : getEmployeeName(otherEmpId);

              const unreadCount = unreadCounts[chat._id] || 0;

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-50 hover:bg-gray-50/80 transition cursor-pointer ${activeChatId === chat._id ? "bg-blue-50/70 border-l-4 border-l-[#1D61E7]" : ""
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1D61E7] flex items-center justify-center text-sm font-bold shrink-0">
                    {(displayName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-xs text-gray-900 truncate">
                        {displayName}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {chat.lastMessageAt
                            ? new Date(chat.lastMessageAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                            : ""}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate font-normal">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 flex flex-col bg-[#F4F8FA] relative">
          {isCreatingCollab ? (
            <CollabCreateView
              collabNameInput={collabNameInput}
              setCollabNameInput={setCollabNameInput}
              collabDescriptionInput={collabDescriptionInput}
              setCollabDescriptionInput={setCollabDescriptionInput}
              onOpenAccessPermissions={() => setShowAccessPermissions(true)}
              onCancel={() => setIsCreatingCollab(false)}
              onCreateCollab={async () => {
                await handleCreateCollab();
                setIsCreatingCollab(false);
              }}
            />
          ) : !activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-[#1D61E7] mb-3 shadow-inner">
                <MessageSquare size={28} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Select a chat room or start a conversation
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click the + icon in the sidebar to message team members
              </p>
              {activeTab === "Collabs" && (
                <button
                  onClick={() => setIsCreatingCollab(true)}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#1D61E7] text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-md"
                >
                  + Create New Collab
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Chat Room Header */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20">
                    {(
                      activeChat.isGroup
                        ? activeChat.chatName
                        : getEmployeeName(otherParticipant)
                    )
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-gray-900">
                      {activeChat.isGroup
                        ? activeChat.chatName
                        : getEmployeeName(otherParticipant)}
                    </h2>
                    <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse" />
                      <span className="truncate max-w-xs md:max-w-md">
                        {activeChat.isGroup
                          ? `Participants (${activeChat.participants?.length || 0}): ${activeChat.participants?.map((p) => getEmployeeName(p)).join(", ")}`
                          : `Participating: ${getEmployeeName(otherParticipant)}`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeChat.isGroup && (
                    <button
                      onClick={() => {
                        fetchEmployees();
                        setActiveModal("add_member");
                      }}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                      title="Add Member"
                    >
                      <UserPlus size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveModal("confirm_delete_chat")}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition cursor-pointer"
                    title="Delete Chat Room"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    onClick={() => setShowAbout((s) => !s)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    title="Chat Details"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Message History List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-blue-50/20 via-emerald-50/20 to-white">
                {/* Embedded Task Card Header (Matching User Design) */}
                {(activeTab === "Task Chats" || activeChat?.isTask || activeChat?.taskData || activeChat?.chatType === "task") && (
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-3.5 py-1 text-[11px] font-semibold text-rose-700 mb-3 shadow-2xs">
                      <span>01 Member</span>
                      <button
                        onClick={() => setShowTaskHistoryModal(true)}
                        className="underline hover:text-rose-900 cursor-pointer font-bold ml-1"
                      >
                        view task
                      </button>
                    </div>

                    <div className="bg-gray-100/90 text-gray-500 rounded-full px-3 py-0.5 text-[10px] font-bold mb-4 border border-gray-200/50">
                      Today
                    </div>

                    {/* Task Card Box */}
                    <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 space-y-2.5 text-xs text-gray-700">
                      <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                        <h4 className="font-bold text-sm text-[#023167]">
                          {activeChat.taskData?.title || activeChat.chatName || "CRM"}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-200/50">
                          ● {activeChat.taskData?.status || "Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-500">Status :</span>
                        <span className="col-span-2 font-medium text-gray-800">{activeChat.taskData?.status || "Pending"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-500">Created by :</span>
                        <span className="col-span-2 font-medium text-gray-800">{getEmployeeName(activeChat.taskData?.assignedBy || "Vishnu-Admin")}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-500">Assignee :</span>
                        <span className="col-span-2 font-medium text-gray-800">{getEmployeeName(activeChat.taskData?.assignedTo || otherParticipant || "Jennie")}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-500">Deadline :</span>
                        <span className="col-span-2 font-medium text-gray-800">{activeChat.taskData?.dueDate || "7/13/2026 7:00 pm"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-500">Description :</span>
                        <span className="col-span-2 font-medium text-gray-800">{activeChat.taskData?.description || "develop crm module"}</span>
                      </div>
                      <div className="text-right text-[10px] text-gray-400 pt-1">3:40 am</div>
                    </div>
                  </div>
                )}

                {loadingMessages && (
                  <p className="text-center text-xs text-gray-400">
                    Loading messages...
                  </p>
                )}

                {messages.map((msg) => {
                  const senderIdStr = typeof msg.senderId === "object"
                    ? (msg.senderId?._id || msg.senderId?.id || msg.senderId?.email)
                    : msg.senderId;

                  const targetSender = String(senderIdStr || "").toLowerCase();
                  const isMine = Boolean(
                    targetSender && (
                      targetSender === String(userId).toLowerCase() ||
                      targetSender === String(user?.email || "").toLowerCase() ||
                      targetSender === String(user?.uid || "").toLowerCase() ||
                      (userDisplayName && targetSender === String(userDisplayName).toLowerCase())
                    )
                  );
                  const senderName = getEmployeeName(senderIdStr);
                  const isEditing = editingMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col group ${isMine ? "items-end" : "items-start"
                        }`}
                    >
                      {/* Sender Name above message bubble */}
                      <span className="text-[10px] font-bold text-gray-500 mb-1 px-1">
                        {isMine ? "You" : senderName}
                      </span>

                      <div className="flex items-center gap-1.5 max-w-[70%]">
                        {/* Hover Action Toolbar */}
                        {isMine && !isEditing && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0">
                            <button
                              onClick={() => {
                                setEditingMessageId(msg._id);
                                setEditingText(msg.text);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 cursor-pointer"
                              title="Edit Message"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}

                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs shadow-xs relative ${isMine
                              ? "bg-[#1D61E7] text-white rounded-tr-none"
                              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                            }`}
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none border border-blue-400"
                                autoFocus
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-2 py-1 rounded-md bg-blue-500 text-[10px] font-bold text-white hover:bg-blue-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(msg._id)}
                                  className="px-2 py-1 rounded-md bg-white text-[10px] font-bold text-blue-700 hover:bg-blue-50"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.text && (
                                <p className="font-normal whitespace-pre-wrap">{msg.text}</p>
                              )}

                              {/* Attachment Rendering */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map((att, idx) => {
                                    const rawUrl = typeof att === "string" ? att : att?.url;
                                    let attName = typeof att === "string" ? "" : att?.name;
                                    const attType = typeof att === "string" ? "" : att?.type;
                                    const attSize = typeof att === "string" ? "" : att?.size;

                                    if (!attName || attName === "Attachment") {
                                      if (rawUrl && typeof rawUrl === "string") {
                                        const parts = rawUrl.split("/");
                                        const lastPart = parts[parts.length - 1] || "";
                                        if (lastPart.includes(".") && !lastPart.startsWith("data:")) {
                                          attName = decodeURIComponent(lastPart);
                                        }
                                      }
                                    }
                                    if (!attName) attName = "Document Attachment";

                                    const ext = attName.includes(".") ? attName.split(".").pop().toLowerCase() : "";

                                    const isImg =
                                      attType?.startsWith("image/") ||
                                      /\.(jpg|jpeg|png|gif|webp)$/i.test(attName || rawUrl || "");

                                    const cleanUrl = rawUrl;

                                    return isImg ? (
                                      <a
                                        key={idx}
                                        href={cleanUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-xl overflow-hidden border border-white/20 max-w-xs hover:opacity-90 transition shadow-xs"
                                      >
                                        <img
                                          src={cleanUrl}
                                          alt={attName || "Attachment"}
                                          className="max-h-48 w-full object-cover rounded-xl"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        key={idx}
                                        href={cleanUrl}
                                        download={attName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 shadow-xs max-w-xs ${
                                          isMine
                                            ? "bg-blue-600/40 border-blue-400/50 text-white hover:bg-blue-600/60"
                                            : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                                        }`}
                                      >
                                        <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${isMine ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>
                                          <FileText size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className="truncate font-semibold text-xs leading-tight">{attName}</p>
                                          <div className="flex items-center gap-1.5 mt-0.5 opacity-80 text-[10px]">
                                            {ext && <span className="uppercase font-extrabold px-1 py-0.2 rounded bg-black/10 text-[9px]">{ext}</span>}
                                            {attSize && <span>{attSize}</span>}
                                          </div>
                                        </div>
                                        <div className={`p-1.5 rounded-lg shrink-0 ${isMine ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-200/70 text-gray-700 hover:bg-gray-200"}`}>
                                          <Download size={14} />
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                              <div
                                className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isMine ? "text-blue-100" : "text-gray-400"
                                  }`}
                              >
                                {msg.isEdited && <span className="italic">edited</span>}
                                <span>
                                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </span>
                                {isMine && <CheckCheck size={12} className="opacity-80" />}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Files Attachment Preview Tray */}
              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-2.5 px-6 py-2 bg-blue-50/80 border-t border-blue-100/80 overflow-x-auto">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-white border border-blue-200/80 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs group relative shrink-0"
                    >
                      {file.isImage ? (
                        <img src={file.url} alt={file.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          <FileText size={16} />
                        </div>
                      )}
                      <div className="max-w-[120px] text-left">
                        <p className="text-[11px] font-bold text-gray-800 truncate">{file.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{file.size}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />

              {/* Bottom Message Input Bar */}
              <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-t border-gray-200/80">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-[#1D61E7] transition cursor-pointer"
                  title="Attach Files"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeTab === "Collabs" || activeChat?.chatType === "collab" ? "Ask me anything..." : "Type a message..."}
                  className="flex-1 bg-[#F1F5F9] rounded-full px-5 py-2.5 text-xs text-gray-800 outline-none placeholder-gray-400 border border-transparent focus:border-blue-300"
                />

                <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                  <Smile size={18} />
                </button>

                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-full bg-[#1D61E7] text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Panel: About Chat Details (Resized & Delayed Reveal) */}
        {showAbout && activeChat && (
          <>
            {/* Backdrop overlay for mobile & tablet screens */}
            <div
              onClick={() => setShowAbout(false)}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-2xs xl:hidden animate-in fade-in duration-200 cursor-pointer"
            />

            <div className="fixed inset-y-0 right-0 z-40 w-full max-w-[280px] sm:w-[300px] border-l border-gray-200/80 bg-white p-4 flex flex-col shadow-2xl xl:relative xl:z-auto xl:shadow-none animate-in slide-in-from-right duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                  About Chat
                </h3>
                <button
                  onClick={() => setShowAbout(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Compact Profile Card */}
              <div className="flex flex-col items-center mb-4 text-center bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-2 shadow-sm shadow-blue-500/20">
                  {(
                    activeChat.isGroup
                      ? activeChat.chatName
                      : getEmployeeName(otherParticipant)
                  )
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>
                <p className="font-bold text-xs text-gray-900 truncate max-w-[200px]">
                  {activeChat.isGroup
                    ? activeChat.chatName
                    : getEmployeeName(otherParticipant)}
                </p>
                <p className="text-[11px] text-gray-400 font-medium truncate max-w-[200px] mt-0.5">
                  {activeChat.taskData?.title || "CRM module develop"}
                </p>
              </div>

              {/* Staggered Delayed Reveal for Delete & Task History Action Cards */}
              <div className="space-y-2 mb-5 min-h-[140px]">
                {actionsVisible ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/90 border border-gray-100 text-[11px] font-semibold text-gray-700 hover:bg-gray-100/80 transition">
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-gray-400" />
                        <span>Favorite message</span>
                      </div>
                      <span className="font-bold text-gray-400 text-[10px]">0</span>
                    </div>

                    <button
                      onClick={() => setActiveModal("confirm_delete_chat")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50/90 hover:bg-red-50 border border-gray-100 hover:border-red-100 text-[11px] font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={14} className="text-gray-400 group-hover:text-red-500" />
                        <span>Delete chat</span>
                      </div>
                      <span className="font-bold text-gray-400 text-[10px]">0</span>
                    </button>

                    <button
                      onClick={() => setShowTaskHistoryModal(true)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100/80 text-[11px] font-bold text-[#1D61E7] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Task History</span>
                      </div>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-[10px] text-gray-400 font-medium animate-pulse space-y-2">
                    <div className="h-7 bg-gray-100 rounded-xl" />
                    <div className="h-7 bg-gray-100 rounded-xl" />
                    <div className="h-7 bg-gray-100 rounded-xl" />
                  </div>
                )}
              </div>

              {/* Participants */}
              <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-3 flex-1 overflow-y-auto">
                <p className="font-bold text-gray-900 text-xs mb-2.5">
                  Participants ({activeChat.participants?.length || 0})
                </p>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {activeChat.participants?.map((pId) => {
                    const pName = getEmployeeName(pId);
                    return (
                      <div key={pId} className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1D61E7] flex items-center justify-center text-[9px] font-bold shrink-0">
                          {pName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-800 font-semibold truncate text-[11px]">
                          {pName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {activeModal === "direct" && "Direct Message (1-on-1)"}
                {activeModal === "group" && "Create Group Chat"}
                {activeModal === "task" && "Start Task Chat"}
                {activeModal === "collab" && "Create Collaboration Room"}
                {activeModal === "add_member" && "Add Member to Chat"}
                {activeModal === "confirm_delete_chat" && "Delete Chat Room"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === "confirm_delete_chat" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-xs font-medium">
                    Are you sure you want to delete this chat room? This will remove all message history for all members.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteChatRoom}
                    className="px-4 py-2 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700 transition shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    Delete Chat
                  </button>
                </div>
              </div>
            )}

            {activeModal === "direct" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">
                  Select a team member to start a 1-on-1 conversation:
                </p>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="bg-transparent text-xs outline-none w-full text-gray-800"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pt-1">
                  {employeeList
                    .filter((emp) => {
                      const empName = emp.employeeName || emp.name || emp.email || "";
                      return empName.toLowerCase().includes(modalSearch.toLowerCase());
                    })
                    .map((emp) => {
                      const empName = emp.employeeName || emp.name || emp.email || "Employee";
                      const empRole = emp.employeeRole || emp.role || emp.email || "Team Member";

                      return (
                        <button
                          key={emp._id || emp.id || emp.email}
                          onClick={() => handleStartDirectChat(emp)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/80 transition border border-gray-100 hover:border-blue-200 text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1D61E7] font-bold text-sm flex items-center justify-center shrink-0">
                              {empName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-[#1D61E7] transition">
                                {empName}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {empRole}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#1D61E7] bg-blue-50 group-hover:bg-[#1D61E7] group-hover:text-white px-3 py-1.5 rounded-xl transition">
                            Chat &rarr;
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {activeModal === "group" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Team, Frontend Leads"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Select Members
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                    {employeeList.map((emp) => {
                      const empId = emp._id || emp.id || emp.email;
                      const isSelected = selectedEmpIds.includes(empId);
                      return (
                        <div
                          key={empId}
                          onClick={() => toggleEmpSelection(empId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${isSelected
                              ? "bg-blue-50 text-[#1D61E7] font-bold"
                              : "hover:bg-gray-100 text-gray-700"
                            }`}
                        >
                          <span>{emp.employeeName || emp.name || emp.email}</span>
                          {isSelected && <Check size={16} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroupChat}
                    className="px-4 py-2 rounded-xl bg-[#1D61E7] text-xs font-semibold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            )}

            {activeModal === "task" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                />
                <div className="max-h-60 overflow-y-auto space-y-1.5 pt-1">
                  {taskList
                    .filter((t) =>
                      (t.title || t.taskName || "")
                        .toLowerCase()
                        .includes(modalSearch.toLowerCase())
                    )
                    .map((task) => (
                      <button
                        key={task._id || task.id}
                        onClick={() => handleSelectTaskChat(task)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-50/70 transition border border-transparent hover:border-cyan-100 text-left cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {task.title || task.taskName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Status: {task.status || "Pending"}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-cyan-600">
                          Open Room &rarr;
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {activeModal === "collab" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Collab Room Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pearls Sync, Partner Room"
                    value={collabNameInput}
                    onChange={(e) => setCollabNameInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Select Collaborators
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                    {employeeList.map((emp) => {
                      const empId = emp._id || emp.id || emp.email;
                      const isSelected = selectedEmpIds.includes(empId);
                      return (
                        <div
                          key={empId}
                          onClick={() => toggleEmpSelection(empId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${isSelected
                              ? "bg-indigo-50 text-indigo-600 font-bold"
                              : "hover:bg-gray-100 text-gray-700"
                            }`}
                        >
                          <span>{emp.employeeName || emp.name || emp.email}</span>
                          {isSelected && <Check size={16} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCollab}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Create Collab
                  </button>
                </div>
              </div>
            )}

            {activeModal === "add_member" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium mb-2">
                  Select a team member to add to {activeChat?.chatName || "this chat"}:
                </p>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {employeeList
                    .filter(
                      (emp) =>
                        !activeChat?.participants?.includes(emp._id || emp.id || emp.email)
                    )
                    .map((emp) => (
                      <button
                        key={emp._id || emp.id || emp.email}
                        onClick={() => handleAddMember(emp._id || emp.id || emp.email)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 transition border border-transparent hover:border-blue-100 text-left cursor-pointer"
                      >
                        <span className="text-xs font-bold text-gray-900">
                          {emp.employeeName || emp.name || emp.email}
                        </span>
                        <span className="text-[11px] font-semibold text-[#1D61E7]">
                          + Add
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {activeModal === "confirm_delete_chat" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Are you sure you want to delete this chat room? All message history will be permanently deleted for all participants.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (activeChatId) {
                        deleteChat(activeChatId);
                        setActiveChatId(null);
                        setShowAbout(false);
                      }
                      setActiveModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700 transition shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TASK HISTORY MODAL (Matching User Image 1) */}
      {showTaskHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-wide">
                <Clock size={18} className="text-[#1D61E7]" />
                TASK HISTORY
              </h3>
              <button
                onClick={() => setShowTaskHistoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* History Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200/80">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/80">
                  <tr>
                    <th className="px-4 py-3 text-[#023167]">TITLE</th>
                    <th className="px-4 py-3 text-[#023167]">DATE</th>
                    <th className="px-4 py-3 text-[#023167]">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5 text-blue-600 font-bold cursor-pointer hover:underline">
                      CRM
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 uppercase font-semibold">
                      JUL-2026
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600 border border-purple-200/60 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5 text-blue-600 font-bold cursor-pointer hover:underline">
                      Banking websites
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 uppercase font-semibold">
                      JUN-2026
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200/60 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5 text-blue-600 font-bold cursor-pointer hover:underline">
                      Bison clothing website
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 uppercase font-semibold">
                      MAY-2026
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200/60 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ACCESS PERMISSIONS DRAWER */}
      <AccessPermissionsModal
        isOpen={showAccessPermissions}
        onClose={() => setShowAccessPermissions(false)}
        collabOwner={collabOwner}
        collabHistoryNewMembers={collabHistoryNewMembers}
        setCollabHistoryNewMembers={setCollabHistoryNewMembers}
        collabUsersInvite={collabUsersInvite}
        setCollabUsersInvite={setCollabUsersInvite}
        collabAllowGuests={collabAllowGuests}
        setCollabAllowGuests={setCollabAllowGuests}
        collabUsersPost={collabUsersPost}
        setCollabUsersPost={setCollabUsersPost}
        collabUsersViewTasks={collabUsersViewTasks}
        setCollabUsersViewTasks={setCollabUsersViewTasks}
        onAddModerator={() => {
          fetchEmployees();
          setActiveModal("add_member");
        }}
      />
    </div>
  );
}