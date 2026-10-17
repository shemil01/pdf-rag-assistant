export const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ai-chat-bot-server-yod7.onrender.com"
    : "http://127.0.0.1:3001");
