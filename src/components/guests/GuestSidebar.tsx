import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  type LucideIcon,
} from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, to, onClick }: NavItemProps) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
        active
          ? "bg-[#355E3B]/10 border-r-4 border-[#C5A059] text-[#355E3B]"
          : "text-slate-500 hover:bg-slate-50 hover:text-[#355E3B] group"
      }`}
    >
      <Icon
        size={18}
        className={active ? "text-[#C5A059]" : "text-slate-400 group-hover:text-[#355E3B]"}
      />
      <span className={`text-sm font-bold ${active ? "text-[#355E3B]" : ""}`}>
        {label}
      </span>
    </Link>
  );
};

const GuestSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 📱 MOBILE TOP BAR */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#355E3B] p-1.5 rounded-md">
            <ShieldCheck size={18} className="text-[#C5A059]" />
          </div>
          <span className="text-[#355E3B] font-serif font-bold text-sm tracking-tight">Guest Portal</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-[#355E3B] hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🌑 MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* 🏛️ MAIN SIDEBAR ASIDE */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[73px] left-0 z-50
        w-72 lg:w-64 bg-white h-screen lg:h-[calc(100vh-73px)]
        border-r border-slate-200 py-8 overflow-y-auto 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Mobile Header */}
        <div className="lg:hidden px-6 mb-8 flex justify-between items-center">
           <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-black">Guest Menu</p>
           <button onClick={toggleSidebar} className="text-slate-400"><X size={20}/></button>
        </div>

        {/* Guest Essentials */}
        <div className="mb-10">
          <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-[#C5A059] mb-4 font-black">
            Guest Navigation
          </p>
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/guest/dashboard" onClick={() => setIsOpen(false)} />
          <NavItem icon={BookOpen} label="High Court Info" to="/guest/info" onClick={() => setIsOpen(false)} />
          <NavItem icon={MapPin} label="Messages" to="/guest/messages" onClick={() => setIsOpen(false)} />
        </div>

        {/* Information Section */}
        <div className="mb-10">
          <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-[#C5A059] mb-4 font-black">
            Information
          </p>
          <NavItem icon={Calendar} label="Notice Board" to="/guest/notices" onClick={() => setIsOpen(false)} />
          <NavItem icon={FileText} label="Events" to="/guest/event" onClick={() => setIsOpen(false)} />
        </div>

        {/* Help/FAQ Footer */}
        <div className="mt-auto px-6 pt-6 border-t border-slate-100">
          <div className="bg-[#355E3B]/5 p-4 rounded-xl border border-[#355E3B]/10">
            <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={14} className="text-[#C5A059]"/>
                <p className="text-[10px] text-[#355E3B] font-bold">NEED ASSISTANCE?</p>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Contact the Registrar's Office for help with your visit.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GuestSidebar;