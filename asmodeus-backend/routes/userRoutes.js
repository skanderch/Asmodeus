import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, getAllUsers, updateUserStatus, forgotPassword } from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/all', verifyToken, requireAdmin, getAllUsers);
router.put('/:userId/status', verifyToken, requireAdmin, updateUserStatus);

export default router;
