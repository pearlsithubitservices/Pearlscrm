import React from "react";

export default function InputField({
label,
Icon,
placeholder,
className=""
}) {
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
/>
)}

<input
placeholder={placeholder}
className="w-full outline-none bg-transparent text-gray-500"
/>

</div>

</div>

);
}