import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchGallery,  type IGallery } from "../../store/slices/gallerySlice";
import { 
  Maximize2, 
  X, 
  Play, 
  Search, 
  Clock, 
  ShieldCheck,
  Calendar,
  User,
  Tag,
  Download,
  AlertCircle
} from "lucide-react";

const JudgeGallery = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.gallery);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<IGallery | null>(null);

  useEffect(() => {
  // 1. Initial Fetch
  dispatch(fetchGallery({}));

  // 2. Poll the server every 10 seconds to check for new evidence
  const pollInterval = setInterval(() => {
    dispatch(fetchGallery({}));
  }, 10000); 

  // 3. Re-fetch when the Judge switches back to this tab
  const handleFocus = () => dispatch(fetchGallery({}));
  window.addEventListener("focus", handleFocus);

  return () => {
    clearInterval(pollInterval);
    window.removeEventListener("focus", handleFocus);
  };
}, [dispatch]);

  // Comprehensive client-side filtering
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.uploadedBy?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] font-sans overflow-hidden">
      {/* HEADER SECTION */}
      <header className="bg-[#1A2F1F] text-white px-8 py-6 shadow-2xl z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#EFBF04] p-2.5 rounded-xl text-[#1A2F1F] shadow-lg shadow-yellow-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl uppercase tracking-tight text-white">
                OFFICE OF THE REGISTRAR HIGH COURT
              </h1>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">
                GALLARY ACCESS
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input 
              type="text"
              placeholder="Query by title, category, or officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-[#EFBF04]/50 focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* MAIN GALLERY GRID */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <div className="relative">
                <ShieldCheck size={64} className="text-[#355E3B] opacity-20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-[#EFBF04] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <span className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Decrypting Assets...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No matching registry entries found</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 text-[10px] text-[#355E3B] font-black uppercase underline tracking-widest"
              >
                Clear Search Parameters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => setSelectedMedia(item)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="aspect-[4/3] relative bg-slate-900 overflow-hidden">
                    {item.resourceType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="z-10 bg-white/10 backdrop-blur-md p-4 rounded-full group-hover:scale-110 transition-transform">
                          <Play size={24} className="text-white fill-white" />
                        </div>
                        <video className="absolute inset-0 w-full h-full object-cover opacity-50" src={item.url} muted />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F1F] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm ${item.category === 'evidence' ? 'bg-red-500 text-white' : 'bg-[#EFBF04] text-[#1A2F1F]'}`}>
                           {item.category}
                         </span>
                         <h3 className="text-white font-bold text-sm mt-1 truncate max-w-[150px]">{item.title}</h3>
                      </div>
                      <Maximize2 size={18} className="text-white/70 group-hover:text-[#EFBF04] transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ENHANCED LIGHTBOX MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-[#0F172A]/98 backdrop-blur-xl" onClick={() => setSelectedMedia(null)} />
          
          <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#1E293B] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col lg:flex-row">
            
            {/* Media Canvas */}
            <div className="flex-[2] bg-white relative flex items-center justify-center">
               <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute top-6 left-6 z-50 p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
              >
                <X size={24} />
              </button>

              {selectedMedia.resourceType === "video" ? (
                <video controls autoPlay className="w-full h-full max-h-[85vh] object-contain" src={selectedMedia.url} />
              ) : (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full h-full object-contain p-4" />
              )}
            </div>

            {/* Sidebar Metadata */}
            <div className="flex-1 min-w-[380px] bg-[#1E293B] border-l border-white/5 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Secure Asset View</span>
                </div>

                <h2 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">
                  {selectedMedia.title}
                </h2>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFBF04]/10 border border-[#EFBF04]/20 rounded-lg mb-8">
                  <Tag size={12} className="text-[#EFBF04]" />
                  <span className="text-[10px] font-black text-[#EFBF04] uppercase tracking-widest">{selectedMedia.category}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Analysis / Description</h4>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5 italic">
                      "{selectedMedia.description || "No official report filed for this visual asset."}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Reporting Officer</p>
                        <p className="text-sm font-bold text-white">{selectedMedia.uploadedBy?.name || "System Automated"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Entry Date</p>
                        <p className="text-sm font-bold text-white">{new Date(selectedMedia.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#EFBF04] hover:bg-[#fcd34d] text-[#1A2F1F] font-black text-xs py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                  <Download size={16} /> DOWNLOAD ASSET
                </button>
                <button 
                  title="Registry Timestamp"
                  className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
                >
                  <Clock size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeGallery;