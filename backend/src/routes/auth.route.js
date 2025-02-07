import express from 'express';
import {login,signup,logout,updateProfile,checkAuth} from '../controllers/auth.controller.js';
import {protectRoute} from '../middleware/auth.middleware.js';

const router=express.Router();

router.post('/login',login);

router.post('/logout',logout);

router.post('/signup',signup);

router.put('/update-profile',protectRoute,updateProfile);

router.get('/check',protectRoute,checkAuth);
export default router;
