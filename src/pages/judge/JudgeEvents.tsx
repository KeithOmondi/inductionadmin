import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEvents,
  type IEvent,
  type EventType,
} from "../../store/slices/eventSlice";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Info,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-react";

const JudgeEventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);

  // Filter aligned with EventType + "ALL"
  const [filter, setFilter] = useState<"ALL" | EventType>("ALL");

  useEffect(() => {
    dispatch(fetchEvents(filter === "ALL" ? undefined : { type: filter }));
  }, [dispatch, filter]);

  const categories: ("ALL" | EventType)[] = [
    "ALL",
    "DEADLINE",
    "CEREMONY",
    "INDUCTION",
    "OTHER",
  ];

  /* Helper to get theme colors based on Event Type */
  const getTypeStyles = (type: EventType) => {
    switch (type) {
      case "DEADLINE":
        return "bg-red-50 text-red-600 border-red-100";
      case "CEREMONY":
        return "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20";
      case "INDUCTION":
        return "bg-[#355E3B]/10 text-[#355E3B] border-[#355E3B]/20";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header & Filtering */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h1 className="text-[#355E3B] font-serif text-3xl lg:text-4xl font-bold">
            Judicial Calendar
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-tight">
            Official schedule of inductions, deadlines, and swearing-in
            protocols.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === cat
                  ? "bg-[#355E3B] border-[#355E3B] text-white shadow-lg shadow-[#355E3B]/20"
                  : "bg-white border-slate-200 text-slate-400 hover:border-[#C5A059] hover:text-[#C5A059]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-[#355E3B]" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Retrieving Schedule...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-600">
          <AlertTriangle size={20} />
          <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
          <CalendarIcon className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 text-sm font-medium">
            No events found for this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {events.map((event: IEvent) => (
            <div
              key={event._id}
              className="group relative flex flex-col md:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-[#355E3B]/10 hover:border-[#355E3B]/30 transition-all duration-500"
            >
              {/* Mandatory Indicator Badge */}
              {event.isMandatory && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full shadow-lg">
                  <AlertTriangle size={10} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                    Mandatory Attendance
                  </span>
                </div>
              )}

              {/* Left Side: Date Block */}
              <div
                className={`w-full md:w-32 lg:w-40 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 transition-colors ${getTypeStyles(event.type).split(" ")[0]}`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                  {new Date(event.date).toLocaleString("default", {
                    month: "short",
                  })}
                </span>
                <span className="text-4xl lg:text-5xl font-serif font-black leading-none text-[#355E3B]">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-[10px] font-bold mt-2 tracking-widest opacity-60">
                  {new Date(event.date).getFullYear()}
                </span>
              </div>

              {/* Right Side: Details */}
              <div className="flex-1 p-8">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getTypeStyles(event.type)}`}
                    >
                      {event.type}
                    </span>
                    <h3 className="text-[#355E3B] font-serif text-2xl lg:text-3xl font-bold group-hover:text-[#C5A059] transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-[#C5A059]/10 transition-colors">
                        <MapPin size={14} className="text-[#C5A059]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-[#C5A059]/10 transition-colors">
                        <Clock size={14} className="text-[#C5A059]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                        {event.time || "TBD"}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl border-l-2 border-slate-100 pl-4 py-1 italic">
                    {event.description}
                  </p>

                  <div className="pt-4 flex items-center justify-between">
                    <button className="group/btn flex items-center gap-2 text-[#C5A059] font-black text-[10px] uppercase tracking-widest transition-all">
                      <Info size={14} />
                      <span className="group-hover/btn:underline underline-offset-4">
                        Protocol & Logistics
                      </span>
                      <ChevronRight
                        size={12}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Global Protocol Note */}
      <div className="bg-[#355E3B]/5 border border-[#355E3B]/10 p-8 rounded-[2rem] flex items-start gap-6 transition-all hover:bg-[#355E3B]/10">
        <div className="bg-[#355E3B] p-4 rounded-2xl text-white shadow-xl shadow-[#355E3B]/20">
          <CalendarIcon size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-[#355E3B] font-black text-[11px] uppercase tracking-[0.2em]">
            Official Attendance Protocol
          </h4>
          <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">
            As per Judicial Service Commission guidelines, attendance for the
            <span className="font-bold text-slate-900">
              {" "}
              Induction Programme
            </span>{" "}
            and
            <span className="font-bold text-slate-900">
              {" "}
              Swearing-in Ceremony
            </span>{" "}
            is strictly mandatory. Officers are required to present their
            appointment letters and national ID at the Nairobi Serena Hotel
            registration desk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JudgeEventsPage;
