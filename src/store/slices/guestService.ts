import axios from "axios";
import type { IGuest } from "../../types/guestTypes";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/* =========================
   ADMIN
========================= */

export const createGuest = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<IGuest> => {
  const res = await API.post("/guests/create", data);
  return res.data.guest;
};

export const getAllGuests = async (): Promise<IGuest[]> => {
  const res = await API.get("/guests/all");
  return res.data.guests;
};

export const deleteGuest = async (id: string): Promise<string> => {
  await API.delete(`/guests/${id}`);
  return id;
};

/* =========================
   GUEST
========================= */

export const getGuestProfile = async (): Promise<IGuest> => {
  const res = await API.get("/guests/profile");
  return res.data.guest;
};

export const getGuestRegistry = async () => {
  const res = await API.get("/guests/registry");
  return res.data.data;
};
