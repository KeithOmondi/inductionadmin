import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Scale } from "lucide-react";

import type { AppDispatch, RootState } from "../../store/store";
import { clearError, loginUser } from "../../store/slices/adminAuthSlice";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  /* ===========================
     EFFECTS
  =========================== */

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

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
      toast.error("All credentials are required");
      return;
    }

    const toastId = toast.loading("Authenticating with Registry...");

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      ).unwrap();

      toast.success("Authentication successful", { id: toastId });
    } catch (err: any) {
      toast.error(err || "Invalid credentials", { id: toastId });
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex items-center justify-center relative fixed inset-0">
      {/* Accent Bars */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#355E3B]" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#EFBF04]" />

      {/* Watermark */}
      <Scale
        className="absolute -right-24 -bottom-24 text-gray-100 rotate-[-15deg] pointer-events-none"
        size={320}
      />

      <div className="w-full max-w-md px-6 z-10">
        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-[#355E3B] leading-tight">
            OFFICE OF THE REGISTRAR <br /> HIGH COURT
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mt-2">
            administrative task portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src="https://res.cloudinary.com/do0yflasl/image/upload/v1770035125/JOB_LOGO_qep9lj.jpg"
                alt="Judiciary Logo"
                className="h-16 w-auto object-contain border-b border-[#EFBF04] pb-1"
              />
            </div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Admin Login
            </h2>
            <p className="text-[10px] text-gray-500 mt-1">
              Authorized registrar personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#355E3B] ml-1">
                Official Email
              </label>
              <div className="relative mt-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-[#EFBF04] rounded-lg pl-10 pr-4 py-3 text-xs font-semibold text-gray-800 outline-none transition-all"
                  placeholder="registrar@court.go.ke"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#355E3B] ml-1">
                Security Password
              </label>
              <div className="relative mt-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-[#EFBF04] rounded-lg pl-10 pr-4 py-3 text-xs font-semibold text-gray-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#355E3B] hover:bg-[#2a4b2f] active:scale-[0.98] disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-[0.2em] py-3.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EFBF04] animate-pulse" />
            Principal Registry • ORHC
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
