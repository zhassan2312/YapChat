import express from 'express';
import {sendMessage,getMessages,getUsersForSidebar,markMessageAsRead,deleteMessage,editMessage} from '../controllers/message.controller.js';
import {protectRoute} from '../middleware/auth.middleware.js';
const router=express.Router();

router.get('/users',protectRoute,getUsersForSidebar);
router.get('/:id',protectRoute,getMessages);
router.post('/send/:id',protectRoute,sendMessage);
router.patch('/mark-read/:id',protectRoute,markMessageAsRead);
router.delete('/:id',protectRoute,deleteMessage);
router.patch('/edit/:id',protectRoute,editMessage);

export default router;