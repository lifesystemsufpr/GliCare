import axios from 'axios';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn(
    'EXPO_PUBLIC_API_URL não foi definida. Verifique o arquivo .env.',
  );
}

export const api = axios.create({
  baseURL: apiUrl,

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});