import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type IEvent,
  type EventType,
} from "../../store/slices/eventSlice";
import { 
  Plus, Trash2, Edit2, Calendar, MapPin, 
  Clock, AlertCircle, X, Search
} from "lucide-react";

const AdminEventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((state) => state.events);

  /* ---------------- STATE ---------------- */
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    type: "DEADLINE" as EventType,
    isMandatory: false,
  });

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    dispatch(fetchEvents({}));
  }, [dispatch]);

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
        type: event.type,
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
        type: "DEADLINE",
        isMandatory: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingEvent) {
      dispatch(updateEvent({ id: editingEvent._id, formData: form }));
    } else {
      dispatch(createEvent(form));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this event from the judicial registry?")) {
      dispatch(deleteEvent(id));
    }
  };

  /* ---------------- UI HELPERS ---------------- */
  const getTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      DEADLINE: "bg-red-50 text-red-700 border-red-100",
      CEREMONY: "bg-amber-50 text-amber-700 border-amber-100",
      INDUCTION: "bg-emerald-50 text-emerald-700 border-emerald-100",
      OTHER: "bg-slate-50 text-slate-700 border-slate-100",
    };
    return styles[type] || styles.OTHER;
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER & SEARCH */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <h1 className="text-[#355E3B] font-serif text-4xl font-black tracking-tight">Judicial Calendar</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Official Registry Management</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search registry..."
              className="w-full bg-slate-100/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B]/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#355E3B] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#2a4b2f] transition-all shadow-xl shadow-[#355E3B]/20 active:scale-95"
          >
            <Plus size={18} /> New Protocol
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
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${getTypeStyle(event.type)}`}>
                      {event.type}
                    </span>
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
                  title="Edit Event"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Delete Event"
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
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Session Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Venue Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm" placeholder="Court Room / Hotel" />
              </div>

              <div className="flex items-center gap-4 pt-6">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Protocol Category</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold">
                    <option value="DEADLINE">DEADLINE</option>
                    <option value="CEREMONY">CEREMONY</option>
                    <option value="INDUCTION">INDUCTION</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-4 self-center">
                  <input type="checkbox" name="isMandatory" id="mand" checked={form.isMandatory} onChange={handleChange} className="w-6 h-6 rounded-lg accent-[#355E3B]" />
                  <label htmlFor="mand" className="text-[10px] font-black uppercase tracking-widest text-red-600 cursor-pointer">Mandatory</label>
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
                className="px-10 py-4 bg-[#355E3B] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2a4b2f] shadow-2xl shadow-[#355E3B]/40 transition-all"
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