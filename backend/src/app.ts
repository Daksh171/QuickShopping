import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import ordersRoutes from './modules/orders/orders.routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(requestIdMiddleware);

// Request logging
app.use((req, _res, next) => {
  console.log(`[${req.requestId}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
