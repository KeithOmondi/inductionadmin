import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import toast from "react-hot-toast";
import { Lock, KeyRound, Scale } from "lucide-react";
import { forceResetPassword } from "../../store/slices/adminAuthSlice";
import type { RootState } from "../../store/store";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionValid, setSessionValid] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading } = useAppSelector(
    (state: RootState) => state.auth
  );

  // 🔐 Get token from state or URL
  const resetToken =
    location.state?.resetToken ||
    new URLSearchParams(location.search).get("token");

  /* ===========================
     VALIDATE TOKEN PRESENCE
  ============================ */
  useEffect(() => {
    if (!resetToken) {
      navigate("/login", { replace: true });
      return;
    }
    setSessionValid(true);
  }, [resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const toastId = toast.loading("Updating Registry Credentials...");

    try {
      await dispatch(
        forceResetPassword({ newPassword, resetToken })
      ).unwrap();

      toast.success("Password updated successfully", { id: toastId });

      navigate("/dashboard", { replace: true });

    } catch (err: any) {
      toast.error(err?.message || "Failed to update password", {
        id: toastId,
      });
    }
  };

  if (!sessionValid) return null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center relative fixed inset-0">
      
      {/* Top & Bottom Accent Bars */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#355E3B] z-50" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#C5A059] z-50" />

      {/* Watermark */}
      <Scale
        className="absolute -right-24 -bottom-24 text-slate-200/50 rotate-[-15deg] pointer-events-none"
        size={400}
      />

      <div className="w-full max-w-md px-6 z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#355E3B] leading-tight">
            OFFICE OF THE REGISTRAR
          </h1>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059] mt-1">
            High Court of Kenya
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">
          
          {/* Side Accent Bar */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#355E3B]" />

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight text-center">
              Password Reset is Requireed
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center">
              For security compliance, update your credentials before accessing your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                New Secure Password
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#b38f4d] active:scale-[0.99] disabled:opacity-70 text-[#355E3B] font-black text-[11px] uppercase tracking-[0.25em] py-4 rounded-xl transition-all shadow-lg shadow-[#C5A059]/30 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? "Processing..." : "Update & Verify Identity"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;