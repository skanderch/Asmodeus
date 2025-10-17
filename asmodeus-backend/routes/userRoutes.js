import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, getAllUsers, updateUserStatus, forgotPassword, createUserAdmin, updateUserAdmin, deleteUserAdmin, getCurrentUserModules, listModules, getUserModules, setUserModules } from '../controllers/userController.js';
import { verifyToken, requireAdmin, requireModule } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/all', verifyToken, requireAdmin, getAllUsers);
router.put('/:userId/status', verifyToken, requireAdmin, requireModule('Users:Write'), updateUserStatus);
router.post('/', verifyToken, requireAdmin, requireModule('Users:Write'), createUserAdmin);
router.put('/:userId', verifyToken, requireAdmin, requireModule('Users:Write'), updateUserAdmin);
router.delete('/:userId', verifyToken, requireAdmin, requireModule('Users:Delete'), deleteUserAdmin);

// Current user's modules
router.get('/me/modules', verifyToken, getCurrentUserModules);

// Admin module management
router.get('/modules', verifyToken, requireAdmin, listModules);
router.get('/:userId/modules', verifyToken, requireAdmin, getUserModules);
router.put('/:userId/modules', verifyToken, requireAdmin, setUserModules);

// (Module management endpoints removed per request)

export default router;
