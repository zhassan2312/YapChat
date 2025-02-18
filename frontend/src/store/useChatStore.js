import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { debounce } from "lodash";

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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  markMessageAsRead: async (userId) => {
    if (!userId) return;

    try {
      await axiosInstance.patch(`/messages/mark-read/${userId}`);
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [userId]: 0 },
      }));

      const socket = useAuthStore.getState().socket;
      socket.emit("markAsRead", {
        senderId: userId,
        receiverId: useAuthStore.getState().authUser?._id,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark messages as read");
    }
  },

  getUnreadMessagesCount: async (userId) => {
    if (!userId) return;

    try {
      const res = await axiosInstance.get(`/messages/unread-count/${userId}`);
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [userId]: res.data.count || 0 },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get unread message count");
    }
  },

  getLastMessage: async (userId) => {
    if (!userId) return;

    try {
      const res = await axiosInstance.get(`/messages/last-message/${userId}`);
      const lastMessageText = res.data.image ? "Photo" : res.data.text;

      set((state) => ({
        lastMessages: { ...state.lastMessages, [userId]: lastMessageText || "No messages yet" },
        lastMessageIsSentByMe: {
          ...state.lastMessageIsSentByMe,
          [userId]: res.data.senderId === useAuthStore.getState().authUser?._id,
        },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get last message");
      set((state) => ({
        lastMessages: { ...state.lastMessages, [userId]: "No messages yet" },
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
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      const socket = useAuthStore.getState().socket;
      socket.emit("newMessage", res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    if (!messageId) return;

    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  editMessage: async (messageId, text) => {
    if (!messageId || !text.trim()) return;

    try {
      const res = await axiosInstance.patch(`/messages/edit/${messageId}`, { text });
      set((state) => ({
        messages: state.messages.map((msg) => (msg._id === messageId ? res.data : msg)),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();

      if (selectedUser?._id === newMessage.senderId) {
        get().markMessageAsRead(newMessage.senderId);
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
        lastMessages: { ...state.lastMessages, [newMessage.senderId]: newMessage.text },
        lastMessageIsSentByMe: { ...state.lastMessageIsSentByMe, [newMessage.senderId]: false },
        unReadMessagesCounts: {
          ...state.unReadMessagesCounts,
          [newMessage.senderId]: (state.unReadMessagesCounts[newMessage.senderId] || 0) + 1,
        },
      }));
    });

    socket.on("messageRead", ({ senderId }) => {
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [senderId]: 0 },
      }));
    });

    socket.on("messagesUpdated", () => {
      set((state) => ({
        messages: [...state.messages],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageRead");
    socket.off("messagesUpdated");
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser) return;

    set({ selectedUser });
    set((state) => ({
      unReadMessagesCounts: { ...state.unReadMessagesCounts, [selectedUser._id]: 0 },
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
      toast.error(error.response?.data?.message || "Failed to download image");
    } finally {
      set({ isLoadingImage: false });
    }
  },

  triggerIsTyping:() => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    socket.emit("isTyping", {
      senderId: useAuthStore.getState().authUser?._id,
      receiverId: selectedUser._id,
    });
  },

  triggerStoppedTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    socket.emit("stoppedTyping", {
      senderId: useAuthStore.getState().authUser?._id,
      receiverId: selectedUser._id,
    });
  },
  
  

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
  
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
    const socket = useAuthStore.getState().socket;
    socket.off("typing");
    socket.off("stoppedTyping");  // ✅ Correctly removes stoppedTyping listener
  
    set({ isTyping: false });
  },
  
  
}));
