import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Search } from "lucide-react";
import MessageSearch from "../Search/MessageSearch";

const ChatHeader = ({ 
  searchText, 
  setSearchText, 
  handleSearch, 
  onNextSearchResult, 
  onPreviousSearchResult, 
  currentSearchIndex, 
  totalSearchResults, 
  isSearching, 
  setIsSearching 
}) => {
  const { selectedUser, subscribeToTyping, unsubscribeFromTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      subscribeToTyping();
    }
    return () => {
      unsubscribeFromTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [selectedUser, subscribeToTyping, unsubscribeFromTyping]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
      {isSearching && (
        <MessageSearch
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          onNextSearchResult={onNextSearchResult}
          onPreviousSearchResult={onPreviousSearchResult}
          currentSearchIndex={currentSearchIndex}
          totalSearchResults={totalSearchResults}
        />
      )}
    </div>
  );
};

export default ChatHeader;
