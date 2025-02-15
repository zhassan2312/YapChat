import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import nodemailer from 'nodemailer';
import { generateVerificationToken } from "../lib/utils.js";
import { EmailHTML } from "../lib/Email.js";


export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});
export const verifyEmail = async (req, res,next) => {
  const { fullName, email, password } = req.body;
  try{
    if (!fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if(!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if(!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const token=generateVerificationToken(email);
    req.body.verificationToken = token; // Store token in req.body for signup()
    const url = `http://localhost:5001/api/auth/verify-email/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Muslim Center-Verify Your Email',
      html: EmailHTML(url)
    });
    
    next();
  }
  catch{
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};