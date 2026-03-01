import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import toast from "react-hot-toast";
import { Lock, KeyRound } from "lucide-react";
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
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-2xl font-bold mb-6">
          Mandatory Password Update
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-xs font-bold text-slate-500">
              New Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] text-[#355E3B] py-3 rounded-xl"
          >
            {loading ? "Processing..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ResetPassword;