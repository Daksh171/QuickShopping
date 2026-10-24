import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from './orders.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createOrderSchema } from './orders.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
