import express from 'express';
import {login,signup,logout,updateProfile,checkAuth,verifyEmailController} from '../controllers/auth.controller.js';
import {protectRoute} from '../middleware/auth.middleware.js';

import {verifyEmail} from '../middleware/auth.middleware.js';
const router=express.Router();

router.post('/login',login);

router.post('/logout',logout);

router.post('/signup',verifyEmail,signup);
router.get('/verify-email/:token',verifyEmailController);

router.put('/update-profile',protectRoute,updateProfile);

router.get('/check',protectRoute,checkAuth);
export default router;
