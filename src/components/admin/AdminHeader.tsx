import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { User, Bell, Search, Calendar, ChevronRight } from "lucide-react";
import type { RootState } from "../store/store";

const AdminHeader: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Convert pathname to a readable breadcrumb (e.g., /users -> Personnel)
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "dashboard") return "Dashboard Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
      {/* Left Side: Breadcrumbs & Page Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Principal Registry</span>
          <ChevronRight size={10} />
          <span className="text-[#355E3B]">{getPageTitle()}</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-800">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Side: Search, Notifications & Profile */}
      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
          <Calendar size={14} className="text-[#355E3B]" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
            {today}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
          <button className="p-2 text-slate-400 hover:text-[#355E3B] hover:bg-emerald-50 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-[#355E3B] hover:bg-emerald-50 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EFBF04] rounded-full border-2 border-white" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
              {user?.name || "Registrar Admin"}
            </p>
            <p className="text-[10px] font-bold text-[#355E3B] uppercase tracking-tighter">
              Authorized Personnel
            </p>
          </div>
          <div className="h-10 w-10 bg-[#355E3B] rounded-xl flex items-center justify-center border-2 border-[#EFBF04] shadow-sm">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
