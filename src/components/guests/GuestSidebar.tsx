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
  Image,
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
      {/* 📱 MOBILE HAMBURGER (Visible only on small screens) */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-6 right-6 z-[110] bg-[#355E3B] text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🌑 OVERLAY */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      />

      {/* 🏛️ SIDEBAR ASIDE */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[105]
        w-72 lg:w-64 bg-white h-screen 
        border-r border-slate-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Branding Area (Sidebar) */}
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="bg-[#355E3B] p-2 rounded-lg">
            <ShieldCheck size={20} className="text-[#C5A059]" />
          </div>
          <span className="text-[#355E3B] font-serif font-black text-sm tracking-tight uppercase">
            Guest Portal
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {/* Main Navigation */}
          <div className="mb-8">
            <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 font-black">
              General Access
            </p>
            <NavItem icon={LayoutDashboard} label="Dashboard" to="/guest/dashboard" onClick={() => setIsOpen(false)} />
            <NavItem icon={BookOpen} label="High Court Info" to="/guest/info" onClick={() => setIsOpen(false)} />
            <NavItem icon={MapPin} label="Messages" to="/guest/messages" onClick={() => setIsOpen(false)} />
          </div>

          {/* Records Section */}
          <div className="mb-8">
            <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 font-black">
              Public Records
            </p>
            <NavItem icon={Calendar} label="Notice Board" to="/guest/notices" onClick={() => setIsOpen(false)} />
            <NavItem icon={FileText} label="Events" to="/guest/event" onClick={() => setIsOpen(false)} />
            <NavItem icon={Image} label="Gallery" to="/guest/gallery" onClick={() => setIsOpen(false)} />
          </div>
        </div>

        {/* Support Block */}
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={14} className="text-[#C5A059]"/>
                <p className="text-[10px] text-[#355E3B] font-black">ASSISTANCE</p>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Contact the Registrar's Office for help with your digital visit.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GuestSidebar;