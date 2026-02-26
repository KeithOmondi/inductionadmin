import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  X,
  Scale,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCourtInfo } from "../../store/slices/courtInformationSlice";

/* =====================================================
    REUSABLE SUB-COMPONENTS
===================================================== */

const ContactCard: React.FC<{
  title: string;
  detail: string;
  sub?: string;
}> = ({ title, detail, sub }) => {
  const getIcon = () => {
    const t = title.toLowerCase();
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
    LEADERSHIP MODAL (Now fully Dynamic)
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
            src={data.content?.[0]?.url}
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
                className="h-30 w-50"
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
            <h2
              className="text-[#1a1a1a] text-6xl md:text-7xl font-light italic leading-none"
              style={{ fontFamily: "serif" }}
            >
              Congratulations
            </h2>
            <div className="space-y-5">
              <p className="font-serif text-2xl text-slate-800 font-semibold italic">
                Greetings,
              </p>
              <div className="text-slate-700 leading-relaxed text-lg font-serif whitespace-pre-line">
                {data.content?.[0]?.body}
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
              <div className="flex flex-col items-end group">
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

const CourtInformation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { divisions, faqs, contacts } = useAppSelector((state) => state.court);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [selectedJudge, setSelectedJudge] = useState<any | null>(null);
  const [isMandateOpen, setIsMandateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCourtInfo());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-6 animate-in fade-in duration-1000">
      {/* HERO SECTION */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#355E3B] via-[#C5A059] to-[#355E3B]" />
        <h1 className="text-[#355E3B] font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          The High Court of Kenya
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Established under Article 165 of the Constitution of Kenya.
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
                onClick={() => setSelectedJudge(d)}
                className="group cursor-pointer bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-md hover:shadow-xl hover:border-[#355E3B] transition-all duration-500"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={d.content?.find((c) => c.type === "IMAGE")?.url}
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
                  <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase">
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
            className="group cursor-pointer bg-[#355E3B] text-white rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden transition-transform hover:scale-[1.01] h-full"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scale size={120} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#C5A059]">
              Article 165
            </h3>
            <p className="text-slate-200 italic leading-relaxed line-clamp-6 text-lg">
              a) unlimited original jurisdiction in criminal and civil matters;
              (b) jurisdiction to determine the question whether a right or
              fundamental freedom in the Bill of Rights has been denied,
              violated, infringed or threatened; (c) jurisdiction to hear an
              appeal from a decision of a tribunal appointed under this
              Constitution to consider the removal of a person from office,
              other than a tribunal appointed under Article 144; (d)
              jurisdiction to hear any question respecting the interpretation of
              this Constitution including the determination of— (i) the question
              whether any law is inconsistent with or in contravention of this
              Constitution; (ii) the question whether anything said to be done
              under the authority of this Constitution or of any law is
              inconsistent with, or in contravention of, this Constitution;
              (iii) any matter relating to constitutional powers of State organs
              in respect of county governments and any matter relating to the
              constitutional relationship between the levels of government; and
              (iv) a question relating to conflict of laws under Article 191;
              and (e) any other jurisdiction, original or appellate, conferred
              on it by legislation. (4) Any matter certified by the court as
              raising a substantial question of law under clause (3) (b) or (d)
              shall be heard by an uneven number of judges, being not less than
              three, assigned by the Chief Justice. (5) The High Court shall not
              have jurisdiction in respect of matters— (a) reserved for the
              exclusive jurisdiction of the Supreme Court under this
              Constitution; or (b) falling within the jurisdiction of the courts
              contemplated in Article 162 (2). (6) The High Court has
              supervisory jurisdiction over the subordinate courts and over any
              person, body or authority exercising a judicial or quasi-judicial
              function, but not over a superior court.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[#C5A059] font-black text-[10px] uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full">
              Read Full Constitution Mandate <ExternalLink size={14} />
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
        {contacts.map((contact) => (
          <ContactCard
            key={contact._id}
            title={contact.title}
            detail={contact.detail}
            sub={contact.sub}
          />
        ))}
      </section>

      {/* MODALS */}
      <LeadershipModal
        isOpen={!!selectedJudge}
        onClose={() => setSelectedJudge(null)}
        data={selectedJudge}
      />
      <MandateModal
        isOpen={isMandateOpen}
        onClose={() => setIsMandateOpen(false)}
      />
    </div>
  );
};

export default CourtInformation;
