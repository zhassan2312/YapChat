import React from "react";
import {ChevronDown,ChevronUp} from 'lucide-react'

const MessageSearch = ({ 
  searchText, 
  setSearchText, 
  handleSearch, 
  onNextSearchResult, 
  onPreviousSearchResult, 
  currentSearchIndex, 
  totalSearchResults 
}) => {
  return (
    <div className="p-2.5 border-t border-base-300">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Search messages"
        />
        <button onClick={handleSearch} className="btn btn-primary btn-sm">
          Search
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button 
          onClick={onPreviousSearchResult} 
          className="btn btn-primary btn-sm" 
          disabled={currentSearchIndex === 0}
        >
          <ChevronUp size={18} />
        </button>
        <button 
          onClick={onNextSearchResult} 
          className="btn btn-primary btn-sm" 
          disabled={currentSearchIndex === totalSearchResults - 1}
        >
          <ChevronDown size={18} />
        </button>
        <span>{totalSearchResults > 0 ? `${currentSearchIndex + 1} / ${totalSearchResults}` : "No results"}</span>
      </div>
    </div>
  );
};

export default MessageSearch;
