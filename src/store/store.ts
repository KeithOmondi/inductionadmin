// admin/src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/adminAuthSlice";
import adminChatReducer from "./slices/adminMessageSlice"
import usersReducer from "./slices/adminUserSlice"
import filesReducer from "./slices/filesSlice"
import courtReducer from "./slices/courtInformationSlice"
import guestReducer from "./slices/guestSlice"
import noticesReducer from "./slices/noticeSlice"
import eventsReducer from "./slices/eventSlice"
import userChatReducer from "./slices/userChatSlice"
import pushReducer from "./slices/pushSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminChat: adminChatReducer,
    users: usersReducer,
    files: filesReducer,
    court: courtReducer,
    guest: guestReducer,
    notices: noticesReducer,
    events: eventsReducer,
    userChat: userChatReducer,
    push: pushReducer
    // add other slices here
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
