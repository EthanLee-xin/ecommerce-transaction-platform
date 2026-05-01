import express from 'express';
import { getMetricsSnapshot, resetMetrics } from '../utils/metrics.ts';

const router = express.Router();

router.get('/', (req, res) => {
  const snapshot = getMetricsSnapshot();
  res.json({
    success: true,
    data: snapshot,
  });
});

router.post('/reset', (req, res) => {
  resetMetrics();
  res.json({
    success: true,
    message: 'Metrics reset successfully',
  });
});

export default router;
