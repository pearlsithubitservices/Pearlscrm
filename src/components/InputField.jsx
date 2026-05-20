import React from "react";

export default function InputField({
  label,
  Icon,
  name,
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  options = [], // 👈 for select
}) {
  return (
    <div className={className}>
      
      <label className="block text-[#0b2b57] font-bold mb-2">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-4">

        {Icon && (
          <Icon size={18} className="text-gray-400" />
        )}

        {/* 🔥 IF TYPE IS SELECT */}
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full outline-none bg-transparent text-gray-500"
          >
            <option value="">{placeholder}</option>

            {options.map((opt, index) => (
              <option key={index} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          /* 🔥 DEFAULT INPUT */
          <input
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full outline-none bg-transparent text-gray-500"
            required
          />
        )}

      </div>
    </div>
  );
}