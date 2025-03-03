export enum Mode {
  DEV = "development",
  PROD = "production",
}

interface WithEnvMode {
  readonly env: {
    readonly MODE: Mode;
  };
}

export const mode = (import.meta as unknown as WithEnvMode).env.MODE;

// App information
export const APP_ID = import.meta.env.VITE_APP_ID || 'queuebeats';

// API URLs and paths
export const API_PATH = '';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
export const WS_API_URL = import.meta.env.VITE_WS_API_URL || 'ws://localhost:8001';

// App configuration
export const APP_BASE_PATH = '/';
export const APP_TITLE = 'QueueBeats';
export const APP_FAVICON_LIGHT = '/favicon-light.svg';
export const APP_FAVICON_DARK = '/favicon-dark.svg';

// Deployment information (not needed for QueueBeats)
export const APP_DEPLOY_USERNAME = '';
export const APP_DEPLOY_APPNAME = '';
export const APP_DEPLOY_CUSTOM_DOMAIN = '';
