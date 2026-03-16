const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('[Secom] VITE_API_URL is not defined. Set it in your .env file.');
}

export const ENV = {
  API_URL: apiUrl as string,
} as const;
