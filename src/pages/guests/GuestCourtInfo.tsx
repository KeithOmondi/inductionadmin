// src/pages/guests/GuestCourtInfoPage.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  X,
  Scale,
  ExternalLink,
  RefreshCw, // Added for a small visual indicator
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGuestCourtInfo,
  clearCourtError,
} from "../../store/slices/guests/guestCourtInfoSlice";

/* =====================================================
    REUSABLE SUB-COMPONENTS
===================================================== */

const ContactCard: React.FC<{
  title: string;
  detail: string;
  sub?: string;
}> = ({ title, detail, sub }) => {
  const getIcon = () => {
    const t = (title + detail).toLowerCase();
    if (t.includes("email") || t.includes("@")) return <Mail size={24} />;
    if (t.includes("location") || t.includes("address"))
      return <MapPin size={24} />;
    return <Phone size={24} />;
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] text-center group hover:border-[#355E3B] transition-all duration-500 shadow-sm">
      <div className="text-[#355E3B] mb-4 flex justify-center group-hover:scale-110 transition-transform">
        {React.cloneElement(getIcon(), { className: "text-[#C5A059]" })}
      </div>
      <h3 className="text-[#355E3B] text-[9px] font-black uppercase tracking-[0.2em] mb-2">
        {title}
      </h3>
      <p className="text-[#355E3B] font-bold text-sm mb-1">{detail}</p>
      {sub && <p className="text-slate-400 text-[10px] font-medium">{sub}</p>}
    </div>
  );
};

/* =====================================================
    MANDATE MODAL
===================================================== */

const MandateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-[#355E3B] font-serif text-3xl font-bold">
              Court Mandate
            </h2>
            <p className="text-[#C5A059] font-black text-[10px] uppercase tracking-widest mt-1">
              Constitution of Kenya • Article 165
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-all shadow-sm border border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 overflow-y-auto">
          <div className="space-y-6 text-slate-700 leading-relaxed font-serif text-lg">
            <p className="font-bold text-[#355E3B]">The High Court has:</p>
            <ul className="space-y-4 list-none p-0">
              <li className="flex gap-4">
                <span className="font-bold text-[#C5A059] shrink-0">(a)</span>{" "}
                unlimited original jurisdiction in criminal and civil matters;
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-[#C5A059] shrink-0">(b)</span>{" "}
                jurisdiction to determine questions regarding the Bill of
                Rights;
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-[#C5A059] shrink-0">(c)</span>{" "}
                jurisdiction to hear appeals regarding constitutional removals;
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-[#C5A059] shrink-0">(d)</span>{" "}
                jurisdiction to hear any question respecting the interpretation
                of the Constitution.
              </li>
            </ul>
            <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#355E3B] italic text-base">
              (6) The High Court has supervisory jurisdiction over the
              subordinate courts and over any person, body or authority
              exercising a judicial function.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
    LEADERSHIP MODAL
===================================================== */

const LeadershipModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: any;
}> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-all shadow-lg border border-slate-100"
        >
          <X size={20} />
        </button>

        <div className="relative w-full md:w-[40%] min-h-[400px] bg-slate-100 overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 h-full w-full pointer-events-none z-10">
            <div className="absolute inset-y-0 -left-12 w-24 bg-[#355E3B] rounded-r-full opacity-90" />
            <div className="absolute inset-y-0 left-8 w-1 bg-[#C5A059]" />
          </div>
          <img
            src={data.content?.find((c: any) => c.type === "IMAGE")?.url || "https://via.placeholder.com/400x600"}
            className="absolute inset-0 w-full h-full object-cover object-top"
            alt={data.name}
          />
          <div className="absolute bottom-0 left-0 w-full p-8 pt-20 bg-gradient-to-t from-[#355E3B] via-[#355E3B]/60 to-transparent z-20">
            <h3 className="text-white font-bold text-xl tracking-wide leading-tight">
              {data.name}
            </h3>
            <p className="text-[#C5A059] font-black text-[10px] uppercase tracking-[0.2em] mt-1">
              {data.title}
            </p>
          </div>
        </div>

        <div className="relative flex-1 p-8 md:p-14 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-px h-10 bg-slate-300" />
              <img
                src="https://res.cloudinary.com/drls2cpnu/image/upload/v1772111715/JOB_LOGO_ebsbgu.jpg"
                className="h-20 w-auto"
                alt="Judiciary Logo"
              />
            </div>
            <p className="text-[#355E3B] font-bold text-[11px] uppercase tracking-[0.3em]">
              Republic of Kenya
            </p>
            <h4 className="text-[#355E3B] font-black text-[12px] uppercase mt-1">
              Office of the {data.title}
            </h4>
          </div>

          <div className="space-y-8 max-w-2xl mx-auto">
            <h2 className="text-[#1a1a1a] text-5xl md:text-6xl font-light italic leading-none font-serif">
              Official Message
            </h2>
            <div className="space-y-5">
              <p className="font-serif text-2xl text-slate-800 font-semibold italic">
                Greetings,
              </p>
              <div className="text-slate-700 leading-relaxed text-lg font-serif whitespace-pre-line">
                {data.content?.find((c: any) => c.type === "TEXT")?.body || 
                 data.content?.find((c: any) => c.type === "IMAGE")?.body || 
                 "No official message available at this time."}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex justify-between items-end gap-4">
              <div>
                <p className="font-serif italic text-2xl text-[#355E3B]">
                  {data.title}
                </p>
                <div className="h-1 w-20 bg-[#C5A059] mt-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                  {data.name}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center">
                    <img
                      src="https://res.cloudinary.com/drls2cpnu/image/upload/v1772113759/images_wh1vyl.png"
                      className="h-full w-auto object-contain"
                      alt="Shield Logo"
                    />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <div className="flex items-center gap-1">
                      <div className="h-[2px] w-4 bg-[#C5A059]" />
                      <span className="text-[11px] font-black uppercase tracking-tighter text-[#355E3B]">
                        Social Transformation
                      </span>
                    </div>
                    <p className="text-[10px] text-[#C5A059] italic font-medium mt-0.5 ml-5">
                      through Access to Justice
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
    MAIN PAGE COMPONENT
===================================================== */

const GuestCourtInfoPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { divisions, faqs, contacts, loading, error } = useAppSelector(
    (state) => state.guestCourtInfo,
  );

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);
  const [isMandateOpen, setIsMandateOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use a ref to store the abortable promise for cleanup
  const activeRequest = useRef<any>(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    activeRequest.current = dispatch(fetchGuestCourtInfo());
    await activeRequest.current;
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Initial fetch
    loadData();

    // Setup Auto-Refresh Interval (e.g., every 30 seconds)
    const REFRESH_INTERVAL = 30000;
    const intervalId = setInterval(() => {
      loadData(true); // silent refresh
    }, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      if (activeRequest.current) activeRequest.current.abort();
      dispatch(clearCourtError());
    };
  }, [dispatch]);

  if (loading && !divisions.length) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-[#355E3B] rounded-full animate-spin" />
        <p className="text-[#355E3B] font-serif animate-pulse">
          Verifying Registry Records...
        </p>
      </div>
    );
  }

  if (error && !divisions.length) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-white border border-red-100 rounded-[2rem] shadow-xl">
        <div className="text-red-500 mb-4 flex justify-center">
          <X size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => loadData()}
          className="px-6 py-2 bg-[#355E3B] text-white rounded-full hover:bg-[#2a4a2e] transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-6 animate-in fade-in duration-1000 relative">
      
      {/* SILENT REFRESH INDICATOR */}
      {isRefreshing && divisions.length > 0 && (
        <div className="fixed top-24 right-10 z-50 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm text-[#355E3B] animate-in slide-in-from-right-4">
          <RefreshCw size={14} className="animate-spin text-[#C5A059]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Updating Registry...</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#355E3B] via-[#C5A059] to-[#355E3B]" />
        <h1 className="text-[#355E3B] font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          The High Court of Kenya
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Established under Article 165 of the Constitution of Kenya. Registry & Public Information
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* LEADERSHIP SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[#355E3B] font-serif text-2xl font-bold italic shrink-0">
              Court Leadership
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {divisions.map((d) => (
              <div
                key={d._id}
                onClick={() => setSelectedLeader(d)}
                className="group cursor-pointer bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-md hover:shadow-xl hover:border-[#355E3B] transition-all duration-500"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={d.content?.find((c: any) => c.type === "IMAGE")?.url || "https://via.placeholder.com/150"}
                    className="w-full h-full object-cover"
                    alt={d.name}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#355E3B] group-hover:underline">
                    {d.name}
                  </h3>
                  <p className="text-xs font-black text-[#C5A059] uppercase tracking-widest mt-1">
                    {d.title}
                  </p>
                  <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase italic">
                    View Official Message • ✉
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MANDATE SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[#355E3B] font-serif text-2xl font-bold italic shrink-0">
              Our Mandate
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div
            onClick={() => setIsMandateOpen(true)}
            className="group cursor-pointer bg-[#355E3B] text-white rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden transition-transform hover:scale-[1.01] h-full flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scale size={120} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#C5A059]">
              Article 165
            </h3>
            <p className="text-slate-200 italic leading-relaxed line-clamp-6 text-lg">
              The High Court has unlimited original jurisdiction in criminal and civil matters; 
              jurisdiction to determine questions regarding the Bill of Rights; 
              supervisory jurisdiction over subordinate courts and over any person, 
              body or authority exercising a judicial function...
            </p>
            <div className="mt-8 flex items-center gap-2 text-[#C5A059] font-black text-[10px] uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full">
              Read Full Constitutional Mandate <ExternalLink size={14} />
            </div>
          </div>
        </section>
      </div>

      {/* FAQ SECTION */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <BookOpen className="text-[#355E3B]" size={28} />
          <h2 className="text-[#355E3B] font-serif text-2xl font-bold">
            Registry FAQ
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq._id;
            return (
              <div
                key={faq._id}
                className={`border rounded-2xl transition-all duration-300 ${isOpen ? "border-[#355E3B] bg-slate-50" : "border-slate-100 bg-white"}`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq._id)}
                  className="w-full flex items-center justify-between p-5 text-left outline-none text-sm font-bold text-slate-700"
                >
                  {faq.question}
                  <ChevronDown
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    size={18}
                  />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-slate-500 text-sm leading-relaxed animate-in slide-in-from-top-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACTS SECTION */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {contacts.map((c) => (
          <ContactCard
            key={c._id}
            title={c.title}
            detail={c.email || c.phone || c.address || "Contact Info"}
            sub={c.address ? "Location" : c.email ? "Email Support" : "Phone Line"}
          />
        ))}
      </section>

      {/* MODALS */}
      <LeadershipModal
        isOpen={!!selectedLeader}
        onClose={() => setSelectedLeader(null)}
        data={selectedLeader}
      />
      <MandateModal
        isOpen={isMandateOpen}
        onClose={() => setIsMandateOpen(false)}
      />
    </div>
  );
};

export default GuestCourtInfoPage;