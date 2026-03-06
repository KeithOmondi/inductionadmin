import { ShieldCheck } from "lucide-react";

const GuestHeader = () => {
  return (
    <header className="sticky top-0 z-[100] w-full flex items-center justify-between px-4 lg:px-8 py-3 bg-white border-b border-slate-200 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="p-2 bg-white rounded-xl shadow-sm border-l-4 border-[#355E3B]">
          <h1 className="text-[#355E3B] font-serif text-sm lg:text-base font-black uppercase">
            OFFICE OF THE REGISTRAR
          </h1>

          <div className="flex items-center gap-1 mt-1">
            <div className="h-[1px] w-3 bg-[#C5A059]" />

            <p className="text-[#C5A059] text-[8px] font-black uppercase tracking-[0.2em]">
              High Court of Kenya
            </p>
          </div>
        </div>

      </div>

      <div className="flex items-center gap-2 text-[#355E3B] text-xs font-bold">
        <ShieldCheck size={16} className="text-[#C5A059]" />
        Public Access
      </div>

    </header>
  );
};

export default GuestHeader;