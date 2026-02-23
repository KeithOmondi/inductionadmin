import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchUserGroups,
  fetchUserMessages,
  sendUserMessage,
  editUserMessage,
  deleteUserMessage,
  receiveMessage,
  updateSocketMessage,
} from "../../store/slices/userChatSlice";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  ShieldCheck,
  CheckCheck,
  Filter,
  X,
  Edit3,
  Trash,
  ChevronLeft // New icon for mobile back
} from "lucide-react";
import { getSocket, initSocket } from "../../services/socket";

const JudgeMessagePage = () => {
  const dispatch = useAppDispatch();
  const { chatMessages, groups } = useAppSelector((state) => state.userChat);
  const userId = useAppSelector((state) => state.auth.user?._id);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
  // Mobile UI state: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---------------- SOCKET ENGINE ---------------- */
  useEffect(() => {
    if (!userId) return;
    const socket = initSocket(userId);

    socket.on("message:new", (msg: any) => {
      if (msg.group === activeChatId || msg.sender?._id === activeChatId) {
        dispatch(receiveMessage(msg));
      }
    });

    socket.on("message:updated", (msg: any) => {
      dispatch(updateSocketMessage(msg));
    });

    return () => {
      socket.off("message:new");
      socket.off("message:updated");
    };
  }, [dispatch, userId, activeChatId]);

  /* ---------------- DATA FETCHING ---------------- */
  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  useEffect(() => {
    if (activeChatId) {
      dispatch(fetchUserMessages({ group: activeChatId }));
      setMobileView('chat'); // Auto-switch view on mobile
    }
  }, [activeChatId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ---------------- ACTIONS ---------------- */
  const handleSendMessage = async () => {
    if (!messageInput.trim() && !file) return;

    if (editingMessageId) {
      await dispatch(editUserMessage({ messageId: editingMessageId, text: messageInput }));
      setEditingMessageId(null);
    } else {
      const payload = {
        group: activeChatId || undefined,
        text: messageInput || undefined,
        image: file || undefined,
      };
      const result = await dispatch(sendUserMessage(payload));
      if (sendUserMessage.fulfilled.match(result)) {
        const socket = getSocket();
        if (socket) socket.emit("message:send", result.payload);
      }
    }
    setMessageInput("");
    setFile(null);
  };

  const startEditing = (msg: any) => {
    setEditingMessageId(msg._id);
    setMessageInput(msg.text);
  };

  const handleDelete = (msgId: string) => {
    if (window.confirm("Rescind this message from the registry?")) {
      dispatch(deleteUserMessage(msgId));
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-none md:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      
      {/* Sidebar - Hidden on mobile if a chat is active */}
      <aside className={`
        ${mobileView === 'chat' ? 'hidden' : 'flex'} 
        md:flex w-full md:w-80 lg:w-96 border-r border-slate-100 flex-col bg-slate-50/30
      `}>
        <div className="p-4 md:p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[#355E3B] font-serif text-xl md:text-2xl font-black">Registry</h2>
            <Filter size={18} className="text-slate-300 cursor-pointer" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-none rounded-xl text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => setActiveChatId(group._id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${
                activeChatId === group._id
                  ? "bg-white shadow-md border border-slate-100"
                  : "hover:bg-white/60"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold text-sm ${activeChatId === group._id ? "text-[#355E3B]" : "text-slate-600"}`}>
                  {group.name}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded font-black uppercase">Secure</span>
              </div>
              <p className="text-slate-400 text-xs truncate mt-1">
                {group.description || "Official Channel"}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat View - Hidden on mobile if looking at list */}
      <section className={`
        ${mobileView === 'list' ? 'hidden' : 'flex'} 
        md:flex flex-1 flex-col bg-white
      `}>
        {activeChatId ? (
          <>
            {/* Mobile-Friendly Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1 -ml-1 text-slate-400 hover:text-[#355E3B]"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#355E3B] rounded-xl flex items-center justify-center text-[#C5A059] font-black text-lg shadow-lg">
                  {groups.find((g) => g._id === activeChatId)?.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[#355E3B] font-black text-sm md:text-base leading-tight">
                    {groups.find((g) => g._id === activeChatId)?.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck size={20} className="text-[#C5A059] hidden sm:block" />
                <MoreVertical size={20} className="cursor-pointer" />
              </div>
            </div>

            {/* Message Thread - Optimized Padding */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#FBFCFD]">
              {chatMessages.map((msg) => {
                const isOutgoing = typeof msg.sender !== "string" ? msg.sender._id === userId : msg.sender === userId;
                return (
                  <div key={msg._id} className={`flex flex-col ${isOutgoing ? "items-end ml-auto" : "items-start"} max-w-[85%] md:max-w-[75%]`}>
                    <div className="group relative flex items-center gap-2">
                      {isOutgoing && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 md:gap-1">
                          <button onClick={() => startEditing(msg)} className="p-1.5 text-slate-400 hover:text-[#C5A059]"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete(msg._id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash size={14} /></button>
                        </div>
                      )}
                      <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl text-sm leading-relaxed shadow-sm border ${
                        isOutgoing ? "bg-[#355E3B] text-white border-[#355E3B] rounded-tr-none" : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                      }`}>
                        {msg.text}
                        {msg.isEdited && <span className="block text-[7px] opacity-60 mt-1 italic uppercase font-black">Edited</span>}
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="attachment" className="mt-2 max-w-full rounded-lg" />
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1.5 ${isOutgoing ? "mr-1" : "ml-1"}`}>
                      {isOutgoing && <CheckCheck size={12} className={msg.readBy.length > 1 ? "text-emerald-400" : "text-slate-300"} />}
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar - Floating/Fixed for Mobile */}
            <div className="p-4 md:p-8 bg-white border-t border-slate-50">
              {editingMessageId && (
                <div className="flex items-center justify-between bg-amber-50 px-3 py-1.5 rounded-t-lg border-t border-amber-100">
                  <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest">Amending...</span>
                  <X size={12} className="cursor-pointer" onClick={() => { setEditingMessageId(null); setMessageInput(""); }} />
                </div>
              )}
              
              <div className={`flex items-center gap-2 md:gap-4 bg-slate-50 border border-slate-200 p-2 md:p-3 ${editingMessageId ? "rounded-b-xl" : "rounded-xl md:rounded-2xl"}`}>
                <label className="p-1.5 md:p-2 text-slate-400 cursor-pointer">
                  <Paperclip size={18} />
                  <input type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                </label>
                
                <input
                  type="text"
                  placeholder="Draft..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-[#355E3B] font-bold"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                
                <button
                  onClick={handleSendMessage}
                  className="bg-[#355E3B] text-white p-2.5 md:px-5 md:py-3 rounded-lg md:rounded-xl hover:bg-[#2a4b2f] flex items-center gap-2"
                >
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Transmit</span>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <ShieldCheck size={40} className="text-slate-100 mb-4" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Select a channel to begin</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default JudgeMessagePage;