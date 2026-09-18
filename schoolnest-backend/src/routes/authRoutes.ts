import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Public: Register a new SCHOOL_ADMIN
router.post('/register', register);

// Public: Login and get token
router.post('/login', login);

export default router;
