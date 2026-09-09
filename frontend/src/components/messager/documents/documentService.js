import { apiUrl } from "../../../config/api.js";

/**
 * Service to interact with the Messenger Documents & Recycle Bin REST API
 */

// Fetch active documents
export const fetchDocuments = async () => {
  try {
    const response = await fetch(apiUrl("/documents"));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn("fetchDocuments API error (falling back):", error);
    return null;
  }
};

// Fetch recycled documents
export const fetchRecycledItems = async () => {
  try {
    const response = await fetch(apiUrl("/documents/recycle-bin"));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn("fetchRecycledItems API error (falling back):", error);
    return null;
  }
};

// Create a new document (from template or file upload)
export const createDocument = async (docData) => {
  try {
    let response;
    if (docData instanceof FormData) {
      response = await fetch(apiUrl("/documents"), {
        method: "POST",
        body: docData,
      });
    } else {
      response = await fetch(apiUrl("/documents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docData),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("createDocument API error:", error);
    return null;
  }
};

// Rename document
export const renameDocument = async (docId, newName) => {
  try {
    const response = await fetch(apiUrl(`/documents/${docId}/rename`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("renameDocument API error:", error);
    return null;
  }
};

// Move document to Recycle Bin
export const recycleDocument = async (docId) => {
  try {
    const response = await fetch(apiUrl(`/documents/${docId}/recycle`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("recycleDocument API error:", error);
    return null;
  }
};

// Restore document from Recycle Bin
export const restoreDocument = async (docId) => {
  try {
    const response = await fetch(apiUrl(`/documents/${docId}/restore`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("restoreDocument API error:", error);
    return null;
  }
};

// Permanently delete document
export const deleteDocumentPermanently = async (docId) => {
  try {
    const response = await fetch(apiUrl(`/documents/${docId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.success;
  } catch (error) {
    console.warn("deleteDocumentPermanently API error:", error);
    return false;
  }
};

// Empty Recycle Bin
export const emptyRecycleBin = async () => {
  try {
    const response = await fetch(apiUrl("/documents/recycle-bin/empty"), {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.success;
  } catch (error) {
    console.warn("emptyRecycleBin API error:", error);
    return false;
  }
};

// Fetch Drive storage stats (active count, total size, etc.)
export const fetchDriveStats = async () => {
  try {
    const response = await fetch(apiUrl("/documents/stats"));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json.data || null;
  } catch (error) {
    console.warn("fetchDriveStats API error:", error);
    return null;
  }
};

