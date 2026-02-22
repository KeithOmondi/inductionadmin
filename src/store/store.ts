// admin/src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/adminAuthSlice";
import adminChatReducer from "./slices/adminMessageSlice"
import usersReducer from "./slices/adminUserSlice"
import filesReducer from "./slices/filesSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminChat: adminChatReducer,
    users: usersReducer,
    files: filesReducer
    // add other slices here
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
