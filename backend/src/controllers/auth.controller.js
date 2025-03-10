import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import jwt from 'jsonwebtoken';
import { generateAuthToken } from "../lib/utils.js";
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

export const verifyEmailController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.email) {
    return res.status(400).send("Invalid token");
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: decoded.email },
    { isVerified: true },
  );

  if (!updatedUser) {
    return res.status(404).send("User not found");
  }

  res.redirect(`${process.env.CLIENT_URL}/`);
});

export const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, verificationToken } = req.body;

  const decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);
  if (!decodedToken || decodedToken.email !== email) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
    isVerified: true,
  });

  await newUser.save();
  generateAuthToken(newUser._id, res);

  res.status(201).json({ message: 'Account Created Successfully' });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "Email not verified" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Password is Incorrect" });
  }

  generateAuthToken(user._id, res);

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    return res.status(400).json({ message: "Profile pic is required" });
  }

  const uploadResponse = await cloudinary.uploader.upload(profilePic);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true }
  );

  res.status(200).json(updatedUser);
});

export const checkAuth = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json(req.user);
});