import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Bell,
  BellOff,
  Search,
  Calendar,
  ChevronRight,
  Loader2,
  LogOut,
  Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { subscribeUserToPush } from "../../store/slices/pushSlice";
import { clearUnreadCount } from "../../store/slices/userChatSlice";
import { logoutUser } from "../../store/slices/adminAuthSlice";

const AdminHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 1. Redux State
  const { user } = useAppSelector((state) => state.auth);
  const { permission, loading: pushLoading } = useAppSelector(
    (state) => state.push,
  );
  const unreadCount = useAppSelector((state) => state.userChat.unreadCount);

  // 2. Local UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = () => {
    if (permission !== "granted") {
      dispatch(subscribeUserToPush());
    } else {
      setIsNotifOpen(!isNotifOpen);
      if (!isNotifOpen) dispatch(clearUnreadCount());
    }
  };

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
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-[50] sticky top-0">
      {/* Left Side: Breadcrumbs */}
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

      {/* Right Side: Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
          <Calendar size={14} className="text-[#355E3B]" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
            {today}
          </span>
        </div>

        <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
          <button className="p-2 text-slate-400 hover:text-[#355E3B] hover:bg-emerald-50 rounded-full transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className={`p-2 rounded-full transition-all relative ${
                permission === "granted"
                  ? "text-slate-400 hover:text-[#355E3B] hover:bg-emerald-50"
                  : "text-red-300 hover:bg-red-50"
              }`}
            >
              {pushLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : permission === "granted" ? (
                <Bell size={20} />
              ) : (
                <BellOff size={20} />
              )}

              {unreadCount > 0 && permission === "granted" && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EFBF04] rounded-full border-2 border-white" />
              )}
            </button>

            {/* Admin Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                    Registry Notifications
                  </span>
                  <span className="bg-[#355E3B] text-white text-[9px] px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    No unread alerts
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-[#355E3B] transition-colors">
                {user?.name || "Registrar Admin"}
              </p>
              <p className="text-[10px] font-bold text-[#355E3B] uppercase tracking-tighter opacity-70">
                {user?.role || "Authorized Personnel"}
              </p>
            </div>
            <div className="h-10 w-10 bg-[#355E3B] rounded-xl flex items-center justify-center border-2 border-[#EFBF04] shadow-sm transition-transform group-active:scale-95">
              <User size={20} className="text-white" />
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Logged in as
                </p>
                <p className="text-xs font-bold text-slate-700 truncate">
                  {user?.email}
                </p>
              </div>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors mt-1">
                <Settings size={14} /> System Settings
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => dispatch(logoutUser())}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
