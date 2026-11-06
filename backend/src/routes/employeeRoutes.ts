import { Router } from 'express';
import { getEmployees, addEmployee, deleteEmployee, verifyPasskey, changePasskey } from '../controllers/employeeController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Passkey management
router.post('/verify-passkey', verifyPasskey);
router.put('/passkey', changePasskey);

// Employee CRUD
router.get('/', getEmployees);
router.post('/', addEmployee);
router.delete('/:id', deleteEmployee);

export default router;
