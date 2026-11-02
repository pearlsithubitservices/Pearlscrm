import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { apiUrl, BASE_URL } from "../config/api.js";

const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, "");

const getErrorMessage = (result, fallback) => result?.message || fallback;

export default function useTeamChat(userId, activeChatId) {
  const [employees, setEmployees] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesChatId, setMessagesChatId] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());
  const [typingUsers, setTypingUsers] = useState([]);
  const [lastNotification, setLastNotification] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const callSignalHandlerRef = useRef(null);
  const receivedMessageIdsRef = useRef(new Set());
  const selectedChatId = activeChatId || chats[0]?._id || null;
  const activeChatIdRef = useRef(selectedChatId);

  useEffect(() => {
    activeChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please sign in to use team messaging.");

    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success === false) {
      throw new Error(getErrorMessage(result, "Team messaging request failed."));
    }
    return result?.data;
  }, []);

  const startLoadingMessages = useCallback(() => setLoadingMessages(true), []);

  const fetchDirectory = useCallback(async () => {
    try {
      const directory = await request("/team-chat/directory");
      setEmployees(Array.isArray(directory) ? directory : []);
      setError("");
    } catch (fetchError) {
      console.error("Team chat directory request failed:", fetchError);
      setError(fetchError.message);
    } finally {
      setLoadingEmployees(false);
    }
  }, [request]);

  const fetchChats = useCallback(async () => {
    try {
      const conversations = await request("/team-chat/conversations");
      setChats(Array.isArray(conversations) ? conversations : []);
      setError("");
    } catch (fetchError) {
      console.error("Team chat conversation request failed:", fetchError);
      setError(fetchError.message);
    } finally {
      setLoadingChats(false);
    }
  }, [request]);

  const markRead = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      const result = await request(`/team-chat/conversations/${chatId}/read`, { method: "POST" });
      const readIds = new Set(result?.messageIds || []);
      if (readIds.size) {
        setMessages((current) =>
          current.map((message) =>
            readIds.has(String(message._id))
              ? { ...message, readBy: [...new Set([...(message.readBy || []), String(userId)])] }
              : message,
          ),
        );
      }
      setChats((current) =>
        current.map((chat) => String(chat._id) === String(chatId) ? { ...chat, unreadCount: 0 } : chat),
      );
      return Array.from(readIds);
    } catch (readError) {
      console.error("Team chat read receipt request failed:", readError);
      setError(readError.message);
    }
  }, [request, userId]);

  const syncConversation = useCallback(async (chatId) => {
    try {
      const history = await request(`/team-chat/conversations/${chatId}/messages`);
      const readIds = new Set(await markRead(chatId));
      setMessages(
        (Array.isArray(history) ? history : []).map((message) =>
          readIds.has(String(message._id))
            ? { ...message, readBy: [...new Set([...(message.readBy || []), String(userId)])] }
            : message,
        ),
      );
      setMessagesChatId(String(chatId));
      setTypingUsers([]);
      setError("");
    } catch (syncError) {
      console.error("Team chat conversation synchronization failed:", syncError);
      setMessages([]);
      setMessagesChatId(String(chatId));
      setError(syncError.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [markRead, request, userId]);

  useEffect(() => {
    let mounted = true;
    const loadDirectory = request("/team-chat/directory")
      .then((directory) => {
        if (mounted) {
          setEmployees(Array.isArray(directory) ? directory : []);
          setError("");
        }
      })
      .catch((fetchError) => {
        console.error("Team chat directory request failed:", fetchError);
        if (mounted) setError(fetchError.message);
      })
      .finally(() => {
        if (mounted) setLoadingEmployees(false);
      });
    const loadChats = request("/team-chat/conversations")
      .then((conversations) => {
        if (mounted) {
          setChats(Array.isArray(conversations) ? conversations : []);
          setError("");
        }
      })
      .catch((fetchError) => {
        console.error("Team chat conversation request failed:", fetchError);
        if (mounted) setError(fetchError.message);
      })
      .finally(() => {
        if (mounted) setLoadingChats(false);
      });
    void Promise.all([loadDirectory, loadChats]);
    return () => {
      mounted = false;
    };
  }, [request, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return undefined;

    const socket = io(`${SOCKET_URL}/team-chat`, {
      autoConnect: false,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    const handlePresenceSnapshot = (ids) => setOnlineUserIds(new Set(ids.map(String)));
    const handlePresenceUpdate = ({ userId: changedUserId, isOnline }) => {
      setOnlineUserIds((current) => {
        const next = new Set(current);
        if (isOnline) next.add(String(changedUserId));
        else next.delete(String(changedUserId));
        return next;
      });
    };
    const handleDisconnect = () => setOnlineUserIds(new Set());
    const handleNewMessage = (message) => {
      if (!message) return;
      const chatId = String(message.chatId);
      const messageSender = String(message.senderId);
      const messageId = String(message._id || "");
      if (messageId && receivedMessageIdsRef.current.has(messageId)) return;
      if (messageId) {
        receivedMessageIdsRef.current.add(messageId);
        if (receivedMessageIdsRef.current.size > 1000) {
          receivedMessageIdsRef.current.delete(receivedMessageIdsRef.current.values().next().value);
        }
      }
      const isActive = String(activeChatIdRef.current) === chatId;

      setMessages((current) => {
        if (current.some((item) => String(item._id) === String(message._id))) return current;
        const optimisticIndex = current.findIndex(
          (item) =>
            String(item.senderId) === messageSender &&
            item._id?.startsWith("local_") &&
            item.text === message.text,
        );
        if (optimisticIndex >= 0) {
          const next = [...current];
          next[optimisticIndex] = message;
          return next;
        }
        return isActive ? [...current, message] : current;
      });
      setChats((current) =>
        current.map((chat) =>
          String(chat._id) === chatId
            ? {
                ...chat,
                lastMessage: message.text,
                lastMessageAt: message.createdAt,
                unreadCount:
                  !isActive && messageSender !== String(userId)
                    ? Number(chat.unreadCount || 0) + 1
                    : chat.unreadCount,
              }
            : chat,
        ),
      );
      if (isActive && messageSender !== String(userId)) markRead(chatId);
      if (!isActive && messageSender !== String(userId)) {
        setLastNotification({
          chatId,
          senderName: "New message",
          text: message.text || "You received a message",
        });
        fetchChats();
      }
    };
    const handleTyping = ({ chatId, userId: senderId, name, isTyping }) => {
      if (String(chatId) !== String(activeChatIdRef.current) || String(senderId) === String(userId)) return;
      setTypingUsers((current) => {
        const withoutSender = current.filter((item) => item.userId !== String(senderId));
        return isTyping ? [...withoutSender, { userId: String(senderId), name }] : withoutSender;
      });
    };
    const handleReadReceipt = ({ chatId, userId: readerId, messageIds }) => {
      if (String(chatId) !== String(activeChatIdRef.current)) return;
      const readIds = new Set((messageIds || []).map(String));
      setMessages((current) =>
        current.map((message) =>
          readIds.has(String(message._id))
            ? { ...message, readBy: [...new Set([...(message.readBy || []), String(readerId)])] }
            : message,
        ),
      );
    };
    const handleCallSignal = async (signal, acknowledge) => {
      try {
        if (!callSignalHandlerRef.current) {
          throw new Error("WebMail is not ready to receive calls.");
        }
        await callSignalHandlerRef.current(signal);
        if (typeof acknowledge === "function") acknowledge({ success: true });
      } catch (signalError) {
        console.error("WebMail call signal handler failed:", signalError);
        if (typeof acknowledge === "function") {
          acknowledge({ success: false, message: signalError.message });
        }
      }
    };
    const handleNewConversation = () => fetchChats();
    const handleConnect = () => {
      setError("");
      fetchDirectory();
      fetchChats();
      const chatId = activeChatIdRef.current;
      if (chatId) {
        socket.emit("chat:join", String(chatId), (result) => {
          if (result?.success) syncConversation(String(chatId));
          else setError(result?.message || "Unable to reconnect to this conversation.");
        });
      }
    };
    const handleSocketError = (socketError) => {
      console.error("Team chat socket connection failed:", socketError);
      setError(socketError.message || "Real-time connection unavailable. Reconnecting...");
    };
    const handleChatError = (socketError) => {
      setError(socketError?.message || "Unable to access this conversation.");
    };

    socket.on("presence:snapshot", handlePresenceSnapshot);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTyping);
    socket.on("message:read", handleReadReceipt);
    socket.on("call:signal", handleCallSignal);
    socket.on("conversation:new", handleNewConversation);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleSocketError);
    socket.on("chat:error", handleChatError);
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchChats, fetchDirectory, markRead, syncConversation, userId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!selectedChatId) return;
    const chatId = String(selectedChatId);
    let mounted = true;
    socket.emit("chat:join", chatId, (result) => {
      if (result?.success) syncConversation(chatId);
      else if (mounted) {
        setLoadingMessages(false);
        setError(result?.message || "Unable to access this conversation.");
      }
    });
    return () => {
      mounted = false;
      socket.emit("chat:leave", chatId);
    };
  }, [selectedChatId, syncConversation]);

  const createChat = useCallback(async ({ participantIds, name, isGroup }) => {
    const chat = await request("/team-chat/conversations", {
      method: "POST",
      body: JSON.stringify({ participantIds, name, isGroup }),
    });
    await fetchChats();
    return chat;
  }, [fetchChats, request]);

  const sendMessage = useCallback(async (text) => {
    const chatId = activeChatIdRef.current;
    if (!chatId) return;
    const optimistic = {
      _id: `local_${Date.now()}`,
      chatId,
      senderId: String(userId),
      text,
      readBy: [String(userId)],
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    try {
      const message = await request(`/team-chat/conversations/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setMessages((current) =>
        current.map((item) => item._id === optimistic._id ? message : item),
      );
      return message;
    } catch (sendError) {
      setMessages((current) => current.filter((item) => item._id !== optimistic._id));
      setError(sendError.message);
      throw sendError;
    }
  }, [request, userId]);

  const sendTyping = useCallback((isTyping) => {
    if (activeChatIdRef.current) {
      socketRef.current?.emit("typing:update", {
        chatId: String(activeChatIdRef.current),
        isTyping,
      });
    }
  }, []);

  const sendCallSignal = useCallback((signal) => {
    socketRef.current?.emit("call:signal", signal);
  }, []);

  const requestCallSignal = useCallback((signal) => new Promise((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      reject(new Error("The real-time connection is unavailable. Reopen WebMail and try again."));
      return;
    }

    socket.timeout(10000).emit("call:signal", signal, (timeoutError, result) => {
      if (timeoutError) {
        reject(new Error("Call signaling timed out. Check that the CRM server has been restarted and deployed."));
      } else if (!result?.success) {
        reject(new Error(result?.message || "The call could not be delivered."));
      } else {
        resolve();
      }
    });
  }), []);

  const subscribeCallSignals = useCallback((handler) => {
    callSignalHandlerRef.current = handler;
    return () => {
      if (callSignalHandlerRef.current === handler) callSignalHandlerRef.current = null;
    };
  }, []);

  const unreadCounts = Object.fromEntries(chats.map((chat) => [chat._id, Number(chat.unreadCount || 0)]));

  return {
    employees,
    chats,
    messages: String(selectedChatId || "") === messagesChatId ? messages : [],
    selectedChatId,
    onlineUserIds,
    typingUsers,
    unreadCounts,
    lastNotification,
    loadingEmployees,
    loadingChats,
    loadingMessages,
    error,
    createChat,
    sendMessage,
    sendTyping,
    sendCallSignal,
    requestCallSignal,
    subscribeCallSignals,
    startLoadingMessages,
    fetchChats,
    fetchDirectory,
  };
}
