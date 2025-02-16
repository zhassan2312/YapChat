import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getLastMessage, getUnreadMessagesCount, lastMessages, unReadMessagesCounts,lastMessageIsSentByMe } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      for (const user of users) {
        await getUnreadMessagesCount(user._id);
      }
    };

    const fetchLastMessages = async () => {
      for (const user of users) {
        await getLastMessage(user._id);
      }
    };

    if (users.length > 0) {
      fetchUnreadMessagesCount();
      fetchLastMessages();
    }
  }, [users, getUnreadMessagesCount, getLastMessage]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
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
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="truncate font-bold text-lg">{user.fullName}</div>
              <div className="flex items-center gap-1">
                <span className={`text-sm truncate ${ lastMessageIsSentByMe[user._id]? "" : "font-medium text-green-700"}`}>
                  {lastMessageIsSentByMe[user._id] ? "You: " : ""}
                  {lastMessages[user._id] === "No messages yet"
                    ? lastMessages[user._id]
                    : lastMessages[user._id]?.length > 20
                    ? lastMessages[user._id].slice(0, 20) + "..."
                    : lastMessages[user._id]}
                </span>
                {unReadMessagesCounts[user._id] > 0 && (
                  <span className="text-xs text-white px-1 rounded-full bg-green-700">
                    {unReadMessagesCounts[user._id]}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;