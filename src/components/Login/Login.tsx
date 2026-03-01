import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Scale, ShieldCheck } from "lucide-react";

import type { RootState } from "../../store/store";
import { clearError, loginUser } from "../../store/slices/adminAuthSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type LoginError = {
  message: string;
  needsReset?: boolean;
  resetToken?: string;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useAppSelector(
    (state: RootState) => state.auth
  );

  /* ===========================
      NORMAL ROLE REDIRECTION
  =========================== */
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      case "judge":
        navigate("/dashboard", { replace: true });
        break;
      default:
        navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate]);

  /* ===========================
      ERROR TOAST HANDLING
  =========================== */
  useEffect(() => {
    if (error) {
      toast.error(error, { id: "auth-error" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  /* ===========================
      LOGIN HANDLER
  =========================== */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Registry credentials required");
      return;
    }

    const toastId = toast.loading("Verifying with High Court Registry...");

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      ).unwrap();

      toast.success("Identity Verified", { id: toastId });

    } catch (err) {
      const error = err as LoginError;

      // 🔐 Forced Reset Flow (Handled Properly)
      if (error?.needsReset && error?.resetToken) {
        toast.dismiss(toastId);

        toast("Initial Login Detected: Password Reset Required 🔐", {
          duration: 4000,
        });

        navigate("/reset-password", {
          state: { resetToken: error.resetToken },
          replace: true,
        });

        return;
      }

      toast.error(error?.message || "Access Denied", { id: toastId });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center relative fixed inset-0">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#355E3B] z-50" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#C5A059] z-50" />

      <Scale
        className="absolute -right-24 -bottom-24 text-slate-200/50 rotate-[-15deg] pointer-events-none"
        size={400}
      />

      <div className="w-full max-w-md px-6 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#355E3B]/10 text-[#355E3B] mb-4">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Secure Portal
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#355E3B] leading-tight">
            OFFICE OF THE REGISTRAR
          </h1>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059] mt-1">
            High Court of Kenya
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#355E3B]" />

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Officer Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide official credentials to establish a secure session.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Official Email
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                  placeholder="name@judiciary.go.ke"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Registry Password
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#355E3B] hover:bg-[#2a4b2f] active:scale-[0.99] disabled:opacity-70 text-white font-black text-[11px] uppercase tracking-[0.25em] py-4 rounded-xl transition-all shadow-lg shadow-[#355E3B]/20 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? "Authenticating..." : "Establish Secure Session"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;