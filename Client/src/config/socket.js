import { io } from "socket.io-client";
import { BASE_URL } from "./api.js";

// Extract the base server URL by removing trailing /api or /api/
const SOCKET_URL = BASE_URL ? BASE_URL.replace(/\/api\/?$/, "") : "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
