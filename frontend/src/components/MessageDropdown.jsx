import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

const MessageDropdown = ({ onEdit, onDelete, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { themeColors } = useThemeStore();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className={`inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 text-sm font-medium focus:outline-none`}
          onClick={toggleDropdown}
        >
          ⋮
        </button>
      </div>

      {isOpen && (
        <div className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 `}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              className={`block px-4 py-2 text-sm w-full text-left`}
              role="menuitem"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className={`block px-4 py-2 text-sm  w-full text-left`}
              role="menuitem"
              onClick={onDelete}
            >
              Delete
            </button>
            <button
              className={`block px-4 py-2 text-sm  w-full text-left`}
              role="menuitem"
              onClick={onShare}
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;