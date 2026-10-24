import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from './cart.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addCartItemSchema, updateCartItemSchema } from './cart.validation';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addCartItemSchema), addItem);
router.patch('/items/:id', validate(updateCartItemSchema), updateItem);
router.delete('/items/:id', removeItem);

export default router;
