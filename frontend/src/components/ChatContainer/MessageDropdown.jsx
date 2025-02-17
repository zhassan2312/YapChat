import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const MessageDropdown = ({ onEdit, onDelete, onShare, onDownload, align, hasImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringEdit, setIsHoveringEdit] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const [isHoveringShare, setIsHoveringShare] = useState(false);
  const [isHoveringDownload, setIsHoveringDownload] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownItemRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if(dropdownRef.current) {
    if (isHovering) {
      gsap.to(dropdownRef.current, {
        opacity: 1,
      });
    } else {
      gsap.to(dropdownRef.current, {
        opacity: 0,
      });
    }
  }
  }, [isHovering]);

  useEffect(() => {
    if(dropdownItemRef.current) {
    if (isOpen) {
      gsap.to(dropdownItemRef.current, {
        opacity: 1
      });
    } else {
      gsap.to(dropdownItemRef.current, {
        opacity: 0,
        y: 0
      });
    }
  }
  }, [isOpen]);

  return (
    <div className="dropdown relative inline-block text-left z-10">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-circle btn-primary bg-primary-content mb-1 shadow-sm text-sm text-primary bg-opacity-0 font-medium focus:outline-none hover:bg-primary-800 hover:bg-opacity-20" 
        onClick={toggleDropdown} 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        ref={dropdownRef}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
        {isOpen && (
        <ul
          tabIndex={0}
          className={`dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow origin-top-${align} absolute ${align}-0 mt-2`}
          ref={dropdownItemRef}
        >
          <li>
            <motion.button
              className={`block px-4 py-2 text-sm w-full ${isHoveringEdit ? 'bg-base-200' : 'bg-base-300'} text-left rounded-t-lg`}
              role="menuitem"
              onClick={onEdit}
              onMouseEnter={() => setIsHoveringEdit(true)}
              onMouseLeave={() => setIsHoveringEdit(false)}
              whileHover={{ scale: 1.05 }}
            >
              Edit
            </motion.button>
          </li>
          <li>
            <motion.button
              className={`block px-4 py-2 text-sm w-full text-left ${isHoveringDelete ? 'bg-base-200' : 'bg-base-300'}`}
              role="menuitem"
              onClick={onDelete}
              onMouseEnter={() => setIsHoveringDelete(true)}
              onMouseLeave={() => setIsHoveringDelete(false)}
              whileHover={{ scale: 1.05 }}
            >
              Delete
            </motion.button>
          </li>
          <li>
            <motion.button
              className={`block px-4 py-2 text-sm w-full text-left ${isHoveringShare ? 'bg-base-200' : 'bg-base-300'} ${hasImage ? '' : 'rounded-b-lg'}`}
              role="menuitem"
              onClick={onShare}
              onMouseEnter={() => setIsHoveringShare(true)}
              onMouseLeave={() => setIsHoveringShare(false)}
              whileHover={{ scale: 1.05 }}
            >
              Share
            </motion.button>
          </li>
          {hasImage && (
            <li>
              <motion.button
                className={`block px-4 py-2 text-sm w-full text-left ${isHoveringDownload ? 'bg-base-200' : 'bg-base-300'} rounded-b-lg`}
                role="menuitem"
                onClick={onDownload}
                onMouseEnter={() => setIsHoveringDownload(true)}
                onMouseLeave={() => setIsHoveringDownload(false)}
                whileHover={{ scale: 1.05 }}
              >
                Download
              </motion.button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default MessageDropdown;
