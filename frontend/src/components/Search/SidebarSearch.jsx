import React from "react";
import { Search } from "lucide-react";

const SidebarSearch = ({
  showOnlineOnly,
  setShowOnlineOnly,
  showUnreadOnly,
  setShowUnreadOnly,
  searchQuery,
  setSearchQuery,
  onlineUsers,
}) => {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="border-b border-base-300 w-full p-5">
      <div className="flex items-center gap-2">
        <Search className="size-6" />
        <span className="font-medium hidden lg:block">Contacts</span>
      </div>
      <div className="mt-3 hidden lg:flex items-center gap-2">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Show online only</span>
        </label>
        <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
      </div>
      <div className="mt-3 hidden lg:flex items-center gap-2">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Show unread only</span>
        </label>
      </div>
      <div className="mt-3 hidden lg:flex items-center gap-2">
        <Search className="size-6" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search contacts"
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
};

export default SidebarSearch;