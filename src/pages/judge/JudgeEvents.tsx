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
} from "lucide-react";

const JudgeEventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);

  /* Date-based filter */
  const [filter, setFilter] = useState<EventFilter>("ALL");

  useEffect(() => {
    dispatch(filter === "ALL" ? fetchEvents() : fetchEvents({ filter }));
  }, [dispatch, filter]);

  const categories: EventFilter[] = ["ALL", "UPCOMING", "RECENT", "PAST"];

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h1 className="text-[#355E3B] font-serif text-3xl lg:text-4xl font-bold">
            ORHC Events
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-tight">
            View Most Recent, Past and Upcoming Events
          </p>
        </div>

        {/* Filter Tabs */}
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

      {/* Content */}
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
            No events found for this period.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {events.map((event: IEvent) => (
            <div
              key={event._id}
              className="group relative flex flex-col md:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-[#355E3B]/10 hover:border-[#355E3B]/30 transition-all duration-500"
            >
              

              {/* Date Block */}
              <div className="w-full md:w-32 lg:w-40 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50">
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

              {/* Details */}
              <div className="flex-1 p-8 space-y-4">
                <h3 className="text-[#355E3B] font-serif text-2xl lg:text-3xl font-bold group-hover:text-[#C5A059] transition-colors">
                  {event.title}
                </h3>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} className="text-[#C5A059]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} className="text-[#C5A059]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                      {event.time || "TBD"}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed max-w-2xl border-l-2 border-slate-100 pl-4 py-1 italic">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JudgeEventsPage;
