import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../store/store";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // Added this to handle multiple roles
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. Handle Initial Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#c5a059]" size={40} />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Access Check
  // Checks if the user's role exists within the allowedRoles array
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    console.error(`SECURE ACCESS DENIED: Role '${user.role}' is unauthorized.`);
    return (
      <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-red-900/20 rounded-full mb-4 border border-red-500/30">
          <ShieldAlert className="text-red-500" size={32} />
        </div>
        <h1 className="text-xl font-serif text-white uppercase tracking-tight">Access Denied</h1>
        <p className="text-sm text-gray-400 mt-2 max-w-xs">
          Your account role ({user.role}) does not have clearance for this section.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 text-[#c5a059] text-sm font-bold uppercase hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
}