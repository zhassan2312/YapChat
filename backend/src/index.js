import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app,server } from './lib/socket.js';
import path from 'path';
dotenv.config(); // Ensure this is called before using any environment variables


const __dirname = path.resolve();
app.use(express.json()); // Increase payload size limit
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? "https://yapchat.onrender.com" 
        : "http://localhost:5173",
    credentials: true,
}));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '/frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    
    });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('Server is running on PORT ' + PORT);
    connectDB();
});