import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageDropdown from "./MessageDropdown"; // Import the DropdownMenu component
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessageAsRead,
    deleteMessage,
    editMessage, // Assuming you have an updateMessage function in your store
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    markMessageAsRead(selectedUser._id);
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessageAsRead]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEdit = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const handleEditSubmit = (messageId) => {
    editMessage(messageId, editingText);
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDelete = (messageId) => {
    deleteMessage(messageId);
  };

  const handleShare = (messageId) => {
    // Handle share message
    console.log("Share message:", messageId);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
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
            <div className="chat-header mb-1 flex justify-between items-center">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              <MessageDropdown
                onEdit={() => handleEdit(message._id, message.text)}
                onDelete={() => handleDelete(message._id)}
                onShare={() => handleShare(message._id)}
              />
            </div>
            <div className="chat-bubble flex flex-col">
              {editingMessageId === message._id ? (
                <div>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="input input-bordered w-full mb-2"
                  />
                  <button
                    onClick={() => handleEditSubmit(message._id)}
                    className="btn btn-primary btn-sm"
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
                          <div className={`chat-read flex items-center text-blue-600 ml-2`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M21.3 6.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2zM21.3 12.3l-9.8 9.8-5.6-5.6-1.4 1.4 7 7 11.2-11.2z" />
                            </svg>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {message.isRead && (
                          <div className={`chat-read flex items-center text-blue-600 mr-2`}>
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
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;