import { io } from "socket.io-client";
import { BASE_URL } from "./api.js";

// Extract the base server URL by removing trailing /api or /api/
const SOCKET_URL = BASE_URL ? BASE_URL.replace(/\/api\/?$/, "") : "http://localhost:5000";

let socketInstance = null;
try {
  socketInstance = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
} catch (error) {
  console.warn("Socket.io client initialization error:", error);
}

export const socket = socketInstance;
export default socket;
