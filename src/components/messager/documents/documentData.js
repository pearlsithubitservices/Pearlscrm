/**
 * Initial mock data and helpers for Documents & Recycle Bin
 * Matching the exact structure and records shown in the PDF screenshot.
 */

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    name: "vishnu.ppt",
    type: "ppt",
    size: "24.82 Kb",
    sizeBytes: 25416,
    createdOn: "37 minutes ago",
    modifiedOn: "Jul, 21",
    author: "Vishnu R",
    extension: "ppt",
  },
  {
    id: "doc-2",
    name: "pearls.doc",
    type: "doc",
    size: "24.35 Kb",
    sizeBytes: 24934,
    createdOn: "today, 02:18",
    modifiedOn: "Jun, 06",
    author: "Vishnu R",
    extension: "doc",
  },
  {
    id: "doc-3",
    name: "company.xls",
    type: "xls",
    size: "21.24 Kb",
    sizeBytes: 21750,
    createdOn: "today, 01:18",
    modifiedOn: "Aug, 13",
    author: "Vishnu R",
    extension: "xls",
  },
];

export const INITIAL_RECYCLE_BIN = [
  {
    id: "recycle-1",
    name: "ai img.jpg",
    type: "ai",
    badgeText: "Ai",
    badgeColor: "bg-purple-700",
    size: "18.50 Kb",
    deletedOn: "today, 10:45",
    daysRemaining: 30,
    extension: "jpg",
  },
];

/**
 * Supported document templates shown in the PDF screenshot
 */
export const DOCUMENT_TEMPLATES = [
  {
    id: "doc",
    type: "doc",
    label: "DOC",
    title: "Word Document",
    extension: ".doc",
    cardBg: "bg-[#eaf2fc]",
    cardBorder: "border-[#d0e2fa]",
    badgeBg: "bg-[#2563eb]",
    badgeText: "DOC",
    buttonBg: "bg-[#1d4ed8] hover:bg-[#1e40af]",
    accentColor: "#2563eb",
    foldedCornerColor: "#bfdbfe",
    allowedExtensions: ["doc", "docx", "odt", "txt", "rtf"],
    accept: ".doc,.docx,.odt,.txt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
    fileHint: ".doc, .docx, .odt, .txt (Word/Text files only)",
  },
  {
    id: "xls",
    type: "xls",
    label: "XLS",
    title: "Excel Spreadsheet",
    extension: ".xls",
    cardBg: "bg-[#edf8f0]",
    cardBorder: "border-[#ccefd6]",
    badgeBg: "bg-[#16a34a]",
    badgeText: "XLS",
    buttonBg: "bg-[#15803d] hover:bg-[#166534]",
    accentColor: "#16a34a",
    foldedCornerColor: "#bbf7d0",
    allowedExtensions: ["xls", "xlsx", "csv", "ods"],
    accept: ".xls,.xlsx,.csv,.ods,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
    fileHint: ".xls, .xlsx, .csv, .ods (Spreadsheets only)",
  },
  {
    id: "ppt",
    type: "ppt",
    label: "PPT",
    title: "PowerPoint Presentation",
    extension: ".ppt",
    cardBg: "bg-[#fef4ea]",
    cardBorder: "border-[#fde2cb]",
    badgeBg: "bg-[#ea580c]",
    badgeText: "PPT",
    buttonBg: "bg-[#c2410c] hover:bg-[#9a3412]",
    accentColor: "#ea580c",
    foldedCornerColor: "#fed7aa",
    allowedExtensions: ["ppt", "pptx", "odp"],
    accept: ".ppt,.pptx,.odp,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    fileHint: ".ppt, .pptx, .odp (Presentations only)",
  },
  {
    id: "board",
    type: "board",
    label: "BOARD",
    title: "Collaboration Board",
    extension: ".brd",
    cardBg: "bg-[#eaf7f7]",
    cardBorder: "border-[#cbeeed]",
    badgeBg: "bg-[#0d9488]",
    badgeText: "BOARD",
    buttonBg: "bg-[#0f766e] hover:bg-[#115e59]",
    accentColor: "#0d9488",
    foldedCornerColor: "#99f6e4",
    allowedExtensions: ["brd", "board", "json", "canvas", "drawio", "pdf", "png", "jpg", "jpeg", "svg"],
    accept: ".brd,.board,.json,.canvas,.drawio,.pdf,.png,.jpg,.jpeg,.svg,application/json,image/png,image/jpeg,image/svg+xml,application/pdf",
    fileHint: ".board, .canvas, .json, .pdf, .png, .jpg (Board & Visuals only)",
  },
];

/**
 * Validate whether a file extension matches the selected document format
 */
export const isFileTypeAllowed = (fileName, type) => {
  if (!fileName || !type) return false;
  const parts = fileName.split(".");
  if (parts.length < 2) return false;
  const ext = parts.pop().toLowerCase();
  const template = DOCUMENT_TEMPLATES.find((t) => t.type === type.toLowerCase());
  if (!template || !template.allowedExtensions) return false;
  return template.allowedExtensions.includes(ext);
};

export const getAllowedExtensionsForType = (type) => {
  const template = DOCUMENT_TEMPLATES.find((t) => t.type === type?.toLowerCase());
  return template?.allowedExtensions || [];
};

