import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users,Image } from "lucide-react";

const Sidebar = () => {
  const {
    subscribeToMessages,
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    lastMessages,
    unReadMessagesCounts,
    lastMessageIsSentByMe,
    markMessageAsRead,
    getLastMessage,
    getUnreadMessagesCount,
    isTyping
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    getUsers();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    users.forEach((user) => {
      getUnreadMessagesCount(user._id);
      getLastMessage(user._id);
    });
  }, [users]);

  // **Refresh Messages in Real-time**
  useEffect(() => {
    const interval = setInterval(() => {
      users.forEach((user) => {
        getUnreadMessagesCount(user._id);
        getLastMessage(user._id);
      });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [users]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (unReadMessagesCounts[user._id] > 0) {
      markMessageAsRead(user._id);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (showOnlineOnly && !onlineUsers.includes(user._id)) {
      return false;
    }
    if (showUnreadOnly && unReadMessagesCounts[user._id] === 0) {
      return false;
    }
    return true;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
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
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleUserClick(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors 
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img src={user.profilePic || "/avatar.png"} alt={user.name} className="size-12 object-cover rounded-full" />
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="flex flex-row justify-between font-medium ">{user.fullName}</div>
                <span className={`flex gap-1 text-sm ${isTyping ||(!lastMessageIsSentByMe[user._id]&&unReadMessagesCounts[user._id]>0) ? "text-bold text-emerald-500" : "text-base-content/70"}`}>
                  {isTyping ? "Typing..." : (
                    <>
                      {lastMessageIsSentByMe[user._id] ? "You: " : ""}
                      {lastMessages[user._id] === 'Photo' ? (
                        <Image size={18} />
                      ) : (
                        lastMessages[user._id] || "No messages yet"
                      )}
                    </>
                  )}
                  
                </span>
                {unReadMessagesCounts[user._id] > 0 && (
                  <span className="text-xs text-white px-1 rounded-full bg-emerald-500">
                    {unReadMessagesCounts[user._id]}
                  </span>
                )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;