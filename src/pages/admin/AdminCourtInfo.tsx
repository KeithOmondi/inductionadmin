import { useEffect, useState } from "react";
import {
  fetchCourtInfo,
  createDivision,
  updateDivision,
  deleteDivision,
  // FAQ Actions
  createFaq,
  updateFaq,
  deleteFaq,
  // Contact Actions
  createContact,
  updateContact,
  deleteContact,
} from "../../store/slices/courtInformationSlice";
import {
  Pencil,
  Trash,
  Plus,
  Gavel,
  BookOpen,
  Contact as ContactIcon,
  Save,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const AdminCourtInfo = () => {
  const dispatch = useAppDispatch();
  const { divisions, faqs, contacts, loading  } = useAppSelector((state) => state.court);

  // --- LOCAL STATE: DIVISIONS ---
  const [newDivision, setNewDivision] = useState("");
  const [editDivId, setEditDivId] = useState<string | null>(null);
  const [editDivName, setEditDivName] = useState("");

  // --- LOCAL STATE: FAQs ---
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editFaqId, setEditFaqId] = useState<string | null>(null);

  // --- LOCAL STATE: CONTACTS ---
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ title: "", detail: "", sub: "" });
  const [editContactId, setEditContactId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCourtInfo());
  }, [dispatch]);

  // --- HANDLERS: DIVISIONS ---
  const handleAddDiv = () => {
    if (!newDivision.trim()) return;
    dispatch(createDivision(newDivision));
    setNewDivision("");
  };

// --- HANDLERS: FAQs ---
const handleFaqSubmit = () => {
  if (!faqForm.question || !faqForm.answer) return;
  if (editFaqId) {
    // Change 'id' to '_id' to satisfy the FAQ interface
    dispatch(updateFaq({ _id: editFaqId, ...faqForm })); 
    setEditFaqId(null);
  } else {
    dispatch(createFaq(faqForm));
    setIsAddingFaq(false);
  }
  setFaqForm({ question: "", answer: "" });
};

// --- HANDLERS: CONTACTS ---
const handleContactSubmit = () => {
  if (!contactForm.title || !contactForm.detail) return;
  if (editContactId) {
    // Change 'id' to '_id' here as well
    dispatch(updateContact({ _id: editContactId, ...contactForm }));
    setEditContactId(null);
  } else {
    dispatch(createContact(contactForm));
    setIsAddingContact(false);
  }
  setContactForm({ title: "", detail: "", sub: "" });
};

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header logic remains same */}
      <header className="border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-[#355E3B] font-serif text-3xl font-bold italic">High Court Information</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium font-serif">Office of the Registrar High Court</p>
        </div>
        {loading && <span className="text-[10px] font-black text-[#C5A059] animate-pulse">SYNCING DATA...</span>}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: DIVISIONS & FAQS */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. DIVISIONS (CRUD) */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#355E3B]/5 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Gavel size={18} className="text-[#355E3B]" />
              <h2 className="font-bold text-xs uppercase tracking-widest text-[#355E3B]">Court Divisions</h2>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#355E3B]"
                  placeholder="New Division Name (e.g. Criminal Division)"
                  value={newDivision}
                  onChange={e => setNewDivision(e.target.value)}
                />
                <button onClick={handleAddDiv} className="bg-[#355E3B] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2a4b2f]">Add</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {divisions.map(d => (
                  <div key={d._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                    {editDivId === d._id ? (
                      <input 
                        autoFocus
                        className="flex-1 bg-white border border-[#355E3B] px-2 py-1 rounded text-sm font-bold"
                        value={editDivName}
                        onChange={e => setEditDivName(e.target.value)}
                        onBlur={() => { dispatch(updateDivision({id: d._id, name: editDivName})); setEditDivId(null); }}
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-700">{d.name}</span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditDivId(d._id); setEditDivName(d.name); }} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={14}/></button>
                      <button onClick={() => dispatch(deleteDivision(d._id))} className="p-1 text-slate-400 hover:text-red-600"><Trash size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. FAQS (CRUD) */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#355E3B]/5 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#355E3B]" />
                <h2 className="font-bold text-xs uppercase tracking-widest text-[#355E3B]">Knowledge Base (FAQs)</h2>
              </div>
              <button 
                onClick={() => { setIsAddingFaq(true); setEditFaqId(null); setFaqForm({question: "", answer: ""}); }} 
                className="text-[10px] font-black text-[#C5A059] border border-[#C5A059] px-3 py-1 rounded-full hover:bg-[#C5A059] hover:text-white transition-all"
              >
                + NEW QUESTION
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {(isAddingFaq || editFaqId) && (
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-[#C5A059]/30 space-y-3">
                  <input 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none"
                    placeholder="Question Title"
                    value={faqForm.question}
                    onChange={e => setFaqForm({...faqForm, question: e.target.value})}
                  />
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm min-h-[100px] outline-none"
                    placeholder="Detailed Answer Content..."
                    value={faqForm.answer}
                    onChange={e => setFaqForm({...faqForm, answer: e.target.value})}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsAddingFaq(false); setEditFaqId(null); }} className="text-xs font-bold text-slate-400 px-4 py-2">Cancel</button>
                    <button onClick={handleFaqSubmit} className="bg-[#355E3B] text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Save size={14} /> Save FAQ Entry
                    </button>
                  </div>
                </div>
              )}

              {faqs.map(f => (
                <div key={f._id} className="group border-b border-slate-100 py-4 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-[#355E3B]">{f.question}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditFaqId(f._id); setFaqForm({question: f.question, answer: f.answer}); }} className="text-blue-500"><Pencil size={14}/></button>
                      <button onClick={() => dispatch(deleteFaq(f._id))} className="text-red-500"><Trash size={14}/></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: CONTACTS (CRUD) */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#C5A059]">
                <ContactIcon size={18} />
                <h2 className="font-bold text-xs uppercase tracking-widest">ORHC Contacts</h2>
              </div>
              <button 
                onClick={() => { setIsAddingContact(true); setEditContactId(null); setContactForm({title: "", detail: "", sub: ""}); }} 
                className="text-white hover:text-[#C5A059]"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {(isAddingContact || editContactId) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-4">
                  <input 
                    className="w-full text-xs font-black uppercase bg-white border border-slate-200 p-2 rounded outline-none" 
                    placeholder="LABEL (e.g. PHONE)"
                    value={contactForm.title}
                    onChange={e => setContactForm({...contactForm, title: e.target.value})}
                  />
                  <input 
                    className="w-full text-sm font-bold bg-white border border-slate-200 p-2 rounded outline-none" 
                    placeholder="Value (e.g. +254...)"
                    value={contactForm.detail}
                    onChange={e => setContactForm({...contactForm, detail: e.target.value})}
                  />
                  <input 
                    className="w-full text-xs bg-white border border-slate-200 p-2 rounded outline-none" 
                    placeholder="Subtitle (Optional)"
                    value={contactForm.sub}
                    onChange={e => setContactForm({...contactForm, sub: e.target.value})}
                  />
                  <button onClick={handleContactSubmit} className="w-full bg-[#C5A059] text-white py-2 rounded text-[10px] font-black uppercase">Save Contact</button>
                </div>
              )}

              {contacts.map(c => (
                <div key={c._id} className="group relative pl-4 border-l-2 border-[#C5A059] py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest">{c.title}</p>
                      <p className="text-sm font-bold text-slate-800">{c.detail}</p>
                      {c.sub && <p className="text-[10px] text-slate-400 italic">{c.sub}</p>}
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditContactId(c._id); setContactForm({title: c.title, detail: c.detail, sub: c.sub || ""}); }} className="text-blue-400 hover:text-blue-600"><Pencil size={12}/></button>
                      <button onClick={() => dispatch(deleteContact(c._id))} className="text-red-400 hover:text-red-600"><Trash size={12}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminCourtInfo;