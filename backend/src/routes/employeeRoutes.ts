import { Router } from 'express';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, verifyPasskey, changePasskey } from '../controllers/employeeController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Passkey management
router.post('/verify-passkey', verifyPasskey);
router.put('/passkey', changePasskey);

// Employee CRUD
router.get('/', getEmployees);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
