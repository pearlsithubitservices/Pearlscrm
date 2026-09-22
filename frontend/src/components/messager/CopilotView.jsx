import React, { useState } from "react";
import { Sparkles, Send, Bot, Lightbulb, CheckCircle2 } from "lucide-react";

export default function CopilotView() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m-1",
      sender: "copilot",
      text: "Hello! I am your AI Copilot. How can I assist you with team collaboration, task summaries, or document analysis today?",
      time: "Just now",
    },
  ]);

  const suggestions = [
    "Summarize recent unread task chats",
    "Draft a project update document",
    "List pending employee approvals",
    "Generate follow-up reminder draft",
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || prompt;
    if (!text.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      time: "Just now",
    };

    const copilotMsg = {
      id: `c-${Date.now() + 1}`,
      sender: "copilot",
      text: `I've analyzed your request: "${text}". Everything looks on track. Let me know if you want me to generate a detailed report or notify team members.`,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg, copilotMsg]);
    setPrompt("");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4f2ec] p-6 lg:p-8 min-h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">AI Copilot Assistant</h3>
              <p className="text-xs text-gray-500">Smart assistance for CRM tasks & documents</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Message feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {m.sender === "user" ? "You" : <Bot size={16} />}
              </div>
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-xs"
                    : "bg-gray-100 text-gray-800 rounded-tl-xs"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    m.sender === "user" ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s)}
              className="text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-full transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Copilot anything about documents, tasks, or clients..."
              className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
