// src/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize socket connection for a user
 */
export const initSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL as string, {
      withCredentials: true, // ✅ send cookies
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);

      // Setup user after connection
      socket?.emit("setup", { _id: userId });
    });

    socket.on("connected", (data) => {
      console.log("✅ Online users:", data.onlineUsers);
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