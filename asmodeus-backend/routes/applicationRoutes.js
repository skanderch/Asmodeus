import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createApplication } from '../controllers/applicationController.js';

const router = express.Router();

router.post('/', verifyToken, createApplication);

export default router;


