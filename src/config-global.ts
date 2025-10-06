// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
};

export const CONFIG: ConfigValue = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ONSAE',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
};
