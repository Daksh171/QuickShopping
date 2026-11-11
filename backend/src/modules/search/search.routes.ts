import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getSearchSuggestions,
  recordSearchEvent,
  getTrendingSearches,
} from './search.controller';
import { validate } from '../../middleware/validate';
import {
  suggestionsQuerySchema,
  searchEventBodySchema,
} from './search.validation';

const router = Router();

// Rate limiter for recording search events: 30 requests per minute per IP
const searchEventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many search events. Please slow down.' },
});

router.get('/suggestions', validate(suggestionsQuerySchema, 'query'), getSearchSuggestions);
router.post('/events', searchEventLimiter, validate(searchEventBodySchema, 'body'), recordSearchEvent);
router.get('/trending', getTrendingSearches);

export default router;

