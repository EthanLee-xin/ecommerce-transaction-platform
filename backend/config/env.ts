const APP_ENV = process.env.APP_ENV || process.env.NODE_ENV || 'development';

type AppEnv = 'development' | 'staging' | 'production';

const ENVIRONMENTS: Record<AppEnv, { name: string; apiBaseUrl: string; useRedis: boolean }> = {
  development: {
    name: 'development',
    apiBaseUrl: 'http://localhost:5000',
    useRedis: false,
  },
  staging: {
    name: 'staging',
    apiBaseUrl: process.env.STAGING_API_BASE_URL || 'https://staging-api.vipshop.example',
    useRedis: true,
  },
  production: {
    name: 'production',
    apiBaseUrl: process.env.PROD_API_BASE_URL || 'https://api.vipshop.example',
    useRedis: true,
  },
};

const getAppEnvironment = () => ENVIRONMENTS[(APP_ENV as AppEnv) || 'development'];

export { APP_ENV, ENVIRONMENTS, getAppEnvironment };
