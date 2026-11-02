import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCheck, MessageCircleMore, Phone, PhoneOff, Search, SendHorizontal, Users, Video } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import useTeamChat from "../Hooks/teamChat.js";

const formatTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getEmployeeDisplay = (employee) => {
  if (!employee) return "Unknown employee";
  return employee.name || employee.employeeName || employee.displayName || "Employee";
};

const getMediaAccessError = (error, mediaType) => {
  const mediaLabel = mediaType === "video" ? "microphone and camera" : "microphone";
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Your browser cannot access media here. Open the CRM over HTTPS (or localhost) and try again.";
  }

  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return `Allow this site to use your ${mediaLabel} in the browser, then try again.`;
    case "NotFoundError":
      return `No ${mediaLabel} device was found. Connect or enable it and try again.`;
    case "NotReadableError":
      return `Your ${mediaLabel} is busy or blocked by the operating system. Close other apps using it, then try again.`;
    case "OverconstrainedError":
      return `Your ${mediaLabel} does not support the settings required for this call.`;
    case "AbortError":
      return `The browser could not start your ${mediaLabel}. Check device permissions and try again.`;
    default:
      return error?.message
        ? `Could not access your ${mediaLabel}: ${error.message}`
        : `Could not access your ${mediaLabel}. Check browser permissions and try again.`;
  }
};

export default function WebMail() {
  const { user } = useAuth();
  const currentUserId = String(user?._id || user?.id || user?.uid || "");
  const currentUserName = user?.displayName || user?.name || user?.employeeName || "You";

  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedEmployeeQuery, setSelectedEmployeeQuery] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const typingTimeoutRef = useRef(null);
  const callRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const pendingLocalIceCandidatesRef = useRef([]);
  const iceSignalReadyCallIdRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringtoneContextRef = useRef(null);
  const ringtoneTimerRef = useRef(null);
  const ringtoneOscillatorsRef = useRef(new Set());

  const {
    employees,
    chats,
    messages,
    selectedChatId,
    onlineUserIds,
    lastNotification,
    error,
    loadingEmployees,
    loadingChats,
    loadingMessages,
    typingUsers,
    unreadCounts,
    createChat,
    sendMessage,
    sendTyping,
    sendCallSignal,
    requestCallSignal,
    subscribeCallSignals,
    startLoadingMessages,
  } = useTeamChat(currentUserId, activeChatId);

  useEffect(() => {
    if (lastNotification) {
      toast(`${lastNotification.senderName}: ${lastNotification.text}`);
    }
  }, [lastNotification]);

  const employeeMap = useMemo(() => {
    const map = new Map();
    for (const employee of employees || []) {
      const key = String(employee?._id || employee?.id || employee?.uid || employee?.email || "");
      if (key) map.set(key.toLowerCase(), employee);
    }
    return map;
  }, [employees]);

  const conversationList = useMemo(
    () => [...(chats || [])].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0)),
    [chats],
  );

  const filteredEmployees = useMemo(() => {
    const query = selectedEmployeeQuery.trim().toLowerCase();
    return (employees || []).filter((employee) => {
      const id = employee?._id || employee?.id || employee?.uid;
      if (String(id) === String(currentUserId)) return false;
      if (!query) return true;

      const haystack = [
        employee?.name,
        employee?.employeeName,
        employee?.department,
        employee?.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [employees, currentUserId, selectedEmployeeQuery]);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const getChatTitle = (chat) => {
    if (!chat) return "Select a conversation";
    if (chat.isGroup || chat.chatType === "group") {
      return chat.chatName || "Team group";
    }

    const participant = (chat.participants || []).find((member) => String(member) !== String(currentUserId));
    if (!participant) return "Direct message";

    const employee = employeeMap.get(String(participant).toLowerCase());
    if (employee) {
      return getEmployeeDisplay(employee);
    }

    return String(participant);
  };

  const getChatSubtitle = (chat) => {
    if (!chat) return "";
    if (chat.isGroup || chat.chatType === "group") {
      return `${(chat.participants || []).length} members`;
    }

    const peer = (chat.participants || []).find((member) => String(member) !== String(currentUserId));
    const employee = employeeMap.get(String(peer || "").toLowerCase());
    if (!employee) return "Direct message";
    return `${onlineUserIds.has(String(peer)) ? "Online" : "Offline"} · ${employee.department || employee.role || "Employee"}`;
  };

  const activeChat = useMemo(
    () => (conversationList || []).find((chat) => String(chat._id) === String(selectedChatId)) || null,
    [selectedChatId, conversationList],
  );
  const activePeerId = (activeChat?.participants || []).find((member) => String(member) !== String(currentUserId));
  const isDirectChat = Boolean(activeChat && !activeChat.isGroup && activeChat.chatType === "direct");

  const updateCall = useCallback((nextCall) => {
    callRef.current = nextCall;
    setCall(nextCall);
  }, []);

  const unlockRingtoneAudio = useCallback(() => {
    if (!window.AudioContext) return null;
    if (!ringtoneContextRef.current || ringtoneContextRef.current.state === "closed") {
      ringtoneContextRef.current = new window.AudioContext();
    }
    const context = ringtoneContextRef.current;
    if (context.state === "suspended") {
      context.resume().catch((error) => {
        console.warn("Unable to enable the WebMail ringtone:", error);
      });
    }
    return context;
  }, []);

  const stopRingtone = useCallback(() => {
    window.clearInterval(ringtoneTimerRef.current);
    ringtoneTimerRef.current = null;
    for (const oscillator of ringtoneOscillatorsRef.current) {
      try {
        oscillator.stop();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.warn("Unable to stop WebMail ringtone:", error);
        }
      }
    }
    ringtoneOscillatorsRef.current.clear();
    if ("vibrate" in navigator) navigator.vibrate(0);
  }, []);

  const ringOnce = useCallback(() => {
    const context = unlockRingtoneAudio();
    if (!context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    volume.gain.setValueAtTime(0, now);
    volume.gain.linearRampToValueAtTime(0.18, now + 0.04);
    volume.gain.setValueAtTime(0.18, now + 0.22);
    volume.gain.linearRampToValueAtTime(0, now + 0.28);
    volume.gain.setValueAtTime(0, now + 0.42);
    volume.gain.linearRampToValueAtTime(0.18, now + 0.46);
    volume.gain.setValueAtTime(0.18, now + 0.64);
    volume.gain.linearRampToValueAtTime(0, now + 0.7);
    oscillator.connect(volume);
    volume.connect(context.destination);
    ringtoneOscillatorsRef.current.add(oscillator);
    oscillator.onended = () => ringtoneOscillatorsRef.current.delete(oscillator);
    oscillator.start(now);
    oscillator.stop(now + 0.72);
    if ("vibrate" in navigator) navigator.vibrate([250, 150, 250]);
  }, [unlockRingtoneAudio]);

  useEffect(() => {
    const unlock = () => {
      const context = unlockRingtoneAudio();
      if (context?.state === "running") {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      stopRingtone();
      ringtoneContextRef.current?.close().catch((error) => {
        console.warn("Unable to close WebMail ringtone audio:", error);
      });
    };
  }, [stopRingtone, unlockRingtoneAudio]);

  useEffect(() => {
    stopRingtone();
    if (call?.status !== "incoming") return undefined;
    ringOnce();
    ringtoneTimerRef.current = window.setInterval(ringOnce, 2200);
    return stopRingtone;
  }, [call?.callId, call?.status, ringOnce, stopRingtone]);

  const releaseCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    pendingLocalIceCandidatesRef.current = [];
    iceSignalReadyCallIdRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    updateCall(null);
  }, [updateCall]);

  const createPeerConnection = useCallback((callInfo) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peerConnectionRef.current = peerConnection;

    localStreamRef.current?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && callRef.current?.callId === callInfo.callId) {
        if (iceSignalReadyCallIdRef.current !== callInfo.callId) {
          pendingLocalIceCandidatesRef.current.push(event.candidate.toJSON());
        } else {
          sendCallSignal({
            chatId: callInfo.chatId,
            targetUserId: callInfo.peerId,
            callId: callInfo.callId,
            kind: "ice",
            data: event.candidate.toJSON(),
          });
        }
      }
    };
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) setRemoteStream(stream);
    };
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "connected" && callRef.current?.callId === callInfo.callId) {
        updateCall({ ...callRef.current, status: "connected" });
      } else if (
        peerConnection.connectionState === "failed" &&
        callRef.current?.callId === callInfo.callId
      ) {
        toast.error("The call could not connect through this network. A TURN relay server may be required.");
        releaseCall();
      }
    };
    return peerConnection;
  }, [releaseCall, sendCallSignal, updateCall]);

  const handleCallSignal = useCallback(async (signal) => {
    if (!signal?.callId || !signal.chatId || !signal.fromUserId) return;

    if (signal.kind === "offer") {
      if (callRef.current) {
        sendCallSignal({
          chatId: signal.chatId,
          targetUserId: signal.fromUserId,
          callId: signal.callId,
          kind: "reject",
        });
        return;
      }
      const incomingCall = {
        callId: signal.callId,
        chatId: signal.chatId,
        peerId: signal.fromUserId,
        type: signal.data?.type === "video" ? "video" : "audio",
        status: "incoming",
        offer: signal.data?.description,
      };
      updateCall(incomingCall);
      return;
    }

    const currentCall = callRef.current;
    if (!currentCall || currentCall.callId !== signal.callId || currentCall.peerId !== signal.fromUserId) return;

    if (signal.kind === "answer" && peerConnectionRef.current && currentCall.status === "calling") {
      await peerConnectionRef.current.setRemoteDescription(signal.data?.description);
      for (const candidate of pendingIceCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
      pendingIceCandidatesRef.current = [];
      updateCall({ ...currentCall, status: "connecting" });
    } else if (signal.kind === "ice" && signal.data) {
      const candidate = new RTCIceCandidate(signal.data);
      if (peerConnectionRef.current?.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    } else if (signal.kind === "reject") {
      toast("The call was declined.");
      releaseCall();
    } else if (signal.kind === "end") {
      releaseCall();
    }
  }, [releaseCall, sendCallSignal, updateCall]);

  useEffect(
    () => subscribeCallSignals((signal) => {
      return handleCallSignal(signal).catch((error) => {
        console.error("Webmail call signaling failed:", error);
        toast.error("Unable to connect the call.");
        releaseCall();
        throw error;
      });
    }),
    [handleCallSignal, releaseCall, subscribeCallSignals],
  );

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream, call]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, call]);

  useEffect(() => {
    if (call?.status !== "calling") return undefined;
    const timeout = window.setTimeout(() => {
      if (callRef.current?.callId !== call.callId) return;
      sendCallSignal({
        chatId: call.chatId,
        targetUserId: call.peerId,
        callId: call.callId,
        kind: "end",
      });
      releaseCall();
      toast("No answer. The call was ended.");
    }, 45_000);
    return () => window.clearTimeout(timeout);
  }, [call?.callId, call?.chatId, call?.peerId, call?.status, releaseCall, sendCallSignal]);

  useEffect(() => {
    if (call?.status !== "connecting") return undefined;
    const timeout = window.setTimeout(() => {
      if (callRef.current?.callId !== call.callId) return;
      sendCallSignal({
        chatId: call.chatId,
        targetUserId: call.peerId,
        callId: call.callId,
        kind: "end",
      });
      releaseCall();
      toast.error("The other person answered, but the media connection failed. Your network may require a TURN relay server.");
    }, 25_000);
    return () => window.clearTimeout(timeout);
  }, [call?.callId, call?.chatId, call?.peerId, call?.status, releaseCall, sendCallSignal]);

  useEffect(() => () => releaseCall(), [releaseCall]);

  const startCall = async (type) => {
    if (!isDirectChat || !activePeerId || !onlineUserIds.has(String(activePeerId))) {
      toast.error("The other team member must be online to receive a call.");
      return;
    }
    if (callRef.current) {
      toast.error("Finish your current call before starting another.");
      return;
    }

    const callInfo = {
      callId: crypto.randomUUID(),
      chatId: String(activeChat._id),
      peerId: String(activePeerId),
      type,
      status: "calling",
    };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
    } catch (error) {
      console.error("Webmail call media access failed:", error);
      toast.error(getMediaAccessError(error, type));
      return;
    }

    try {
      localStreamRef.current = stream;
      setLocalStream(stream);
      updateCall(callInfo);
      const peerConnection = createPeerConnection(callInfo);
      const description = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(description);
      await requestCallSignal({
        chatId: callInfo.chatId,
        targetUserId: callInfo.peerId,
        callId: callInfo.callId,
        kind: "offer",
        data: { type, description: peerConnection.localDescription },
      });
      iceSignalReadyCallIdRef.current = callInfo.callId;
      for (const candidate of pendingLocalIceCandidatesRef.current) {
        sendCallSignal({
          chatId: callInfo.chatId,
          targetUserId: callInfo.peerId,
          callId: callInfo.callId,
          kind: "ice",
          data: candidate,
        });
      }
      pendingLocalIceCandidatesRef.current = [];
    } catch (error) {
      console.error("Unable to start webmail call:", error);
      releaseCall();
      toast.error(error.message || "The call could not be delivered. Check your real-time connection and try again.");
    }
  };

  const acceptCall = async () => {
    const incomingCall = callRef.current;
    if (!incomingCall || incomingCall.status !== "incoming") return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === "video",
      });
    } catch (error) {
      console.error("Unable to access media to answer webmail call:", error);
      sendCallSignal({
        chatId: incomingCall.chatId,
        targetUserId: incomingCall.peerId,
        callId: incomingCall.callId,
        kind: "reject",
      });
      releaseCall();
      toast.error(getMediaAccessError(error, incomingCall.type));
      return;
    }

    try {
      localStreamRef.current = stream;
      setLocalStream(stream);
      const peerConnection = createPeerConnection(incomingCall);
      await peerConnection.setRemoteDescription(incomingCall.offer);
      for (const candidate of pendingIceCandidatesRef.current) {
        await peerConnection.addIceCandidate(candidate);
      }
      pendingIceCandidatesRef.current = [];
      const description = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(description);
      updateCall({ ...incomingCall, status: "connecting" });
      await requestCallSignal({
        chatId: incomingCall.chatId,
        targetUserId: incomingCall.peerId,
        callId: incomingCall.callId,
        kind: "answer",
        data: { description: peerConnection.localDescription },
      });
      iceSignalReadyCallIdRef.current = incomingCall.callId;
      for (const candidate of pendingLocalIceCandidatesRef.current) {
        sendCallSignal({
          chatId: incomingCall.chatId,
          targetUserId: incomingCall.peerId,
          callId: incomingCall.callId,
          kind: "ice",
          data: candidate,
        });
      }
      pendingLocalIceCandidatesRef.current = [];
    } catch (error) {
      console.error("Unable to accept webmail call:", error);
      sendCallSignal({
        chatId: incomingCall.chatId,
        targetUserId: incomingCall.peerId,
        callId: incomingCall.callId,
        kind: "reject",
      });
      releaseCall();
      toast.error(error.message || "Unable to answer the call. Check your real-time connection and try again.");
    }
  };

  const endCall = () => {
    const currentCall = callRef.current;
    if (currentCall) {
      sendCallSignal({
        chatId: currentCall.chatId,
        targetUserId: currentCall.peerId,
        callId: currentCall.callId,
        kind: currentCall.status === "incoming" ? "reject" : "end",
      });
    }
    releaseCall();
  };

  const openChat = (chatId) => {
    startLoadingMessages();
    setActiveChatId(chatId);
  };

  const handleOpenDirectChat = async (employeeId) => {
    if (!employeeId) return;

    const existingChat = (conversationList || []).find((chat) => {
      if (chat.isGroup || chat.chatType === "group") return false;
      const participants = chat.participants || [];
      return participants.includes(String(currentUserId)) && participants.includes(String(employeeId));
    });

    if (existingChat) {
      openChat(existingChat._id);
      return;
    }

    try {
      const chat = await createChat({
        participantIds: [String(employeeId)],
        isGroup: false,
      });

      if (chat?._id) {
        openChat(chat._id);
        setSelectedEmployeeQuery("");
      }
    } catch (error) {
      toast.error(error.message || "Unable to start direct chat.");
    }
  };

  const toggleGroupMember = (employeeId) => {
    setSelectedGroupMembers((current) => {
      const next = current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId];
      return next;
    });
  };

  const handleCreateGroup = async () => {
    if (selectedGroupMembers.length < 2) {
      toast.error("Select at least two team members for the group.");
      return;
    }

    try {
      const chat = await createChat({
        participantIds: selectedGroupMembers,
        name: groupName.trim(),
        isGroup: true,
      });

      if (chat?._id) {
        setGroupModalOpen(false);
        setSelectedGroupMembers([]);
        setGroupName("");
        openChat(chat._id);
      }
    } catch (error) {
      toast.error(error.message || "Unable to create group chat.");
    }
  };

  const handleSend = async () => {
    const text = draftMessage.trim();
    if (!text || !activeChatId) return;

    try {
      await sendMessage(text);
      setDraftMessage("");
      sendTyping(false);
    } catch (sendError) {
      toast.error(sendError.message || "Unable to send message.");
    }
  };

  const handleTyping = (event) => {
    const value = event.target.value;
    setDraftMessage(value);

    if (value.trim()) {
      sendTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
      return;
    }

    clearTimeout(typingTimeoutRef.current);
    sendTyping(false);
  };

  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-hidden bg-slate-100 p-3 md:p-4 lg:h-dvh">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <MessageCircleMore className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pearls CRM</p>
              <h1 className="text-xl font-bold text-slate-900">Team Messaging</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setGroupModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <Users className="h-4 w-4" />
              New Group
            </button>
          </div>
        </header>

        {error && (
          <div role="status" className="shrink-0 border-b border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:grid-cols-[330px_minmax(0,1fr)] xl:grid-rows-1">
          <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={selectedEmployeeQuery}
                  onChange={(event) => setSelectedEmployeeQuery(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="Search employees"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Employees</h2>
                <span className="text-xs text-slate-400">{filteredEmployees.length}</span>
              </div>

              <div className="space-y-2">
                {loadingEmployees ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    Loading directory...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    No employees found.
                  </div>
                ) : (
                  filteredEmployees.map((employee) => {
                    const employeeName = getEmployeeDisplay(employee);
                    const employeeId = employee?._id || employee?.id || employee?.uid || employee?.email;
                    const isOnline = onlineUserIds.has(String(employeeId));
                    return (
                      <button
                        key={employeeId}
                        onClick={() => handleOpenDirectChat(employeeId)}
                        title={`Message ${employeeName}`}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {employee.avatar ? (
                              <img src={employee.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                                {employeeName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                isOnline ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{employeeName}</p>
                            <p className="truncate text-xs text-slate-500">{employee?.department || employee?.role || "CRM Team"}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-medium ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Recent chats</h2>
                <span className="text-xs text-slate-400">{conversationList.length}</span>
              </div>

              <div className="space-y-2">
                {loadingChats ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    Loading conversations...
                  </div>
                ) : conversationList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    No conversations yet.
                  </div>
                ) : (
                  conversationList.map((chat) => {
                    const isActive = String(chat._id) === String(selectedChatId);
                    const unreadCount = Number(unreadCounts?.[chat._id] || 0);

                    return (
                      <button
                        key={chat._id}
                        onClick={() => openChat(chat._id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          isActive ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {(getChatTitle(chat).charAt(0) || "C").toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">{getChatTitle(chat)}</p>
                            {unreadCount > 0 && (
                              <span className="min-w-[20px] rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
                                {unreadCount}
                              </span>
                            )}
                          </div>

                          <p className="truncate text-xs text-slate-500">{chat.lastMessage || "Start a conversation"}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-400">
                            {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : getChatSubtitle(chat)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col bg-slate-50">
            {!activeChat ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <MessageCircleMore className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Team communication</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose an employee or start a group to begin real-time messaging with your CRM team.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const peerId = (activeChat.participants || []).find((member) => String(member) !== String(currentUserId));
                      const peer = employeeMap.get(String(peerId || "").toLowerCase());
                      return peer?.avatar ? (
                        <img src={peer.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                          {(getChatTitle(activeChat).charAt(0) || "T").toUpperCase()}
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{getChatTitle(activeChat)}</h2>
                      <p className={`text-xs ${getChatSubtitle(activeChat).startsWith("Online") ? "text-emerald-600" : "text-slate-500"}`}>{getChatSubtitle(activeChat)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <button
                      onClick={() => startCall("audio")}
                      disabled={!isDirectChat || !onlineUserIds.has(String(activePeerId || "")) || Boolean(call)}
                      title="Start voice call"
                      aria-label="Start voice call"
                      className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startCall("video")}
                      disabled={!isDirectChat || !onlineUserIds.has(String(activePeerId || "")) || Boolean(call)}
                      title="Start video call"
                      aria-label="Start video call"
                      className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </header>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f8fafc] p-4 md:p-6">
                  {loadingMessages ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                      No messages yet. Say hello and start the conversation.
                    </div>
                  ) : (
                    messages.map((message) => {
                      const messageFromMe = String(message.senderId) === String(currentUserId);
                      const sender = messageFromMe
                        ? currentUserName
                        : getEmployeeDisplay(
                            employeeMap.get(String(message.senderId || "").toLowerCase()) || { name: String(message.senderId) },
                          );

                      return (
                        <div
                          key={message._id || `${message.senderId}-${message.createdAt}`}
                          className={`flex ${messageFromMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                              messageFromMe ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                            }`}
                          >
                            {!messageFromMe && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{sender}</p>}
                            <p className="whitespace-pre-wrap text-sm leading-6">{message.text || message.content || "Shared an update"}</p>
                            <div className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${messageFromMe ? "text-blue-100" : "text-slate-400"}`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {messageFromMe && (message.readBy || []).some((readerId) => String(readerId) !== String(currentUserId)) && (
                                <span className="inline-flex items-center gap-1">
                                  <CheckCheck className="h-3 w-3" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                        {typingUsers.map((typingUser) => typingUser.name).join(", ")} typing...
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-[76px] shrink-0 border-t border-slate-200 bg-white px-3 py-3 md:px-4">
                  <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-2">
                    <div className="flex-1">
                      <textarea
                        rows={1}
                        value={draftMessage}
                        onChange={handleTyping}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={`Message ${getChatTitle(activeChat) || "team"}`}
                        className="h-9 max-h-9 min-h-9 w-full resize-none overflow-y-auto border-0 bg-transparent px-3 py-2 text-sm leading-5 text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!draftMessage.trim() || !activeChatId}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                      aria-label="Send message"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {call && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${call.type === "video" ? "Video" : "Voice"} call`}
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {call.type === "video" ? "Video call" : "Voice call"}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {getEmployeeDisplay(employeeMap.get(String(call.peerId).toLowerCase()))}
                </h2>
              </div>
              <span className="text-sm text-slate-300">
                {call.status === "incoming" ? "Incoming call" : call.status === "calling" ? "Calling..." : call.status === "connected" ? "Connected" : "Connecting..."}
              </span>
            </header>

            {call.status !== "incoming" && (
              <div className={`grid gap-3 p-4 ${call.type === "video" ? "md:grid-cols-2" : ""}`}>
                {call.type === "video" && (
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-800">
                    <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    {!remoteStream && <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">Waiting for video...</p>}
                  </div>
                )}
                {call.type === "video" && (
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-800">
                    <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                    {!localStream && <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">Starting camera...</p>}
                  </div>
                )}
                {call.type === "audio" && <audio ref={remoteAudioRef} autoPlay />}
              </div>
            )}

            {call.status === "incoming" && (
              <div className="px-5 py-8 text-center text-sm text-slate-300">
                {getEmployeeDisplay(employeeMap.get(String(call.peerId).toLowerCase()))} is calling you.
              </div>
            )}

            <footer className="flex justify-center gap-3 border-t border-white/10 px-5 py-4">
              {call.status === "incoming" ? (
                <>
                  <button onClick={endCall} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold hover:bg-rose-500">
                    <PhoneOff className="h-4 w-4" />
                    Decline
                  </button>
                  <button onClick={acceptCall} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500">
                    <Phone className="h-4 w-4" />
                    Answer
                  </button>
                </>
              ) : (
                <button onClick={endCall} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold hover:bg-rose-500">
                  <PhoneOff className="h-4 w-4" />
                  End call
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Create group</p>
                <h3 className="text-xl font-bold text-slate-900">New team chat</h3>
              </div>
              <button onClick={() => setGroupModalOpen(false)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                placeholder="Group name"
                maxLength={80}
              />

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {(employees || []).map((employee) => {
                  const employeeId = employee?._id || employee?.id || employee?.uid || employee?.email;
                  const employeeName = getEmployeeDisplay(employee);
                  const checked = selectedGroupMembers.includes(employeeId);

                  return (
                    <label
                      key={employeeId}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 ${
                        checked ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {employee.avatar ? (
                          <img src={employee.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                            {employeeName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800">{employeeName}</p>
                          <p className="text-xs text-slate-500">{employee?.department || employee?.role || "CRM Team"}</p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGroupMember(employeeId)}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button onClick={() => setGroupModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                Cancel
              </button>
              <button onClick={handleCreateGroup} disabled={selectedGroupMembers.length < 2 || !groupName.trim()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                Create chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
