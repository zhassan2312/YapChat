import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {produce} from "immer";

const handleError = (error, defaultMessage) => {
  toast.error(error.response?.data?.message || defaultMessage);
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMarkingAsRead: false,
  lastMessages: {}, // Store last message per user
  unReadMessagesCounts: {}, // Store unread message count per user
  lastMessageIsSentByMe: {},
  isLoadingImage: false,
  isTyping: false,
  forwardMessage: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      handleError(error, "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  markMessageAsRead: async (userId) => {
    if (!userId) return;

    const { authUser, socket } = useAuthStore.getState();

    try {
      await axiosInstance.patch(`/messages/mark-read/${userId}`);
      set(produce((state) => {
        state.unReadMessagesCounts[userId] = 0;
      }));

      socket.emit("markAsRead", {
        senderId: userId,
        receiverId: authUser?._id,
      });
    } catch (error) {
      handleError(error, "Failed to mark messages as read");
    }
  },

  getUnreadMessagesCount: async (userId) => {
    if (!userId) return;

    try {
      const res = await axiosInstance.get(`/messages/unread-count/${userId}`);
      set(produce((state) => {
        state.unReadMessagesCounts[userId] = res.data.count || 0;
      }));
    } catch (error) {
      handleError(error, "Failed to get unread message count");
    }
  },

  getLastMessage: async (userId) => {
    if (!userId) return;

    const { authUser } = useAuthStore.getState();

    try {
      const res = await axiosInstance.get(`/messages/last-message/${userId}`);
      const lastMessageText = res.data.image ? "Photo" : res.data.text;

      set(produce((state) => {
        state.lastMessages[userId] = lastMessageText || "No messages yet";
        state.lastMessageIsSentByMe[userId] = res.data.senderId === authUser?._id;
      }));
    } catch (error) {
      handleError(error, "Failed to get last message");
      set(produce((state) => {
        state.lastMessages[userId] = "No messages yet";
      }));
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      handleError(error, "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    const { socket } = useAuthStore.getState();

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      socket.emit("newMessage", res.data);
    } catch (error) {
      handleError(error, "Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    if (!messageId) return;

    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set(produce((state) => {
        state.messages = state.messages.filter((message) => message._id !== messageId);
      }));
    } catch (error) {
      handleError(error, "Failed to delete message");
    }
  },

  editMessage: async (messageId, text) => {
    if (!messageId || !text.trim()) return;

    try {
      const res = await axiosInstance.patch(`/messages/edit/${messageId}`, { text });
      set(produce((state) => {
        state.messages = state.messages.map((msg) => (msg._id === messageId ? res.data : msg));
      }));
    } catch (error) {
      handleError(error, "Failed to edit message");
    }
  },

  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();

      if (selectedUser?._id === newMessage.senderId) {
        get().markMessageAsRead(newMessage.senderId);
      }

      set(produce((state) => {
        state.messages.push(newMessage);
        state.lastMessages[newMessage.senderId] = newMessage.text;
        state.lastMessageIsSentByMe[newMessage.senderId] = false;
        state.unReadMessagesCounts[newMessage.senderId] = (state.unReadMessagesCounts[newMessage.senderId] || 0) + 1;
      }));
    });

    socket.on("messageRead", ({ senderId }) => {
      set(produce((state) => {
        state.unReadMessagesCounts[senderId] = 0;
      }));
    });

    socket.on("messagesUpdated", () => {
      set(produce((state) => {
        state.messages = [...state.messages];
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    socket.off("newMessage");
    socket.off("messageRead");
    socket.off("messagesUpdated");
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser) return;

    set({ selectedUser });
    set(produce((state) => {
      state.unReadMessagesCounts[selectedUser._id] = 0;
    }));
  },

  downloadImage: async (senderId) => {
    if (!senderId) return;

    set({ isLoadingImage: true });
    try {
      const res = await axiosInstance.get(`/messages/download-image/${senderId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "image.png");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      handleError(error, "Failed to download image");
    } finally {
      set({ isLoadingImage: false });
    }
  },

  triggerIsTyping: () => {
    const { socket, authUser } = useAuthStore.getState();
    const { selectedUser } = get();
    if (!selectedUser) return;

    socket.emit("isTyping", {
      senderId: authUser?._id,
      receiverId: selectedUser._id,
    });
  },

  triggerStoppedTyping: () => {
    const { socket, authUser } = useAuthStore.getState();
    const { selectedUser } = get();
    if (!selectedUser) return;

    socket.emit("stoppedTyping", {
      senderId: authUser?._id,
      receiverId: selectedUser._id,
    });
  },

  subscribeToTyping: () => {
    const { socket } = useAuthStore.getState();

    socket.on("typing", ({ senderId }) => {
      const { selectedUser } = get();

      if (selectedUser?._id === senderId) {
        set({ isTyping: true });
      }
    });

    socket.on("stoppedTyping", ({ senderId }) => {
      const { selectedUser } = get();

      if (selectedUser?._id === senderId) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromTyping: () => {
    const { socket } = useAuthStore.getState();
    socket.off("typing");
    socket.off("stoppedTyping");

    set({ isTyping: false });
  },

  forwardMessage: async (receiverId, message) => {
    if (!receiverId) return;

    const { socket } = useAuthStore.getState();

    try {
      const res = await axiosInstance.post(`/messages/forward-message/${receiverId}`, message);
      if (res.status === 200 || res.status === 201) {
        set(produce((state) => {
          state.messages.push(res.data);
        }));

        socket.emit("newMessage", res.data);
      } else {
        throw new Error("Failed to forward message");
      }
    } catch (error) {
      console.error("Error forwarding message:", error);
      handleError(error, "Failed to forward message");
    }
  },

  searchMessageWithinChat: async (userId, searchQuery) => {
    if (!userId || !searchQuery) return;

    try {
      const res = await axiosInstance.post(`/messages/search-message/${userId}`, { searchQuery });
      return res.data;
    } catch (error) {
      handleError(error, "Failed to search message");
    }
  },

  sidebarSearch: async (searchQuery) => {
    if (!searchQuery) return;

    try {
      const res = await axiosInstance.post(`/messages/search/`, { searchQuery });
      return res;
    } catch (error) {
      handleError(error, "Failed to search");
    }
  },
}));