import React, { useEffect, useState } from "react";

import {
  fetchContacts,
  fetchContactById,
  updateContact,
  createContact,
  deleteContact,
} from "./services/api";

import DataTable from "./components/DataTable";

export default function Contacts() {
  // =====================================================
  // STATE
  // =====================================================

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedContact, setSelectedContact] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    employeeName: "",
    employeeRole: "",
    contact: "",
    email: "",
    location: "",
    joinDate: "",
    notes: "",
  };

  const [editForm, setEditForm] = useState(emptyForm);
  const [addForm, setAddForm] = useState(emptyForm);

  // =====================================================
  // FETCH CONTACTS
  // =====================================================

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");

      const contacts = await fetchContacts();

      setData(Array.isArray(contacts) ? contacts : []);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // =====================================================
  // VIEW CONTACT
  // =====================================================

const handleViewContact = (contact) => {
  setAdding(false);
  setEditing(false);
  setSelectedContact(contact);
};

  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const handleCloseDetails = () => {
    setSelectedContact(null);
    setEditing(false);
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const handleStartEdit = () => {
    if (!selectedContact) return;

    setEditForm({
      employeeName: selectedContact.employeeName || "",
      employeeRole: selectedContact.employeeRole || "",
      contact: selectedContact.contact || "",
      email: selectedContact.email || "",
      location: selectedContact.location || "",
      joinDate: selectedContact.joinDate
        ? selectedContact.joinDate.substring(0, 10)
        : "",
      notes: selectedContact.notes || "",
    });

    setEditing(true);
  };

  // =====================================================
  // EDIT INPUT
  // =====================================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE EDIT
  // =====================================================

  const handleSaveEdit = async () => {
    if (!selectedContact?._id) return;

    if (
      !editForm.employeeName.trim() ||
      !editForm.employeeRole.trim() ||
      !editForm.contact.trim() ||
      !editForm.email.trim()
    ) {
      alert("Please fill Name, Role, Phone and Email.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateContact(
        selectedContact._id,
        editForm
      );

      const updatedContact = response.data || response;

      setSelectedContact(updatedContact);

      setData((previous) =>
        previous.map((contact) =>
          contact._id === updatedContact._id
            ? updatedContact
            : contact
        )
      );

      setEditing(false);

      alert("Contact updated successfully.");
    } catch (error) {
      console.error("Update contact error:", error);
      alert("Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // OPEN ADD CONTACT
  // =====================================================

  const handleOpenAdd = () => {
    setSelectedContact(null);
    setEditing(false);
    setAddForm(emptyForm);
    setAdding(true);
  };

  // =====================================================
  // CLOSE ADD CONTACT
  // =====================================================

  const handleCloseAdd = () => {
    if (creating) return;

    setAdding(false);
    setAddForm(emptyForm);
  };

  // =====================================================
  // ADD INPUT
  // =====================================================

  const handleAddChange = (event) => {
    const { name, value } = event.target;

    setAddForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE CONTACT
  // =====================================================

  const handleCreateContact = async () => {
    if (
      !addForm.employeeName.trim() ||
      !addForm.employeeRole.trim() ||
      !addForm.contact.trim() ||
      !addForm.email.trim()
    ) {
      alert("Please fill Name, Role, Phone and Email.");
      return;
    }

    try {
      setCreating(true);

      const response = await createContact(addForm);

      const newContact = response.data || response;

      setData((previous) => [newContact, ...previous]);

      setAdding(false);
      setAddForm(emptyForm);

      alert("Contact created successfully.");
    } catch (error) {
      console.error("Create contact error:", error);
      alert("Failed to create contact.");
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // DELETE CONTACT
  // =====================================================

  const handleDeleteContact = async () => {
    if (!selectedContact?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedContact.employeeName}?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteContact(selectedContact._id);

      setData((previous) =>
        previous.filter(
          (contact) => contact._id !== selectedContact._id
        )
      );

      setSelectedContact(null);
      setEditing(false);

      alert("Contact deleted successfully.");
    } catch (error) {
      console.error("Delete contact error:", error);
      alert("Failed to delete contact.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredData = data.filter((contact) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      contact.employeeName
        ?.toLowerCase()
        .includes(searchText) ||
      contact.employeeRole
        ?.toLowerCase()
        .includes(searchText) ||
      contact.contact
        ?.toLowerCase()
        .includes(searchText) ||
      contact.email
        ?.toLowerCase()
        .includes(searchText) ||
      contact.location
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // =====================================================
  // GET INITIAL
  // =====================================================

  const getInitial = (name) => {
    if (!name) return "?";

    return name.charAt(0).toUpperCase();
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const cols = [
    {
      header: "Contact",
      accessor: "employeeName",

      render: (contact) => {
        const name = contact.employeeName || "-";

        return (
          <div style={contactCell}>
            <div style={avatarStyle}>
              {getInitial(name)}
            </div>

            <div>
              <div style={contactName}>
                {name}
              </div>

              <div style={contactSubtext}>
                CRM Contact
              </div>
            </div>
          </div>
        );
      },
    },

    {
      header: "Role",
      accessor: "employeeRole",

      render: (contact) => (
        <span style={roleStyle}>
          {contact.employeeRole || "-"}
        </span>
      ),
    },

    {
      header: "Phone",
      accessor: "contact",

      render: (contact) => (
        <span style={tableText}>
          {contact.contact || "-"}
        </span>
      ),
    },

    {
      header: "Email",
      accessor: "email",

      render: (contact) => (
        <span style={emailText}>
          {contact.email || "-"}
        </span>
      ),
    },

    {
      header: "Location",
      accessor: "location",

      render: (contact) => (
        <span style={locationBadge}>
          <span>●</span>
          {contact.location || "Not specified"}
        </span>
      ),
    },

    {
      header: "Action",
      accessor: "action",

      render: (contact) => (
        <button
          type="button"
          style={viewButton}
          onClick={() => handleViewContact(contact)}
        >
          View Details →
        </button>
      ),
    },
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div style={pageStyle}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={headerStyle}>
        <div>
          <div style={titleRow}>
            <div style={titleIcon}>
              👥
            </div>

            <div>
              <h2 style={titleStyle}>
                Contacts
              </h2>

              <p style={subtitleStyle}>
                Manage and organize your CRM contacts
                in one place.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          style={addButton}
          onClick={handleOpenAdd}
        >
          <span style={{ fontSize: 20 }}>+</span>
          Add Contact
        </button>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div style={summaryGrid}>

        <div style={summaryCard}>
          <div>
            <div style={summaryLabel}>
              Total Contacts
            </div>

            <div style={summaryValue}>
              {data.length}
            </div>

            <div style={summaryDescription}>
              All CRM contacts
            </div>
          </div>

          <div style={summaryIcon}>
            👥
          </div>
        </div>

        <div style={summaryCard}>
          <div>
            <div style={summaryLabel}>
              Search Results
            </div>

            <div style={summaryValue}>
              {filteredData.length}
            </div>

            <div style={summaryDescription}>
              Matching contacts
            </div>
          </div>

          <div
            style={{
              ...summaryIcon,
              background: "#f0fdf4",
            }}
          >
            ✓
          </div>
        </div>

        <div style={summaryCard}>
          <div>
            <div style={summaryLabel}>
              Contact Management
            </div>

            <div
              style={{
                marginTop: 9,
                fontSize: 17,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Active
            </div>

            <div style={summaryDescription}>
              Create, edit and manage contacts
            </div>
          </div>

          <div
            style={{
              ...summaryIcon,
              background: "#fff7ed",
            }}
          >
            ⚡
          </div>
        </div>

      </div>

      {/* =================================================
          SEARCH + TABLE CARD
      ================================================= */}

      <div style={tableCard}>

        {/* SEARCH BAR */}

        <div style={toolbarStyle}>

          <div style={searchWrapper}>
            <span style={searchIcon}>
              🔍
            </span>

            <input
              type="text"
              style={searchInput}
              placeholder="Search by name, phone, email, role or location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                style={clearSearch}
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div style={resultBadge}>
            {filteredData.length} contacts
          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div style={stateContainer}>
            <div style={loadingSpinner} />
            <div style={stateTitle}>
              Loading contacts...
            </div>
            <div style={stateText}>
              Please wait while we fetch your CRM contacts.
            </div>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div style={errorContainer}>
            <div style={errorIcon}>
              !
            </div>

            <div>
              <div style={errorTitle}>
                Unable to load contacts
              </div>

              <div style={errorText}>
                {error}
              </div>
            </div>

            <button
              type="button"
              style={retryButton}
              onClick={loadContacts}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!loading && !error && (
          <>
            <div style={tableWrapper}>
              <DataTable
                columns={cols}
                data={filteredData}
              />
            </div>

            <div style={tableFooter}>
              <span>
                Showing{" "}
                <strong>
                  {filteredData.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {data.length}
                </strong>{" "}
                contacts
              </span>

              {search && (
                <span>
                  Search:{" "}
                  <strong>
                    "{search}"
                  </strong>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* =================================================
          ADD CONTACT MODAL
      ================================================= */}

      {adding && (
        <div style={overlayStyle}>

          <div style={modalStyle}>

            {/* MODAL HEADER */}

            <div style={modalHeader}>
              <div style={modalHeaderLeft}>

                <div style={modalIcon}>
                  +
                </div>

                <div>
                  <h3 style={modalTitle}>
                    Create New Contact
                  </h3>

                  <p style={modalSubtitle}>
                    Add a new contact to your CRM.
                  </p>
                </div>

              </div>

              <button
                type="button"
                style={closeButton}
                onClick={handleCloseAdd}
              >
                ×
              </button>
            </div>

            <div style={divider} />

            {/* FORM */}

            <div style={formGrid}>

              <FormField
                label="Full Name"
                required
                name="employeeName"
                placeholder="Enter full name"
                value={addForm.employeeName}
                onChange={handleAddChange}
              />

              <FormField
                label="Role"
                required
                name="employeeRole"
                placeholder="e.g. HR Manager"
                value={addForm.employeeRole}
                onChange={handleAddChange}
              />

              <FormField
                label="Phone Number"
                required
                name="contact"
                placeholder="+91 9876543210"
                value={addForm.contact}
                onChange={handleAddChange}
              />

              <FormField
                label="Email Address"
                required
                name="email"
                type="email"
                placeholder="example@company.com"
                value={addForm.email}
                onChange={handleAddChange}
              />

              <FormField
                label="Location"
                name="location"
                placeholder="e.g. Chennai"
                value={addForm.location}
                onChange={handleAddChange}
              />

              <FormField
                label="Join Date"
                name="joinDate"
                type="date"
                value={addForm.joinDate}
                onChange={handleAddChange}
              />

            </div>

            <div style={fullField}>
              <label style={fieldLabel}>
                Notes
              </label>

              <textarea
                name="notes"
                placeholder="Add any additional information..."
                value={addForm.notes}
                onChange={handleAddChange}
                rows={4}
                style={textareaStyle}
              />
            </div>

            {/* FOOTER */}

            <div style={modalFooter}>

              <button
                type="button"
                style={cancelButton}
                onClick={handleCloseAdd}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...saveButton,
                  opacity: creating ? 0.7 : 1,
                }}
                onClick={handleCreateContact}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span style={smallSpinner} />
                    Creating...
                  </>
                ) : (
                  <>
                    ✓ Create Contact
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          CONTACT DETAILS MODAL
      ================================================= */}

      {selectedContact && (
        <div style={overlayStyle}>

          <div style={detailsModalStyle}>

            {/* HEADER */}

            <div style={modalHeader}>

              <div style={modalHeaderLeft}>

                <div style={largeAvatar}>
                  {getInitial(
                    selectedContact.employeeName
                  )}
                </div>

                <div>
                  <h3 style={modalTitle}>
                    {editing
                      ? "Edit Contact"
                      : selectedContact.employeeName}
                  </h3>

                  <p style={modalSubtitle}>
                    {editing
                      ? "Update contact information"
                      : selectedContact.employeeRole ||
                        "CRM Contact"}
                  </p>
                </div>

              </div>

              <button
                type="button"
                style={closeButton}
                onClick={handleCloseDetails}
              >
                ×
              </button>

            </div>

            <div style={divider} />

            {/* LOADING */}

            {detailsLoading && (
              <div style={stateContainer}>
                <div style={loadingSpinner} />

                <div style={stateTitle}>
                  Loading contact details...
                </div>
              </div>
            )}

            {/* =================================================
                EDIT MODE
            ================================================= */}

            {!detailsLoading && editing && (
              <>
                <div style={formGrid}>

                  <FormField
                    label="Full Name"
                    required
                    name="employeeName"
                    value={editForm.employeeName}
                    onChange={handleEditChange}
                  />

                  <FormField
                    label="Role"
                    required
                    name="employeeRole"
                    value={editForm.employeeRole}
                    onChange={handleEditChange}
                  />

                  <FormField
                    label="Phone Number"
                    required
                    name="contact"
                    value={editForm.contact}
                    onChange={handleEditChange}
                  />

                  <FormField
                    label="Email Address"
                    required
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />

                  <FormField
                    label="Location"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                  />

                  <FormField
                    label="Join Date"
                    name="joinDate"
                    type="date"
                    value={editForm.joinDate}
                    onChange={handleEditChange}
                  />

                </div>

                <div style={fullField}>
                  <label style={fieldLabel}>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows={4}
                    style={textareaStyle}
                  />
                </div>

                <div style={modalFooter}>

                  <button
                    type="button"
                    style={cancelButton}
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    style={{
                      ...saveButton,
                      opacity: saving ? 0.7 : 1,
                    }}
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span style={smallSpinner} />
                        Saving...
                      </>
                    ) : (
                      <>✓ Save Changes</>
                    )}
                  </button>

                </div>
              </>
            )}

            {/* =================================================
                DETAILS VIEW
            ================================================= */}

            {!detailsLoading && !editing && (
              <>
                <div style={profileHeader}>
                  <div>
                    <div style={profileName}>
                      {selectedContact.employeeName ||
                        "-"}
                    </div>

                    <div style={profileRole}>
                      {selectedContact.employeeRole ||
                        "No role specified"}
                    </div>
                  </div>

                  <div style={activeBadge}>
                    ● Active Contact
                  </div>
                </div>

                <div style={detailsGrid}>

                  <DetailItem
                    icon="📞"
                    label="Phone Number"
                    value={
                      selectedContact.contact
                    }
                  />

                  <DetailItem
                    icon="✉"
                    label="Email Address"
                    value={
                      selectedContact.email
                    }
                  />

                  <DetailItem
                    icon="📍"
                    label="Location"
                    value={
                      selectedContact.location
                    }
                  />

                  <DetailItem
                    icon="📅"
                    label="Join Date"
                    value={
                      selectedContact.joinDate
                        ? new Date(
                            selectedContact.joinDate
                          ).toLocaleDateString()
                        : "-"
                    }
                  />

                </div>

                <div style={notesCard}>
                  <div style={notesTitle}>
                    📝 Notes
                  </div>

                  <div style={notesText}>
                    {selectedContact.notes ||
                      "No notes available for this contact."}
                  </div>
                </div>

                <div style={idBox}>
                  <span>
                    Contact ID
                  </span>

                  <code>
                    {selectedContact._id || "-"}
                  </code>
                </div>

                {/* ACTIONS */}

                <div style={modalFooter}>

                  <button
                    type="button"
                    style={cancelButton}
                    onClick={handleCloseDetails}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    style={editActionButton}
                    onClick={handleStartEdit}
                  >
                    ✎ Edit Contact
                  </button>

                  <button
                    type="button"
                    style={deleteActionButton}
                    onClick={handleDeleteContact}
                    disabled={deleting}
                  >
                    {deleting
                      ? "Deleting..."
                      : "🗑 Delete"}
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  required,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div style={fieldWrapper}>
      <label style={fieldLabel}>
        {label}

        {required && (
          <span style={requiredStyle}>
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

// =========================================================
// DETAIL ITEM
// =========================================================

function DetailItem({
  icon,
  label,
  value,
}) {
  return (
    <div style={detailItem}>
      <div style={detailIcon}>
        {icon}
      </div>

      <div>
        <div style={detailLabel}>
          {label}
        </div>

        <div style={detailValue}>
          {value || "-"}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// PAGE STYLES
// =========================================================

const pageStyle = {
  width: "100%",
  minHeight: "100%",
  padding: "8px 4px 30px",
  boxSizing: "border-box",
  color: "#0f172a",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
};

const titleRow = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const titleIcon = {
  width: 48,
  height: 48,
  borderRadius: 13,
  background: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
};

const titleStyle = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 750,
  color: "#111827",
};

const subtitleStyle = {
  margin: "6px 0 0",
  fontSize: 13,
  color: "#64748b",
};

const addButton = {
  border: "none",
  borderRadius: 9,
  padding: "12px 18px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 5px 14px rgba(37,99,235,0.22)",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 22,
};

const summaryCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 19,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
};

const summaryLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
};

const summaryValue = {
  marginTop: 6,
  fontSize: 28,
  fontWeight: 750,
  color: "#0f172a",
};

const summaryDescription = {
  marginTop: 4,
  fontSize: 11,
  color: "#94a3b8",
};

const summaryIcon = {
  width: 42,
  height: 42,
  borderRadius: 11,
  background: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const tableCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(15,23,42,0.035)",
};

const toolbarStyle = {
  padding: 17,
  display: "flex",
  alignItems: "center",
  gap: 12,
  borderBottom: "1px solid #eef2f7",
};

const searchWrapper = {
  position: "relative",
  flex: 1,
};

const searchIcon = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  fontSize: 15,
};

const searchInput = {
  width: "100%",
  height: 43,
  boxSizing: "border-box",
  border: "1px solid #dbe1ea",
  borderRadius: 9,
  outline: "none",
  padding: "0 40px",
  fontSize: 13,
  color: "#334155",
  background: "#f8fafc",
};

const clearSearch = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "#e2e8f0",
  width: 23,
  height: 23,
  borderRadius: "50%",
  cursor: "pointer",
  color: "#475569",
  fontSize: 16,
  lineHeight: 1,
};

const resultBadge = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#f1f5f9",
  color: "#475569",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tableWrapper = {
  overflowX: "auto",
};

const tableFooter = {
  padding: "13px 17px",
  borderTop: "1px solid #eef2f7",
  display: "flex",
  justifyContent: "space-between",
  color: "#94a3b8",
  fontSize: 12,
};

const contactCell = {
  display: "flex",
  alignItems: "center",
  gap: 11,
};

const avatarStyle = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 750,
  fontSize: 14,
};

const contactName = {
  fontWeight: 650,
  color: "#1e293b",
  fontSize: 13,
};

const contactSubtext = {
  marginTop: 3,
  fontSize: 10,
  color: "#94a3b8",
};

const roleStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 6,
  background: "#f8fafc",
  color: "#475569",
  fontSize: 11,
  fontWeight: 600,
};

const tableText = {
  color: "#475569",
  fontSize: 12,
};

const emailText = {
  color: "#2563eb",
  fontSize: 12,
};

const locationBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "#475569",
  fontSize: 11,
};

const viewButton = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: 7,
  padding: "7px 11px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 650,
};

// =========================================================
// STATES
// =========================================================

const stateContainer = {
  minHeight: 300,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const loadingSpinner = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "3px solid #dbeafe",
  borderTop: "3px solid #2563eb",
};

const smallSpinner = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.4)",
  borderTop: "2px solid white",
  display: "inline-block",
};

const stateTitle = {
  marginTop: 8,
  fontSize: 14,
  fontWeight: 650,
  color: "#334155",
};

const stateText = {
  fontSize: 12,
  color: "#94a3b8",
};

const errorContainer = {
  margin: 20,
  padding: 18,
  borderRadius: 10,
  background: "#fff7f7",
  border: "1px solid #fecaca",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const errorIcon = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "#fee2e2",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const errorTitle = {
  fontSize: 13,
  fontWeight: 650,
  color: "#991b1b",
};

const errorText = {
  marginTop: 3,
  fontSize: 12,
  color: "#b91c1c",
};

const retryButton = {
  marginLeft: "auto",
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#dc2626",
  borderRadius: 7,
  padding: "7px 12px",
  cursor: "pointer",
  fontWeight: 600,
};

// =========================================================
// MODAL
// =========================================================

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.58)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 720,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 18,
  padding: 26,
  boxSizing: "border-box",
  boxShadow: "0 25px 70px rgba(15,23,42,0.25)",
};

const detailsModalStyle = {
  width: "100%",
  maxWidth: 680,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 18,
  padding: 26,
  boxSizing: "border-box",
  boxShadow: "0 25px 70px rgba(15,23,42,0.25)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
};

const modalHeaderLeft = {
  display: "flex",
  alignItems: "center",
  gap: 13,
};

const modalIcon = {
  width: 43,
  height: 43,
  borderRadius: 11,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  fontWeight: 700,
};

const largeAvatar = {
  width: 48,
  height: 48,
  borderRadius: 13,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 750,
  fontSize: 18,
};

const modalTitle = {
  margin: 0,
  fontSize: 19,
  fontWeight: 700,
  color: "#111827",
};

const modalSubtitle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
};

const closeButton = {
  border: "none",
  background: "#f1f5f9",
  color: "#475569",
  width: 34,
  height: 34,
  borderRadius: 8,
  fontSize: 21,
  cursor: "pointer",
};

const divider = {
  height: 1,
  background: "#eef2f7",
  margin: "21px 0",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: 17,
};

const fieldWrapper = {
  display: "flex",
  flexDirection: "column",
};

const fullField = {
  marginTop: 17,
};

const fieldLabel = {
  marginBottom: 7,
  fontSize: 12,
  fontWeight: 650,
  color: "#334155",
};

const requiredStyle = {
  color: "#dc2626",
  marginLeft: 3,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: 43,
  padding: "0 12px",
  border: "1px solid #dbe1ea",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "#334155",
  fontSize: 13,
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #dbe1ea",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "#334155",
  fontSize: 13,
  resize: "vertical",
  minHeight: 100,
  lineHeight: 1.5,
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 9,
  marginTop: 24,
};

const cancelButton = {
  border: "1px solid #dbe1ea",
  background: "#fff",
  color: "#475569",
  borderRadius: 8,
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 12,
};

const saveButton = {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 7,
  boxShadow: "0 4px 10px rgba(37,99,235,0.18)",
};

// =========================================================
// DETAILS
// =========================================================

const profileHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #eef2f7",
};

const profileName = {
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};

const profileRole = {
  marginTop: 4,
  fontSize: 12,
  color: "#64748b",
};

const activeBadge = {
  padding: "6px 9px",
  borderRadius: 20,
  background: "#dcfce7",
  color: "#15803d",
  fontSize: 10,
  fontWeight: 650,
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 17,
};

const detailItem = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: 13,
  border: "1px solid #eef2f7",
  borderRadius: 10,
};

const detailIcon = {
  width: 34,
  height: 34,
  borderRadius: 9,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
};

const detailLabel = {
  fontSize: 10,
  color: "#94a3b8",
  fontWeight: 600,
};

const detailValue = {
  marginTop: 3,
  fontSize: 12,
  color: "#334155",
  fontWeight: 600,
  wordBreak: "break-word",
};

const notesCard = {
  marginTop: 14,
  padding: 15,
  borderRadius: 10,
  background: "#f8fafc",
  border: "1px solid #eef2f7",
};

const notesTitle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const notesText = {
  marginTop: 8,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.6,
};

const idBox = {
  marginTop: 13,
  padding: "10px 12px",
  background: "#f8fafc",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const editActionButton = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: 8,
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};

const deleteActionButton = {
  border: "none",
  background: "#dc2626",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};