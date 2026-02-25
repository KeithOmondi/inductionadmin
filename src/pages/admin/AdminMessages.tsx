import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Search, Scale, Plus, X, Megaphone, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import type { Message } from "../../store/slices/adminMessageSlice";
import { sendMessage, fetchChatMessages, receiveMessage, resetChatMessages } from "../../store/slices/adminMessageSlice";
import { fetchUsers, addToActiveConversations, fetchActiveConversations } from "../../store/slices/adminUserSlice";
import { getSocket } from "../../services/socket";

const AdminMessages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string; isBroadcast?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const { chatMessages } = useSelector((state: RootState) => state.adminChat);
  const { user: admin } = useSelector((state: RootState) => state.auth);
  const { users: allUsers, activeConversationIds } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchActiveConversations());
  }, [dispatch]);

  // Filters out groups - purely User vs Admin + Global Channel
  const activeChatPersonnel = useMemo(() => {
    const users = allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isPersistent = activeConversationIds.includes(user._id);
      if (searchQuery.trim() !== "") return matchesSearch;
      return isPersistent;
    });

    const broadcastEntry = { _id: "broadcast_global", name: "Official Broadcasts", isBroadcast: true };
    
    if (searchQuery.trim() === "" || "broadcast".includes(searchQuery.toLowerCase())) {
      return [broadcastEntry, ...users];
    }
    return users;
  }, [allUsers, searchQuery, activeConversationIds]);

  useEffect(() => {
    if (!selectedChat) return;
    dispatch(resetChatMessages());
    
    const fetchParams = selectedChat.isBroadcast 
      ? { isBroadcast: true } 
      : { receiverId: selectedChat.id };

    dispatch(fetchChatMessages(fetchParams));
    
    if (!selectedChat.isBroadcast) {
      getSocket()?.emit("join_chat", selectedChat.id);
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const receiverId = typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;

      const isCurrentChat = selectedChat?.id === senderId || receiverId === selectedChat?.id;
      const isViewingBroadcastChannel = selectedChat?.isBroadcast && msg.isBroadcast;

      if (isCurrentChat || isViewingBroadcastChannel) {
        dispatch(receiveMessage(msg));
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:broadcast", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:broadcast", handleNewMessage);
    };
  }, [selectedChat, dispatch]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedChat || !inputText.trim()) return;

    try {
      const payload = selectedChat.isBroadcast 
        ? { text: inputText.trim(), isBroadcast: true } 
        : { text: inputText.trim(), receiver: selectedChat.id };

      const result = await dispatch(sendMessage(payload)).unwrap();
      getSocket()?.emit(selectedChat.isBroadcast ? "message:broadcast" : "message:send", result);
      
      if (!selectedChat.isBroadcast) {
        dispatch(addToActiveConversations(selectedChat.id));
      }
      
      setInputText("");
    } catch (err: any) {
      toast.error("Failed to transmit.");
    }
  }, [dispatch, selectedChat, inputText]);

  const handleBroadcastSubmit = async () => {
    if (!broadcastTarget || !broadcastMessage.trim()) return toast.error("Missing fields");
    try {
      const isGlobal = broadcastTarget === "all_judges";
      const payload = { 
        text: broadcastMessage, 
        isBroadcast: isGlobal, 
        receiver: isGlobal ? undefined : broadcastTarget 
      };

      const result = await dispatch(sendMessage(payload)).unwrap();
      getSocket()?.emit(isGlobal ? "message:broadcast" : "message:send", result);
      
      if (isGlobal) {
        setSelectedChat({ id: "broadcast_global", name: "Official Broadcasts", isBroadcast: true });
      } else {
        const targetUser = allUsers.find(u => u._id === broadcastTarget);
        dispatch(addToActiveConversations(broadcastTarget));
        setSelectedChat({ id: broadcastTarget, name: targetUser?.name || "User" });
      }

      setIsBroadcastModalOpen(false);
      setBroadcastMessage(""); setBroadcastTarget("");
    } catch (err: any) {
      toast.error("Dispatch failed.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 bg-white space-y-3 shadow-sm z-10">
          <button onClick={() => setIsBroadcastModalOpen(true)} className="w-full bg-[#355E3B] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-[#2a4b2f] transition-all">
            <Plus size={18} className="text-[#EFBF04]" /> NEW DISPATCH
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search registry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-xs outline-none focus:ring-1 ring-[#355E3B]/20" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <h2 className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Channels</h2>
          <div className="space-y-1">
            {activeChatPersonnel.map((item) => (
              <button 
                key={item._id} 
                onClick={() => setSelectedChat({ id: item._id, name: item.name, isBroadcast: !!(item as any).isBroadcast })} 
                className={`w-full p-3 px-4 flex items-center gap-3 rounded-xl transition-all ${selectedChat?.id === item._id ? "bg-white border-r-4 border-[#EFBF04] shadow-sm text-[#355E3B]" : "hover:bg-white text-slate-700"}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedChat?.id === item._id ? "bg-[#355E3B] text-white" : "bg-slate-300 text-white"}`}>
                  {(item as any).isBroadcast ? <Megaphone size={14} className="text-[#EFBF04]" /> : item.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  {(item as any).isBroadcast && <p className="text-[9px] text-[#C5A059] font-black uppercase tracking-tighter">Global Channel</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                {selectedChat.isBroadcast && <Megaphone size={20} className="text-[#EFBF04]" />}
                <div>
                  <h3 className="font-serif font-bold text-slate-800 text-lg leading-tight">{selectedChat.name}</h3>
                  <p className="text-[10px] font-black uppercase text-[#C5A059]">
                    {selectedChat.isBroadcast ? "Registry Announcements" : "Official Correspondence"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfc]">
              {chatMessages.map((msg, i) => {
                const isFromMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender?._id) === admin?._id;
                return (
                  <div key={i} className={`w-full flex flex-col mb-4 ${isFromMe ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[70%] p-4 shadow-sm border ${isFromMe ? "bg-[#355E3B] text-white rounded-2xl rounded-tr-none border-[#2a4b2f]" : "bg-white text-slate-800 rounded-2xl rounded-tl-none border-slate-100"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <span className={`text-[9px] mt-2 block opacity-50 ${isFromMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-100 flex items-center gap-4 bg-white">
              <input 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder={selectedChat.isBroadcast ? "Send a global announcement..." : "Type a message..."} 
                className={`flex-1 rounded-xl px-5 py-3 text-sm outline-none transition-all ${selectedChat.isBroadcast ? "bg-amber-50 border border-amber-100" : "bg-slate-100"}`} 
              />
              <button type="submit" className="bg-[#355E3B] text-white p-3.5 rounded-xl transition-transform active:scale-95">
                <Send size={20} className={selectedChat.isBroadcast ? "text-[#EFBF04]" : "text-white"} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <Scale size={120} />
            <p className="font-serif italic text-xl mt-4">Registry Communication</p>
          </div>
        )}
      </div>

      {/* BROADCAST MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-[#355E3B]">
                <Megaphone size={20} />
                <h2 className="text-xl font-serif font-bold">Registry Dispatch</h2>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="relative">
                <select 
                  value={broadcastTarget} 
                  onChange={(e) => setBroadcastTarget(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 text-sm outline-none appearance-none focus:border-[#355E3B] transition-all"
                >
                  <option value="">Select Recipient...</option>
                  <option value="all_judges" className="font-bold text-[#355E3B]">📢 BROADCAST TO ALL REGISTRY</option>
                  {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} — {u.role}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
              
              <textarea 
                value={broadcastMessage} 
                onChange={(e) => setBroadcastMessage(e.target.value)} 
                placeholder="Type your official announcement or message here..." 
                rows={5} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 text-sm outline-none resize-none focus:border-[#355E3B] transition-all" 
              />
              
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-500 font-bold hover:text-slate-700 px-4">Cancel</button>
                <button 
                  onClick={handleBroadcastSubmit} 
                  className="bg-[#355E3B] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#355E3B]/20 hover:bg-[#2a4b2f] transition-all flex items-center gap-2"
                >
                  <Send size={16} className="text-[#EFBF04]" /> Dispatch Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;