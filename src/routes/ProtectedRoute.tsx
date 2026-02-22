import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { RootState } from "../store/store";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. Handle Initial Loading State (Session Restoration)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#013220]" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Strict Admin Check
  if (user.role !== "admin") {
    console.error("SECURE ACCESS DENIED: Insufficient Privileges");
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-100 rounded-full mb-4">
          <ShieldAlert className="text-rose-600" size={32} />
        </div>
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">
          Your account does not have administrative clearance for this ledger.
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  // Authorized
  return children;
}