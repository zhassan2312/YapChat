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
  isMarkingAsRead: false,
  lastMessages: {},  // Store last message per user
  unReadMessagesCounts: {}, // Store unread message count per user
  lastMessageIsSentByMe: {},
  isLoadingImage: false,

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

      // Reset unread count for this user
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [userId]: 0 },
      }));

      // **Notify sender that message is read**
      const socket = useAuthStore.getState().socket;
      socket.emit("markAsRead", { senderId: userId, receiverId: useAuthStore.getState().authUser._id });
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
          const lastMessageText = res.data.image ? 'Photo' : res.data.text;
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
            lastMessages: { ...state.lastMessages, [userId]: lastMessageText || "No messages yet" }
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

      socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({
          messages: [...get().messages, newMessage],
        });

        set((state) => ({
          lastMessages: { ...state.lastMessages, [selectedUser._id]: res.data.text },
          unReadMessagesCounts: { ...state.unReadMessagesCounts, [selectedUser._id]: 0 },
          lastMessageIsSentByMe: { ...state.lastMessageIsSentByMe, [selectedUser._id]: true }
        }));
      });

      
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
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { senderId, text } = newMessage;
      const { selectedUser } = get();

      // If the selected user is the sender, mark message as read instantly
      if (selectedUser?._id === senderId) {
        get().markMessageAsRead(senderId);
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
        lastMessages: { ...state.lastMessages, [senderId]: text },
        lastMessageIsSentByMe: { ...state.lastMessageIsSentByMe, [senderId]: false },
        unReadMessagesCounts: {
          ...state.unReadMessagesCounts,
          [senderId]: (state.unReadMessagesCounts[senderId] || 0) + 1,
        },
      }));
    });

    // **Handle "messageRead" event for sender**
    socket.on("messageRead", ({ senderId }) => {
      set((state) => ({
        unReadMessagesCounts: { ...state.unReadMessagesCounts, [senderId]: 0 },
      }));
    });

    // **Handle "messagesUpdated" to refresh UI for the receiver**
    socket.on("messagesUpdated", () => {
      set((state) => ({
        messages: [...state.messages],
      }));
    });
  },
  

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser })
    set((state) => ({
      unReadMessagesCounts: { ...state.unReadMessagesCounts, [selectedUser._id]: 0 }
    }));
  },

  downloadImage: async (senderId) => {
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
      toast.error(error.response.data.message);
    } finally {
      set({ isLoadingImage: false });
    }
  },


}));