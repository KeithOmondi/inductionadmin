import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNotices } from "../../store/slices/noticeSlice";
import { fetchEvents } from "../../store/slices/eventSlice";
import { fetchMyGuestList } from "../../store/slices/guestSlice";
// 1. Import the chat thunk
import { fetchUserMessages } from "../../store/slices/userChatSlice"; 
import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
    <p className="text-slate-400 text-[12px] mt-2 font-medium">
      {subtext}
    </p>
  </div>
);

const JudgeDashboardPage = () => {
  const dispatch = useAppDispatch();
  
  // 2. Map selectors to the specific slices
  const { user } = useAppSelector((state) => state.auth);
  const { notices, loading: noticesLoading } = useAppSelector((state) => state.notices);
  const { events } = useAppSelector((state) => state.events);
  const { guestList, loading: guestLoading } = useAppSelector((state) => state.guest);
  const { unreadCount, chatMessages, loading: chatLoading } = useAppSelector((state) => state.userChat);

  useEffect(() => {
    dispatch(fetchNotices(undefined));
    dispatch(fetchEvents(undefined));
    dispatch(fetchMyGuestList());
    // 3. Fetch messages to populate the stat card
    dispatch(fetchUserMessages({})); 
  }, [dispatch]);

  // 4. Data Derivation based on your Types
  const guestCount = guestList?.guests?.length || 0;
  const totalMessages = chatMessages.length;
  const displayName = user?.name || "Justice";
  const priorityEvent = events.find((e) => e.isMandatory) || events[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* 1. HEADER */}
        <div className="space-y-1 border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-serif text-[#355E3B]">
            Welcome, <span className="capitalize">Hon. {displayName}</span>
          </h1>
          <p className="text-slate-500 text-sm tracking-wide font-medium">
            High Court Judge Onboarding Portal — <span className="text-[#355E3B]">Judiciary of Kenya</span>
          </p>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Guests Registered"
            value={guestCount}
            subtext={guestList?.status === "SUBMITTED" ? "of 5 allowed" : "Draft - 5 max"}
            loading={guestLoading}
          />
          <StatCard
            title="Notices"
            value={notices.length}
            subtext={`${notices.filter(n => n.isUrgent).length} urgent`}
            loading={noticesLoading}
          />
          <StatCard
            title="Days to Ceremony"
            value="21"
            subtext="15 March 2026"
          />
          <StatCard
            title="Messages"
            value={totalMessages}
            subtext={`${unreadCount} unread`}
            loading={chatLoading}
          />
        </div>

        {/* 3. CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* EVENT BOX */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-[#EFBF04]" size={20} />
              <h2 className="text-[#355E3B] font-serif text-2xl">Upcoming: Swearing-In Ceremony</h2>
            </div>

            {priorityEvent ? (
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                {/* Date Square */}
                <div className="bg-[#355E3B] border border-[#355E3B] p-4 text-center min-w-[100px] rounded-sm">
                  <p className="text-[#EFBF04] text-[10px] uppercase font-bold tracking-tighter">
                    {new Date(priorityEvent.date).toLocaleString("en-us", { month: "short" }).toUpperCase()}
                  </p>
                  <p className="text-white text-4xl font-serif font-bold">
                    {new Date(priorityEvent.date).getDate()}
                  </p>
                  <p className="text-slate-300 text-[10px]">2026</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[#355E3B] text-xl font-bold">{priorityEvent.title}</h3>
                  <div className="space-y-2 text-sm text-slate-600 font-medium">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#EFBF04]" /> {priorityEvent.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-[#EFBF04]" /> {priorityEvent.time}
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                    {priorityEvent.description || "Please ensure all guest details are submitted for clearance."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic mb-8">No upcoming events scheduled.</p>
            )}

            <button className="bg-[#355E3B] text-white px-6 py-3 text-sm hover:bg-[#2a4b2f] transition-all flex items-center gap-2 group font-bold rounded-sm shadow-md">
              {guestList?.status === "SUBMITTED" ? "View Guest List" : "Register Guests"} 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* NOTICES BOX */}
          <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="text-[#EFBF04]" size={20} />
              <h2 className="text-[#355E3B] font-serif text-xl">Recent Notices</h2>
            </div>

            <div className="space-y-6">
              {notices.length > 0 ? (
                notices.slice(0, 4).map((notice) => (
                  <div key={notice._id} className="group cursor-pointer border-b border-slate-100 pb-4 last:border-0">
                    <h4 className="text-slate-700 text-sm font-bold group-hover:text-[#355E3B] transition-colors">
                      {notice.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                      <span className="text-slate-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[#EFBF04] uppercase">{notice.type} • {notice.size}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">No recent notices found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JudgeDashboardPage;