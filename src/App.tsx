import { useEffect, useState, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { store, type AppDispatch, type RootState } from "./store/store";
import { refreshUser } from "./store/slices/adminAuthSlice";
import { initSocket } from "./services/socket";

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);

  // 🔑 prevents multiple socket initializations
  const socketInitialized = useRef(false);

  const user = useSelector((state: RootState) => state.auth.user);

  /* ================= AUTH REFRESH ================= */
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[APP] Attempting session refresh...");
        await dispatch(refreshUser()).unwrap();
        console.log("[APP] Session restored");
      } catch {
        console.log("[APP] No active session restored.");
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [dispatch]);

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    if (!user?._id) {
      console.log("[SOCKET] No user yet, skipping socket init");
      return;
    }

    if (socketInitialized.current) {
      console.log("[SOCKET] Already initialized, skipping...");
      return;
    }

    console.log("[SOCKET] Initializing socket for user:", user._id);
    initSocket(user._id);
    socketInitialized.current = true;
  }, [user]);

  /* ================= LOADING SCREEN ================= */
  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-serif italic animate-pulse">
            Verifying registry credentials...
          </p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
};

/* ================= ROOT APP ================= */
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