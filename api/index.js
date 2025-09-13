import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from '../backend/src/lib/db.js';
import authRoutes from '../backend/src/routes/auth.route.js';
import messageRoutes from '../backend/src/routes/message.route.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? process.env.CLIENT_URL || true
        : "http://localhost:5175",
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// For Vercel serverless functions
export default app;
