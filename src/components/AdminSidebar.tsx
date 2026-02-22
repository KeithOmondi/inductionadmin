import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Gavel,
  PinIcon,
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { logoutUser } from "../store/slices/adminAuthSlice";

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const linkClass = "flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 group";
  const activeClass = "bg-[#355E3B] text-white shadow-lg shadow-emerald-900/20 border-r-4 border-[#EFBF04]";
  const inactiveClass = "text-slate-500 hover:bg-slate-50 hover:text-[#355E3B]";

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col justify-between p-6 z-20">
      <div>
        {/* Sidebar Header/Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-[#355E3B] p-2 rounded-lg">
            <Gavel size={20} className="text-[#EFBF04]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">REGISTRY</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">High Court Portal</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <MessageSquare size={18} />
            Messages
          </NavLink>

          <NavLink
            to="/files"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <PinIcon size={18} />
            Files
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <Users size={18} />
            Personnel
          </NavLink>

          <div className="my-6 border-t border-slate-100" />

          <NavLink
            to="/settings"
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}
          >
            <Settings size={18} />
            System Settings
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-rose-500 hover:bg-rose-50 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-rose-100"
      >
        <LogOut size={18} />
        Terminate Session
      </button>
    </aside>
  );
};

export default AdminSidebar;