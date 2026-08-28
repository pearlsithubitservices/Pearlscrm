import React, { useEffect, useState } from "react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";

/* =========================================================
   ACTION OPTIONS
========================================================= */

const actionOptions = [
  "Fetch Attendance",
  "Start Leave Flow",
  "Fetch Leave Balance",
  "Fetch Leave Status",
  "Provide Payslip",
  "Route to HR",
  "Assign to Human",
  "Send Normal Response",
  "Send Away Message",
];

/* =========================================================
   CONDITION OPTIONS
========================================================= */

const messageConditions = [
  "Attendance",
  "Leave Request",
  "Leave Balance",
  "Leave Status",
  "Payslip",
  "HR Help",
  "Talk to HR",
];

const timeConditions = [
  "Working Hours",
  "Outside Working Hours",
];

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  name: "",
  trigger: "Message",
  condition: "",
  action: "",
  status: "Active",
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AutomationRules() {
  const [rules, setRules] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [editingRule, setEditingRule] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH RULES
  ========================================================= */

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/automation-rules`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch automation rules: ${response.status}`
        );
      }

      const data = await response.json();

      const rulesData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setRules(rulesData);
    } catch (error) {
      console.error(
        "Fetch automation rules error:",
        error
      );

      setError(
        "Failed to load automation rules. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD RULES
  ========================================================= */

  useEffect(() => {
    fetchRules();
  }, []);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "trigger") {
      setForm((prev) => ({
        ...prev,
        trigger: value,
        condition: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     CREATE MODAL
  ========================================================= */

  const handleCreateRule = () => {
    setForm(emptyForm);
    setEditingRule(null);
    setError("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT MODAL
  ========================================================= */

  const handleEditRule = (rule) => {
    setEditingRule(rule);

    setForm({
      name: rule.name || "",
      trigger: rule.trigger || "Message",
      condition: rule.condition || "",
      action: rule.action || "",
      status: rule.status || "Active",
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setForm(emptyForm);
    setError("");
  };

  /* =========================================================
     SAVE RULE
  ========================================================= */

  const handleSaveRule = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.condition ||
      !form.action
    ) {
      setError(
        "Please fill Rule Name, Condition and Action."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      /* =====================================================
         EDIT EXISTING RULE
      ===================================================== */

      if (editingRule) {
        const ruleId =
          editingRule._id || editingRule.id;

        const response = await fetch(
          `${API_BASE_URL}/automation-rules/${ruleId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: form.name.trim(),
              trigger: form.trigger,
              condition: form.condition,
              action: form.action,
              status: form.status,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update rule: ${response.status}`
          );
        }
      }

      /* =====================================================
         CREATE NEW RULE
      ===================================================== */

      else {
        const response = await fetch(
          `${API_BASE_URL}/automation-rules`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: form.name.trim(),
              trigger: form.trigger,
              condition: form.condition,
              action: form.action,
              status: form.status,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create rule: ${response.status}`
          );
        }
      }

      await fetchRules();

      closeModal();
    } catch (error) {
      console.error(
        "Save automation rule error:",
        error
      );

      setError(
        "Failed to save automation rule."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ENABLE / DISABLE
  ========================================================= */

  const toggleStatus = async (rule) => {
    const newStatus =
      rule.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      setError("");

      const ruleId =
        rule._id || rule.id;

      const response = await fetch(
        `${API_BASE_URL}/automation-rules/${ruleId}/status`,
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
        throw new Error(
          `Failed to update status: ${response.status}`
        );
      }

      await fetchRules();
    } catch (error) {
      console.error(
        "Toggle automation rule status error:",
        error
      );

      setError(
        "Failed to update rule status."
      );
    }
  };

  /* =========================================================
     DELETE RULE
  ========================================================= */

  const deleteRule = async (rule) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this automation rule?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const ruleId =
        rule._id || rule.id;

      const response = await fetch(
        `${API_BASE_URL}/automation-rules/${ruleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete rule: ${response.status}`
        );
      }

      await fetchRules();
    } catch (error) {
      console.error(
        "Delete automation rule error:",
        error
      );

      setError(
        "Failed to delete automation rule."
      );
    }
  };

  /* =========================================================
     SEARCH + STATUS FILTER
  ========================================================= */

  const filteredRules = rules.filter((rule) => {
    const searchText =
      search.toLowerCase().trim();

    const matchesSearch =
      (rule.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (rule.trigger || "")
        .toLowerCase()
        .includes(searchText) ||
      (rule.condition || "")
        .toLowerCase()
        .includes(searchText) ||
      (rule.action || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      rule.status === statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  /* =========================================================
     COUNTS
  ========================================================= */

  const activeCount = rules.filter(
    (rule) => rule.status === "Active"
  ).length;

  const inactiveCount = rules.filter(
    (rule) => rule.status === "Inactive"
  ).length;

  /* =========================================================
     CONDITION OPTIONS
  ========================================================= */

  const conditionOptions =
    form.trigger === "Message"
      ? messageConditions
      : timeConditions;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div style={pageStyle}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={headerStyle}>

        <div>
          <h2 style={titleStyle}>
            Automation Rules
          </h2>

          <p
            className="muted"
            style={subtitleStyle}
          >
            Create and manage automation rules
            for WhatsApp employee flows.
          </p>
        </div>

        <button
          onClick={handleCreateRule}
          style={primaryButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
          }}
        >
          <span style={{ fontSize: 18 }}>
            +
          </span>

          Create Rule
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div style={errorStyle}>
          <span>⚠</span>

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div style={summaryGridStyle}>

        <SummaryCard
          title="Total Rules"
          value={rules.length}
          description="All automation rules"
          icon="⚙"
        />

        <SummaryCard
          title="Active Rules"
          value={activeCount}
          description="Currently enabled"
          icon="✓"
          active
        />

        <SummaryCard
          title="Inactive Rules"
          value={inactiveCount}
          description="Currently disabled"
          icon="○"
          inactive
        />

      </div>

      {/* =====================================================
          FILTER AREA
      ===================================================== */}

      <div style={filterCardStyle}>

        <div style={searchWrapperStyle}>

          <span style={searchIconStyle}>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search automation rules..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={searchInputStyle}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              style={clearSearchButton}
            >
              ×
            </button>
          )}

        </div>

        <div style={filterWrapperStyle}>

          <span style={filterLabelStyle}>
            Status
          </span>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={filterSelectStyle}
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

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div style={tableCardStyle}>

        <div style={tableHeaderStyle}>

          <div>
            <h3 style={tableTitleStyle}>
              Automation Rules
            </h3>

            <span
              className="muted"
              style={tableSubtitleStyle}
            >
              {filteredRules.length}{" "}
              {filteredRules.length === 1
                ? "rule"
                : "rules"}{" "}
              displayed
            </span>
          </div>

        </div>

        <div style={tableScrollStyle}>

          <table style={tableStyle}>

            <thead>

              <tr>

                <th style={numberHeaderStyle}>
                  #
                </th>

                <th style={thStyle}>
                  Rule Name
                </th>

                <th style={thStyle}>
                  Trigger
                </th>

                <th style={thStyle}>
                  Condition
                </th>

                <th style={thStyle}>
                  Action
                </th>

                <th style={thStyle}>
                  Status
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                  }}
                >
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    style={loadingStyle}
                  >
                    <div style={loadingSpinner}>
                      <div
                        style={spinnerCircle}
                      />

                      Loading automation rules...
                    </div>
                  </td>
                </tr>
              )}

              {/* RULES */}

              {!loading &&
                filteredRules.map(
                  (rule, index) => (
                    <tr
                      key={
                        rule._id ||
                        rule.id
                      }
                      style={rowStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--bg-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "transparent";
                      }}
                    >

                      {/* AUTOMATIC NUMBER */}

                      <td
                        style={
                          numberCellStyle
                        }
                      >
                        <span
                          style={
                            numberBadgeStyle
                          }
                        >
                          {index + 1}
                        </span>
                      </td>

                      {/* RULE NAME */}

                      <td style={tdStyle}>

                        <div
                          style={
                            ruleNameWrapperStyle
                          }
                        >
                          <div
                            style={
                              ruleIconStyle
                            }
                          >
                            ⚡
                          </div>

                          <strong
                            style={
                              ruleNameStyle
                            }
                          >
                            {rule.name}
                          </strong>
                        </div>

                      </td>

                      {/* TRIGGER */}

                      <td style={tdStyle}>

                        <span
                          style={
                            triggerBadgeStyle
                          }
                        >
                          {rule.trigger}
                        </span>

                      </td>

                      {/* CONDITION */}

                      <td style={tdStyle}>

                        <span
                          style={
                            conditionBadge
                          }
                        >
                          {rule.condition}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td style={tdStyle}>

                        <span
                          style={
                            actionTextStyle
                          }
                        >
                          {rule.action}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td style={tdStyle}>

                        <span
                          style={{
                            ...statusBadge,
                            ...(rule.status ===
                            "Active"
                              ? activeStatusStyle
                              : inactiveStatusStyle),
                          }}
                        >
                          <span
                            style={
                              statusDotStyle
                            }
                          />

                          {rule.status}
                        </span>

                      </td>

                      {/* ACTION BUTTONS */}

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          whiteSpace:
                            "nowrap",
                        }}
                      >

                        <button
                          onClick={() =>
                            handleEditRule(
                              rule
                            )
                          }
                          style={
                            editButtonStyle
                          }
                          title="Edit rule"
                        >
                          ✎ Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(
                              rule
                            )
                          }
                          style={{
                            ...toggleButtonStyle,
                            ...(rule.status ===
                            "Active"
                              ? disableButtonStyle
                              : enableButtonStyle),
                          }}
                          title={
                            rule.status ===
                            "Active"
                              ? "Disable rule"
                              : "Enable rule"
                          }
                        >
                          {rule.status ===
                          "Active"
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          onClick={() =>
                            deleteRule(
                              rule
                            )
                          }
                          style={
                            deleteButtonStyle
                          }
                          title="Delete rule"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )}

              {/* NO RESULTS */}

              {!loading &&
                filteredRules.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={
                        emptyStateStyle
                      }
                    >
                      <div
                        style={
                          emptyIconStyle
                        }
                      >
                        ⚙
                      </div>

                      <div
                        style={
                          emptyTitleStyle
                        }
                      >
                        No automation rules found
                      </div>

                      <div
                        className="muted"
                        style={
                          emptyDescriptionStyle
                        }
                      >
                        Try changing your search
                        or status filter.
                      </div>
                    </td>
                  </tr>
                )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div style={overlayStyle}>

          <div style={modalStyle}>

            {/* MODAL HEADER */}

            <div style={modalHeaderStyle}>

              <div>

                <div
                  style={
                    modalIconStyle
                  }
                >
                  ⚡
                </div>

                <h3
                  style={
                    modalTitleStyle
                  }
                >
                  {editingRule
                    ? "Edit Automation Rule"
                    : "Create Automation Rule"}
                </h3>

                <p
                  className="muted"
                  style={
                    modalSubtitleStyle
                  }
                >
                  Define when the automation
                  should run.
                </p>

              </div>

              <button
                onClick={closeModal}
                style={closeButton}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={handleSaveRule}
            >

              {/* RULE NAME */}

              <label style={labelStyle}>
                Rule Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Example: Attendance Query"
                value={form.name}
                onChange={handleChange}
                style={modalInputStyle}
                disabled={saving}
              />

              {/* TRIGGER */}

              <label style={labelStyle}>
                Trigger Type
              </label>

              <select
                name="trigger"
                value={form.trigger}
                onChange={handleChange}
                style={modalSelectStyle}
                disabled={saving}
              >
                <option value="Message">
                  Message
                </option>

                <option value="Time Based">
                  Time Based
                </option>
              </select>

              {/* CONDITION */}

              <label style={labelStyle}>
                Condition
              </label>

              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                style={modalSelectStyle}
                disabled={saving}
              >
                <option value="">
                  Select Condition
                </option>

                {conditionOptions.map(
                  (condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  )
                )}
              </select>

              {/* ACTION */}

              <label style={labelStyle}>
                Action
              </label>

              <select
                name="action"
                value={form.action}
                onChange={handleChange}
                style={modalSelectStyle}
                disabled={saving}
              >
                <option value="">
                  Select Action
                </option>

                {actionOptions.map(
                  (action) => (
                    <option
                      key={action}
                      value={action}
                    >
                      {action}
                    </option>
                  )
                )}
              </select>

              {/* STATUS */}

              <label style={labelStyle}>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={modalSelectStyle}
                disabled={saving}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              {/* MODAL BUTTONS */}

              <div
                style={
                  modalFooterStyle
                }
              >

                <button
                  type="button"
                  onClick={closeModal}
                  style={
                    cancelButton
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={
                    primaryButton
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingRule
                    ? "Save Changes"
                    : "Create Rule"}
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
  description,
  icon,
  active,
  inactive,
}) {
  return (
    <div
      style={{
        ...summaryCardStyle,
        ...(active
          ? activeCardStyle
          : inactive
          ? inactiveCardStyle
          : {}),
      }}
    >

      <div style={summaryTopStyle}>

        <div>
          <div
            className="muted"
            style={
              summaryTitleStyle
            }
          >
            {title}
          </div>

          <div
            style={
              summaryValueStyle
            }
          >
            {value}
          </div>
        </div>

        <div
          style={{
            ...summaryIconStyle,
            ...(active
              ? activeIconStyle
              : inactive
              ? inactiveIconStyle
              : {}),
          }}
        >
          {icon}
        </div>

      </div>

      <div
        className="muted"
        style={
          summaryDescriptionStyle
        }
      >
        {description}
      </div>

    </div>
  );
}

/* =========================================================
   PAGE STYLES
========================================================= */

const pageStyle = {
  padding: "4px",
  position: "relative",
};

/* =========================================================
   HEADER
========================================================= */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  gap: 20,
};

const titleStyle = {
  margin: 0,
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: "-0.4px",
};

const subtitleStyle = {
  marginTop: 7,
  marginBottom: 0,
  fontSize: 14,
};

const primaryButton = {
  border: "none",
  borderRadius: 9,
  padding: "11px 17px",
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  transition: "all 0.2s ease",
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.08)",
};

/* =========================================================
   ERROR
========================================================= */

const errorStyle = {
  marginBottom: 16,
  padding: "11px 14px",
  borderRadius: 9,
  background: "#fee2e2",
  color: "#b91c1c",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 9,
  border: "1px solid #fecaca",
};

/* =========================================================
   SUMMARY CARDS
========================================================= */

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 20,
};

const summaryCardStyle = {
  background: "var(--card-bg)",
  padding: "18px 20px",
  borderRadius: 12,
  border:
    "1px solid var(--border-color)",
  minHeight: 118,
  boxSizing: "border-box",
  transition:
    "transform 0.2s ease, box-shadow 0.2s ease",
};

const activeCardStyle = {
  border:
    "1px solid rgba(34, 197, 94, 0.25)",
};

const inactiveCardStyle = {
  border:
    "1px solid rgba(148, 163, 184, 0.25)",
};

const summaryTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const summaryTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
};

const summaryValueStyle = {
  fontSize: 30,
  lineHeight: 1,
  fontWeight: 700,
  marginTop: 9,
};

const summaryDescriptionStyle = {
  fontSize: 12,
  marginTop: 14,
};

const summaryIconStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 19,
  background:
    "var(--bg-secondary)",
};

const activeIconStyle = {
  background: "rgba(34, 197, 94, 0.12)",
};

const inactiveIconStyle = {
  background: "rgba(148, 163, 184, 0.12)",
};

/* =========================================================
   FILTERS
========================================================= */

const filterCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 16,
  padding: 14,
  background: "var(--card-bg)",
  border:
    "1px solid var(--border-color)",
  borderRadius: 11,
};

const searchWrapperStyle = {
  flex: 1,
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchIconStyle = {
  position: "absolute",
  left: 12,
  fontSize: 14,
  opacity: 0.6,
  pointerEvents: "none",
};

const searchInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 38px",
  borderRadius: 8,
  border:
    "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  color: "inherit",
  outline: "none",
};

const clearSearchButton = {
  position: "absolute",
  right: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 19,
  opacity: 0.6,
};

const filterWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const filterLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
};

const filterSelectStyle = {
  padding: "10px 12px",
  minWidth: 135,
  borderRadius: 8,
  border:
    "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  color: "inherit",
  cursor: "pointer",
};

/* =========================================================
   TABLE
========================================================= */

const tableCardStyle = {
  background: "var(--card-bg)",
  border:
    "1px solid var(--border-color)",
  borderRadius: 12,
  overflow: "hidden",
};

const tableHeaderStyle = {
  padding: "17px 18px",
  borderBottom:
    "1px solid var(--border-color)",
};

const tableTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const tableSubtitleStyle = {
  display: "block",
  marginTop: 4,
  fontSize: 12,
};

const tableScrollStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: 1050,
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 15px",
  fontSize: 12,
  fontWeight: 700,
  color: "inherit",
  borderBottom:
    "1px solid var(--border-color)",
  whiteSpace: "nowrap",
};

const numberHeaderStyle = {
  ...thStyle,
  width: 55,
  textAlign: "center",
};

const tdStyle = {
  padding: "14px 15px",
  borderBottom:
    "1px solid var(--border-color)",
  fontSize: 13,
};

const numberCellStyle = {
  ...tdStyle,
  textAlign: "center",
};

const numberBadgeStyle = {
  width: 28,
  height: 28,
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "var(--bg-secondary)",
  fontSize: 12,
  fontWeight: 700,
};

const rowStyle = {
  transition:
    "background 0.15s ease",
};

const ruleNameWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};

const ruleIconStyle = {
  width: 29,
  height: 29,
  borderRadius: 7,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "var(--bg-secondary)",
  fontSize: 13,
};

const ruleNameStyle = {
  fontSize: 13,
};

const triggerBadgeStyle = {
  padding: "5px 9px",
  borderRadius: 6,
  background:
    "var(--bg-secondary)",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const conditionBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 6,
  background:
    "var(--bg-secondary)",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const actionTextStyle = {
  fontSize: 13,
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 9px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
};

const activeStatusStyle = {
  background:
    "rgba(34, 197, 94, 0.12)",
  color: "#16a34a",
};

const inactiveStatusStyle = {
  background:
    "rgba(148, 163, 184, 0.15)",
  color: "#64748b",
};

const statusDotStyle = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "currentColor",
};

const editButtonStyle = {
  border:
    "1px solid var(--border-color)",
  borderRadius: 6,
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: 11,
  background:
    "var(--card-bg)",
  color: "inherit",
};

const toggleButtonStyle = {
  border: "none",
  borderRadius: 6,
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: 11,
  marginLeft: 5,
};

const disableButtonStyle = {
  background:
    "rgba(245, 158, 11, 0.12)",
  color: "#d97706",
};

const enableButtonStyle = {
  background:
    "rgba(34, 197, 94, 0.12)",
  color: "#16a34a",
};

const deleteButtonStyle = {
  border: "none",
  borderRadius: 6,
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: 11,
  marginLeft: 5,
  background:
    "rgba(239, 68, 68, 0.1)",
  color: "#dc2626",
};

/* =========================================================
   LOADING
========================================================= */

const loadingStyle = {
  textAlign: "center",
  padding: 45,
};

const loadingSpinner = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontSize: 13,
};

const spinnerCircle = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border:
    "2px solid var(--border-color)",
  borderTopColor: "currentColor",
};

/* =========================================================
   EMPTY STATE
========================================================= */

const emptyStateStyle = {
  textAlign: "center",
  padding: "55px 20px",
};

const emptyIconStyle = {
  width: 50,
  height: 50,
  borderRadius: 12,
  margin: "0 auto 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "var(--bg-secondary)",
  fontSize: 21,
};

const emptyTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
};

const emptyDescriptionStyle = {
  fontSize: 12,
  marginTop: 5,
};

/* =========================================================
   MODAL
========================================================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0, 0, 0, 0.48)",
  backdropFilter: "blur(3px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 510,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "var(--card-bg)",
  borderRadius: 15,
  padding: 25,
  boxSizing: "border-box",
  boxShadow:
    "0 25px 70px rgba(0, 0, 0, 0.25)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 23,
};

const modalIconStyle = {
  width: 38,
  height: 38,
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "var(--bg-secondary)",
  fontSize: 17,
  marginBottom: 10,
};

const modalTitleStyle = {
  margin: 0,
  fontSize: 19,
  fontWeight: 700,
};

const modalSubtitleStyle = {
  margin: "5px 0 0",
  fontSize: 12,
};

const closeButton = {
  border: "none",
  background: "transparent",
  fontSize: 27,
  cursor: "pointer",
  lineHeight: 1,
  opacity: 0.65,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 7,
};

const modalInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 8,
  border:
    "1px solid var(--border-color)",
  background:
    "var(--bg-secondary)",
  color: "inherit",
  outline: "none",
  marginBottom: 16,
};

const modalSelectStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 8,
  border:
    "1px solid var(--border-color)",
  background:
    "var(--bg-secondary)",
  color: "inherit",
  outline: "none",
  marginBottom: 16,
  cursor: "pointer",
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 8,
};

const cancelButton = {
  border:
    "1px solid var(--border-color)",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
  background: "transparent",
  color: "inherit",
};