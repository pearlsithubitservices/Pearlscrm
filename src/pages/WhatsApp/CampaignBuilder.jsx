import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Send, Smartphone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useWhatsApp from "../../Hooks/useWhatsApp";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "./components/StatusBadge";
import { extractTagsFromText } from "../../utils/whatsappTags";

const EMPTY_FILTERS = {
  status: [],
  source: [],
  priority: [],
  assignedTo: [],
  followUpDue: false,
  lastContactOlderThanDays: null,
};

export default function CampaignBuilder() {
  const { user } = useAuth();
  const {
    templates,
    fetchTemplates,
    createCampaign,
    updateCampaign,
    queueCampaign,
    previewAudience,
    fetchBuilderConfig,
  } = useWhatsApp();

  const [builderConfig, setBuilderConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    templateId: "",
    templateName: "",
    messageBody: "",
    deliveryMode: "send_now",
    scheduledAt: "",
    priority: "normal",
    recurring: { frequency: "weekly", endDate: "" },
    audienceFilters: { ...EMPTY_FILTERS },
  });
  const [audienceCount, setAudienceCount] = useState(0);
  const [audienceSample, setAudienceSample] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setConfigLoading(true);
      const [config] = await Promise.all([
        fetchBuilderConfig(),
        fetchTemplates(),
      ]);
      setBuilderConfig(config);
      setConfigLoading(false);
    };
    load();
  }, []);

  const refreshAudience = useCallback(
    async (filters) => {
      setPreviewLoading(true);
      try {
        const data = await previewAudience(filters);
        setAudienceCount(data?.count || 0);
        setAudienceSample(data?.sample?.[0] || null);
      } catch {
        setAudienceCount(0);
        setAudienceSample(null);
      } finally {
        setPreviewLoading(false);
      }
    },
    [previewAudience],
  );

  useEffect(() => {
    if (!builderConfig) return;
    refreshAudience(form.audienceFilters);
  }, [form.audienceFilters, builderConfig, refreshAudience]);

  const selectedTemplate = templates.find((t) => t._id === form.templateId);

  const messageTags = useMemo(() => {
    const base = builderConfig?.messageTags || [];
    const fromTemplate =
      selectedTemplate?.variables?.map((v) => ({
        tag: `{{${v}}}`,
        label: v,
      })) ||
      extractTagsFromText(selectedTemplate?.body).map((tag) => ({
        tag,
        label: tag.replace(/\{\{|\}\}/g, ""),
      }));
    const merged = [...base];
    fromTemplate.forEach((t) => {
      if (!merged.some((m) => m.tag === t.tag)) merged.push(t);
    });
    return merged;
  }, [builderConfig, selectedTemplate]);

  const sending = builderConfig?.sending || {};
  const messagesPerMinute = sending.messagesPerMinute || 1500;
  const totalWithPhone = builderConfig?.filters?.totalWithPhone || 1;
  const estMinutes =
    audienceCount > 0
      ? Math.max(1, Math.ceil(audienceCount / messagesPerMinute))
      : 0;

  const handleTemplateChange = (e) => {
    const tpl = templates.find((t) => t._id === e.target.value);
    setForm((f) => ({
      ...f,
      templateId: e.target.value,
      templateName: tpl?.name || "",
      messageBody: tpl?.body || f.messageBody,
    }));
  };

  const toggleArrayFilter = (key, value) => {
    setForm((f) => {
      const current = f.audienceFilters[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...f,
        audienceFilters: { ...f.audienceFilters, [key]: next },
      };
    });
  };

  const toggleFollowUpDue = () => {
    setForm((f) => ({
      ...f,
      audienceFilters: {
        ...f.audienceFilters,
        followUpDue: !f.audienceFilters.followUpDue,
      },
    }));
  };

  const toggleLastContact30 = () => {
    setForm((f) => ({
      ...f,
      audienceFilters: {
        ...f.audienceFilters,
        lastContactOlderThanDays: f.audienceFilters.lastContactOlderThanDays
          ? null
          : 30,
      },
    }));
  };

  const toggleAssignedToMe = () => {
    if (!user?.uid) return;
    setForm((f) => {
      const current = f.audienceFilters.assignedTo || [];
      const isActive = current.includes(user.uid);
      return {
        ...f,
        audienceFilters: {
          ...f.audienceFilters,
          assignedTo: isActive
            ? current.filter((id) => id !== user.uid)
            : [...current, user.uid],
        },
      };
    });
  };

  const clearAllFilters = () => {
    setForm((f) => ({ ...f, audienceFilters: { ...EMPTY_FILTERS } }));
  };

  const insertTag = (tag) => {
    setForm((f) => ({ ...f, messageBody: `${f.messageBody} ${tag}`.trim() }));
  };

  const buildPayload = () => ({
    ...form,
    scheduledAt: form.scheduledAt
      ? new Date(form.scheduledAt).toISOString()
      : undefined,
    recurring:
      form.deliveryMode === "recurring"
        ? {
            frequency: form.recurring.frequency,
            endDate: form.recurring.endDate
              ? new Date(form.recurring.endDate).toISOString()
              : undefined,
          }
        : undefined,
  });

  const handleSaveDraft = async () => {
    if (!form.name) return toast.error("Campaign name is required");
    setSaving(true);
    try {
      const payload = {
        ...buildPayload(),
        status: "draft",
        createdBy: user?.uid,
      };
      const result = campaignId
        ? await updateCampaign(campaignId, payload)
        : await createCampaign(payload);
      setCampaignId(result._id);
      toast.success("Draft saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQueue = async () => {
    if (!form.name) return toast.error("Campaign name is required");
    if (audienceCount === 0)
      return toast.error("No contacts match your filters");
    if (form.deliveryMode === "schedule" && !form.scheduledAt) {
      return toast.error("Please select a schedule date and time");
    }
    setSaving(true);
    try {
      const payload = { ...buildPayload(), createdBy: user?.uid };
      let id = campaignId;
      if (!id) {
        const created = await createCampaign({ ...payload, status: "draft" });
        id = created._id;
        setCampaignId(id);
      } else {
        await updateCampaign(id, payload);
      }
      const result = await queueCampaign(id);
      toast.success(
        form.deliveryMode === "schedule" && form.scheduledAt
          ? "Campaign scheduled successfully!"
          : "Campaign queued for sending!",
      );
      return result;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewMessage = useMemo(() => {
    if (!form.messageBody) return "";
    const vars = audienceSample?.variables || {
      name: "Kavya",
      company: "Acme Corp",
      Hospital: builderConfig?.organizationName || "Pearls IT Hub",
      "Patient Name": "Kavya",
      Doctor: "Dr. Sharma",
      "Appointment Date": "20 Jul, 9:00 AM",
      Token: "#A-1042",
    };
    let msg = form.messageBody;
    Object.entries(vars).forEach(([key, value]) => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      msg = msg.replace(
        new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "gi"),
        value ?? "",
      );
    });
    return msg;
  }, [form.messageBody, audienceSample, builderConfig]);

  const isFilterActive = (key, value) => {
    if (key === "followUpDue") return form.audienceFilters.followUpDue;
    if (key === "lastContact30")
      return !!form.audienceFilters.lastContactOlderThanDays;
    if (key === "assignedToMe")
      return user?.uid && form.audienceFilters.assignedTo?.includes(user.uid);
    return (form.audienceFilters[key] || []).includes(value);
  };

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
      active
        ? "bg-[#2563a9] text-white border-[#2563a9]"
        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
    }`;

  const priorityLabel =
    sending.priorities?.find((p) => p.id === form.priority)?.label ||
    form.priority;

  if (configLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563a9]" />
      </div>
    );
  }

  const {
    statuses = [],
    sources = [],
    priorities = [],
    assignees = [],
  } = builderConfig?.filters || {};

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            WhatsApp Campaign Builder
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and queue bulk WhatsApp messages
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={handleQueue}
            disabled={saving || previewLoading}
            className="flex items-center gap-2 px-5 py-2 bg-[#2563a9] text-white rounded-lg text-sm font-medium hover:bg-[#1e5090] disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> Queue Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Section 1 — Campaign Details (already dynamic) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h2 className="font-semibold text-gray-800 mb-4">
              1. Campaign Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Diabetes Follow-up - July Batch"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Template
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={form.templateId}
                    onChange={handleTemplateChange}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">
                      Select a template ({templates.length} available)
                    </option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <StatusBadge status={selectedTemplate.status} />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2 — Audience (dynamic filters from Leads DB) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                2. Audience — Lead Filters
              </h2>
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            </div>

            {statuses.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArrayFilter("status", s)}
                      className={chipClass(isFilterActive("status", s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {priorities.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleArrayFilter("priority", p)}
                      className={chipClass(isFilterActive("priority", p))}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sources.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Source
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArrayFilter("source", s)}
                      className={chipClass(isFilterActive("source", s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {assignees.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Assigned To
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignees.slice(0, 8).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => toggleArrayFilter("assignedTo", a.id)}
                      className={chipClass(isFilterActive("assignedTo", a.id))}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Quick Filters
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearAllFilters}
                  className={chipClass(
                    Object.values(form.audienceFilters).every(
                      (v) => !v || (Array.isArray(v) && v.length === 0),
                    ),
                  )}
                >
                  All Leads ({totalWithPhone.toLocaleString()})
                </button>
                <button
                  onClick={toggleFollowUpDue}
                  className={chipClass(isFilterActive("followUpDue"))}
                >
                  Follow-up Due
                </button>
                <button
                  onClick={toggleLastContact30}
                  className={chipClass(isFilterActive("lastContact30"))}
                >
                  Last Contact &gt; 30 days
                </button>
                {user?.uid && (
                  <button
                    onClick={toggleAssignedToMe}
                    className={chipClass(isFilterActive("assignedToMe"))}
                  >
                    Assigned to Me
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#2563a9] h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalWithPhone ? Math.min(100, (audienceCount / totalWithPhone) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap flex items-center gap-1.5">
                {previewLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                {audienceCount.toLocaleString()} contacts matched
              </span>
            </div>
            {audienceSample && (
              <p className="text-xs text-gray-400 mt-2">
                Preview contact: {audienceSample.name} · {audienceSample.phone}
              </p>
            )}
          </motion.div>

          {/* Section 3 — Message Composer (dynamic tags from template + CRM fields) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h2 className="font-semibold text-gray-800 mb-1">
              3. Message Composer
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Tags from CRM fields
              {selectedTemplate ? ` + template "${selectedTemplate.name}"` : ""}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {messageTags.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => insertTag(t.tag)}
                  title={t.label}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-mono hover:bg-blue-100"
                >
                  {t.tag}
                </button>
              ))}
            </div>
            <textarea
              value={form.messageBody}
              onChange={(e) =>
                setForm((f) => ({ ...f, messageBody: e.target.value }))
              }
              rows={5}
              placeholder={`Hi {{name}}, this is a reminder from {{Hospital}}...`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </motion.div>

          {/* Section 4 — Sending Options (dynamic rate, priority, schedule) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h2 className="font-semibold text-gray-800 mb-4">
              4. Sending Options
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {(sending.deliveryModes || []).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setForm((f) => ({ ...f, deliveryMode: mode.id }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.deliveryMode === mode.id
                      ? "bg-[#2563a9] text-white border-[#2563a9]"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {form.deliveryMode === "schedule" && (
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-1 block">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {form.deliveryMode === "recurring" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Frequency
                  </label>
                  <select
                    value={form.recurring.frequency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        recurring: {
                          ...f.recurring,
                          frequency: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {(sending.recurringFrequencies || []).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.recurring.endDate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        recurring: { ...f.recurring, endDate: e.target.value },
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">
                Priority
              </label>
              <div className="flex gap-2">
                {(sending.priorities || []).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setForm((f) => ({ ...f, priority: p.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      form.priority === p.id
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
              <span>~{messagesPerMinute.toLocaleString()} Msgs/min</span>
              <span className="text-orange-500 font-medium">
                {priorityLabel}
              </span>
              <span>
                Est. Completion:{" "}
                {audienceCount > 0 ? `~${estMinutes} min` : "—"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Live Preview — uses real sample contact data */}
        <div className="col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-6 sticky top-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Live Preview</h2>
            </div>
            {audienceSample && (
              <p className="text-xs text-gray-400 mb-3">
                Showing preview for: <strong>{audienceSample.name}</strong>
              </p>
            )}
            <div className="bg-[#e5ddd5] rounded-2xl p-4 min-h-[320px] relative">
              <div className="bg-[#dcf8c6] rounded-lg p-3 text-sm text-gray-800 shadow-sm max-w-[90%] ml-auto">
                {previewMessage || "Your message preview will appear here..."}
                <p className="text-[10px] text-gray-400 text-right mt-1">
                  {new Date().toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}{" "}
                  ✓✓
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
