import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Scale, ShieldCheck } from "lucide-react";

import type { AppDispatch, RootState } from "../../store/store";
import { clearError, loginUser } from "../../store/slices/adminAuthSlice";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  /* ===========================
      ROLE-BASED REDIRECTION
  =========================== */
  useEffect(() => {
    if (user) {
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
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "auth-error" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

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
        }),
      ).unwrap();

      toast.success("Identity Verified", { id: toastId });
    } catch (err: any) {
      toast.error(err || "Access Denied", { id: toastId });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center relative fixed inset-0">
      {/* Accent Bars */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#355E3B] z-50" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#C5A059] z-50" />

      {/* Watermark */}
      <Scale
        className="absolute -right-24 -bottom-24 text-slate-200/50 rotate-[-15deg] pointer-events-none"
        size={400}
      />

      <div className="w-full max-w-md px-6 z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#355E3B]/10 text-[#355E3B] mb-4">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Secure Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#355E3B] leading-tight">
            THE JUDICIARY
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059] mt-1">
            High Court of Kenya
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">
          {/* Internal card decorative line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#355E3B]" />

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Officer Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide your official credentials to access the registry.
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300"
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

        {/* Institutional Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-slate-200" />
            Office of the Registrar
            <span className="w-8 h-[1px] bg-slate-200" />
          </p>
          <img
            src="/judiciary-logo.png"
            alt="Logo"
            className="h-10 mx-auto opacity-80 grayscale hover:grayscale-0 transition-all cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
