import { useState, useRef, useEffect } from "react";
import { Bell, BellOff, ShieldCheck, ChevronDown, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { subscribeUserToPush } from "../../store/slices/pushSlice";
import { logoutUser } from "../../store/slices/adminAuthSlice";

const JudgeHeader = () => {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // 1. Redux State Selectors
  const { user } = useAppSelector((state) => state.auth);
  const { permission, loading: pushLoading } = useAppSelector((state) => state.push);
  const unreadCount = useAppSelector((state) => state.userChat?.unreadCount || 0);

  // 2. Local UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 3. Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (permission !== "granted") {
      dispatch(subscribeUserToPush());
    } else {
      setIsNotifOpen(!isNotifOpen);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Helper: Name to Initials
  const getInitials = (name: string = "Anonymous") => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-[100] w-full flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all isolate">
      
      {/* --- LOGO SECTION --- */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="p-2 lg:p-3 bg-white rounded-xl shadow-sm border-l-4 border-[#355E3B] flex flex-col justify-center">
          <h1 className="text-[#355E3B] font-serif text-sm lg:text-base font-black leading-none uppercase tracking-tighter">
            The Judiciary
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-[1px] w-3 bg-[#C5A059]" />
            <p className="text-[#C5A059] text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] leading-none">
              High Court of Kenya
            </p>
          </div>
        </div>
        <div className="border-l border-slate-200 pl-3 lg:pl-4 hidden xs:block">
          <h1 className="text-[#355E3B] font-serif text-base lg:text-xl font-bold leading-tight tracking-tight">
            Kenya Judiciary
          </h1>
          <p className="hidden md:block text-[#C5A059] text-[9px] font-black uppercase tracking-[0.25em] mt-0.5">
            Office of the Registrar • Registry
          </p>
        </div>
      </div>

      {/* --- ACTIONS & AUTH SECTION --- */}
      <div className="flex items-center gap-3 lg:gap-8">
        
        {/* NOTIFICATION CENTER */}
        <div className="relative" ref={dropdownRef}>
          <div onClick={handleBellClick} className="relative cursor-pointer group">
            <div className={`p-2.5 rounded-full transition-all ${
              permission === "granted" ? "hover:bg-[#355E3B]/5" : "bg-red-50 hover:bg-red-100"
            }`}>
              {pushLoading ? (
                <Loader2 className="text-[#355E3B] w-5 h-5 animate-spin" />
              ) : permission === "granted" ? (
                <Bell className="text-[#355E3B] w-5 h-5 transition-transform group-hover:rotate-12" />
              ) : (
                <BellOff className="text-red-400 w-5 h-5" />
              )}
            </div>

            {unreadCount > 0 && permission === "granted" && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C5A059] text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white shadow-sm animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>

          {/* NOTIFICATION DROPDOWN */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="bg-[#355E3B] px-4 py-3 flex justify-between items-center">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Official Alerts</span>
                <span className="bg-[#C5A059] text-white text-[8px] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {/* Map notifications here */}
                <div className="flex items-center justify-center p-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  No new messages
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* PROFILE CAPSULE */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 lg:gap-3 bg-slate-50 pl-1 pr-2 lg:pr-4 py-1 rounded-full border border-slate-200 hover:border-[#355E3B]/30 hover:bg-white transition-all cursor-pointer shadow-sm group"
          >
            <div className="bg-[#355E3B] w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center font-black text-[#C5A059] text-xs lg:text-sm border-2 border-white shadow-sm shrink-0">
              {getInitials(user?.name)}
            </div>
            
            <div className="hidden sm:block text-left">
              <p className="text-[#355E3B] text-[11px] lg:text-sm font-bold leading-none">{user?.name || "Loading..."}</p>
              <p className="text-[#C5A059] text-[7px] lg:text-[8px] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                <ShieldCheck size={9} strokeWidth={3} /> {user?.role || "Registry"}
              </p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* PROFILE DROPDOWN */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2 duration-200 origin-top-right">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <UserIcon size={14} /> Profile Settings
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default JudgeHeader;