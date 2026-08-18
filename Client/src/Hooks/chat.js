import { useEffect, useState, useCallback } from "react";
import { apiUrl } from "../config/api.js";
import { socket } from "../config/socket.js";
import { triggerNotification } from "../Utils/notificationResolver.js";

const DEFAULT_CHATS = [
  {
    _id: "collab_general",
    chatName: "Pearls Team Collab",
    isGroup: true,
    chatType: "collab",
    participants: ["admin", "emp_1", "emp_2", "emp_3"],
    lastMessage: "Welcome to the Pearls CRM Collaboration Room!",
    lastMessageAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    _id: "direct_ragavi",
    chatName: "",
    isGroup: false,
    chatType: "direct",
    participants: ["admin", "emp_1"],
    lastMessage: "Hi, please check the updated leads dashboard.",
    lastMessageAt: new Date().toISOString(),
    createdBy: "admin",
  },
];

export default function useChat(userId, activeChatId) {
  const currentUserId = userId || "admin";

  const [chats, setChats] = useState(DEFAULT_CHATS);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // FETCH ALL CHATS FOR THE LOGGED-IN USER (isSilent prevents UI flickering during background sync)
  const fetchChats = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingChats(true);
      const response = await fetch(apiUrl(`/chat?userId=${currentUserId}`));
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        setChats(result.data);
      } else if (!isSilent) {
        setChats(DEFAULT_CHATS);
      }
    } catch (error) {
      console.log("Using default fallback chats:", error);
      if (!isSilent) setChats(DEFAULT_CHATS);
    } finally {
      if (!isSilent) setLoadingChats(false);
    }
  }, [currentUserId]);

  // FETCH MESSAGES FOR THE ACTIVE CHAT (isSilent prevents UI flickering during background sync)
  const fetchMessages = useCallback(async (isSilent = false) => {
    if (!activeChatId) return;

    try {
      if (!isSilent) setLoadingMessages(true);
      const response = await fetch(apiUrl(`/messages/${activeChatId}`));
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setMessages(result.data);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  }, [activeChatId]);

  useEffect(() => {
    fetchChats(false);
  }, [fetchChats]);

  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  // SOCKET ROOM JOIN / LEAVE AND LISTENERS
  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join user's personal room
    if (currentUserId) {
      socket.emit("joinUser", currentUserId);
    }

    if (activeChatId) {
      socket.emit("joinChat", activeChatId);
    }

    // Helper to play audio notification chime
    const playNotificationChime = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        console.log("Audio chime error:", e);
      }
    };

    // New Message Listener
    const handleNewMessage = (newMsg) => {
      if (!newMsg) return;

      const sender = typeof newMsg.senderId === "object" ? (newMsg.senderId?._id || newMsg.senderId?.id || newMsg.senderId?.email) : newMsg.senderId;
      const isFromOther = sender ? (sender !== currentUserId && sender !== userId) : true;

      if (isFromOther) {
        triggerNotification({
          title: "New Chat Message",
          body: newMsg.text || "Sent an attachment",
        });
      }

      if (newMsg.chatId === activeChatId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;

          // Deduplicate optimistic messages
          const tempIndex = prev.findIndex(
            (m) =>
              m._id.toString().startsWith("msg_") &&
              m.senderId === newMsg.senderId &&
              m.text === newMsg.text
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMsg;
            return updated;
          }

          return [...prev, newMsg];
        });
      }

      setChats((prev) =>
        prev.map((c) =>
          c._id === newMsg.chatId
            ? {
                ...c,
                lastMessage: newMsg.text || "Sent an attachment",
                lastMessageAt: newMsg.createdAt,
              }
            : c
        )
      );
    };

    // Message Deleted Listener
    const handleMessageDeleted = ({ messageId, chatId }) => {
      if (chatId === activeChatId) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    // Chat Updated Listener
    const handleChatUpdated = ({ chatId, lastMessage, lastMessageAt }) => {
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId ? { ...c, lastMessage, lastMessageAt } : c
        )
      );
    };

    // New Chat Created Listener
    const handleNewChatCreated = (newChat) => {
      if (!newChat) return;

      const isParticipant = newChat.participants?.some((p) => {
        const pId = typeof p === "object" ? (p._id || p.id || p.uid) : p;
        return pId === currentUserId;
      });

      if (isParticipant || !currentUserId) {
        setChats((prev) => {
          if (prev.some((c) => c._id === newChat._id)) return prev;
          return [newChat, ...prev];
        });
      }
    };

    // Typing Listeners
    const handleUserTyping = ({ chatId, userName }) => {
      if (chatId === activeChatId && userName) {
        setTypingUsers((prev) =>
          prev.includes(userName) ? prev : [...prev, userName]
        );
      }
    };

    const handleUserStopTyping = ({ chatId, userName }) => {
      if (chatId === activeChatId && userName) {
        setTypingUsers((prev) => prev.filter((u) => u !== userName));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("chatUpdated", handleChatUpdated);
    socket.on("newChatCreated", handleNewChatCreated);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      if (activeChatId) {
        socket.emit("leaveChat", activeChatId);
      }
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("chatUpdated", handleChatUpdated);
      socket.off("newChatCreated", handleNewChatCreated);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, [activeChatId, currentUserId]);

  // Silent background polling sync fallback (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats(true);
      if (activeChatId) {
        fetchMessages(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchChats, fetchMessages, activeChatId]);

  // START A NEW CHAT (1-on-1, group, collab, channel, copilot)
  const createChat = async ({ participants, chatName, isGroup, chatType }) => {
    const finalParticipants = Array.from(new Set([currentUserId, ...(participants || [])]));
    const type = chatType || (isGroup ? "group" : "direct");
    const name = chatName || (type === "collab" ? "Collab Room" : "Group Chat");

    const newChatObj = {
      _id: "chat_" + Date.now(),
      chatName: name,
      isGroup: isGroup || type === "group" || type === "collab",
      chatType: type,
      participants: finalParticipants,
      lastMessage: "Chat created",
      lastMessageAt: new Date().toISOString(),
      createdBy: currentUserId,
    };

    // Add to state immediately
    setChats((prev) => [newChatObj, ...prev]);

    try {
      const response = await fetch(apiUrl("/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: finalParticipants,
          chatName: name,
          isGroup: isGroup || type === "group" || type === "collab",
          chatType: type,
          createdBy: currentUserId,
        }),
      });

      const result = await response.json();
      if (result?.data?._id) {
        setChats((prev) =>
          prev.map((c) => (c._id === newChatObj._id ? result.data : c))
        );
        return result.data;
      }
    } catch (error) {
      console.log("Created chat locally:", error);
    }

    return newChatObj;
  };

  // SEND A MESSAGE IN THE ACTIVE CHAT
  const sendMessage = async (text, attachments = []) => {
    if (!activeChatId) return;

    const optimisticMsg = {
      _id: "msg_" + Date.now(),
      chatId: activeChatId,
      senderId: currentUserId,
      text,
      attachments,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update messages list & chat preview instantly
    setMessages((prev) => [...prev, optimisticMsg]);
    setChats((prev) =>
      prev.map((c) =>
        c._id === activeChatId
          ? {
              ...c,
              lastMessage: text,
              lastMessageAt: optimisticMsg.createdAt,
            }
          : c
      )
    );

    try {
      const response = await fetch(apiUrl(`/messages/${activeChatId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          text,
          attachments,
        }),
      });

      const result = await response.json();
      if (result?.data?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? result.data : m))
        );
      }
    } catch (error) {
      console.log("Sent message locally:", error);
    }

    return optimisticMsg;
  };

  // DELETE A MESSAGE
  const deleteMessage = async (messageId) => {
    if (!activeChatId) return;

    setMessages((prev) => prev.filter((m) => m._id !== messageId));

    try {
      await fetch(apiUrl(`/messages/${activeChatId}/${messageId}`), {
        method: "DELETE",
      });
    } catch (error) {
      console.log("Deleted message locally:", error);
    }
  };

  // EMIT TYPING EVENTS
  const sendTyping = (userName) => {
    if (activeChatId && socket) {
      socket.emit("typing", { chatId: activeChatId, userName });
    }
  };

  const sendStopTyping = (userName) => {
    if (activeChatId && socket) {
      socket.emit("stopTyping", { chatId: activeChatId, userName });
    }
  };

  return {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    typingUsers,
    fetchChats,
    fetchMessages,
    createChat,
    sendMessage,
    deleteMessage,
    sendTyping,
    sendStopTyping,
  };
}