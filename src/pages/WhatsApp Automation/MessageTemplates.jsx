import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  category: "Attendance",
  message: "",
  status: "Active",
};

const categoryOptions = [
  "Attendance",
  "Leave",
  "Payroll",
  "Support",
  "General",
];

export default function MessageTemplates() {
  const [templates, setTemplates] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD TEMPLATES
  ========================================================= */

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/message-templates`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch templates (${response.status})`
        );
      }

      const data = await response.json();

      /*
        Supports either:

        [
          {...},
          {...}
        ]

        OR

        {
          templates: [...]
        }
      */

      const templateData = Array.isArray(data)
        ? data
        : Array.isArray(data.templates)
        ? data.templates
        : [];

      setTemplates(templateData);
    } catch (err) {
      console.error("Fetch templates error:", err);
      setError(
        err.message ||
          "Unable to load message templates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* =========================================================
     CREATE
  ========================================================= */

  const handleCreate = () => {
    setForm(emptyForm);
    setEditingTemplate(null);
    setError("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (template) => {
    setEditingTemplate(template);

    setForm({
      name: template.name || "",
      category: template.category || "Attendance",
      message: template.message || "",
      status: template.status || "Active",
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE - CREATE / UPDATE
  ========================================================= */

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setError(
        "Template name and message are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        category: form.category,
        message: form.message.trim(),
        status: form.status,
      };

      let response;

      /* ================= UPDATE ================= */

      if (editingTemplate) {
        const templateId =
          editingTemplate._id || editingTemplate.id;

        response = await fetch(
          `${API_BASE_URL}/message-templates/${templateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      /* ================= CREATE ================= */

      else {
        response = await fetch(
          `${API_BASE_URL}/message-templates`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        let errorMessage = "Unable to save template.";

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      await response.json();

      closeModal();

      await fetchTemplates();
    } catch (err) {
      console.error("Save template error:", err);

      setError(
        err.message ||
          "Unable to save message template."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message template?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/message-templates/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMessage = "Unable to delete template.";

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      await fetchTemplates();
    } catch (err) {
      console.error("Delete template error:", err);

      setError(
        err.message ||
          "Unable to delete message template."
      );
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const toggleStatus = async (template) => {
    const templateId =
      template._id || template.id;

    const newStatus =
      template.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/message-templates/${templateId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Unable to update template status.";

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      await fetchTemplates();
    } catch (err) {
      console.error(
        "Toggle status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update template status."
      );
    }
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setForm(emptyForm);
    setError("");
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredTemplates = templates.filter(
    (template) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const templateName =
        template.name || "";

      const templateCategory =
        template.category || "";

      const templateMessage =
        template.message || "";

      const templateStatus =
        template.status || "";

      const matchesSearch =
        templateName
          .toLowerCase()
          .includes(searchText) ||
        templateCategory
          .toLowerCase()
          .includes(searchText) ||
        templateMessage
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        templateCategory === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        templateStatus === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    }
  );

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalTemplates = templates.length;

  const activeTemplates = templates.filter(
    (template) =>
      template.status === "Active"
  ).length;

  const inactiveTemplates =
    templates.filter(
      (template) =>
        template.status === "Inactive"
    ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        padding: "4px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Message Templates
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Create and manage predefined WhatsApp
            messages used by AI automation.
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={createButton}
        >
          <span style={{ fontSize: 20 }}>+</span>
          Create Template
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 14px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ================= SUMMARY CARDS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          title="Total Templates"
          value={totalTemplates}
          icon="▣"
          description="All message templates"
        />

        <SummaryCard
          title="Active Templates"
          value={activeTemplates}
          icon="✓"
          description="Currently available"
        />

        <SummaryCard
          title="Inactive Templates"
          value={inactiveTemplates}
          icon="○"
          description="Currently disabled"
        />
      </div>

      {/* ================= MAIN CARD ================= */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* ================= FILTER BAR ================= */}

        <div
          style={{
            padding: 18,
            borderBottom:
              "1px solid #e5e7eb",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 250,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#9ca3af",
                fontSize: 16,
              }}
            >
              🔍
            </span>

            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                ...searchInput,
                paddingLeft: 38,
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            style={filterSelect}
          >
            <option value="All">
              All Categories
            </option>

            {categoryOptions.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={filterSelect}
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* ================= TABLE ================= */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 850,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                }}
              >
                <th style={thStyle}>#</th>

                <th style={thStyle}>
                  Template
                </th>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Message
                </th>

                <th style={thStyle}>
                  Status
                </th>

                <th style={thStyle}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ================= LOADING ================= */}

              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: 50,
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Loading message templates...
                  </td>
                </tr>
              )}

              {/* ================= DATA ================= */}

              {!loading &&
                filteredTemplates.map(
                  (template, index) => (
                    <tr
                      key={
                        template._id ||
                        template.id
                      }
                      style={{
                        transition:
                          "background 0.2s",
                      }}
                    >
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#64748b",
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#111827",
                            marginBottom: 4,
                          }}
                        >
                          {template.name}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          WhatsApp Template
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={categoryBadge}
                        >
                          {template.category}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            maxWidth: 420,
                            color: "#475569",
                            lineHeight: 1.5,
                            fontSize: 13,
                          }}
                          title={
                            template.message
                          }
                        >
                          {template.message}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            ...statusBadge,
                            background:
                              template.status ===
                              "Active"
                                ? "#dcfce7"
                                : "#f1f5f9",
                            color:
                              template.status ===
                              "Active"
                                ? "#15803d"
                                : "#64748b",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius:
                                "50%",
                              background:
                                template.status ===
                                "Active"
                                  ? "#22c55e"
                                  : "#94a3b8",
                              display:
                                "inline-block",
                            }}
                          />

                          {template.status}
                        </span>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleEdit(
                              template
                            )
                          }
                          style={editButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(
                              template
                            )
                          }
                          style={
                            secondaryButton
                          }
                        >
                          {template.status ===
                          "Active"
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              template._id ||
                                template.id
                            )
                          }
                          style={
                            deleteButton
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}

              {/* ================= EMPTY ================= */}

              {!loading &&
                filteredTemplates.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: 50,
                        textAlign:
                          "center",
                        color: "#94a3b8",
                      }}
                    >
                      No message templates
                      found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                marginBottom: 24,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 21,
                    color: "#111827",
                  }}
                >
                  {editingTemplate
                    ? "Edit Message Template"
                    : "Create Message Template"}
                </h3>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Configure the message used by
                  WhatsApp automation.
                </p>
              </div>

              <button
                onClick={closeModal}
                style={closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label style={labelStyle}>
                Template Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Example: Attendance Response"
                value={form.name}
                onChange={handleChange}
                style={modalInput}
              />

              <label style={labelStyle}>
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={modalInput}
              >
                {categoryOptions.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

              <label style={labelStyle}>
                Message
              </label>

              <textarea
                name="message"
                placeholder="Type your WhatsApp message..."
                value={form.message}
                onChange={handleChange}
                rows={6}
                style={{
                  ...modalInput,
                  resize: "vertical",
                  minHeight: 130,
                  lineHeight: 1.5,
                }}
              />

              <div
                style={{
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <strong
                  style={{
                    color: "#334155",
                  }}
                >
                  Available variables:
                </strong>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {"{{employeeName}}"}{" "}
                  {"{{attendanceStatus}}"}{" "}
                  {"{{leaveBalance}}"}{" "}
                  {"{{leaveDate}}"}{" "}
                  {"{{month}}"}
                </div>
              </div>

              <label style={labelStyle}>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={modalInput}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: 10,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={cancelButton}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...createButton,
                    opacity: saving
                      ? 0.7
                      : 1,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTemplate
                    ? "Save Changes"
                    : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 20,
        boxShadow:
          "0 2px 8px rgba(15, 23, 42, 0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color: "#64748b",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {value}
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const createButton = {
  border: "none",
  borderRadius: 9,
  padding: "11px 17px",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 7,
  boxShadow:
    "0 3px 8px rgba(37, 99, 235, 0.22)",
};

const searchInput = {
  width: "100%",
  boxSizing: "border-box",
  height: 42,
  borderRadius: 8,
  border: "1px solid #dbe1ea",
  padding: "0 13px",
  outline: "none",
  fontSize: 13,
  color: "#334155",
  background: "#ffffff",
};

const filterSelect = {
  height: 42,
  minWidth: 150,
  borderRadius: 8,
  border: "1px solid #dbe1ea",
  padding: "0 12px",
  background: "#ffffff",
  color: "#334155",
  outline: "none",
  fontSize: 13,
};

const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  borderBottom:
    "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px 16px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize: 13,
  verticalAlign: "middle",
};

const categoryBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 6,
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: 11,
  fontWeight: 600,
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 9px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
};

const editButton = {
  border: "1px solid #dbe1ea",
  background: "#ffffff",
  color: "#334155",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
};

const secondaryButton = {
  border: "1px solid #dbe1ea",
  background: "#ffffff",
  color: "#475569",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  marginLeft: 6,
};

const deleteButton = {
  border: "1px solid #fecaca",
  background: "#fff7f7",
  color: "#dc2626",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  marginLeft: 6,
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(15, 23, 42, 0.48)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: 15,
  padding: 26,
  boxSizing: "border-box",
  boxShadow:
    "0 25px 60px rgba(15, 23, 42, 0.22)",
};

const closeButton = {
  border: "none",
  background: "#f1f5f9",
  color: "#475569",
  width: 34,
  height: 34,
  borderRadius: 8,
  fontSize: 22,
  cursor: "pointer",
  lineHeight: 1,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
};

const modalInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid #dbe1ea",
  background: "#ffffff",
  color: "#334155",
  fontSize: 13,
  marginBottom: 16,
  outline: "none",
};

const cancelButton = {
  border: "1px solid #dbe1ea",
  background: "#ffffff",
  color: "#475569",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};