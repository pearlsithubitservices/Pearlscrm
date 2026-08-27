const API_BASE_URL = "http://localhost:5000/api";

/* =========================================================
   FETCH DASHBOARD STATS
   ========================================================= */

export async function fetchStats() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch conversations: ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      };
    }

    return {
      total: data.length,

      completed: data.filter(
        (conversation) =>
          conversation.status === "Completed"
      ).length,

      inProgress: data.filter(
        (conversation) =>
          conversation.status === "In Progress"
      ).length,

      pending: data.filter(
        (conversation) =>
          conversation.status === "Pending"
      ).length,
    };
  } catch (error) {
    console.error("fetchStats error:", error);
    throw error;
  }
}


/* =========================================================
   FETCH REAL CONVERSATIONS FROM CRM
   ========================================================= */

export async function fetchConversations() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch conversations: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "REAL CONVERSATIONS FROM CRM:",
      data
    );

    if (!Array.isArray(data)) {
      console.error(
        "Expected conversations array:",
        data
      );

      return [];
    }

    return data.map((conversation) => {
      const messages = Array.isArray(
        conversation.messages
      )
        ? conversation.messages
        : [];

      return {
        // MongoDB ID
        id: conversation._id,

        // Contact information
        contactId: conversation.contactId,

        name: conversation.contactName,

        phone: conversation.phone,

        // Conversation information
        status: conversation.status,

        intent: conversation.intent,

        // Latest message
        message:
          messages.length > 0
            ? messages[messages.length - 1].message
            : "",

        // Who handled the conversation
        handledBy:
           conversation.handledBy || "AI",

        // All messages
        messages: messages.map((msg) => ({
          from:
            msg.sender === "customer"
              ? "user"
              : msg.sender === "agent"
              ? "human"
              : "ai",

          text: msg.message,

          timestamp: msg.timestamp,

          time: msg.timestamp
            ? new Date(
                msg.timestamp
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        })),
      };
    });
  } catch (error) {
    console.error(
      "fetchConversations error:",
      error
    );

    throw error;
  }
}

/* =========================================================
   SEND ADMIN MESSAGE
   ========================================================= */

export async function sendAdminMessage(
  conversationId,
  message
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          sender: "agent",
          message: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to send admin message: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "ADMIN MESSAGE SENT:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "sendAdminMessage error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   TAKE OVER CONVERSATION
   ========================================================= */

export async function takeOverConversation(
  conversationId
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/take-over`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to take over conversation: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "CONVERSATION TAKEN OVER:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "takeOverConversation error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   RESOLVE CONVERSATION
   ========================================================= */

export async function resolveConversation(
  conversationId
) {
  try {

    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/resolve`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {

      throw new Error(
        `Failed to resolve conversation: ${response.status}`
      );

    }

    const data =
      await response.json();

    console.log(
      "CONVERSATION RESOLVED:",
      data
    );

    return data;

  } catch (error) {

    console.error(
      "resolveConversation error:",
      error
    );

    throw error;
  }
}


/* =========================================================
   BLOCK CONVERSATION
   ========================================================= */

export async function blockConversation(
  conversationId
) {
  try {

    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/block`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {

      throw new Error(
        `Failed to block conversation: ${response.status}`
      );

    }

    const data =
      await response.json();

    console.log(
      "CONVERSATION BLOCKED:",
      data
    );

    return data;

  } catch (error) {

    console.error(
      "blockConversation error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   FETCH SINGLE CONTACT
   ========================================================= */

export async function fetchContactById(employeeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch contact: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("CONTACT DETAILS:", data);

    return data;
  } catch (error) {
    console.error(
      "fetchContactById error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   FETCH CONTACTS
   ========================================================= */

export async function fetchContacts() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch contacts: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "REAL CONTACTS FROM CRM:",
      data
    );

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(
      "fetchContacts error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   UPDATE CONTACT
   ========================================================= */

export async function updateContact(
  employeeId,
  contactData
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(contactData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update contact: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "CONTACT UPDATED:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "updateContact error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   CREATE CONTACT
   ========================================================= */

export async function createContact(contactData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(contactData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create contact: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "CONTACT CREATED:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "createContact error:",
      error
    );

    throw error;
  }
}
/* =========================================================
   DELETE CONTACT
   ========================================================= */

export async function deleteContact(contactId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees/${contactId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete contact: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "CONTACT DELETED:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "deleteContact error:",
      error
    );

    throw error;
  }
}