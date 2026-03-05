import { useEffect, useState, useRef } from "react";
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

  const [isInitializing, setIsInitializing] = useState(true);

  const socketInitialized = useRef(false);

  const user = useSelector((state: RootState) => state.auth.user);

  /* =====================================================
     AUTH SESSION RESTORE
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[APP] Checking existing session...");

        await dispatch(refreshUser()).unwrap();

        console.log("[APP] Session restored successfully");
      } catch (error) {
        console.log("[APP] No active session found.");
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  /* =====================================================
     SOCKET MANAGEMENT
  ===================================================== */

  useEffect(() => {
    if (!user?._id) {
      console.log("[SOCKET] No user logged in");

      disconnectSocket();

      socketInitialized.current = false;

      return;
    }

    if (socketInitialized.current) return;

    console.log("[SOCKET] Connecting for user:", user._id);

    initSocket(user._id);

    socketInitialized.current = true;
  }, [user]);

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin" />

          <p className="text-slate-500 font-serif italic animate-pulse">
            Office of the Registrar High Court...
          </p>

        </div>
      </div>
    );
  }

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
