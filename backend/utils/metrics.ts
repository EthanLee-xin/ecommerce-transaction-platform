type RequestDurationEntry = {
  durationMs: number;
  route: string;
  timestamp: string;
};

type MetricCounts = {
  requestDurations: RequestDurationEntry[];
  paymentSuccess: number;
  paymentFailure: number;
  refundSuccess: number;
  refundFailure: number;
  orderCreateSuccess: number;
  orderCreateFailure: number;
};

const metrics: MetricCounts = {
  requestDurations: [],
  paymentSuccess: 0,
  paymentFailure: 0,
  refundSuccess: 0,
  refundFailure: 0,
  orderCreateSuccess: 0,
  orderCreateFailure: 0,
};

type MetricKey = Exclude<keyof MetricCounts, 'requestDurations'>;

const recordMetric = (name: MetricKey, value = 1) => {
  if (typeof metrics[name] === 'number') {
    metrics[name] += value;
  }
};

const recordRequestDuration = (durationMs: number, route = '') => {
  metrics.requestDurations.push({ durationMs, route, timestamp: new Date().toISOString() });
};

const getMetricsSnapshot = () => {
  const durations = metrics.requestDurations.map((entry) => entry.durationMs);
  const avgDuration = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : 0;

  return {
    ...metrics,
    averageRequestDurationMs: avgDuration,
  };
};

const resetMetrics = () => {
  metrics.requestDurations = [];
  metrics.paymentSuccess = 0;
  metrics.paymentFailure = 0;
  metrics.refundSuccess = 0;
  metrics.refundFailure = 0;
  metrics.orderCreateSuccess = 0;
  metrics.orderCreateFailure = 0;
};

export {
  metrics,
  recordMetric,
  recordRequestDuration,
  getMetricsSnapshot,
  resetMetrics,
};
