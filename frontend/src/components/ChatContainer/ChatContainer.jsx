import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import ChatStart from "./ChatStart";
import ChatEnd from "./ChatEnd";
import MiniSidebar from "./MiniSidebar";
import { formatMessageTime } from "../../lib/utils";

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
    triggerIsTyping,
    searchMessageWithinChat
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [highlightedMessages, setHighlightedMessages] = useState([]);
  const [noOfSearchResults, setNoOfSearchResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const result = await searchMessageWithinChat(selectedUser._id, searchText);
    setHighlightedMessages(result.map(msg => msg._id));
    setNoOfSearchResults(result.length);
    setCurrentSearchIndex(0);
  };

  const scrollIntoViewMessage = (index) => {
    if (highlightedMessages.length > 0) {
      const messageId = highlightedMessages[index];
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const onNextSearchResult = () => {
    setCurrentSearchIndex((prev) => {
      const newIndex = Math.min(prev + 1, highlightedMessages.length - 1);
      scrollIntoViewMessage(newIndex);
      return newIndex;
    });
  };

  const onPreviousSearchResult = () => {
    setCurrentSearchIndex((prev) => {
      const newIndex = Math.max(prev - 1, 0);
      scrollIntoViewMessage(newIndex);
      return newIndex;
    });
  };

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
  }, [messages, selectedUser]);

  const handleEdit = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const handleDownload = (senderId) => {
    downloadImage(senderId);
  };

  const handleForward = (message) => {
    setMessageToForward({ text: message.text, image: message.image });
    setIsForwarding(true);
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
    setIsForwarding(false);
    setMessageToForward(null);
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
      <ChatHeader
        searchText={searchText}
        setSearchText={setSearchText}
        handleSearch={handleSearch}
        onNextSearchResult={onNextSearchResult}
        onPreviousSearchResult={onPreviousSearchResult}
        currentSearchIndex={currentSearchIndex}
        totalSearchResults={noOfSearchResults}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            id={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={index === currentSearchIndex ? messageEndRef : null}
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
                    isSearched={highlightedMessages.includes(message._id)}
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
                    isSearched={highlightedMessages.includes(message._id)}
                  />}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
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