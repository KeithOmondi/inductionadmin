import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGuestMessages,
  receiveNewMessage,
  clearGuestMessages,
} from "../../store/slices/guests/guestMessagesSlice";
import {
  ShieldCheck,
  Search,
  Scale,
  Megaphone,
  Info
} from "lucide-react";
import { getSocket } from "../../services/socket";

export const GuestMessagesPage = () => {
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.guestMessages);

  const [activeChatId, setActiveChatId] = useState<string>("global_broadcast");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= DISPLAY NAME NORMALIZER ================= */
  const getDisplayName = (name?: string) => {
    if (!name) return "ORHC Team";
    const lower = name.toLowerCase();
    if (lower.includes("registry") || lower.includes("admin") || lower.includes("team")) {
      return "ORHC Team";
    }
    return name;
  };

  /* ================= SOCKET LOGIC ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (msg.isBroadcast) {
        dispatch(receiveNewMessage(msg));
      }
    };

    socket.on("message:broadcast", handleNewMessage);
    return () => {
      socket.off("message:broadcast", handleNewMessage);
    };
  }, [dispatch]);

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    dispatch(fetchGuestMessages());
    return () => {
      dispatch(clearGuestMessages());
    };
  }, [dispatch]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F1F3F4] overflow-hidden font-sans">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#355E3B] text-white shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-md border border-white/20">
            <Scale className="text-[#EFBF04]" size={22} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide uppercase">ORHC</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-medium -mt-1">
              Public Bulletins
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck size={14} className="text-[#EFBF04]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Guest View Only</span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-[400px] flex-col bg-white border-r border-slate-200`}>
          <div className="p-5">
            <div className="relative group">
              <Search className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" size={18} />
              <input
                className="w-full bg-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm outline-none border border-transparent focus:border-[#355E3B] focus:bg-white transition-all shadow-inner"
                placeholder="Search bulletins..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <button
              onClick={() => { setActiveChatId("global_broadcast"); setMobileView("chat"); }}
              className={`w-full p-4 flex items-center gap-4 rounded-xl transition-all ${
                activeChatId === "global_broadcast" ? "bg-[#355E3B] text-white" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-100 text-[#355E3B]">
                <Megaphone size={22} />
              </div>
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="font-bold text-sm truncate w-full">Official Announcements</span>
                <span className="text-[10px] uppercase opacity-60 font-semibold tracking-tighter">Registry Wide</span>
              </div>
            </button>
          </div>
          
          {/* GUEST INFO FOOTER (Sidebar) */}
          <div className="p-4 bg-slate-50 border-t flex items-start gap-3">
             <Info size={16} className="text-[#355E3B] mt-0.5 shrink-0" />
             <p className="text-[11px] text-slate-500 leading-relaxed">
               For more inquiry, kindly contact the administrator of this site
             </p>
          </div>
        </aside>

        {/* CHAT VIEW (Bulletin Board) */}
        <section className="flex-1 flex flex-col bg-[#F8F9FA] relative">
          <div className="px-6 py-4 border-b bg-white flex justify-between items-center shadow-sm">
            <h2 className="font-serif font-bold text-[#355E3B] text-lg">Official Announcements</h2>
            {loading && <span className="text-xs text-slate-400 animate-pulse font-medium">Updating...</span>}
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <Megaphone size={48} strokeWidth={1} />
                <p className="text-sm">No announcements have been posted yet.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg._id} className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-[#355E3B] mb-1 ml-2 uppercase tracking-tight">
                  {getDisplayName(msg.sender.name)}
                </span>
                
                <div className="max-w-[85%] md:max-w-[70%] p-5 shadow-md bg-[#355E3B] text-white rounded-2xl rounded-tl-none relative border border-white/10">
                  {msg.text && <p className="text-sm leading-relaxed font-medium">{msg.text}</p>}
                  
                  {msg.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                       <img 
                         src={msg.imageUrl} 
                         alt="announcement" 
                         className="max-h-80 w-auto object-cover" 
                       />
                    </div>
                  )}
                  
                  <div className="text-[9px] mt-3 opacity-60 flex items-center gap-2 font-bold uppercase tracking-wider">
                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="ml-auto bg-white/20 px-1.5 py-0.5 rounded text-white">Official</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* NO INPUT - READ ONLY STATUS BAR */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400">
               <ShieldCheck size={16} />
               <span className="text-xs font-semibold uppercase tracking-widest">
                 BROADCAST CHANNEL 
               </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GuestMessagesPage;