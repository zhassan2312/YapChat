import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Image } from "lucide-react";
import SidebarSearch from "./Search/SidebarSearch";

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
    isTyping,
    sidebarSearch,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

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

  useEffect(() => {
    const interval = setInterval(() => {
      users.forEach((user) => {
        getUnreadMessagesCount(user._id);
        getLastMessage(user._id);
      });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [users]);

  useEffect(() => {
    if (searchQuery) {
      sidebarSearch(searchQuery);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (unReadMessagesCounts[user._id] > 0) {
      markMessageAsRead(user._id);
    }
  };

  const filteredUsersList = filteredUsers.filter((user) => {
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
      <SidebarSearch
        showOnlineOnly={showOnlineOnly}
        setShowOnlineOnly={setShowOnlineOnly}
        showUnreadOnly={showUnreadOnly}
        setShowUnreadOnly={setShowUnreadOnly}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onlineUsers={onlineUsers}
      />

      <div className="overflow-y-auto w-full py-3">
        {filteredUsersList.map((user) => (
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