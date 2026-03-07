import { ShieldCheck, LogOut, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import toast from "react-hot-toast";
import { logoutUser } from "../../store/slices/adminAuthSlice";

const GuestHeader = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-[90] w-full flex items-center justify-between px-4 lg:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200">
      
      {/* Title Area */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex p-2 bg-slate-50 rounded-lg border border-slate-100">
           <ShieldCheck size={18} className="text-[#C5A059]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[#355E3B] font-serif text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-tight">
            The Judiciary of Kenya
          </h1>
          <p className="text-[#C5A059] text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.1em]">
            Office of the Registrar
          </p>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* User Identity (Hidden on very small screens) */}
        <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-200">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-900 leading-none capitalize">{user?.name || "Guest"}</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Authorized User</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#355E3B]/10 flex items-center justify-center text-[#355E3B]">
            <UserIcon size={16} />
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all active:scale-95 group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default GuestHeader;