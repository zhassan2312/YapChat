import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, subscribeToTyping, unsubscribeFromTyping, isTyping } = useChatStore();
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
              {isTyping ? "Typing..." : onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;