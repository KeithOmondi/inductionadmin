// src/services/messageService.ts
import axios from "axios";
import { getSocket } from "./socket";

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessageAPI = async (payload: {
  receiver?: string;
  group?: string;
  text?: string;
  file?: File;
}) => {
  const formData = new FormData();
  if (payload.receiver) formData.append("receiver", payload.receiver);
  if (payload.group) formData.append("group", payload.group);
  if (payload.text) formData.append("text", payload.text);
  if (payload.file) formData.append("file", payload.file);

  const { data } = await axios.post(`${API_URL}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const onMessageReceived = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket?.on("message:new", callback);
};