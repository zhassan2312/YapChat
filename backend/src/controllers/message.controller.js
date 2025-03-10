import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const handleError = (res, error, message = "Internal server error") => {
  console.error(message, error.message);
  res.status(500).json({ error: message });
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    handleError(res, error, "Error in getUsersForSidebar");
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: `Messages marked as read for user ${userToChatId}` });
  } catch (error) {
    handleError(res, error, "Error in markMessageAsRead");
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.text = text;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    handleError(res, error, "Error in editMessage");
  }
};

export const unReadMessagesCount = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const count = await Message.countDocuments({
      senderId: userToChatId,
      receiverId: myId,
      isRead: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    handleError(res, error, "Error in unReadMessagesCount");
  }
};

export const getLastMessage = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const lastMessage = await Message.findOne({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: -1 });

    if (!lastMessage) {
      return res.status(404).json({ message: 'No messages found' });
    }

    res.status(200).json(lastMessage);
  } catch (error) {
    handleError(res, error, "Error in getLastMessage");
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    handleError(res, error, "Error in getMessages");
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    handleError(res, error, "Error in sendMessage");
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    handleError(res, error, "Error in deleteMessage");
  }
};

export const downloadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message || !message.image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.status(200).json({ imageUrl: message.image });
  } catch (error) {
    handleError(res, error, "Error in downloadImage");
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      text,
      image,
      forwarded: true,
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    handleError(res, error, "Error in forwardMessage");
  }
};

export const searchMessageWithinChat = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { searchQuery } = req.body;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      text: { $regex: searchQuery, $options: "i" },
    });

    res.status(200).json(messages);
  } catch (error) {
    handleError(res, error, "Error in searchMessageWithinChat");
  }
};

export const sidebarSearch = async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const users = await User.find({ name: { $regex: searchQuery, $options: "i" } });
    res.status(200).json(users);
  } catch (error) {
    handleError(res, error, "Error in sidebarSearch");
  }
};