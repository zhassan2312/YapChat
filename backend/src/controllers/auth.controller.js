import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import jwt from 'jsonwebtoken';
import { generateAuthToken } from "../lib/utils.js";
//import passport from "../lib/passport.js";

export const verifyEmailController=async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.email) {
      return res.status(400).send("Invalid token");
    }

    // Find the user and set `isVerified` to true
    const updatedUser = await User.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true },
    );
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.redirect(`${process.env.CLIENT_URL}/`);
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(400).send("Invalid or expired token");
  }
}


export const signup = async (req, res) => {
  try {
    const { fullName, email, password, verificationToken } = req.body;

    // Ensure token is present
    if (!verificationToken) {
      return res.status(400).json({ message: "Verification token is missing" });
    }

    // Decode token to validate email
    const decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);
    if (!decodedToken || decodedToken.email !== email) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: true, // Ensure user is marked as verified
    });

    await newUser.save(); // Save to DB
    generateAuthToken(newUser._id, res);

    res.status(201).json({ message: 'Account Created Successfully' });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if(!user.isVerified)
    {
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
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
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
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};