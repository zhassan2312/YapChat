import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "../ChatHeader";
import MessageInput from "../MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import ChatStart from "./ChatStart";
import ChatEnd from "./ChatEnd";
import MiniSidebar from "./MiniSidebar";

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
    editMessage,
    downloadImage,
    triggerIsTyping, // Assuming you have an updateMessage function in your store
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null); // State to store the message to be forwarded

  useEffect(() => {
    if (selectedUser) {
      markMessageAsRead(selectedUser._id);
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      if (selectedUser) {
        unsubscribeFromMessages();
      }
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessageAsRead]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEdit = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const handleDownload = (senderId) => {
    downloadImage(senderId);
  };

  const handleForward = (message) => {
    setMessageToForward({text:message.text,image:message.image}); // Set the message to be forwarded
    setIsForwarding(true); // Open the MiniSidebar
  };

  const handleEditSubmit = (messageId) => {
    editMessage(messageId, editingText);
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDelete = (messageId) => {
    deleteMessage(messageId);
  };

  const closeMiniSidebar = () => {
    setIsForwarding(false); // Close the MiniSidebar
    setMessageToForward(null); // Clear the message to be forwarded
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput triggerIsTyping={triggerIsTyping} />
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
            <div className="flex flex-col gap-2">
              <div className="chat-header ml-16 flex justify-between items-center">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              {message.senderId === authUser._id
                ? <ChatEnd 
                    message={message} 
                    authUser={authUser} 
                    selectedUser={selectedUser} 
                    editingMessageId={editingMessageId} 
                    editingText={editingText} 
                    handleEdit={handleEdit} 
                    handleEditSubmit={handleEditSubmit} 
                    handleDelete={handleDelete} 
                    handleForward={handleForward} 
                    handleDownload={handleDownload}
                  />
                : <ChatStart 
                    message={message} 
                    authUser={authUser} 
                    selectedUser={selectedUser} 
                    editingMessageId={editingMessageId} 
                    editingText={editingText} 
                    handleEdit={handleEdit} 
                    handleEditSubmit={handleEditSubmit} 
                    handleDelete={handleDelete} 
                    handleForward={handleForward} 
                    handleDownload={handleDownload}
                  />}
            </div>
          </div>
        ))}
      </div>

      <MessageInput triggerIsTyping={triggerIsTyping} />
      {isForwarding && (
        <MiniSidebar
          isOpen={isForwarding}
          onClose={closeMiniSidebar}
          message={messageToForward}
        />
      )}
    </div>
  );
};

export default ChatContainer;