import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Diamond,
  Eraser,
  Hand,
  Loader,
  Minus,
  MousePointer2,
  Paintbrush,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  Scissors,
  Share2,
  Square,
  Star,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { apiUrl } from "../config/api.js";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toolGroups = [
  {
    label: "Tools",
    items: [
      { id: "select", label: "Selection", icon: MousePointer2, tool: "select" },
      { id: "hand", label: "Pan", icon: Hand, tool: "hand" },
      { id: "text", label: "Text", icon: Type, tool: "text" },
    ],
  },
  {
    label: "Drawing",
    items: [
      { id: "pen", label: "Pen", icon: Pencil, tool: "draw" },
      { id: "pencil", label: "Pencil", icon: Pencil, tool: "draw" },
      { id: "brush", label: "Brush", icon: Paintbrush, tool: "draw" },
      { id: "eraser", label: "Eraser", icon: Eraser, tool: "eraser" },
    ],
  },
  {
    label: "Shapes",
    items: [
      { id: "rectangle", label: "Rectangle", icon: Square, tool: "geo", shape: "rectangle" },
      { id: "rounded-rectangle", label: "Rounded rectangle", icon: Square, tool: "geo", shape: "pill" },
      { id: "diamond", label: "Diamond", icon: Diamond, tool: "geo", shape: "diamond" },
      { id: "star", label: "Star", icon: Star, tool: "geo", shape: "star" },
      { id: "arrow", label: "Arrow", icon: ArrowUpRight, tool: "arrow" },
      { id: "line", label: "Line", icon: Minus, tool: "line" },
      { id: "polygon", label: "Polygon", icon: Scissors, tool: "geo", shape: "hexagon" },
    ],
  },
];

function EditorButton({ active, label, icon: Icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function BoardEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState("saved");
  const [shareState, setShareState] = useState("");
  const [editorState, setEditorState] = useState({
    activeTool: "select",
    canUndo: false,
    canRedo: false,
    zoom: 1,
    selectedCount: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadBoard = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await fetch(apiUrl(`/boards/${id}`), {
          headers: getAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this board");
        }

        if (isMounted) setBoard(data.data);
      } catch (error) {
        if (isMounted) setLoadError(error.message || "Unable to load this board");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBoard();

    return () => {
      isMounted = false;
      window.clearTimeout(saveTimeoutRef.current);
      unsubscribeRef.current?.();
    };
  }, [id]);

  const saveCanvas = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    try {
      setSaveState("saving");
      const response = await fetch(apiUrl(`/boards/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ canvasData: editor.getSnapshot() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to save board changes");
      }

      setSaveState("saved");
    } catch (error) {
      console.error("Error saving board canvas:", error);
      setSaveState("error");
    }
  };

  const scheduleSave = () => {
    setSaveState("unsaved");
    window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(saveCanvas, 800);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    if (board?.canvasData?.store) {
      editor.loadSnapshot(board.canvasData);
    }

    const updateEditorState = () => {
      setEditorState({
        activeTool: editor.getCurrentToolId(),
        canUndo: editor.getCanUndo(),
        canRedo: editor.getCanRedo(),
        zoom: editor.getZoom(),
        selectedCount: editor.getSelectedShapeIds().length,
      });
      scheduleSave();
    };

    unsubscribeRef.current = editor.store.listen(updateEditorState);
    updateEditorState();
  };

  const activateTool = (item) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (item.tool === "geo") {
      editor.setCurrentTool("geo", { shape: item.shape });
    } else {
      editor.setCurrentTool(item.tool);
    }
  };

  const deleteSelected = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selectedIds = editor.getSelectedShapeIds();
    if (selectedIds.length > 0) editor.deleteShapes(selectedIds);
  };

  const clearCanvas = () => {
    const editor = editorRef.current;
    if (!editor || !window.confirm("Clear every object from this board?")) return;
    editor.deleteShapes(editor.getCurrentPageShapes());
  };

  const shareBoard = async () => {
    const boardUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: board.boardName, url: boardUrl });
      } else {
        await navigator.clipboard.writeText(boardUrl);
      }
      setShareState("Link copied");
      window.setTimeout(() => setShareState(""), 2200);
    } catch (error) {
      if (error.name !== "AbortError") setShareState("Unable to share");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-gray-50 lg:h-screen">
        <Loader className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loadError || !board) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-gray-50 p-6 lg:h-screen">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h1 className="text-lg font-semibold text-gray-900">Unable to open board</h1>
          <p className="mt-2 text-sm text-gray-600">{loadError || "Board not found"}</p>
          <button
            type="button"
            onClick={() => navigate("/boards")}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#f4f5f7] lg:h-screen">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/boards")}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Back to boards"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-900">{board.boardName}</h1>
            <p className="text-xs text-gray-500">Board editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {saveState === "saving" && (
            <span className="flex items-center gap-1.5">
              <Loader className="h-3.5 w-3.5 animate-spin" /> Saving
            </span>
          )}
          {saveState === "unsaved" && <span>Unsaved changes</span>}
          {saveState === "saved" && (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          {saveState === "error" && (
            <span className="text-red-600">Save failed</span>
          )}
          <button
            type="button"
            onClick={saveCanvas}
            disabled={saveState === "saving"}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button
            type="button"
            onClick={shareBoard}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 font-medium text-white hover:bg-gray-700"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          {shareState && <span className="hidden text-green-600 sm:inline">{shareState}</span>}
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto">
          {toolGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1 last:border-0">
              {group.items.map((item) => (
                <EditorButton
                  key={item.id}
                  active={
                    item.tool === "geo"
                      ? editorState.activeTool === "geo"
                      : editorState.activeTool === item.tool
                  }
                  label={item.label}
                  icon={item.icon}
                  onClick={() => activateTool(item)}
                />
              ))}
            </div>
          ))}

          <div className="ml-auto flex items-center gap-1 pl-1">
            <EditorButton
              label="Undo"
              icon={Undo2}
              disabled={!editorState.canUndo}
              onClick={() => editorRef.current?.undo()}
            />
            <EditorButton
              label="Redo"
              icon={Redo2}
              disabled={!editorState.canRedo}
              onClick={() => editorRef.current?.redo()}
            />
            <span className="mx-1 h-6 border-l border-gray-200" />
            <EditorButton label="Zoom out" icon={ZoomOut} onClick={() => editorRef.current?.zoomOut()} />
            <span className="min-w-12 text-center text-xs font-medium text-gray-600">
              {Math.round(editorState.zoom * 100)}%
            </span>
            <EditorButton label="Zoom in" icon={ZoomIn} onClick={() => editorRef.current?.zoomIn()} />
            <EditorButton
              label="Reset view"
              icon={RotateCcw}
              onClick={() => editorRef.current?.zoomToFit({ animation: { duration: 180 } })}
            />
            <span className="mx-1 h-6 border-l border-gray-200" />
            <EditorButton
              label="Delete selected"
              icon={Trash2}
              disabled={editorState.selectedCount === 0}
              onClick={deleteSelected}
            />
            <EditorButton label="Clear board" icon={Trash2} onClick={clearCanvas} />
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <Tldraw onMount={handleEditorMount} />
      </div>
    </div>
  );
}
