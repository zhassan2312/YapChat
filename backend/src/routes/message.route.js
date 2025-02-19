import express from 'express';
import {
    sendMessage,
    getMessages,
    getUsersForSidebar,
    markMessageAsRead,
    deleteMessage,
    editMessage,
    unReadMessagesCount,
    getLastMessage,
    downloadImage,
    forwardMessage
} from '../controllers/message.controller.js';
import {protectRoute} from '../middleware/auth.middleware.js';
const router=express.Router();

router.get('/users',protectRoute,getUsersForSidebar);
router.get('/:id',protectRoute,getMessages);
router.post('/send/:id',protectRoute,sendMessage);
router.patch('/mark-read/:id',protectRoute,markMessageAsRead);
router.delete('/:id',protectRoute,deleteMessage);
router.get('/download-image/:id',protectRoute,downloadImage);
router.patch('/edit/:id',protectRoute,editMessage);
router.get('/unread-count/:id',protectRoute,unReadMessagesCount);
router.get('/last-message/:id',protectRoute,getLastMessage);
router.post('/forward-message/:id',protectRoute,forwardMessage);
export default router;