import { Router } from 'express';
import { getProducts, getProductById, getProductBySlug } from './products.controller';
import { validate } from '../../middleware/validate';
import { productQuerySchema } from './products.validation';

const router = Router();

router.get('/', validate(productQuerySchema, 'query'), getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

export default router;
