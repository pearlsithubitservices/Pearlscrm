import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const MEMBER_OPTIONS = ["All members", "Owner Only", "Owner And Moderators"];
const TASK_OPTIONS = [
  "All members",
  "Owner Only",
  "Owner And Moderators",
  "Employees Only",
];
const AUTO_DELETE_OPTIONS = [
  { label: "Never", value: "never" },
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "1 week", value: "1w" },
  { label: "1 month", value: "1m" },
];

const DEFAULT_PERMISSIONS = {
  chatHistoryVisible: "yes",
  invitePermission: "All members",
  allowGuestInvite: "yes",
  postMessagePermission: "All members",
  taskViewPermission: "All members",
  taskSortPermission: "All members",
  taskCreatePermission: "All members",
  taskEditPermission: "Owner And Moderators",
  taskDeletePermission: "Owner And Moderators",
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function Collabs() {
  const { user } = useAuth();
  const [collabs, setCollabs] = useState([]);
  const [activeCollabId, setActiveCollabId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");

  // Live list of collabs this user belongs to
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "collabs"),
      where("memberIds", "array-contains", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.lastMessageAt?.toMillis?.() || 0) -
            (a.lastMessageAt?.toMillis?.() || 0)
        );
      setCollabs(list);
    });
    return () => unsub();
  }, [user]);

  const filteredCollabs = useMemo(() => {
    if (!search.trim()) return collabs;
    return collabs.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [collabs, search]);

  const activeCollab = collabs.find((c) => c.id === activeCollabId) || null;

  return (
    <div className="flex h-full min-h-[600px] bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* ---------------- LEFT: Collab list ---------------- */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <div className="flex-1 flex items-center bg-gray-50 rounded-md px-2">
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a collab..."
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setActiveCollabId(null);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            title="Create Collab"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCollabs.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-6 px-4">
              No collabs yet. Create one to get started.
            </p>
          )}
          {filteredCollabs.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCollabId(c.id);
                setShowCreateForm(false);
              }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${
                activeCollabId === c.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-400 text-white flex items-center justify-center font-semibold shrink-0">
                {c.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {c.name}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {formatTime(c.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage || c.description || "No messages yet"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- RIGHT: Chat / Create form / Empty state ---------------- */}
      <div className="flex-1 flex flex-col">
        {showCreateForm ? (
          <CreateCollabForm
            currentUser={user}
            onCancel={() => setShowCreateForm(false)}
            onCreated={(id) => {
              setShowCreateForm(false);
              setActiveCollabId(id);
            }}
          />
        ) : activeCollab ? (
          <CollabChatWindow collab={activeCollab} currentUser={user} />
        ) : (
          <EmptyState onCreateClick={() => setShowCreateForm(true)} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty / intro state                                                */
/* ------------------------------------------------------------------ */

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
      <div className="text-5xl mb-4">🤝</div>
      <h2 className="text-lg font-semibold text-gray-800 max-w-sm">
        A collaborative workspace designed to connect your team with clients
        and external partners.
      </h2>
      <ul className="mt-6 space-y-3 text-left max-w-sm">
        <li className="flex gap-3 text-sm text-gray-600">
          <span>👥</span>
          <span>
            <b className="text-gray-800">Connect with external teams</b>
            <br />
            Chats, video calls, meetings, tasks and files.
          </span>
        </li>
        <li className="flex gap-3 text-sm text-gray-600">
          <span>💼</span>
          <span>
            <b className="text-gray-800">Business-Focused</b>
            <br />
            Collaborate on business matters with coworkers and customers in
            one secure space.
          </span>
        </li>
        <li className="flex gap-3 text-sm text-gray-600">
          <span>✅</span>
          <span>
            <b className="text-gray-800">Every discussion leads to meaningful results</b>
            <br />
            Turn chat messages into tasks and track their progress.
          </span>
        </li>
      </ul>
      <button
        onClick={onCreateClick}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-md transition"
      >
        CREATE COLLAB
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create Collab Form                                                 */
/* ------------------------------------------------------------------ */

function CreateCollabForm({ currentUser, onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [autoDeleteOpen, setAutoDeleteOpen] = useState(false);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [autoDeleteDuration, setAutoDeleteDuration] = useState("never");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "collabs"), {
        name: name.trim(),
        description: description.trim(),
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        moderatorIds: [],
        memberIds: [currentUser.uid],
        permissions,
        autoDelete: {
          enabled: autoDeleteEnabled,
          duration: autoDeleteDuration,
        },
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      onCreated(docRef.id);
    } catch (err) {
      console.error("Failed to create collab:", err);
      alert("Could not create collab. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
          📷
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collab name..."
          className="flex-1 border-b border-gray-200 py-2 outline-none focus:border-blue-500 text-sm"
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Collab is a shared workspace for collaborating with external guests
        and customers.
      </p>

      <label className="text-xs font-medium text-gray-500 mb-1">
        Collab description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell other users what this collab is about..."
        rows={2}
        className="border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-blue-500 mb-4 resize-none"
      />

      <button
        onClick={() => setShowPermissions(true)}
        className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 mb-3 hover:bg-gray-50"
      >
        <span>🔒 Access Permissions</span>
        <span>›</span>
      </button>

      <button
        onClick={() => setAutoDeleteOpen(true)}
        className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 mb-6 hover:bg-gray-50"
      >
        <span>
          🕑 Auto delete message
          <br />
          <span className="text-xs text-gray-400">
            {AUTO_DELETE_OPTIONS.find((o) => o.value === autoDeleteDuration)
              ?.label || "Never"}
          </span>
        </span>
        <span
          className={`w-9 h-5 rounded-full relative transition ${
            autoDeleteEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
              autoDeleteEnabled ? "left-4.5 translate-x-4" : "left-0.5"
            }`}
          />
        </span>
      </button>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md"
        >
          {submitting ? "Creating..." : "Create Collab"}
        </button>
      </div>

      {showPermissions && (
        <AccessPermissionsModal
          permissions={permissions}
          onChange={setPermissions}
          ownerName={currentUser.displayName || currentUser.email}
          onClose={() => setShowPermissions(false)}
        />
      )}

      {autoDeleteOpen && (
        <AutoDeleteModal
          value={autoDeleteDuration}
          onSelect={(val) => {
            setAutoDeleteDuration(val);
            setAutoDeleteEnabled(val !== "never");
            setAutoDeleteOpen(false);
          }}
          onClose={() => setAutoDeleteOpen(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Access Permissions Modal                                           */
/* ------------------------------------------------------------------ */

function AccessPermissionsModal({ permissions, onChange, ownerName, onClose }) {
  const set = (key, value) => onChange({ ...permissions, [key]: value });

  return (
    <Modal onClose={onClose} title="Access permissions">
      <Section title="Admin & Permissions">
        <Field label="Owner">
          <p className="text-sm text-blue-600 font-medium">{ownerName}</p>
        </Field>
        <Field label="Moderators">
          <button className="text-sm text-blue-600">+ Add</button>
        </Field>
        <Dropdown
          label="Make chat history available to new members"
          value={permissions.chatHistoryVisible}
          options={["yes", "no"]}
          onChange={(v) => set("chatHistoryVisible", v)}
        />
        <Dropdown
          label="Users allowed to invite new collab members"
          value={permissions.invitePermission}
          options={MEMBER_OPTIONS}
          onChange={(v) => set("invitePermission", v)}
        />
        <Dropdown
          label="Allow inviting guests to this collab"
          value={permissions.allowGuestInvite}
          options={["yes", "no"]}
          onChange={(v) => set("allowGuestInvite", v)}
        />
        <Dropdown
          label="Users allowed to post messages"
          value={permissions.postMessagePermission}
          options={MEMBER_OPTIONS}
          onChange={(v) => set("postMessagePermission", v)}
        />
      </Section>

      <Section title="Collab Tasks">
        <Dropdown
          label="Users allowed to view collab tasks"
          value={permissions.taskViewPermission}
          options={TASK_OPTIONS}
          onChange={(v) => set("taskViewPermission", v)}
        />
        <Dropdown
          label="Users allowed to sort and move collab tasks"
          value={permissions.taskSortPermission}
          options={TASK_OPTIONS}
          onChange={(v) => set("taskSortPermission", v)}
        />
        <Dropdown
          label="Users allowed to create new tasks"
          value={permissions.taskCreatePermission}
          options={TASK_OPTIONS}
          onChange={(v) => set("taskCreatePermission", v)}
        />
        <Dropdown
          label="Users allowed to edit collab tasks"
          value={permissions.taskEditPermission}
          options={TASK_OPTIONS}
          onChange={(v) => set("taskEditPermission", v)}
        />
        <Dropdown
          label="Users allowed to delete collab tasks"
          value={permissions.taskDeletePermission}
          options={TASK_OPTIONS}
          onChange={(v) => set("taskDeletePermission", v)}
        />
      </Section>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function Dropdown({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm bg-white outline-none focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Auto Delete Modal                                                  */
/* ------------------------------------------------------------------ */

function AutoDeleteModal({ value, onSelect, onClose }) {
  return (
    <Modal onClose={onClose} title="Auto delete messages" small>
      <p className="text-xs text-gray-500 mb-3">
        Select when the messages in this chat will be deleted. If you disable
        the auto delete option, the existing messages that are marked for
        deletion will be auto deleted anyway.
      </p>
      <div className="space-y-2">
        {AUTO_DELETE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
          >
            <input
              type="radio"
              checked={value === opt.value}
              onChange={() => onSelect(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic Modal wrapper                                              */
/* ------------------------------------------------------------------ */

function Modal({ title, children, onClose, small }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl p-5 ${
          small ? "w-80" : "w-96 max-h-[85vh] overflow-y-auto"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat window                                                        */
/* ------------------------------------------------------------------ */

function CollabChatWindow({ collab, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "collabs", collab.id, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [collab.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canPostMessage = useMemo(() => {
    const perm = collab.permissions?.postMessagePermission || "All members";
    if (perm === "All members") return true;
    if (perm === "Owner Only") return collab.ownerId === currentUser.uid;
    if (perm === "Owner And Moderators")
      return (
        collab.ownerId === currentUser.uid ||
        collab.moderatorIds?.includes(currentUser.uid)
      );
    return true;
  }, [collab, currentUser]);

  const handleSend = async () => {
    if (!text.trim() || !canPostMessage) return;
    const messageText = text.trim();
    setText("");
    try {
      await addDoc(collection(db, "collabs", collab.id, "messages"), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: messageText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "collabs", collab.id), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-400 text-white flex items-center justify-center font-semibold">
            {collab.name?.[0]?.toUpperCase() || "C"}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">{collab.name}</p>
            <p className="text-xs text-gray-400">
              {collab.memberIds?.length || 1} member
              {collab.memberIds?.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <span title="Members">👥</span>
          <span title="Search">🔍</span>
          <span title="Info">☰</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-br from-emerald-50 to-blue-50">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-10">
            No messages yet — say hello 👋
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === currentUser.uid;
          return (
            <div
              key={m.id}
              className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {!isMine && (
                  <p className="text-[11px] font-semibold mb-0.5 text-blue-500">
                    {m.senderName}
                  </p>
                )}
                <p>{m.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {canPostMessage ? (
        <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center"
          >
            ➤
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400 py-3 border-t border-gray-100">
          You don't have permission to post in this collab.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400 shrink-0">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function formatTime(ts) {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
