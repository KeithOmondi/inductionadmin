import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGuestMessages, 
  receiveMessage,      
  resetChatMessages,
  fetchGuestChannels 
} from "../../store/slices/userChatSlice"; 
import {
  ShieldCheck,
  Scale,
  Megaphone,
  Info,
  ChevronLeft,
  Mail
} from "lucide-react";
import { getSocket } from "../../services/socket";
import type { Message } from "../../store/slices/userChatSlice";

export const GuestMessagesPage = () => {
  const dispatch = useAppDispatch();
  
  // Aligned with userChatSlice: uses 'groups' instead of 'channels'
  const { chatMessages: messages, loading, groups } = useAppSelector((state) => state.userChat);

  const [activeChatId, setActiveChatId] = useState<string>("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= SOCKET LOGIC ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingMessage = (msg: Message) => {
      // Find the current active channel object
      const currentChannel = groups.find(g => g._id === activeChatId);
      
      // Logic: Only add to the UI if the message matches the current view
      // (e.g., it's a broadcast and we are on the broadcast channel)
      if (msg.isBroadcast && currentChannel?.type === 'broadcast') {
        dispatch(receiveMessage(msg));
      } else if (!msg.isBroadcast && activeChatId !== "global_broadcast" && currentChannel?.type !== 'broadcast') {
        // This handles private messages sent to the guest
        dispatch(receiveMessage(msg));
      }
    };

    socket.on("message:broadcast", handleIncomingMessage);
    socket.on("message:new", handleIncomingMessage);
    
    return () => {
      socket.off("message:broadcast", handleIncomingMessage);
      socket.off("message:new", handleIncomingMessage);
    };
  }, [dispatch, activeChatId, groups]);

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    // 1. Fetch Sidebar Groups (Broadcast + Private Inbox)
    dispatch(fetchGuestChannels());
  }, [dispatch]);

  // Auto-select the first channel once groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !activeChatId) {
      setActiveChatId(groups[0]._id);
    }
  }, [groups, activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;

    const selectedGroup = groups.find(g => g._id === activeChatId);
    
    // 2. Fetch messages based on the selected group's type
    dispatch(fetchGuestMessages({ 
      isBroadcast: selectedGroup?.type === 'broadcast' 
    }));
    
    return () => {
      dispatch(resetChatMessages());
    };
  }, [dispatch, activeChatId, groups]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeGroup = groups.find(g => g._id === activeChatId);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F1F3F4] overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-[#355E3B] text-white shadow-lg z-20">
        <div className="flex items-center gap-4">
          {mobileView === "chat" && (
            <button onClick={() => setMobileView("list")} className="md:hidden mr-2">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="bg-white/10 p-2 rounded-md border border-white/20">
            <Scale className="text-[#EFBF04]" size={22} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide uppercase">ORHC</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-medium -mt-1">
              Guest Portal
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Uses 'groups' from slice */}
        <aside className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-[400px] flex-col bg-white border-r border-slate-200`}>
          <div className="p-5 border-b bg-slate-50/50">
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Your Channels</h3>
             <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => { setActiveChatId(group._id); setMobileView("chat"); }}
                    className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${
                      activeChatId === group._id ? "bg-[#355E3B] text-white shadow-md" : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeChatId === group._id ? "bg-white/20" : "bg-slate-200 text-[#355E3B]"}`}>
                      {group.type === 'broadcast' ? <Megaphone size={18} /> : <Mail size={18} />}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-xs truncate">{group.name}</p>
                      <p className={`text-[9px] truncate ${activeChatId === group._id ? "text-white/60" : "text-slate-400"}`}>
                        {group.description || (group.type === 'broadcast' ? 'Public Bulletin' : 'Private Inbox')}
                      </p>
                    </div>
                  </button>
                ))}
                
                {groups.length === 0 && !loading && (
                  <p className="text-center text-xs text-slate-400 py-10">No channels available</p>
                )}
             </div>
          </div>
          
          <div className="mt-auto p-4 bg-slate-50 border-t">
             <div className="flex items-center gap-2 mb-2 text-[#355E3B]">
               <Info size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Inquiry Notice</span>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed italic">
               This portal is read-only. For assistance, contact the Registry office.
             </p>
          </div>
        </aside>

        {/* CHAT VIEW */}
        <section className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 flex flex-col bg-[#F8F9FA]`}>
          <div className="px-6 py-4 border-b bg-white flex justify-between items-center shadow-sm">
            <h2 className="font-serif font-bold text-[#355E3B] text-lg">
              {activeGroup?.name || "Select a Channel"}
            </h2>
            {loading && <div className="h-2 w-2 bg-[#EFBF04] rounded-full animate-ping" />}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <Mail size={48} strokeWidth={1} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">No messages found.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg._id} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] font-bold text-[#355E3B] mb-1 ml-2 uppercase tracking-tight">
                  {typeof msg.sender === 'string' ? "Registry Official" : msg.sender?.name}
                </span>
                <div className="max-w-[85%] md:max-w-[70%] p-4 shadow-sm bg-white border border-slate-200 rounded-2xl rounded-tl-none">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} className="mt-3 rounded-lg w-full border" alt="Attachment" />
                  )}
                  <div className="text-[9px] mt-3 text-slate-400 font-bold uppercase tracking-wider border-t pt-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-center">
            <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
               <ShieldCheck size={16} className="text-[#355E3B]" />
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                 Read-Only Secure Message Portal
               </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};