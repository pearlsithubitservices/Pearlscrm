import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import useWhatsApp from "../../Hooks/useWhatsApp";
import StatusBadge from "./components/StatusBadge";

export default function Templates() {
  const { templates, fetchTemplates, createTemplate, syncTemplates, loading } = useWhatsApp();
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en",
    body: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTemplate(form);
      toast.success("Template created");
      setShowForm(false);
      setForm({ name: "", category: "UTILITY", language: "en", body: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncTemplates();
      toast.success(`Synced ${result?.synced || 0} templates from Meta`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const categoryLabel = (cat) =>
    cat === "MARKETING" ? "Marketing" : cat === "AUTHENTICATION" ? "Authentication" : "Utility";

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Templates</h1>
          <p className="text-gray-500 text-sm mt-1">Meta-approved message templates library</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync from Meta
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#2563a9] text-white rounded-lg text-sm font-medium hover:bg-[#1e5090]"
          >
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-100 p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Template name (e.g. follow_up_reminder_v3)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="UTILITY">Utility</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
          <textarea
            required
            placeholder="Message body with {{1}} variables..."
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={3}
            className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#2563a9] text-white rounded-lg">
              Create Template
            </button>
          </div>
        </motion.form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["Template", "Category", "Language", "Status"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : templates.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No templates yet. Create one or sync from Meta.</td></tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-800">{tpl.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{categoryLabel(tpl.category)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tpl.language === "en" ? "English" : tpl.language}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tpl.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
