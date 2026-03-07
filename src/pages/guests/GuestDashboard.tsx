import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNotices } from "../../store/slices/noticeSlice";
import { fetchEvents } from "../../store/slices/eventSlice";
import { fetchUserMessages } from "../../store/slices/userChatSlice";

import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Activity,
  MessageSquare,
  ChevronRight,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

/* --- Institutional Theme Stat Card --- */
const StatCard = ({
  title,
  value,
  subtext,
  loading,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtext: string;
  loading?: boolean;
  icon?: any;
}) => (
  <div className="bg-white border-l-4 border-l-[#355E3B] border border-slate-200 p-5 rounded-sm relative overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.15em]">
        {title}
      </p>
      {Icon && <Icon size={16} className="text-slate-300 group-hover:text-[#C5A059] transition-colors" />}
    </div>
    <div className="flex items-baseline gap-2">
      {loading ? (
        <Loader2 className="animate-spin text-[#355E3B]" size={24} />
      ) : (
        <h3 className="text-[#355E3B] text-4xl font-serif">
          {value}
        </h3>
      )}
    </div>
    <p className="text-slate-400 text-[11px] mt-2 font-bold truncate uppercase tracking-tighter">
      {subtext}
    </p>
  </div>
);

const GuestDashboardPage = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const { user } = useAppSelector((state) => state.auth);
  const { notices, loading: noticesLoading } = useAppSelector((state) => state.notices);
  const { events, loading: eventsLoading } = useAppSelector((state) => state.events);
  const { unreadCount, chatMessages, loading: chatLoading } = useAppSelector((state) => state.userChat);

  useEffect(() => {
    dispatch(fetchNotices(undefined));
    dispatch(fetchEvents({ filter: "ALL" }));
    dispatch(fetchUserMessages({}));
  }, [dispatch]);

  // Logic: Get the most relevant upcoming public event
  const displayEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    
    // Check for ongoing events first
    const ongoing = events.find(e => e.status === "ONGOING");
    if (ongoing) return ongoing;

    // Otherwise find the soonest upcoming
    return [...events]
      .filter(e => new Date(e.date) >= new Date(now.setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [events]);

  const isOngoing = displayEvent?.status === "ONGOING";

  return (
    <div className="min-h-screen bg-[#F1F3F4] text-slate-800 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#C5A059] h-1 w-8 rounded-full"></span>
                <p className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.3em]">Public Portal</p>
            </div>
            <h1 className="text-4xl font-serif text-[#355E3B] font-bold">
              Welcome, <span className="text-slate-900">Hon. {user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium italic">
              Guest Access • High Court of Kenya Registry
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                <Activity size={16} />
            </div>
            <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Status</p>
                <p className="text-xs font-black text-slate-700">Online & Secure</p>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/guest/messages">
            <StatCard
              title="Messages"
              value={chatMessages.length}
              subtext={`${unreadCount} new messages`}
              loading={chatLoading}
              icon={MessageSquare}
            />
          </Link>

          <Link to="/guest/event">
            <StatCard
              title="Upcoming Events"
              value={events.length}
              subtext="Public Calendar"
              loading={eventsLoading}
              icon={Calendar}
            />
          </Link>

          <Link to="/guest/gallary">
            <StatCard
              title="Documents"
              value={12} 
              subtext="Public Archive"
              icon={FileText}
            />
          </Link>

          <Link to="/guest/notices">
            <StatCard
              title="Notices"
              value={notices.length}
              subtext={`${notices.filter(n => n.type === 'URGENT').length} marked urgent`}
              loading={noticesLoading}
              icon={Info}
            />
          </Link>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FEATURED EVENT / NOTICE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className={`px-6 py-4 flex justify-between items-center transition-colors duration-500 ${isOngoing ? 'bg-red-900' : 'bg-[#355E3B]'}`}>
                    <h2 className="text-[#EFBF04] font-serif font-bold text-lg flex items-center gap-2">
                        {isOngoing ? (
                          <Activity size={20} className="animate-pulse text-red-400" />
                        ) : (
                          <Calendar size={20} />
                        )}
                        {isOngoing ? "Ongoing Activities" : "Highlighted Activity"}
                    </h2>
                    <div className="flex items-center gap-4">
                        {isOngoing && (
                          <span className="bg-red-500/20 text-red-100 text-[9px] font-black uppercase px-2 py-1 rounded border border-red-500/30 animate-pulse">
                            Live
                          </span>
                        )}
                        <Link to="/guest/event" className="text-white/80 text-[10px] font-bold uppercase hover:text-white flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="p-8">
                    {displayEvent ? (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-shrink-0">
                                <div className={`w-20 h-20 bg-slate-50 border-2 rounded-2xl flex flex-col items-center justify-center shadow-inner transition-colors ${isOngoing ? 'border-red-700' : 'border-[#355E3B]'}`}>
                                    <span className={`text-[10px] font-black uppercase ${isOngoing ? 'text-red-700' : 'text-[#355E3B]'}`}>{new Date(displayEvent.date).toLocaleString('en-us', {month: 'short'})}</span>
                                    <span className="text-3xl font-serif font-bold text-slate-900">{new Date(displayEvent.date).getDate()}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className={`text-2xl font-serif font-bold leading-tight mb-2 ${isOngoing ? 'text-red-900' : 'text-[#355E3B]'}`}>{displayEvent.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#C5A059]"/> {displayEvent.location}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#C5A059]"/> {displayEvent.time}</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-xl italic">
                                    {displayEvent.description || "Official judicial schedule. Please contact the registrar for more specific details regarding this public event."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-400 italic">No scheduled activities found in the public record.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* QUICK ACTIONS / INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-6 rounded-xl group hover:bg-[#C5A059]/15 transition-colors">
                    <h4 className="text-[#355E3B] font-bold text-sm mb-2 uppercase tracking-tight">High Court Info</h4>
                    <p className="text-slate-600 text-xs mb-4 leading-normal">Wish to know more about Th High Court? Click below</p>
                    <Link to="/guest/info" className="text-[#355E3B] font-black text-[10px] uppercase underline decoration-[#C5A059] underline-offset-4">Explore Hub</Link>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="text-[#EFBF04] font-bold text-sm mb-2 uppercase tracking-tight">Notice Board</h4>
                        <p className="text-slate-400 text-xs mb-4 leading-normal">Check the most recent, upcoming and Past notices, don't miss out.</p>
                        <Link to="/guest/notices" className="bg-[#355E3B] px-4 py-2 rounded text-[10px] font-bold uppercase hover:bg-[#447a4d] transition-colors inline-block">View Board</Link>
                    </div>
                    <FileText className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors" size={100} />
                </div>
            </div>
          </div>

          {/* SIDEBAR: RECENT NOTICES */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <Info size={18} className="text-[#C5A059]" />
                    <h2 className="text-[#355E3B] font-serif font-bold text-lg">Recent Notices</h2>
                </div>

                <div className="space-y-5">
                    {notices.length > 0 ? (
                        notices.slice(0, 5).map((notice) => (
                            <Link 
                                to={`/guest/notices`} 
                                key={notice._id} 
                                className="block group border-b border-slate-50 last:border-0 pb-4 last:pb-0"
                            >
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#355E3B] transition-colors line-clamp-2 mb-1 uppercase tracking-tight">
                                    {notice.title}
                                </h5>
                                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[#C5A059]">{notice.type}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-slate-400 text-xs italic text-center py-4">No recent notices archived.</p>
                    )}
                </div>
            </div>

            {/* SUPPORT CONTACT */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-[#355E3B] font-bold text-xs uppercase tracking-widest mb-4">ORHC Support</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[11px] font-medium text-slate-600">Registrar is currently online</p>
                    </div>
                    <Link to="/guest/messages" className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <MessageSquare size={14} /> Start Inquiry
                    </Link>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;