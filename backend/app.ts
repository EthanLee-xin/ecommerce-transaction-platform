import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import userRoutes from './routes/userRoutes.ts';
import orderRoutesFactory from './routes/orderRoutes.ts';
import stripeRoutes from './routes/stripeRoutes.ts';
import metricsRoutes from './routes/metricsRoutes.js';
import { requestLogger } from './middleware/requestLogger.ts';
import { metricsMiddleware } from './middleware/metricsMiddleware.ts';
import { notFound, errorHandler } from './middleware/errorMiddleware.ts';
import { inMemoryIdempotencyStore, createRedisIdempotencyStore } from './utils/idempotencyStore.ts';
import { createRedisClient } from './config/redis.ts';
import { getHealth } from './middleware/healthMiddleware.ts';

const app = express();

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(metricsMiddleware);

const initRoutes = async () => {
  const redisClient = await createRedisClient();
  const idempotencyStore = redisClient
    ? createRedisIdempotencyStore(redisClient)
    : inMemoryIdempotencyStore;

  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutesFactory(idempotencyStore));
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/metrics', metricsRoutes);
};

await initRoutes();

app.get('/api/health', getHealth);
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
