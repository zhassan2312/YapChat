import MessageDropdown from "./MessageDropdown"; // Import the DropdownMenu component
import React from "react"; // Import the React library

const ChatEnd = ({ message, authUser, selectedUser, editingMessageId, editingText, handleEdit, handleEditSubmit, handleDelete, handleForward, handleDownload }) => {
  const hasImage = message.image;
  return (
    <div className="flex flex-row items-end gap-4">
      <MessageDropdown
        onEdit={() => handleEdit(message._id, message.text)}
        onDelete={() => handleDelete(message._id)}
        onForward={() => handleForward(message)}
        onDownload={() => handleDownload(message._id)}
        hasImage={hasImage}
        align="right"
      />
      <div className="chat-bubble flex flex-col">
        {message.forwarded && (
          <div className="flex items-center text-gray-500 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
              <path d="M12 2l-5.5 9h11L12 2zm0 2.5l2.5 4.5h-5L12 4.5zM2 13h20v2H2v-2zm0 4h20v2H2v-2z" />
            </svg>
            <span>Forwarded</span>
          </div>
        )}
        {editingMessageId === message._id ? (
          <div>
            <input
              type="text"
              value={editingText}
              onChange={(e) => handleEditSubmit(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <button
              onClick={() => handleEditSubmit(message._id)}
              className="btn btn-sm"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            {message.image && (
              <img
                src={message.image}
                alt="Attachment"
                className="sm:max-w-[200px] rounded-md mb-2"
              />
            )}
            <div className="flex items-center">
              {message.senderId !== authUser._id ? (
                <>
                  {message.text && <p>{message.text}</p>}
                  {message.isRead && (
                    <div className="chat-read flex items-center text-blue-600 ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.3 6.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2zM21.3 12.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2z" />
                      </svg>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {message.isRead && (
                    <div className="chat-read flex items-center text-blue-600 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21.3 6.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2zM21.3 12.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2z" />
                      </svg>
                    </div>
                  )}
                  {message.text && <p>{message.text}</p>}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId === authUser._id
                ? authUser.profilePic || "/avatar.png"
                : selectedUser.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatEnd; // Export the ChatEnd component