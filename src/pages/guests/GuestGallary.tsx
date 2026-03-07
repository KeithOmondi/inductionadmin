import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchGallery, clearGalleryError, type IGallery } from "../../store/slices/gallerySlice";
import { 
  X, 
  Play, 
  Camera, 
  Calendar,
  ChevronRight,
  Maximize2,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

const GuestGallery = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.gallery);
  const [selectedMedia, setSelectedMedia] = useState<IGallery | null>(null);

  useEffect(() => {
    dispatch(fetchGallery({ category: "event" })); 
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearGalleryError());
    }
  }, [error, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#355E3B] selection:text-white">
      
      {/* --- REFINED HERO SECTION --- */}
      <section className="relative h-[45vh] bg-[#1A2F1D] flex items-center justify-center overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 grayscale contrast-125">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 rotate-12 scale-110">
            {items.slice(0, 12).map((item, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl overflow-hidden shadow-2xl">
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A2F1D]/60 to-[#1A2F1D]" />

        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 bg-[#EFBF04]/10 border border-[#EFBF04]/20 px-4 py-1.5 rounded-full mb-6">
             <div className="w-2 h-2 rounded-full bg-[#EFBF04] animate-pulse" />
             <span className="text-[#EFBF04] text-[10px] font-bold uppercase tracking-[0.2em]">Live Registry</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight italic">
            Event <span className="text-[#EFBF04]">Showcase</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            A curated visual archive of the Office of the Registrar High Court (ORHC) 
            official proceedings and institutional milestones.
          </p>
        </div>
      </section>

      {/* --- GALLERY GRID --- */}
      <main className="max-w-[1400px] mx-auto w-full px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-200 pb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="text-[#355E3B]" size={20} />
              <h2 className="text-xs font-black text-[#355E3B] uppercase tracking-[0.3em]">Institutional Archive</h2>
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900">Visual Records</h3>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock size={14} /> Real-time Sync</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {items.map((item) => (
              <div 
                key={item._id}
                onClick={() => setSelectedMedia(item)}
                className="group relative break-inside-avoid rounded-[2rem] overflow-hidden cursor-none bg-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 hover:-translate-y-2"
              >
                {item.resourceType === "video" ? (
                  <div className="relative aspect-[4/5]">
                    <video src={item.url} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-500">
                        <Play fill="white" className="text-white" size={28} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                )}
                
                {/* MODERN GLASS OVERLAY */}
                <div className="absolute inset-x-4 bottom-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-[#EFBF04] text-[9px] font-black uppercase tracking-widest mb-1">Entry #{item._id.slice(-4)}</p>
                  <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-white/60 text-[10px] font-medium uppercase tracking-tighter">Click to expand</span>
                    <Maximize2 size={16} className="text-white/80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODERN MODAL LIGHTBOX --- */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A0F0B]/95 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => setSelectedMedia(null)}
          />

          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-8 right-8 z-[110] p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
          >
            <X size={32} />
          </button>

          <div className="relative z-[105] w-full max-w-6xl flex flex-col md:flex-row bg-[#FDFDFD] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            
            {/* Left: Media Side */}
            <div className="flex-[1.5] bg-black flex items-center justify-center min-h-[300px] md:min-h-[600px] group">
              {selectedMedia.resourceType === "video" ? (
                <video controls autoPlay className="max-w-full max-h-full" src={selectedMedia.url} />
              ) : (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="max-w-full max-h-full object-contain" />
              )}
            </div>

            {/* Right: Info Side */}
            <div className="flex-1 p-8 md:p-14 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 mb-8">
                   <div className="h-[1px] w-8 bg-[#355E3B]" />
                   <span className="text-[11px] font-black text-[#355E3B] uppercase tracking-[0.4em]">Official Case View</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-[1.1]">
                  {selectedMedia.title}
                </h2>
                
                <p className="text-slate-500 text-lg leading-relaxed font-light italic border-l-4 border-[#EFBF04]/30 pl-6 py-2">
                  {selectedMedia.description || "This visual record is preserved within the permanent registry of the High Court for institutional transparency and public record."}
                </p>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Category</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Camera size={14} className="text-[#355E3B]" /> Event Records
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Date</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={14} className="text-[#355E3B]" /> {new Date(selectedMedia.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMedia(null)}
                  className="w-full py-5 bg-[#355E3B] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#2A4B2F] transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98]"
                >
                  Dismiss Record <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestGallery;