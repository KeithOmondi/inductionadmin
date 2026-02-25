import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  LogOut,
  Gavel,
  PinIcon,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { logoutUser } from "../../store/slices/adminAuthSlice";

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const linkClass =
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 group";
  const activeClass =
    "bg-[#355E3B] text-white shadow-lg shadow-emerald-900/20 border-r-4 border-[#C5A059]";
  const inactiveClass = "text-slate-500 hover:bg-slate-50 hover:text-[#355E3B]";

  return (
    <>
      {/* 📱 MOBILE TOP BAR (Hidden on Desktop) */}
      <div className="lg:hidden sticky top-0 z-[70] bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#355E3B] p-1.5 rounded-md">
            <Gavel size={18} className="text-[#C5A059]" />
          </div>
          <span className="text-[#355E3B] font-serif font-bold text-sm">Registry Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#355E3B] hover:bg-slate-100 rounded-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🌑 MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-[80] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🏛️ MAIN SIDEBAR ASIDE */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[73px] left-0 z-[90]
        w-72 lg:w-64 bg-white h-screen lg:h-[calc(100vh-73px)]
        border-r border-slate-200 p-6 flex flex-col justify-between 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div>
          {/* Sidebar Header/Logo - Hidden on Mobile if Header is present */}
          <div className="hidden lg:flex items-center gap-3 px-2 mb-10">
            <div className="bg-[#355E3B] p-2 rounded-lg shadow-sm">
              <Gavel size={20} className="text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 leading-tight tracking-tight">
                REGISTRY
              </h2>
              <p className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest mt-0.5">
                Admin Console
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/info"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <PinIcon size={18} />
              High Court Info
            </NavLink>

            <NavLink
              to="/admin/messages"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <MessageSquare size={18} />
              Messages
            </NavLink>

            

            <NavLink
              to="/admin/list"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <PinIcon size={18} />
              Guest List
            </NavLink>

            <NavLink
              to="/admin/notice"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Users size={18} />
              Notice Board
            </NavLink>
            <NavLink
              to="/admin/event"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Users size={18} />
              Events
            </NavLink>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 hidden lg:block">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={12} className="text-[#C5A059]" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Status</span>
            </div>
            <p className="text-[10px] text-[#355E3B] font-bold">Active Encrypted Session</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-rose-500 hover:bg-rose-50 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-rose-100"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;