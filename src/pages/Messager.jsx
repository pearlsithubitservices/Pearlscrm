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
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  UploadCloud,
  Calendar,
  Filter,
  UserPlus,
  History,
  Star,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useChat from "../Hooks/chat.js";
import { apiUrl } from "../config/api.js";

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return { status: "unsupported", message: "Browser notifications are not supported." };
  }

  const permission = await Notification.requestPermission();
  return {
    status: permission,
    message: permission === "granted"
      ? "Browser notifications enabled."
      : "Browser notifications were not enabled.",
  };
};

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
    key: "task",
    label: "Task Chat",
    desc: "Discuss a specific task",
    icon: MessageSquare,
  },
  {
    key: "collab",
    label: "Collab",
    desc: "Collaborate with outside teams and guests",
    icon: Handshake,
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
  const [newChatMode, setNewChatMode] = useState("group"); // "group" | "collab" | "channel" | "task" | "direct"
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [groupName, setGroupName] = useState("");

  // Task selection for Task Chat modal
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // File attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Edit message state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  // New Chat Task Form modal state (matching design screenshot)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignedFrom, setNewTaskAssignedFrom] = useState(user?.name || user?.employeeName || "Admin");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("High");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("New");
  const [newTaskFile, setNewTaskFile] = useState(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Add to Chat modal state & Task History modal state (matching design screenshot)
  const [showAddToChatModal, setShowAddToChatModal] = useState(false);
  const [addToChatSearch, setAddToChatSearch] = useState("");
  const [showTaskHistoryModal, setShowTaskHistoryModal] = useState(false);

  const {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteChat,
    createChat,
    addParticipantToChat,
    getOrCreateTaskChat,
  } = useChat(userId, activeChatId);

  // Fetch employee directory on mount to display names
  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, []);

  // Refresh tasks whenever Task History modal is opened
  useEffect(() => {
    if (showTaskHistoryModal) {
      fetchTasks();
    }
  }, [showTaskHistoryModal]);

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
    if (c.chatType === "task" || c.taskId) {
      return c.chatName || `Task Chat #${c.taskId || c._id}`;
    }
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
    if (otherId === "admin") return "Admin";
    const foundEmp = employees.find((emp) => (emp._id || emp.id || emp.uid) === otherId);
    if (foundEmp) {
      return foundEmp.employeeName || foundEmp.name || foundEmp.email || "Employee";
    }

    return c.chatName || "Direct Chat";
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
      if (c.isGroup || c.chatType === "collab" || c.chatType === "task" || c.chatType === "group" || c.taskId) {
        return false;
      }
    } else if (activeTab === "Collabs") {
      if (!c.isGroup && c.chatType !== "collab" && c.chatType !== "group") {
        return false;
      }
    } else if (activeTab === "Task Chats") {
      if (c.chatType !== "task" && !c.taskId) return false;
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

      setEmployees(list || []);
    } catch (error) {
      console.log("Error in fetchEmployees:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // FETCH TASKS (for Task Chat selection)
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      let list = [];
      try {
        const response = await fetch(apiUrl("/tasks"));
        const result = await response.json();
        const apiList = Array.isArray(result) ? result : result.data || [];
        if (apiList && apiList.length > 0) list = apiList;
      } catch (err) {
        console.log("Error fetching tasks from API:", err);
      }
      setTasks(list);
    } catch (err) {
      console.log("fetchTasks error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Handle clicking one of the "+" dropdown options
  const handleAddOptionClick = async (key) => {
    setShowAddMenu(false);

    if (key === "task") {
      const isAdmin = user?.role === 'Admin' || user?.userType === 'Admin';
      if (!isAdmin) {
        // Employees pick from existing assigned tasks to chat
        setNewChatMode("task");
        setSelectedTaskId("");
        fetchTasks();
        setShowNewChatModal(true);
        return;
      }
      // Admins open the New Chat Task Assignment Form
      fetchEmployees();
      setShowNewTaskModal(true);
      return;
    }

    if (key === "direct" || key === "group" || key === "collab") {
      setNewChatMode(key);
      setSelectedEmployeeIds([]);
      setSelectedTaskId("");
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

  const handleCreateNewTaskSubmit = async (e) => {
    if (e) e.preventDefault();

    const isAdmin = user?.role === 'Admin' || user?.userType === 'Admin';
    if (!isAdmin) {
      showToastMessage("Only Admins can create and assign new tasks.", "error");
      return;
    }

    if (!newTaskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      setIsSubmittingTask(true);

      const taskData = {
        title: newTaskTitle.trim(),
        notes: newTaskDescription.trim(),
        description: newTaskDescription.trim(),
        assignedBy: userId || "admin",
        assignedFrom: newTaskAssignedFrom || "Admin",
        assignedTo: newTaskAssignedTo || userId || "admin",
        priority: newTaskPriority || "High",
        dueDate: newTaskDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        status: newTaskStatus || "New",
      };

      // 1. Create task via API
      let createdTask = null;
      try {
        const response = await fetch(apiUrl("/tasks"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (response.ok) {
          createdTask = await response.json();
        }
      } catch (err) {
        console.log("Error posting task to API:", err);
      }

      const createdTaskId = createdTask?._id || createdTask?.id || "task_" + Date.now();
      const createdTaskTitle = newTaskTitle.trim();

      // 2. Initialize or fetch Task Chat room
      const chat = await getOrCreateTaskChat(createdTaskId, createdTaskTitle);

      // 3. Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskAssignedTo("");
      setNewTaskFile(null);
      setShowNewTaskModal(false);

      // 4. Send initial Task Announcement Card message into the Task Chat room
      if (chat?._id) {
        const targetEmp = employees.find((e) => (e._id || e.id || e.uid) === newTaskAssignedTo);
        const assigneeName = targetEmp ? (targetEmp.employeeName || targetEmp.name || targetEmp.email) : "Assigned Member";
        const createdByName = user?.name || user?.employeeName || (user?.role === "Admin" ? "Admin" : "Admin");

        const formattedDeadline = newTaskDueDate
          ? new Date(newTaskDueDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) + " 7:00 pm"
          : new Date(Date.now() + 86400000 * 3).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) + " 7:00 pm";

        const taskCardPayload = {
          title: createdTaskTitle,
          status: newTaskStatus || "Pending",
          createdBy: createdByName,
          assignee: assigneeName,
          deadline: formattedDeadline,
          description: newTaskDescription.trim() || "Task initialized",
        };

        try {
          await fetch(apiUrl(`/chat/${chat._id}/messages`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderId: userId || "admin",
              text: `TASK_CARD:${JSON.stringify(taskCardPayload)}`,
            }),
          });
        } catch (msgErr) {
          console.error("Error sending initial task card message:", msgErr);
        }

        setActiveChatId(chat._id);
        setActiveTab("Task Chats");
      }
    } catch (err) {
      console.error("Error creating new task from messenger:", err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const toggleEmployeeSelected = (empId) => {
    if (newChatMode === "direct") {
      setSelectedEmployeeIds([empId]);
      const targetEmp = employees.find((e) => (e._id || e.id || e.uid) === empId);
      const resolvedName = targetEmp ? (targetEmp.employeeName || targetEmp.name || targetEmp.email) : "Direct Chat";
      createChat({
        participants: Array.from(new Set([userId || "admin", empId])),
        chatName: resolvedName,
        isGroup: false,
        chatType: "direct",
      }).then((newChat) => {
        setShowNewChatModal(false);
        if (newChat?._id) {
          setActiveChatId(newChat._id);
          setActiveTab("Chats");
        }
      });
    } else {
      setSelectedEmployeeIds((prev) =>
        prev.includes(empId)
          ? prev.filter((id) => id !== empId)
          : [...prev, empId]
      );
    }
  };

  const handleCreateChat = async () => {
    if (newChatMode === "task") {
      if (!selectedTaskId) return;
      const t = tasks.find((item) => (item._id || item.id) === selectedTaskId);
      const title = t?.title || t?.taskName || `Task #${selectedTaskId}`;
      const chat = await getOrCreateTaskChat(selectedTaskId, title);
      setShowNewChatModal(false);
      if (chat?._id) {
        setActiveChatId(chat._id);
        setActiveTab("Task Chats");
      }
      return;
    }

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
      if (chatType === "collab" || chatType === "group" || chatType === "channel") setActiveTab("Collabs");
      else setActiveTab("Chats");
    }
  };

  const handleAddParticipant = async (empId) => {
    if (!activeChatId || !empId) return;
    try {
      const updatedChat = await addParticipantToChat(activeChatId, empId);
      if (updatedChat) {
        showToastMessage("Participant added to chat successfully!", "success");
      }
    } catch (err) {
      console.error("Error adding participant:", err);
    } finally {
      setShowAddToChatModal(false);
    }
  };

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  const handleDeleteChat = async (chatIdToDelete) => {
    const idToDelete = chatIdToDelete || activeChatId;
    if (idToDelete && window.confirm("Are you sure you want to delete this chat conversation?")) {
      await deleteChat(idToDelete);
      if (idToDelete === activeChatId) {
        setActiveChatId(null);
      }
    }
  };

  return (
    <>
    <div className="flex flex-col h-screen w-full bg-[#f4f2ec] overflow-hidden">
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
            <div className="relative">
              <button
                onClick={() => setShowAddMenu((s) => !s)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Plus size={18} />
              </button>

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
            </div>
          </div>

          {/* Quick Create Task Chat button for Admin */}
          {activeTab === "Task Chats" && (user?.role === "Admin" || user?.userType === "Admin") && (
            <div className="px-3 py-2 border-b border-gray-100 bg-blue-50/50">
              <button
                onClick={() => {
                  fetchEmployees();
                  setShowNewTaskModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus size={15} /> Create New Task Chat
              </button>
            </div>
          )}

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
                <div
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className={`group relative w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 ${
                    activeChatId === chat._id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
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
                  {/* Delete Task Chat Icon on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat._id);
                    }}
                    title="Delete Chat Room"
                    className="absolute right-3 top-4 p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
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
                    {activeTab === "Task Chats" || activeChat?.chatType === "task" || activeChat?.taskId || activeChat?.chatName?.toLowerCase().includes("task") ? (
                      <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                        {activeChat.chatName ? activeChat.chatName.replace(/^Task Chat:\s*/i, "") : "Task Discussion"}
                      </p>
                    ) : activeChat.isGroup || activeChat.chatType === "group" || activeChat.chatType === "collab" ? (
                      <p className="text-[11px] text-gray-500 font-medium">
                        {activeChat.participants?.length || 1} members in group
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
                  <button
                    onClick={() => setShowAddToChatModal(true)}
                    title="Add to Chat"
                    className="p-2 rounded-lg hover:bg-white/80 text-gray-600 transition"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/80 text-gray-600">
                    <Search size={18} />
                  </button>
                  <button
                    onClick={() => setShowAbout((s) => !s)}
                    className={`p-2 rounded-lg transition ${
                      showAbout ? "bg-blue-100 text-blue-600" : "hover:bg-white/80 text-gray-600"
                    }`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Sub-header badge line (ONLY for Task Chats) */}
              {(activeTab === "Task Chats" || activeChat?.chatType === "task" || activeChat?.taskId || activeChat?.chatName?.toLowerCase().includes("task")) && (
                <div className="flex justify-center pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-gray-200/80 text-xs text-gray-700 shadow-2xs">
                    <button
                      onClick={() => setShowAbout(true)}
                      className="font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {activeChat.participants?.length || 1} Member
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setShowTaskHistoryModal(true)}
                      className="text-red-500 underline font-semibold hover:text-red-600 ml-0.5"
                    >
                      view task
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 page-scroll">
                {loadingMessages && (
                  <p className="text-center text-sm text-gray-400">
                    Loading messages...
                  </p>
                )}

                {messages.map((msg) => {
                  const isMine = msg.senderId?._id === userId || msg.senderId === userId;
                  const isEditingThis = editingMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      } group`}
                    >
                      <div className="flex items-center gap-1.5 max-w-sm relative">
                        {/* Hover actions for sender */}
                        {isMine && !isEditingThis && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0">
                            <button
                              onClick={() => handleStartEdit(msg)}
                              title="Edit Message"
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition shadow-xs"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete Message"
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded transition shadow-xs"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}

                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                          }`}
                        >
                          {/* Display Sender Name for Incoming Messages */}
                          {!isMine && (
                            <p className="text-[11px] font-bold text-blue-600 mb-1 tracking-wide">
                              {getParticipantDetails(msg.senderId).name}
                            </p>
                          )}
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
                                        <span className="truncate">{att.name || "Attachment"}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1">
                            {msg.isEdited && (
                              <span className="text-[9px] opacity-75 font-medium">(edited)</span>
                            )}
                            <span
                              className={`text-[10px] ${
                                isMine ? "text-blue-100" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attachment Preview Banner */}
              {selectedFile && (
                <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-800">
                  <div className="flex items-center gap-2 truncate">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <span className="font-medium truncate">{selectedFile.name}</span>
                    )}
                  </div>
                  <button onClick={clearFile} className="p-1 text-blue-500 hover:text-blue-700">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200">
                <input
                  type="file"
                  id="messager_file_input"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById("messager_file_input")?.click()}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
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
                  disabled={!messageText.trim() && !selectedFile}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* About Chat panel (matching design screenshot) */}
        {showAbout && activeChat && (
          <div className="w-72 border-l border-gray-200 bg-[#f7f6f1] p-4 flex flex-col page-scroll overflow-y-auto shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAbout(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                >
                  <X size={16} />
                </button>
                <p className="font-bold text-gray-900 text-sm">About Chat</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col items-center mb-4 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold uppercase mb-3 shadow-md overflow-hidden">
                {otherParticipantName.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {otherParticipantName}
              </h3>
              <button
                onClick={() => setShowAddToChatModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition"
              >
                <UserPlus size={13} /> Add
              </button>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800 text-xs">
                  Chat Members ({activeChat.participants?.length || 1})
                </p>
                <button
                  onClick={() => setShowAddToChatModal(true)}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <UserPlus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto page-scroll pr-1">
                {activeChat.participants && activeChat.participants.length > 0 ? (
                  activeChat.participants.map((p, idx) => {
                    const details = getParticipantDetails(p);
                    return (
                      <div key={idx} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                          {details.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-800 truncate">{details.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{details.role}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">1 Member</p>
                )}
              </div>
            </div>

            {/* Files and media */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs mb-4">
              <p className="font-semibold text-gray-800 text-xs mb-3">Files and media</p>
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <FileText className="text-gray-300 mb-1" size={24} />
                <p className="text-[11px] text-gray-400">There are no files or media</p>
              </div>
            </div>

            {/* Favorite & Delete Chat Options */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs mb-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-gray-500" />
                  <span>Favorite message</span>
                </div>
                <span className="font-semibold text-gray-500">0</span>
              </div>
              <div
                onClick={() => handleDeleteChat(activeChat._id)}
                className="flex items-center justify-between py-1.5 px-2 hover:bg-red-50 rounded-lg cursor-pointer text-red-600 transition"
              >
                <div className="flex items-center gap-2">
                  <Trash2 size={15} className="text-red-500" />
                  <span>Delete chat</span>
                </div>
                <span className="font-semibold text-red-500">0</span>
              </div>
            </div>

            {/* Task History Button (ONLY for Task Chats) */}
            {(activeTab === "Task Chats" || activeChat?.chatType === "task" || activeChat?.taskId || activeChat?.chatName?.toLowerCase().includes("task")) && (
              <button
                onClick={() => setShowTaskHistoryModal(true)}
                className="w-full bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between text-xs font-semibold text-blue-600 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-2">
                  <History size={16} className="text-blue-600" />
                  <span>Task History</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition" />
              </button>
            )}
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
                : newChatMode === "task"
                ? "Start Task Chat"
                : newChatMode === "collab"
                ? "New Collab Room"
                : "New Group Chat"}
            </p>
            <button onClick={() => setShowNewChatModal(false)}>
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {newChatMode !== "direct" && newChatMode !== "task" && (
            <div className="px-5 py-3 border-b border-gray-100">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={
                  newChatMode === "collab"
                    ? "Collab / Project name (e.g. Client Portal)"
                    : "Group name (e.g. Sales Team)"
                }
                className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-3 page-scroll">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {newChatMode === "task"
                ? "Select Task for Collaboration:"
                : newChatMode === "direct"
                ? "Select Employee to Message:"
                : "Select Participants:"}
            </p>

            {newChatMode === "task" && (
              <>
                {loadingTasks && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Loading task list...
                  </p>
                )}

                {!loadingTasks && tasks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No active tasks found.
                  </p>
                )}

                {tasks.map((t) => {
                  const taskId = t._id || t.id;
                  const title = t.title || t.taskName || `Task #${taskId}`;
                  const isSelected = selectedTaskId === taskId;

                  return (
                    <div
                      key={taskId}
                      onClick={() => setSelectedTaskId(taskId)}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition mb-1 border ${
                        isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="task_select"
                        checked={isSelected}
                        onChange={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {title}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          Status: {t.status || "Pending"} | Priority: {t.priority || "Normal"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {newChatMode !== "task" && (
              <>
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
                          onChange={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none"
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
              </>
            )}
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
              disabled={
                newChatMode === "task"
                  ? !selectedTaskId
                  : selectedEmployeeIds.length === 0
              }
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {newChatMode === "task"
                ? "Start Task Chat"
                : newChatMode === "direct"
                ? "Start 1-on-1 Chat"
                : "Create Chat"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* New Chat Task Form Modal (matching design screenshot) */}
    {showNewTaskModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-[#f6f5ef] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col page-scroll max-h-[90vh]">
          {/* Form Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-[#f6f5ef]">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">TASK DETAILS</p>
              <h2 className="text-base font-bold text-gray-900">New Chat Task Form</h2>
            </div>
            <button
              onClick={() => setShowNewTaskModal(false)}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          <hr className="border-gray-200 mx-6" />

          {/* Form Content */}
          <form onSubmit={handleCreateNewTaskSubmit} className="p-6 space-y-4 overflow-y-auto page-scroll">
            {/* Task Title */}
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Redesign onboarding flow for enterprise"
                className="w-full bg-white rounded-lg px-4 py-2.5 text-sm border border-gray-200 shadow-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                Task Description
              </label>
              <textarea
                rows={3}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="e.g. Redesign onboarding flow for enterprise"
                className="w-full bg-white rounded-lg px-4 py-2.5 text-sm border border-gray-200 shadow-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Assigned From & Assigned To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                  Assigned From
                </label>
                <input
                  type="text"
                  value={newTaskAssignedFrom}
                  onChange={(e) => setNewTaskAssignedFrom(e.target.value)}
                  placeholder="e.g. Agent Name"
                  className="w-full bg-white rounded-lg px-4 py-2 text-sm border border-gray-200 shadow-xs outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                  Assigned To
                </label>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-2 text-sm border border-gray-200 shadow-xs outline-none text-gray-800"
                >
                  <option value="">e.g. Select Agent</option>
                  {employees.map((emp) => {
                    const empId = emp._id || emp.id || emp.uid;
                    const empName = emp.employeeName || emp.name || emp.email;
                    return (
                      <option key={empId} value={empId}>
                        {empName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Task Priority & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                  Task Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-2 text-sm border border-gray-200 shadow-xs outline-none text-gray-800"
                >
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-2 text-sm border border-gray-200 shadow-xs outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                Status
              </label>
              <select
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className="w-full bg-white rounded-lg px-4 py-2 text-sm border border-gray-200 shadow-xs outline-none text-gray-800"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Attachments (optional) */}
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-1.5">
                Attachments (optional)
              </label>
              <div
                onClick={() => document.getElementById("new_task_file_input")?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 bg-white text-center cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="file"
                  id="new_task_file_input"
                  onChange={(e) => setNewTaskFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <UploadCloud className="mx-auto text-gray-400 mb-1" size={32} />
                <p className="text-xs text-gray-700 font-medium">
                  Drag & Drop or <span className="text-emerald-600 underline font-semibold">Choose File</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {newTaskFile ? newTaskFile.name : "Supported JPG, PNG, PDF (Max 5MB)"}
                </p>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingTask || !newTaskTitle.trim()}
                className="px-7 py-2.5 bg-[#1d64b4] hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={16} /> Add to Tasks
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Add to Chat Modal (matching Image 1 design) */}
    {showAddToChatModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl border border-gray-200 overflow-hidden flex flex-col p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Add to chat</h3>
            <button
              onClick={() => setShowAddToChatModal(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 bg-gray-100/80 rounded-xl px-3 py-2 border border-gray-200/50">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={addToChatSearch}
                onChange={(e) => setAddToChatSearch(e.target.value)}
                placeholder="Search employee..."
                className="bg-transparent outline-none text-sm w-full text-gray-800"
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 mb-2">Recent chats</p>

          <div className="space-y-1.5 max-h-60 overflow-y-auto page-scroll pr-1">
            {employees
              .filter((emp) => {
                const name = emp.employeeName || emp.name || emp.email || "";
                return name.toLowerCase().includes(addToChatSearch.toLowerCase());
              })
              .map((emp) => {
                const empId = emp._id || emp.id || emp.uid;
                const empName = emp.employeeName || emp.name || emp.email || "Employee";

                return (
                  <div
                    key={empId}
                    onClick={() => handleAddParticipant(empId)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition border border-transparent hover:border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {empName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{empName}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    )}

    {/* Task History Modal (matching Image 2 design) */}
    {showTaskHistoryModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTaskHistoryModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
              <h3 className="text-base font-bold text-gray-900 tracking-wide uppercase">TASK HISTORY</h3>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6 text-center">TITLE</th>
                  <th className="py-3 px-6 text-center">DATE</th>
                  <th className="py-3 px-6 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks && tasks.length > 0 ? (
                  tasks.map((t, idx) => (
                    <tr key={t._id || idx} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-semibold text-blue-600 text-center">{t.title || t.taskName || "Task #" + (idx + 1)}</td>
                      <td className="py-3.5 px-6 text-gray-500 font-medium text-center">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase() : (t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase() : "RECENT")}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                            t.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : t.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          ● {t.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400 font-medium text-xs">
                      No task history recorded in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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