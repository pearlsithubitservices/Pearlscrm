import { useEffect, useState, useCallback, useRef } from "react";
import { apiUrl } from "../config/api.js";
import { socket } from "../config/socket.js";

export default function useChat(userId, activeChatId) {
  const currentUserId = userId || "admin";

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Unread badge counts per chat room: { [chatId]: count }
  const [unreadCounts, setUnreadCounts] = useState({});
  // In-App Toast Banner state for subtle inside-chat alerts
  const [inAppToast, setInAppToast] = useState(null);

  const knownMsgIdsRef = useRef(new Set());
  const activeChatIdRef = useRef(activeChatId);

  // Always keep activeChatIdRef in sync with latest activeChatId
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // FETCH ALL CHATS FOR THE LOGGED-IN USER
  const fetchChats = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingChats(true);
      const response = await fetch(apiUrl(`/chat?userId=${encodeURIComponent(currentUserId)}`));
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setChats(result.data);
      } else if (!isSilent) {
        setChats([]);
      }
    } catch (error) {
      console.log("Error fetching chats:", error);
      if (!isSilent) setChats([]);
    } finally {
      if (!isSilent) setLoadingChats(false);
    }
  }, [currentUserId]);

  // FETCH MESSAGES FOR THE ACTIVE CHAT
  const fetchMessages = useCallback(async (isSilent = false) => {
    const currentActiveId = activeChatIdRef.current;
    if (!currentActiveId) return;

    try {
      if (!isSilent) setLoadingMessages(true);
      const response = await fetch(apiUrl(`/messages/${currentActiveId}`));
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        const fetched = result.data;

        // Trigger toast for new messages received during background polling
        if (isSilent && knownMsgIdsRef.current.size > 0) {
          fetched.forEach((m) => {
            if (!knownMsgIdsRef.current.has(m._id)) {
              const senderStr = typeof m.senderId === "object"
                ? (m.senderId?._id || m.senderId?.id || m.senderId?.email)
                : m.senderId;

              const isFromOther = senderStr ? (senderStr !== currentUserId && senderStr !== userId) : true;
              if (isFromOther) {
                setInAppToast({
                  senderId: senderStr,
                  text: m.text || "Sent an attachment",
                  chatId: currentActiveId,
                  timestamp: Date.now(),
                });
              }
            }
          });
        }

        fetched.forEach((m) => knownMsgIdsRef.current.add(m._id));
        setMessages((prev) => {
          const pendingOptimistic = prev.filter(
            (m) =>
              typeof m._id === "string" &&
              m._id.startsWith("msg_") &&
              !fetched.some(
                (f) =>
                  String(f.senderId) === String(m.senderId) &&
                  ((f.text && f.text === m.text) || (f.attachments?.length > 0 && m.attachments?.length > 0))
              )
          );
          return [...fetched, ...pendingOptimistic];
        });
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  }, [currentUserId, userId]);

  useEffect(() => {
    fetchChats(false);
  }, [fetchChats]);

  useEffect(() => {
    knownMsgIdsRef.current.clear();
    fetchMessages(false);
  }, [activeChatId, fetchMessages]);

  // Clear unread count for active chat when opened
  useEffect(() => {
    if (activeChatId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeChatId]: 0,
      }));
    }
  }, [activeChatId]);

  // SOCKET ROOM JOIN / LEAVE AND LISTENERS
  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    if (currentUserId) {
      socket.emit("joinUser", currentUserId);
    }

    if (activeChatId) {
      socket.emit("joinChat", activeChatId);
    }

    // New Message Listener
    const handleNewMessage = (newMsg) => {
      if (!newMsg) return;

      const senderStr = typeof newMsg.senderId === "object"
        ? (newMsg.senderId?._id || newMsg.senderId?.id || newMsg.senderId?.email)
        : newMsg.senderId;

      const isFromOther = senderStr ? (senderStr !== currentUserId && senderStr !== userId) : true;

      const incomingChatId = typeof newMsg.chatId === "object"
        ? (newMsg.chatId?._id || newMsg.chatId?.id)
        : newMsg.chatId;

      const currentActiveId = typeof activeChatIdRef.current === "object"
        ? (activeChatIdRef.current?._id || activeChatIdRef.current?.id)
        : activeChatIdRef.current;

      const isCurrentActiveRoom = Boolean(
        incomingChatId &&
        currentActiveId &&
        String(incomingChatId) === String(currentActiveId)
      );

      // Track known message ID
      if (newMsg._id) {
        knownMsgIdsRef.current.add(newMsg._id);
      }

      // If message is from another user, trigger unread badge & toast banner
      if (isFromOther) {
        if (!isCurrentActiveRoom) {
          setUnreadCounts((prev) => ({
            ...prev,
            [incomingChatId]: (prev[incomingChatId] || 0) + 1,
          }));
        }

        setInAppToast({
          senderId: senderStr,
          text: newMsg.text || "Sent an attachment",
          chatId: incomingChatId,
          timestamp: Date.now(),
        });
      }

      // If active chat matches incoming message, append immediately to messages state
      if (isCurrentActiveRoom) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;

          const tempIndex = prev.findIndex(
            (m) =>
              typeof m._id === "string" &&
              m._id.startsWith("msg_") &&
              ((newMsg.text && m.text === newMsg.text) || (m.attachments?.length > 0 && newMsg.attachments?.length > 0))
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMsg;
            return updated;
          }

          return [...prev, newMsg];
        });
      }

      // Update chat room preview list in real time
      setChats((prev) => {
        const exists = prev.some((c) => String(c._id) === String(incomingChatId));
        if (exists) {
          return prev.map((c) =>
            String(c._id) === String(incomingChatId)
              ? {
                  ...c,
                  lastMessage: newMsg.text || "Sent an attachment",
                  lastMessageAt: newMsg.createdAt || new Date().toISOString(),
                }
              : c
          );
        } else {
          fetchChats(true);
          return prev;
        }
      });
    };

    const handleMessageDeleted = ({ messageId, chatId }) => {
      const currentActiveId = activeChatIdRef.current;
      if (String(chatId) === String(currentActiveId)) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    const handleMessageEdited = (editedMsg) => {
      if (!editedMsg) return;
      const currentActiveId = activeChatIdRef.current;
      if (String(editedMsg.chatId) === String(currentActiveId)) {
        setMessages((prev) =>
          prev.map((m) => (m._id === editedMsg._id ? editedMsg : m))
        );
      }
    };

    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((c) => String(c._id) !== String(chatId)));
    };

    const handleChatUpdated = ({ chatId, lastMessage, lastMessageAt }) => {
      setChats((prev) =>
        prev.map((c) =>
          String(c._id) === String(chatId) ? { ...c, lastMessage, lastMessageAt } : c
        )
      );
    };

    const handleNewChatCreated = (newChat) => {
      if (!newChat) return;
      fetchChats(true);
    };

    const handleUserTyping = ({ chatId, userName }) => {
      const currentActiveId = activeChatIdRef.current;
      if (String(chatId) === String(currentActiveId) && userName) {
        setTypingUsers((prev) =>
          prev.includes(userName) ? prev : [...prev, userName]
        );
      }
    };

    const handleUserStopTyping = ({ chatId, userName }) => {
      const currentActiveId = activeChatIdRef.current;
      if (String(chatId) === String(currentActiveId) && userName) {
        setTypingUsers((prev) => prev.filter((u) => u !== userName));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("chatDeleted", handleChatDeleted);
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
      socket.off("messageEdited", handleMessageEdited);
      socket.off("chatDeleted", handleChatDeleted);
      socket.off("chatUpdated", handleChatUpdated);
      socket.off("newChatCreated", handleNewChatCreated);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, [activeChatId, currentUserId, fetchChats, userId]);

  // Silent background polling sync fallback (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats(true);
      if (activeChatIdRef.current) {
        fetchMessages(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchChats, fetchMessages]);

  const clearUnread = (chatId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [chatId]: 0,
    }));
  };

  const dismissToast = () => setInAppToast(null);

  const createChat = async ({ participants, chatName, isGroup, chatType, taskId }) => {
    const finalParticipants = Array.from(new Set([currentUserId, ...(participants || [])]));
    const type = chatType || (isGroup ? "group" : "direct");
    const name = chatName || (type === "collab" ? "Collab Room" : type === "task" ? "Task Chat" : "Group Chat");

    const newChatObj = {
      _id: "chat_" + Date.now(),
      chatName: name,
      isGroup: isGroup || type === "group" || type === "collab" || type === "task",
      chatType: type,
      taskId: taskId || null,
      participants: finalParticipants,
      lastMessage: "Chat created",
      lastMessageAt: new Date().toISOString(),
      createdBy: currentUserId,
    };

    setChats((prev) => [newChatObj, ...prev]);

    try {
      const response = await fetch(apiUrl("/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: finalParticipants,
          chatName: name,
          isGroup: isGroup || type === "group" || type === "collab" || type === "task",
          chatType: type,
          taskId: taskId || null,
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

  const deleteChat = async (chatIdToDelete) => {
    const idToDelete = chatIdToDelete || activeChatIdRef.current;
    if (!idToDelete) return;

    setChats((prev) => prev.filter((c) => String(c._id) !== String(idToDelete)));

    try {
      await fetch(apiUrl(`/chat/${idToDelete}`), {
        method: "DELETE",
      });
    } catch (error) {
      console.log("Deleted chat error:", error);
    }
  };

  const sendMessage = async (text, attachments = []) => {
    const currentActiveId = activeChatIdRef.current;
    if (!currentActiveId) return;

    const optimisticMsg = {
      _id: "msg_" + Date.now(),
      chatId: currentActiveId,
      senderId: currentUserId,
      text,
      attachments,
      createdAt: new Date().toISOString(),
    };

    knownMsgIdsRef.current.add(optimisticMsg._id);
    setMessages((prev) => [...prev, optimisticMsg]);
    setChats((prev) =>
      prev.map((c) =>
        String(c._id) === String(currentActiveId)
          ? {
              ...c,
              lastMessage: text,
              lastMessageAt: optimisticMsg.createdAt,
            }
          : c
      )
    );

    try {
      const response = await fetch(apiUrl(`/messages/${currentActiveId}`), {
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
        knownMsgIdsRef.current.add(result.data._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? result.data : m))
        );
      }
    } catch (error) {
      console.log("Sent message locally:", error);
    }

    return optimisticMsg;
  };

  const editMessage = async (messageId, newText) => {
    const currentActiveId = activeChatIdRef.current;
    if (!currentActiveId || !messageId || !newText.trim()) return;

    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId ? { ...m, text: newText.trim(), isEdited: true } : m
      )
    );

    try {
      await fetch(apiUrl(`/messages/${currentActiveId}/${messageId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText.trim() }),
      });
    } catch (error) {
      console.log("Edited message error:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    const currentActiveId = activeChatIdRef.current;
    if (!currentActiveId) return;

    setMessages((prev) => prev.filter((m) => m._id !== messageId));

    try {
      await fetch(apiUrl(`/messages/${currentActiveId}/${messageId}`), {
        method: "DELETE",
      });
    } catch (error) {
      console.log("Deleted message locally:", error);
    }
  };

  const sendTyping = (userName) => {
    const currentActiveId = activeChatIdRef.current;
    if (currentActiveId && socket) {
      socket.emit("typing", { chatId: currentActiveId, userName });
    }
  };

  const sendStopTyping = (userName) => {
    const currentActiveId = activeChatIdRef.current;
    if (currentActiveId && socket) {
      socket.emit("stopTyping", { chatId: currentActiveId, userName });
    }
  };

  const getOrCreateTaskChat = async (taskId, taskTitle) => {
    if (!taskId) return null;
    try {
      const response = await fetch(apiUrl(`/chat/task/${taskId}?userId=${encodeURIComponent(currentUserId)}&taskTitle=${encodeURIComponent(taskTitle || "")}`));
      const result = await response.json();
      if (result?.data?._id) {
        setChats((prev) => {
          if (prev.some((c) => String(c._id) === String(result.data._id))) {
            return prev.map((c) => (String(c._id) === String(result.data._id) ? result.data : c));
          }
          return [result.data, ...prev];
        });
        return result.data;
      }
    } catch (error) {
      console.log("Error in getOrCreateTaskChat:", error);
    }
    return null;
  };

  const addParticipantToChat = async (chatId, newParticipantId) => {
    try {
      const response = await fetch(apiUrl(`/chat/${chatId}/participants`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newParticipantId }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setChats((prev) =>
          prev.map((c) => (String(c._id) === String(chatId) ? result.data : c))
        );
        return result.data;
      }
    } catch (err) {
      console.log("addParticipantToChat error:", err);
    }
    return null;
  };

  return {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    typingUsers,
    unreadCounts,
    inAppToast,
    clearUnread,
    dismissToast,
    fetchChats,
    fetchMessages,
    createChat,
    deleteChat,
    addParticipantToChat,
    getOrCreateTaskChat,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    sendStopTyping,
  };
}