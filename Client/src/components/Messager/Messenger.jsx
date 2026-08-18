import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useChat from "../../Hooks/chat.js";

const TABS = ["Chats", "Task Chats", "Copilot", "Collabs", "Channels"];

export default function Messenger() {
  const { user } = useAuth();
  const userId = user?.uid;

  const [activeTab, setActiveTab] = useState("Chat");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [search, setSearch] = useState("");

  const {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    sendMessage,
  } = useChat(userId, activeChatId);

  const activeChat = chats.find((c) => c._id === activeChatId);

  const otherParticipant =
    activeChat?.participants?.find((p) => p._id !== userId) ||
    activeChat?.participants?.[0];

  const filteredChats = chats.filter((c) => {
    const name = c.isGroup
      ? c.chatName
      : c.participants?.find((p) => p._id !== userId)?.employeeName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

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
    <div className="flex flex-col h-[calc(100vh-100px)] bg-[#f4f2ec] rounded-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Admin - Messenger
          </h1>
          <p className="text-sm text-gray-500">
            Manage and Connecting Client and employees
          </p>
        </div>
        <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
          <Bell size={18} />
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
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
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
              const displayName = chat.isGroup
                ? chat.chatName
                : chat.participants?.find((p) => p._id !== userId)
                    ?.employeeName || "Unknown";

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${
                    activeChatId === chat._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {displayName}
                      </p>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {chat.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
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
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {(otherParticipant?.employeeName ||
                      activeChat.chatName ||
                      "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <p className="font-medium text-gray-900">
                    {activeChat.isGroup
                      ? activeChat.chatName
                      : otherParticipant?.employeeName || "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/60 text-gray-500">
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => setShowAbout((s) => !s)}
                    className="p-2 rounded-lg hover:bg-white/60 text-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
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
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
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
          <div className="w-72 border-l border-gray-200 bg-white p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium text-gray-900">About Chat</p>
              <button onClick={() => setShowAbout(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-700 mb-2">
                {(otherParticipant?.employeeName ||
                  activeChat.chatName ||
                  "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <p className="font-medium text-gray-900">
                {activeChat.isGroup
                  ? activeChat.chatName
                  : otherParticipant?.employeeName}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1">
                Files and media
              </p>
              <p className="text-xs">There are no files or media</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}