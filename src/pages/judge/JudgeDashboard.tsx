import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNotices } from "../../store/slices/noticeSlice";
import { fetchEvents } from "../../store/slices/eventSlice";
import { fetchMyGuestList } from "../../store/slices/guestSlice";
import {
  Users,
  FileCheck,
  FileText,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

/* --- Executive Stat Card --- */
const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: any;
  loading?: boolean;
}) => (
  <div className="bg-white border border-slate-200 p-6 rounded-[1.5rem] relative overflow-hidden group hover:shadow-xl hover:shadow-[#355E3B]/5 transition-all duration-500">
    <p className="text-[#355E3B] text-[10px] uppercase font-black tracking-[0.2em] mb-4 opacity-70">
      {title}
    </p>
    <div className="flex items-baseline gap-2 relative z-10">
      {loading ? (
        <Loader2 className="animate-spin text-slate-200" size={24} />
      ) : (
        <h3 className="text-[#355E3B] text-4xl font-serif font-black">{value}</h3>
      )}
    </div>
    <p className="text-slate-500 text-[11px] mt-2 font-bold uppercase tracking-wider">{subtext}</p>
    <Icon
      className="absolute -right-2 -bottom-2 text-slate-100 group-hover:text-[#C5A059]/10 transition-colors duration-500 transform group-hover:scale-110"
      size={80}
    />
    <div className="absolute top-1/4 left-0 w-1 h-1/2 bg-[#C5A059] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
  </div>
);

const JudgeDashboardPage = () => {
  const dispatch = useAppDispatch();
  
  // Real-time data from Redux Slices
  const { user } = useAppSelector((state) => state.auth);
  const { notices, loading: noticesLoading } = useAppSelector((state) => state.notices);
  const { events } = useAppSelector((state) => state.events);
const { guestList, loading: guestLoading } = useAppSelector((state) => state.guest);

  useEffect(() => {
    dispatch(fetchNotices(undefined));
    dispatch(fetchEvents(undefined));
    dispatch(fetchMyGuestList());
  }, [dispatch]);

  // Derived Values
  const guestCount = guestList?.guests?.length || 0;
  // If lastName isn't in DB, split name or default to 'Justice'
  const displayName = user?.name || user?.name?.split(" ").pop() || "Justice";
  const priorityEvent = events.find(e => e.isMandatory) || events[0];

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* 1. WELCOME BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-10 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#C5A059]" />
            <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em]">Live Judicial Registry</p>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif text-[#355E3B] font-bold">
            Welcome, <span className="text-[#C5A059] italic">Hon. {displayName}</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-black tracking-widest uppercase">
            High Court of Kenya <span className="mx-2 text-slate-200">|</span> 
            <span className="text-slate-900 italic">Judicial Induction Portal</span>
          </p>
        </div>
        
        <div className="bg-[#355E3B]/5 border border-[#355E3B]/10 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-xs font-black text-[#355E3B]">ENCRYPTED & LIVE</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
        </div>
      </div>

      {/* 2. STATS LEDGER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Induction Cohort" value="24" subtext="Active Appointees" icon={Users} />
        <StatCard 
            title="Your Guests" 
            value={guestCount} 
            subtext={`${guestCount}/5 Registered`} 
            icon={FileCheck} 
            loading={guestLoading}
        />
        <StatCard 
            title="Legal Directives" 
            value={notices.length} 
            subtext="Issued Gazettes" 
            icon={FileText} 
            loading={noticesLoading}
        />
        <StatCard title="Secure Comms" value="100%" subtext="Channel Integrity" icon={ShieldCheck} />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PRIORITY EVENT CARD */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
          {priorityEvent?.isMandatory && (
            <div className="absolute top-0 right-0 p-8">
              <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Priority Protocol</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-10">
            <Calendar className="text-[#C5A059]" size={28} />
            <h2 className="text-[#355E3B] font-serif text-3xl font-bold tracking-tight">Main Event</h2>
          </div>

          {priorityEvent ? (
            <div className="flex flex-col md:flex-row gap-10 items-stretch mb-10">
              <div className="bg-[#355E3B] p-6 text-center min-w-[140px] rounded-[2rem] shadow-2xl shadow-[#355E3B]/30 flex flex-col justify-center text-white">
                <p className="text-[#C5A059] text-[11px] uppercase font-black tracking-[0.3em]">
                  {new Date(priorityEvent.date).toLocaleString('en-us', { month: 'short' })}
                </p>
                <p className="text-5xl font-serif font-black my-2">{new Date(priorityEvent.date).getDate()}</p>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">2025</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-[#355E3B] text-2xl lg:text-3xl font-bold mb-4">{priorityEvent.title}</h3>
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <MapPin size={14} className="text-[#C5A059]" /> {priorityEvent.location}
                  </span>
                  <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Clock size={14} className="text-[#C5A059]" /> {priorityEvent.time}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-slate-400 italic">No events scheduled.</div>
          )}

          <button className="bg-[#355E3B] text-white px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-black hover:bg-[#2a4b2f] transition-all rounded-xl shadow-xl shadow-[#355E3B]/20 flex items-center gap-3 group">
            Register Official Guests
            <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* GAZETTE SIDEBAR */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="text-[#C5A059]" size={24} />
            <h2 className="text-[#355E3B] font-serif text-2xl font-bold tracking-tight">Directives</h2>
          </div>

          <div className="space-y-5">
            {notices.slice(0, 4).map((notice) => (
              <div key={notice._id} className="group border-b border-slate-50 pb-5 hover:border-[#C5A059]/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-[#355E3B] text-[13px] font-bold leading-snug group-hover:text-[#C5A059] transition-colors">
                    {notice.title}
                  </h4>
                  <ArrowUpRight size={14} className="text-slate-200 group-hover:text-[#C5A059]" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[9px] text-[#C5A059] font-black uppercase tracking-tighter">PDF • {notice.size}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-4 text-[10px] uppercase font-black tracking-[0.3em] text-[#355E3B] hover:bg-slate-50 transition-all border border-[#355E3B]/10 rounded-xl">
            Protocol Archive
          </button>
        </div>

      </div>
    </div>
  );
};

export default JudgeDashboardPage;