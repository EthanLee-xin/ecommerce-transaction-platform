const APP_NAME = 'vipshop-ecommerce';

const DEPLOYMENT_STEPS = [
  'Install dependencies',
  'Run tests',
  'Build frontend',
  'Deploy backend and frontend artifacts',
  'Run smoke tests',
  'Enable monitoring checks',
];

const ROLLBACK_STEPS = [
  'Stop current release',
  'Revert to last known good version',
  'Restore environment variables if needed',
  'Re-run smoke tests',
  'Verify metrics and logs',
];

export { APP_NAME, DEPLOYMENT_STEPS, ROLLBACK_STEPS };
