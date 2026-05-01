import mongoose from 'mongoose';

const getHealth = async (_req: any, res: any) => {
  const mongoState = mongoose.connection.readyState;

  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    dependencies: {
      mongo: {
        ready: mongoState === 1,
        state: mongoState,
      },
      redis: {
        configured: Boolean(process.env.REDIS_URL),
      },
      stripe: {
        configured: Boolean(process.env.STRIPE_SECRET_KEY),
        webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      },
    },
  });
};

export { getHealth };
