import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNotices } from "../../store/slices/noticeSlice";
import { fetchEvents } from "../../store/slices/eventSlice";
import { fetchMyGuestList } from "../../store/slices/guestSlice";
import { fetchUserMessages } from "../../store/slices/userChatSlice";

import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

/* --- Institutional Theme Stat Card --- */
const StatCard = ({
  title,
  value,
  subtext,
  loading,
}: {
  title: string;
  value: string | number;
  subtext: string;
  loading?: boolean;
}) => (
  <div className="bg-white border-l-4 border-l-[#355E3B] border border-slate-200 p-6 rounded-sm relative overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-md">
    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.15em] mb-4">
      {title}
    </p>
    <div className="flex items-baseline gap-2">
      {loading ? (
        <Loader2 className="animate-spin text-[#355E3B]" size={24} />
      ) : (
        <h3 className="text-[#355E3B] text-5xl font-serif">
          {value}
        </h3>
      )}
    </div>
    <p className="text-slate-400 text-[12px] mt-2 font-medium truncate">
      {subtext}
    </p>
  </div>
);

const JudgeDashboardPage = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const { user } = useAppSelector((state) => state.auth);
  const { notices, loading: noticesLoading } = useAppSelector((state) => state.notices);
  const { events, loading: eventsLoading } = useAppSelector((state) => state.events);
  const { guestList, loading: guestLoading } = useAppSelector((state) => state.guest);
  const { unreadCount, chatMessages, loading: chatLoading } = useAppSelector((state) => state.userChat);

  /* -------------------- DYNAMIC DATA LOGIC -------------------- */

  // Helper: Calculate Days Remaining
  const calculateDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(targetDate);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 1. PRIMARY DISPLAY EVENT (Priority: ONGOING > MANDATORY > SOONEST)
  const displayEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    
    const ongoing = events.find(e => e.status === "ONGOING");
    if (ongoing) return ongoing;

    const now = new Date();
    const upcoming = [...events]
      .filter(e => new Date(e.date) >= new Date(now.setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming.find(e => e.isMandatory) || upcoming[0];
  }, [events]);

  // 2. STAT CARD EVENT (Strictly next scheduled UPCOMING event)
  const nextScheduledEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    
    const now = new Date();
    const upcoming = [...events]
      .filter(e => e.status === "SCHEDULED" && new Date(e.date) >= new Date(now.setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming[0] || null;
  }, [events]);

  useEffect(() => {
    dispatch(fetchNotices(undefined));
    dispatch(fetchEvents({ filter: "ALL" }));
    dispatch(fetchMyGuestList());
    dispatch(fetchUserMessages({}));
  }, [dispatch]);

  /* -------------------- DERIVED UI STRINGS -------------------- */
  const isOngoing = displayEvent?.status === "ONGOING";
  const guestCount = guestList?.guests?.length || 0;
  const displayName = user?.name || "Justice";

  // Stat Card Countdown Logic
  const daysToNext = calculateDaysRemaining(nextScheduledEvent?.date);
  const countdownValue = daysToNext === null ? "--" : (daysToNext <= 0 ? "Today" : daysToNext);
  const countdownSubtext = nextScheduledEvent 
    ? `Next: ${nextScheduledEvent.title}`
    : "No upcoming schedule";

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="space-y-1 border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-serif text-[#355E3B]">
            Welcome, <span className="capitalize">Judge {displayName}</span>
          </h1>
          <p className="text-slate-500 text-sm tracking-wide font-medium">
            High Court Onboarding Portal
          </p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Notices"
            value={notices.length}
            subtext={`${notices.filter((n) => n.isUrgent).length} urgent items`}
            loading={noticesLoading}
          />

          <Link to="/judge/messages">
            <StatCard
              title="Messages"
              value={chatMessages.length}
              subtext={`${unreadCount} unread`}
              loading={chatLoading}
            />
          </Link>

          <StatCard
            title="Guests Registered"
            value={guestCount}
            subtext={
              guestList?.status === "SUBMITTED"
                ? "Submission Finalized"
                : "Draft - 5 slots max"
            }
            loading={guestLoading}
          />

          <Link to="/judge/events">
            <StatCard
              title="Days to activity"
              value={countdownValue}
              subtext={countdownSubtext}
              loading={eventsLoading}
            />
          </Link>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN EVENT BOX */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {isOngoing ? (
                   <Activity className="text-red-600 animate-pulse" size={22} />
                ) : (
                  <Calendar className="text-[#EFBF04]" size={22} />
                )}
                <h2 className="text-[#355E3B] font-serif text-2xl">
                  {isOngoing ? "Ongoing Event" : "Upcoming Assignment"}
                </h2>
              </div>
              
              {isOngoing && (
                <span className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest bg-red-50 px-3 py-1 border border-red-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Active Now
                </span>
              )}
            </div>

            {displayEvent ? (
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                
                {/* Date Square */}
                <div className={`${isOngoing ? 'bg-red-800' : 'bg-[#355E3B]'} p-4 text-center min-w-[100px] rounded-sm transition-colors duration-500`}>
                  <p className={`${isOngoing ? 'text-red-200' : 'text-[#EFBF04]'} text-[10px] uppercase font-bold tracking-tighter`}>
                    {new Date(displayEvent.date)
                      .toLocaleString("en-us", { month: "short" })
                      .toUpperCase()}
                  </p>
                  <p className="text-white text-4xl font-serif font-bold">
                    {new Date(displayEvent.date).getDate()}
                  </p>
                  <p className="text-slate-300 text-[10px]">
                    {new Date(displayEvent.date).getFullYear()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[#355E3B] text-xl font-bold">
                        {displayEvent.title}
                    </h3>
                    {displayEvent.isMandatory && (
                        <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 font-bold uppercase border border-red-100">
                            Mandatory
                        </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 font-medium">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#EFBF04]" />
                      {displayEvent.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-[#EFBF04]" />
                      {displayEvent.time}
                    </p>
                  </div>

                  <p className="text-slate-500 text-sm max-w-md leading-relaxed italic">
                    {displayEvent.description || "No additional details provided for this assignment."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-sm">
                <p className="text-slate-400 italic">
                  {eventsLoading ? "Accessing judicial calendar..." : "No events scheduled at this time."}
                </p>
              </div>
            )}
          </div>

          {/* NOTICES BOX */}
          <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="text-[#EFBF04]" size={20} />
              <h2 className="text-[#355E3B] font-serif text-xl">
                Recent Notices
              </h2>
            </div>

            <div className="space-y-6">
              {notices.length > 0 ? (
                notices.slice(0, 4).map((notice) => (
                  <div
                    key={notice._id}
                    className="group cursor-pointer border-b border-slate-100 pb-4 last:border-0"
                  >
                    <h4 className="text-slate-700 text-sm font-bold group-hover:text-[#355E3B] transition-colors line-clamp-1">
                      {notice.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                      <span className="text-slate-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[#EFBF04] uppercase">
                        {notice.type} • {notice.size}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">
                  No recent notices available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboardPage;