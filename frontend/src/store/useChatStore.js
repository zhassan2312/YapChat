import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMarkingAsRead:false,
  lastMessages: {},  // Store last message per user
  unReadMessagesCounts: {}, // Store unread message count per user
  lastMessageIsSentByMe: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  markMessageAsRead: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/mark-read/${userId}`);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark messages as read");
    }
  },

  getUnreadMessagesCount: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/unread-count/${userId}`);
    
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [userId]: res.data.count || 0 }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get unread messages count");
    }
  },

  getLastMessage: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/last-message/${userId}`);
      if(res.data.senderId === useAuthStore.getState().authUser._id){
        set((state) => ({
          lastMessageIsSentByMe: { ...state.lastMessageIsSentByMe, [userId]: true }
        }));
      }else{
        set((state) => ({
          lastMessageIsSentByMe: { ...state.lastMessageIsSentByMe, [userId]: false }
        }));
      }
      set((state) => ({
        lastMessages: { ...state.lastMessages, [userId]: res.data?.text || "No messages yet" }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get last message");
      set((state) => ({
        lastMessages: { ...state.lastMessages, [userId]: "No messages yet" }
      }));
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  deleteMessage: async (messageId) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: messages.filter((message) => message._id !== messageId),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  editMessage: async (messageId, text) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.patch(`/messages/edit/${messageId}`, { text });
      set({
        messages: messages.map((message) => (message._id === messageId ? res.data : message)),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },



  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));