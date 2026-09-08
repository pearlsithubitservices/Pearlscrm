import React, { useState } from "react";
import { Search } from "lucide-react";
import ConversationItem from "./ConversationItem";

export default function ConversationList({ items, onSelect }) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="conversation-list-wrapper">

      {/* SEARCH ONLY */}

      <div className="conversation-search-box">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* CONVERSATION LIST */}

      <div className="convo-list">

        {filteredItems.map((item) => (
          <ConversationItem
            key={item.id}
            convo={item}
            onClick={() => onSelect(item)}
          />
        ))}

      </div>

    </div>
  );
}