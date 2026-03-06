import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";
import { store, type AppDispatch, type RootState } from "./store/store";
import { refreshUser } from "./store/slices/adminAuthSlice";
import { disconnectSocket, initSocket } from "./services/socket";

/* =====================================================
   APP CONTENT
===================================================== */

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socketInitialized = useRef(false);

  const user = useSelector((state: RootState) => state.auth.user);

  /* =====================================================
     AUTH SESSION RESTORE (NON BLOCKING)
  ===================================================== */

  useEffect(() => {
    console.log("[APP] Checking existing session...");

    dispatch(refreshUser())
      .unwrap()
      .then(() => {
        console.log("[APP] Session restored");
      })
      .catch(() => {
        console.log("[APP] No session found");
      });

  }, [dispatch]);

  /* =====================================================
     SOCKET MANAGEMENT
  ===================================================== */

  useEffect(() => {
    if (!user?._id) {
      disconnectSocket();
      socketInitialized.current = false;
      return;
    }

    if (socketInitialized.current) return;

    console.log("[SOCKET] Connecting:", user._id);

    initSocket(user._id);

    socketInitialized.current = true;

  }, [user]);

  return <AppRoutes />;
};

/* =====================================================
   ROOT APP
===================================================== */

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>

        <AppContent />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff",
            },
          }}
        />

      </BrowserRouter>
    </Provider>
  );
};

export default App;
