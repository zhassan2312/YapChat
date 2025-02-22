import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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

    res.status(200).json({ message: 'Messages marked as read{userToChatId}' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const message = await Message
      .findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.text = text;
    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: `Server Error${err}` });
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
    console.log("Error in unReadMessagesCount controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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
    console.log("Error in getLastMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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
      console.log("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
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
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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
    
  } catch (err) {
    res.status(500).json({ message: `Server Error${err}` });
  }
};


export const downloadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message || !message.image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    console.log(message.image);
    res.status(200).json({ imageUrl: message.image });
  }
  catch (err) {
    res.status(500).json({ message: `Server Error${err}` });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { id:receiverId } = req.params;
    const { text,image } = req.body;
    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      text: text,
      image: image,
      forwarded:true
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", newMessage);
    }
    res.status(201).json(newMessage);
  }
  catch (err) {
    res.status(500).json({ message: `Server Error${err}` });
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
    console.log("Error in searchMessageWithinChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};