import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchUserGroups,
  fetchUserMessages,
  sendUserMessage,
  receiveMessage,
  resetChatMessages,
} from "../../store/slices/userChatSlice";
import {
  Send,
  ShieldCheck,
  UserCircle,
  Search,
  Scale,
  Megaphone,
  Lock,
  ChevronLeft,
  Info
} from "lucide-react";
import { getSocket } from "../../services/socket";
import type { Message } from "../../store/slices/userChatSlice";

const JudgeMessagePage = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?._id);
  const { chatMessages, groups } = useAppSelector((state) => state.userChat);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= 1. SOCKET & REAL-TIME LOGIC ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join room for private/group chats
    if (activeChatId) {
      socket.emit("join_chat", activeChatId);
    }

    const handleNewMessage = (msg: Message) => {
      // Logic to ensure message belongs to current view or is a broadcast
      const isCurrentChat = 
        msg.group === activeChatId || 
        (typeof msg.sender === 'string' ? msg.sender : msg.sender._id) === activeChatId ||
        msg.isBroadcast;

      if (isCurrentChat) {
        dispatch(receiveMessage(msg));
      }
    };

    // Listen for standard messages AND global broadcasts
    socket.on("message:new", handleNewMessage);
    socket.on("message:broadcast", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:broadcast", handleNewMessage);
    };
  }, [activeChatId, dispatch]);

  /* ================= 2. DATA FETCHING ================= */
  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  useEffect(() => {
    if (activeChatId) {
      const selected = groups.find((g) => g._id === activeChatId);
      
      // Reset messages to prevent "ghosting" from previous chat during load
      dispatch(resetChatMessages());

      if (selected?.type === "broadcast") {
        dispatch(fetchUserMessages({ isBroadcast: true }));
      } else if (selected?.type === "private") {
        // In private chat, activeChatId is likely the Admin's User ID
        dispatch(fetchUserMessages({ receiver: activeChatId }));
      } else {
        dispatch(fetchUserMessages({ group: activeChatId }));
      }
      
      setMobileView("chat");
    }
  }, [activeChatId, dispatch, groups]);

  /* ================= 3. UTILITIES ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const activeChat = useMemo(
    () => groups.find((g) => g._id === activeChatId),
    [groups, activeChatId]
  );

  const isReplyDisabled = activeChat?.isReadOnly || activeChat?.type === "broadcast";

  const handleSendMessage = useCallback(async () => {
    const trimmed = messageInput.trim();
    if (!activeChatId || !trimmed || isReplyDisabled) return;

    // Payload logic based on chat type
    const payload = activeChat?.type === "private" 
      ? { receiver: activeChatId, text: trimmed }
      : { group: activeChatId, text: trimmed };

    const result = await dispatch(sendUserMessage(payload));
    
    if (sendUserMessage.fulfilled.match(result)) {
      // Emit to socket for instant delivery acknowledgement
      getSocket()?.emit("message:send", result.payload);
      setMessageInput("");
    }
  }, [dispatch, activeChatId, messageInput, isReplyDisabled, activeChat]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F1F3F4] overflow-hidden font-sans">
      
      {/* PROFESSIONAL TOP BAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#355E3B] text-white shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-md border border-white/20">
            <Scale className="text-[#EFBF04]" size={22} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide uppercase">The Judiciary</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-medium -mt-1">Secure Registry Portal</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck size={14} className="text-[#EFBF04]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Session</span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR (LIST VIEW) */}
        <aside className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-[400px] flex-col bg-white border-r border-slate-200`}>
          <div className="p-5">
            <div className="relative group">
              <Search className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-[#355E3B] transition-colors" size={18} />
              <input 
                className="w-full bg-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm outline-none border border-transparent focus:border-[#355E3B] focus:bg-white transition-all shadow-inner" 
                placeholder="Search registry files..." 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication Channels</p>
            {groups.map((group) => (
              <button
                key={group._id}
                onClick={() => setActiveChatId(group._id)}
                className={`w-full p-4 flex items-center gap-4 rounded-xl transition-all duration-200 group ${
                  activeChatId === group._id 
                  ? "bg-[#355E3B] text-white shadow-md translate-x-1" 
                  : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${activeChatId === group._id ? "bg-white/20" : "bg-slate-100 group-hover:bg-white"}`}>
                  {group.type === "private" ? <UserCircle size={22} /> : <Megaphone size={22} />}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-bold text-sm truncate w-full text-left leading-tight">
                    {group.name}
                  </span>
                  <span className={`text-[10px] font-medium uppercase tracking-tighter ${activeChatId === group._id ? "text-white/60" : "text-slate-400"}`}>
                    {group.type === "broadcast" ? "Official Broadcast" : "Registry Correspondence"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CHAT VIEW */}
        <section className={`${mobileView === "list" ? "hidden" : "flex"} flex-1 flex-col bg-[#F8F9FA] relative shadow-inner`}>
          {activeChat ? (
            <>
              {/* CHAT HEADER */}
              <div className="px-6 py-4 border-b bg-white flex items-center gap-4">
                <button onClick={() => setMobileView("list")} className="md:hidden p-2 -ml-2 text-[#355E3B] hover:bg-slate-100 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                  <h2 className="font-serif font-bold text-[#355E3B] text-lg leading-tight">{activeChat.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {activeChat.type === "broadcast" ? "Verified Announcement" : "Authenticated Thread"}
                    </span>
                  </div>
                </div>
                {isReplyDisabled && (
  <span title="Read-only">
    <Lock className="text-slate-300" size={20} />
  </span>
)}
              </div>

              {/* MESSAGES AREA */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg) => {
                  const senderObj = typeof msg.sender === "string" ? null : msg.sender;
                  const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
                  const isOutgoing = senderId === userId;
                  
                  return (
                    <div key={msg._id} className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}>
                      {!isOutgoing && (
                         <span className="text-[10px] font-bold text-slate-400 mb-1 ml-2 uppercase tracking-tight">
                           {senderObj?.name || "Registry Admin"}
                         </span>
                      )}
                      <div className={`max-w-[80%] md:max-w-[65%] p-4 shadow-sm border ${
                        isOutgoing 
                          ? "bg-white border-emerald-100 text-slate-800 rounded-2xl rounded-tr-none" 
                          : "bg-[#355E3B] border-transparent text-white rounded-2xl rounded-tl-none"
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`mt-2 flex items-center gap-2 text-[9px] font-bold uppercase ${isOutgoing ? "text-slate-400" : "text-white/60"}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutgoing && <ShieldCheck size={10} className="text-[#355E3B]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT CONTROL */}
              <div className="p-6 bg-white border-t border-slate-200">
                {isReplyDisabled ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl flex flex-col items-center gap-2 text-slate-400">
                    <div className="flex items-center gap-3">
                      <Info size={18} className="text-[#355E3B]" />
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">Administrative Channel</span>
                    </div>
                    <p className="text-[11px] text-center max-w-xs">This is a broadcast-only channel. For inquiries, please use the private Registry correspondence thread.</p>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center max-w-5xl mx-auto">
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#355E3B] focus-within:bg-white px-5 py-2 transition-all">
                      <textarea
                        rows={1}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Enter official response..."
                        className="w-full bg-transparent border-none py-3 text-sm outline-none resize-none font-medium text-slate-700"
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage} 
                      disabled={!messageInput.trim()}
                      className="bg-[#355E3B] text-white p-4 rounded-2xl hover:bg-[#2A4B2F] disabled:opacity-20 shadow-lg"
                    >
                      <Send size={22} className="text-[#EFBF04]" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Scale size={100} className="text-[#355E3B] opacity-10 mb-6" />
              <h3 className="font-serif font-bold text-slate-400 text-xl">Select a Registry Channel</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px]">Access official broadcasts or private administrative threads from the sidebar.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JudgeMessagePage;