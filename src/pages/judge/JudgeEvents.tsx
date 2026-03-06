import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEvents,
  type IEvent,
  type EventFilter,
} from "../../store/slices/eventSlice";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Timer,
  ArrowRight
} from "lucide-react";

/* ---------------- COUNTDOWN HELPER ---------------- */
const getCountdown = (targetDate: string) => {
  const total = Date.parse(targetDate) - Date.parse(new Date().toString());
  if (total <= 0) return null;
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

const JudgeEventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const [filter, setFilter] = useState<EventFilter>("UPCOMING"); // Default to Upcoming for Judges

  useEffect(() => {
    const filterParam = filter === "ALL" ? undefined : filter;
    dispatch(fetchEvents({ filter: filterParam }));
  }, [dispatch, filter]);

  const categories: { label: string; value: EventFilter }[] = [
    { label: "UPCOMING", value: "UPCOMING" },
    { label: "ALL PROCEEDINGS", value: "ALL" },
    { label: "ARCHIVE", value: "PAST" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">ORHC</span>
          </div>
          <h1 className="text-[#355E3B] font-serif text-4xl lg:text-5xl font-black tracking-tight">
            Events Calendar
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">
            Office of the Registrar High Court
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat.value
                  ? "bg-white text-[#355E3B] shadow-sm"
                  : "text-slate-500 hover:text-[#C5A059]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <Loader2 className="animate-spin text-[#355E3B]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">
            Retrieving Case Records...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl flex items-center gap-6 text-red-700">
          <AlertTriangle size={32} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">Registry Synchronization Error</p>
            <p className="text-sm font-medium mt-1">{error}</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-[4rem] bg-slate-50/50">
          <CalendarIcon className="mx-auto text-slate-200 mb-6" size={64} />
          <p className="text-slate-400 text-lg font-serif italic">
            No active proceedings found for this session.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event: IEvent) => {
            const timeLeft = getCountdown(event.scheduledAt);
            
            return (
              <div
                key={event._id}
                className="group relative flex flex-col md:flex-row bg-white border border-slate-200 rounded-[3rem] overflow-hidden hover:shadow-2xl hover:shadow-[#355E3B]/5 transition-all duration-500"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                  event.status === 'ONGOING' ? 'bg-amber-500' : 
                  event.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-[#355E3B]'
                }`} />

                {/* Date Side Block */}
                <div className="w-full md:w-40 flex flex-col items-center justify-center p-10 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                    {new Date(event.date).toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-5xl font-serif font-black text-[#355E3B]">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-[10px] font-bold mt-2 tracking-widest text-slate-400">
                    {new Date(event.date).getFullYear()}
                  </span>
                </div>

                {/* Main Content Details */}
                <div className="flex-1 p-10 space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-3">
                         {event.status === 'ONGOING' && (
                           <span className="flex items-center gap-1.5 text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                             <Timer size={10} className="animate-spin" /> In Session
                           </span>
                         )}
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            event.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-[#355E3B]/5 text-[#355E3B] border-[#355E3B]/10'
                         }`}>
                           {event.status}
                         </span>
                       </div>
                       <h3 className="text-[#355E3B] font-serif text-3xl font-bold group-hover:text-[#C5A059] transition-colors leading-tight">
                        {event.title}
                      </h3>
                    </div>

                    {/* Countdown/Timer Logic */}
                    {timeLeft && event.status === 'SCHEDULED' && (
                      <div className="flex items-center gap-3 bg-[#355E3B] text-white px-5 py-3 rounded-2xl shadow-lg shadow-[#355E3B]/20">
                        <Timer size={16} className="text-[#C5A059]" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{timeLeft}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} className="text-[#C5A059]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-[#C5A059]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{event.time}</span>
                    </div>
                    {event.isMandatory && (
                      <div className="flex items-center gap-2.5 text-red-600 bg-red-50 px-3 py-1 rounded-xl">
                        <AlertCircle size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest"></span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-[#C5A059]">
                      <p className="text-slate-600 text-sm leading-relaxed italic">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Interaction Footer (Mobile Only visible padding) */}
                <div className="md:hidden p-8 pt-0">
                   <button className="w-full flex items-center justify-center gap-2 bg-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#355E3B]">
                      View Details <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JudgeEventsPage;