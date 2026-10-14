import { Router } from 'express';
import { getEmployees, addEmployee, deleteEmployee } from '../controllers/employeeController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getEmployees);
router.post('/', addEmployee);
router.delete('/:id', deleteEmployee);

export default router;
