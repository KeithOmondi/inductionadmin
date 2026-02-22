// src/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize socket connection for a user
 * @returns Socket instance
 */
export const initSocket = (userId: string, token: string): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL as string, {
      auth: { token },
    });

    // Setup user after connecting
    socket.emit("setup", { _id: userId });

    socket.on("connected", (data) => {
      console.log("✅ Socket connected. Online users:", data.onlineUsers);
    });

    socket.on("presence:online", ({ userId }) => {
      console.log(`🟢 User ${userId} is online`);
    });

    socket.on("presence:offline", ({ userId, lastSeen }) => {
      console.log(`⚫ User ${userId} went offline at ${lastSeen}`);
    });
  }

  return socket;
};

/**
 * Get the existing socket instance
 */
export const getSocket = (): Socket | null => socket;
