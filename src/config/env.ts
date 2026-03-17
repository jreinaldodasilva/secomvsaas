const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl && import.meta.env.MODE !== 'test') {
  throw new Error('[Secom] VITE_API_URL is not defined. Set it in your .env file.');
}

export const ENV = {
  API_URL: (apiUrl ?? 'http://localhost:5000') as string,
  APP_ENV: (import.meta.env.VITE_APP_ENV ?? 'development') as 'development' | 'staging' | 'production',
  IS_DEV:  import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE:    import.meta.env.MODE,
} as const;
