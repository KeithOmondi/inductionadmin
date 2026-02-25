import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type IEvent,
  type EventFilter,
} from "../../store/slices/eventSlice";
import { 
  Plus, Trash2, Edit2, Calendar, MapPin, 
  Clock, AlertCircle, X, Search, Filter
} from "lucide-react";
import toast from "react-hot-toast";

const AdminEventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((state) => state.events);

  /* ---------------- STATE ---------------- */
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("ALL");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    isMandatory: false,
  });

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    // Fetch events based on active filter (ALL, UPCOMING, etc.)
    dispatch(fetchEvents({ filter: activeFilter === "ALL" ? undefined : activeFilter }));
  }, [dispatch, activeFilter]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = (event?: IEvent) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date.split("T")[0],
        time: event.time,
        isMandatory: event.isMandatory,
      });
    } else {
      setEditingEvent(null);
      setForm({
        title: "",
        description: "",
        location: "",
        date: "",
        time: "",
        isMandatory: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.time) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      if (editingEvent) {
        await dispatch(updateEvent({ id: editingEvent._id, formData: form })).unwrap();
        toast.success("Event updated successfully");
      } else {
        await dispatch(createEvent(form)).unwrap();
        toast.success("Event published to registry");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err || "Action failed");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this event from the judicial registry?")) {
      dispatch(deleteEvent(id))
        .unwrap()
        .then(() => toast.success("Event deleted"))
        .catch((err) => toast.error(err));
    }
  };

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* 1. HEADER & SEARCH */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <h1 className="text-[#355E3B] font-serif text-4xl font-black tracking-tight">Events Calendar</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Events Management</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as EventFilter)}
              className="appearance-none w-full bg-slate-100 border-none rounded-xl pl-10 pr-8 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#355E3B]/10 cursor-pointer"
            >
              <option value="ALL">All Events</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Archive</option>
              <option value="RECENT">Recently Added</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search registry..."
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B]/10 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#355E3B] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#2a4b2f] transition-all shadow-xl shadow-[#355E3B]/20 active:scale-95"
          >
            <Plus size={18} /> Add Event
          </button>
        </div>
      </div>

      {/* 2. EVENTS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#355E3B]" /></div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-serif italic text-lg">No matching judicial events found.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event._id} className="bg-white border border-slate-200 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col lg:flex-row items-center gap-8">
              
              {/* Date Block */}
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-[#355E3B] text-white p-5 rounded-[1.5rem] text-center min-w-[110px] shadow-lg shadow-[#355E3B]/20">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">
                    {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-3xl font-serif font-black">
                    {new Date(event.date).getDate()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {event.isMandatory && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-widest">
                        <AlertCircle size={10} /> Mandatory
                      </span>
                    )}
                  </div>
                  <h3 className="text-[#355E3B] text-xl font-bold group-hover:text-[#C5A059] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight">
                      <Clock size={14} className="text-[#C5A059]" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight">
                      <MapPin size={14} className="text-[#C5A059]" /> {event.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full lg:w-auto justify-end ml-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                <button
                  onClick={() => openModal(event)}
                  className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-[#C5A059]/10 hover:text-[#C5A059] transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-[#355E3B]/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-[#355E3B] font-serif text-3xl font-black">
                  {editingEvent ? "Revise Directive" : "New Protocol"}
                </h2>
                <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em] mt-1">Calendar Entry System</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-2 rounded-full shadow-sm hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Title of Proceeding</label>
                <input
                  type="text" name="title" value={form.title} onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#C5A059]/30 rounded-2xl px-5 py-4 text-sm outline-none transition-all"
                  placeholder="Official Title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Event Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#C5A059]/30 rounded-2xl px-5 py-4 text-sm outline-none transition-all resize-none"
                  placeholder="Details regarding the event..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Scheduled Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Session Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Venue Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm outline-none" placeholder="Court Room / Hotel" />
              </div>

              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name="isMandatory" 
                    id="mand" 
                    checked={form.isMandatory} 
                    onChange={handleChange} 
                    className="w-6 h-6 rounded-lg accent-[#355E3B]" 
                  />
                  <label htmlFor="mand" className="text-[10px] font-black uppercase tracking-widest text-red-600 cursor-pointer">Mark as Mandatory proceeding</label>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-4 rounded-2xl text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-4 bg-[#355E3B] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2a4b2f] shadow-2xl shadow-[#355E3B]/40 transition-all disabled:opacity-50"
              >
                {editingEvent ? "Update Record" : "Publish to Registry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;