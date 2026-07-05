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
  options = [],
  disabled = false,
  onIconClick,
}) {
  const getOptionValue = (opt) => {
    if (typeof opt === "object" && opt !== null) {
      return opt.value ?? "";
    }
    return opt;
  };

  const getOptionLabel = (opt) => {
    if (typeof opt === "object" && opt !== null) {
      if (typeof opt.label === "object" && opt.label !== null) {
        console.log("⚠ Broken option:", opt);
        return JSON.stringify(opt.label);
      }
      return opt.label ?? "Unknown";
    }
    return opt;
  };

  return (
    <div className={className}>
      <label className="block text-[#0b2b57] font-bold mb-2">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-4">
        {Icon && (
          <Icon
            size={18}
            className="text-gray-400"
            onClick={onIconClick}
          />
        )}

        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full outline-none bg-transparent text-gray-500"
            disabled={disabled}
            required
          >
            <option value="">{placeholder}</option>

            {Array.isArray(options) &&
              options.map((opt, index) => (
                <option
                  key={index}
                  value={getOptionValue(opt)}
                >
                  {getOptionLabel(opt)}
                </option>
              ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full outline-none bg-transparent text-gray-500 resize-none"
            disabled={disabled}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full outline-none bg-transparent text-gray-500"
            disabled={disabled}
            required
          />
        )}
      </div>
    </div>
  );
}