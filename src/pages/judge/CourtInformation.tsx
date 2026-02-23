import React, { useEffect, useState } from "react";
import {
  Scale,
  ChevronDown,
  Gavel,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  BookOpen,
  type LucideProps,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCourtInfo } from "../../store/slices/courtInformationSlice";

const CourtInformation = () => {
  const dispatch = useAppDispatch();
  const { divisions, faqs, contacts, loading } = useAppSelector((state) => state.court);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have data yet to prevent unnecessary API calls
    if (divisions.length === 0 && faqs.length === 0) {
      dispatch(fetchCourtInfo());
    }
  }, [dispatch, divisions.length, faqs.length]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
      {/* 1. Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm relative overflow-hidden">
        <div className="bg-[#355E3B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#355E3B]/20">
          <Scale color="#C5A059" size={32} />
        </div>
        <h1 className="text-[#355E3B] font-serif text-4xl font-bold mb-4 tracking-tight">
          The High Court of Kenya
        </h1>
        <div className="w-24 h-1 bg-[#C5A059] mx-auto mb-6 rounded-full" />
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Established under{" "}
          <span className="text-[#355E3B] font-bold">
            Article 165 of the Constitution of Kenya 2010
          </span>
          , the High Court is a superior court with unlimited original
          jurisdiction.
        </p>
      </section>

      {/* 2. Mandate & Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-[#C5A059]" size={24} />
            <h2 className="text-[#355E3B] font-serif text-2xl font-bold">
              Constitutional Mandate
            </h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
            The High Court derives its existence from Article 165. It serves as
            the principal court for the protection of fundamental rights and
            freedoms.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            The Court also exercises supervisory jurisdiction over subordinate
            courts and maintains both first instance and appellate capacity.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Gavel className="text-[#C5A059]" size={24} />
            <h2 className="text-[#355E3B] font-serif text-2xl font-bold">
              Structure & Divisions
            </h2>
          </div>
          <p className="text-slate-600 text-sm mb-6 font-medium">
            Specialized divisions ensure judicial expertise:
          </p>
          <div className="flex flex-wrap gap-2">
            {loading && divisions.length === 0 ? (
              <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
            ) : (
              divisions.map((d) => (
                <span
                  key={d._id}
                  className="px-3 py-1.5 bg-[#355E3B]/5 text-[#355E3B] text-[10px] font-black uppercase tracking-wider rounded-md border border-[#355E3B]/10"
                >
                  {d.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Smooth FAQ Accordion */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="text-[#C5A059]" size={24} />
          <h2 className="text-[#355E3B] font-serif text-2xl font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq._id;
            return (
              <div
                key={faq._id}
                className={`border rounded-xl transition-all duration-300 ${isOpen ? "border-[#355E3B] bg-[#355E3B]/[0.02]" : "border-slate-100 bg-slate-50"}`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq._id)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span
                    className={`text-sm font-bold transition-colors duration-300 ${isOpen ? "text-[#355E3B]" : "text-slate-700"}`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <ChevronDown
                      size={20}
                      color={isOpen ? "#355E3B" : "#C5A059"}
                    />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-[#355E3B]/10">
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Dynamic Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <ContactCard
            key={contact._id}
            title={contact.title}
            detail={contact.detail}
            sub={contact.sub}
          />
        ))}
      </div>
    </div>
  );
};

const ContactCard = ({ title, detail, sub }: any) => {
  const getIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("email") || t.includes("@")) return <Mail />;
    if (t.includes("location") || t.includes("address")) return <MapPin />;
    return <Phone />;
  };

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center group hover:border-[#355E3B] transition-all duration-500 shadow-sm hover:shadow-md">
      <div className="text-[#355E3B] mb-4 flex justify-center group-hover:-translate-y-1 transition-transform duration-300">
        {/* Cast to React.ReactElement<LucideProps> to allow 'size' */}
        {React.cloneElement(getIcon() as React.ReactElement<LucideProps>, {
          size: 28,
          className: "text-[#C5A059]",
        })}
      </div>
      <h3 className="text-[#355E3B] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
        {title}
      </h3>
      <p className="text-[#355E3B] font-bold text-sm mb-1">{detail}</p>
      <p className="text-slate-400 text-xs font-medium">{sub}</p>
    </div>
  );
};

export default CourtInformation;