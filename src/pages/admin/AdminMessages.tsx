import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Send,
  Search,
  Scale,
  Plus,
  X,
  Megaphone,
  ShieldCheck,
  UserPlus,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import {
  type Message,
  sendMessage,
  fetchChatMessages,
  receiveMessage,
  resetChatMessages,
} from "../../store/slices/adminMessageSlice";
import {
  fetchUsers,
  addToActiveConversations,
  fetchActiveConversations,
} from "../../store/slices/adminUserSlice";
import { getSocket } from "../../services/socket";

const AdminMessages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    isBroadcast?: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isGlobalBroadcast, setIsGlobalBroadcast] = useState(false);

  const { chatMessages } = useSelector((state: RootState) => state.adminChat);
  const { user: admin } = useSelector((state: RootState) => state.auth);
  const { users: allUsers, activeConversationIds } = useSelector(
    (state: RootState) => state.users,
  );

  // INITIAL DATA FETCH
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchActiveConversations());
  }, [dispatch]);

  // SIDEBAR FILTERING
  const activeChatPersonnel = useMemo(() => {
    const users = allUsers.filter((user) => {
      const matchesSearch = user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isPersistent = activeConversationIds.includes(user._id);
      if (searchQuery.trim() !== "") return matchesSearch;
      return isPersistent;
    });

    const broadcastEntry = {
      _id: "broadcast_global",
      name: "ORHC Broadcasts",
      isBroadcast: true,
    };

    if (searchQuery.trim() === "" || "broadcast".includes(searchQuery.toLowerCase())) {
      return [broadcastEntry, ...users];
    }
    return users;
  }, [allUsers, searchQuery, activeConversationIds]);

  const filteredRecipientOptions = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(recipientSearch.toLowerCase()),
    );
  }, [allUsers, recipientSearch]);

  // CHAT AUTO-SWITCH & ROOM JOIN
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

  // REAL-TIME SOCKET LISTENER
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
  const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
  const receiverId = typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;

  // Use .toString() to ensure we aren't comparing a string to a MongoDB ObjectId object
  const isCurrentChat = 
    selectedChat?.id?.toString() === senderId?.toString() || 
    selectedChat?.id?.toString() === receiverId?.toString();
    
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = useCallback(
  async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Safety check: Don't even try if the ID is missing
    if (!selectedChat?.id || !inputText.trim()) {
      console.error("Missing Destination or Text", { selectedChat, inputText });
      return;
    }

    try {
      // Create a clean payload
      const payload = selectedChat.isBroadcast
        ? { text: inputText.trim(), isBroadcast: true }
        : { 
            text: inputText.trim(), 
            receiver: selectedChat.id, // Ensure this is a string ID like "65b..."
            receivers: [selectedChat.id] // Send as both for backend compatibility
          };

      const result = await dispatch(sendMessage(payload)).unwrap();

      // Emit to socket
      const socket = getSocket();
      if (socket) {
        const event = selectedChat.isBroadcast ? "message:broadcast" : "message:send";
        socket.emit(event, result);
      }

      // Update sidebar list
      if (!selectedChat.isBroadcast) {
        dispatch(addToActiveConversations(selectedChat.id));
      }

      setInputText("");
    } catch (err: any) {
      // This will now show the actual error message from the backend (e.g., "No valid destination")
      toast.error(err || "Failed to transmit.");
    }
  },
  [dispatch, selectedChat, inputText]
);

  // MULTI-SELECT BROADCAST SUBMIT
  const handleBroadcastSubmit = async () => {
    if (!isGlobalBroadcast && selectedRecipients.length === 0) {
      return toast.error("Select at least one recipient");
    }
    if (!broadcastMessage.trim()) return toast.error("Message cannot be empty");

    try {
      if (isGlobalBroadcast) {
        const payload = { text: broadcastMessage, isBroadcast: true };
        const result = await dispatch(sendMessage(payload)).unwrap();
        getSocket()?.emit("message:broadcast", result);
        setSelectedChat({ id: "broadcast_global", name: "ORHC Broadcasts", isBroadcast: true });
      } else {
        const payload = { 
          text: broadcastMessage, 
          receivers: selectedRecipients 
        };
        const results = await dispatch(sendMessage(payload)).unwrap();
        
        if (Array.isArray(results)) {
          results.forEach((msg) => {
            const targetId = typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;
            getSocket()?.emit("message:send", msg);
            if (targetId) dispatch(addToActiveConversations(targetId));
          });
        }

        const lastId = selectedRecipients[selectedRecipients.length - 1];
        const lastUser = allUsers.find(u => u._id === lastId);
        setSelectedChat({ id: lastId, name: lastUser?.name || "User" });
      }

      setIsBroadcastModalOpen(false);
      setBroadcastMessage(""); 
      setSelectedRecipients([]);
      toast.success("Correspondence dispatched.");
    } catch (err: any) {
      // Fix for "Objects are not valid as React child" - extract string from error
      const errorMessage = typeof err === 'string' ? err : err?.message || "Dispatch failed";
      toast.error(errorMessage);
    }
  };

  const toggleRecipient = (id: string) => {
    if (isGlobalBroadcast) return;
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 bg-white space-y-3 shadow-sm z-10">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="w-full bg-[#355E3B] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-[#2a4b2f] transition-all"
          >
            <Plus size={18} className="text-[#EFBF04]" /> NEW MESSAGE
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search correspondence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-xs outline-none focus:ring-1 ring-[#355E3B]/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <h2 className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            ORHC Channels
          </h2>
          <div className="space-y-1">
            {activeChatPersonnel.map((item) => (
              <button
                key={item._id}
                onClick={() =>
                  setSelectedChat({
                    id: item._id,
                    name: item.name,
                    isBroadcast: !!(item as any).isBroadcast,
                  })
                }
                className={`w-full p-3 px-4 flex items-center gap-3 rounded-xl transition-all ${selectedChat?.id === item._id ? "bg-white border-r-4 border-[#EFBF04] shadow-sm text-[#355E3B]" : "hover:bg-white text-slate-700"}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedChat?.id === item._id ? "bg-[#355E3B] text-white" : "bg-slate-300 text-white"}`}>
                  {(item as any).isBroadcast ? <Megaphone size={14} className="text-[#EFBF04]" /> : item.name.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  {(item as any).isBroadcast && (
                    <p className="text-[9px] text-[#355E3B] font-black uppercase tracking-tighter">Official Channel</p>
                  )}
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
                  <h3 className="font-serif font-bold text-[#355E3B] text-lg leading-tight">{selectedChat.name}</h3>
                  <p className="text-[10px] font-black uppercase text-[#C5A059]">
                    {selectedChat.isBroadcast ? "ORHC Announcements" : "Secure Correspondence"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfc]">
              {chatMessages.map((msg, i) => {
                const isFromMe = (typeof msg.sender === "string" ? msg.sender : msg.sender?._id) === admin?._id;
                return (
                  <div key={i} className={`w-full flex flex-col mb-4 ${isFromMe ? "items-end" : "items-start"}`}>
                    <span className={`text-[10px] font-bold mb-1 px-2 uppercase tracking-tight ${isFromMe ? "text-[#355E3B]" : "text-slate-400"}`}>
                      {isFromMe ? "ORHC Team" : selectedChat.name}
                    </span>
                    <div className={`max-w-[70%] p-4 shadow-sm border ${isFromMe ? "bg-[#355E3B] text-white rounded-2xl rounded-tr-none border-[#2a4b2f]" : "bg-white text-slate-800 rounded-2xl rounded-tl-none border-slate-100"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-2 opacity-60 ${isFromMe ? "justify-end" : "justify-start"}`}>
                        <span className="text-[9px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isFromMe && <ShieldCheck size={10} className="text-[#EFBF04]" />}
                      </div>
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
                placeholder={selectedChat.isBroadcast ? "Send a global ORHC announcement..." : "Type a message..."}
                className={`flex-1 rounded-xl px-5 py-3 text-sm outline-none transition-all ${selectedChat.isBroadcast ? "bg-emerald-50 border border-emerald-100" : "bg-slate-100"}`}
              />
              <button type="submit" className="bg-[#355E3B] text-white p-3.5 rounded-xl transition-transform active:scale-95">
                <Send size={20} className={selectedChat.isBroadcast ? "text-[#EFBF04]" : "text-white"} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <Scale size={120} className="text-[#355E3B]" />
            <p className="font-serif italic text-xl mt-4">ORHC Secure Communication</p>
          </div>
        )}
      </div>

      {/* NEW MESSAGE MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-[#355E3B]">
                <UserPlus size={20} />
                <h2 className="text-xl font-serif font-bold">New Correspondence</h2>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <button
                onClick={() => {
                  setIsGlobalBroadcast(!isGlobalBroadcast);
                  setSelectedRecipients([]);
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isGlobalBroadcast ? "border-[#EFBF04] bg-[#355E3B] text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"}`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Megaphone size={20} className={isGlobalBroadcast ? "text-[#EFBF04]" : "text-slate-400"} />
                  <div>
                    <p className="font-bold text-sm">Public Broadcast</p>
                    <p className="text-[10px] opacity-70">Send to all members and public bulletin board</p>
                  </div>
                </div>
                {isGlobalBroadcast && <Check size={20} className="text-[#EFBF04]" />}
              </button>

              {!isGlobalBroadcast && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Recipients ({selectedRecipients.length})
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-slate-400"><Search size={16} /></div>
                    <input
                      type="text"
                      placeholder="Search users by name or role..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full bg-slate-100 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-[#355E3B]/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredRecipientOptions.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => toggleRecipient(u._id)}
                        className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${selectedRecipients.includes(u._id) ? "border-[#355E3B] bg-emerald-50" : "border-slate-100 hover:bg-slate-50"}`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${selectedRecipients.includes(u._id) ? "text-[#355E3B]" : "text-slate-700"}`}>{u.name}</span>
                          <span className="text-[9px] uppercase font-black text-[#C5A059]">{u.role}</span>
                        </div>
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${selectedRecipients.includes(u._id) ? "bg-[#355E3B] border-[#355E3B]" : "border-slate-300"}`}>
                          {selectedRecipients.includes(u._id) && <Check size={12} className="text-[#EFBF04]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Message</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type your official announcement here..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 text-sm outline-none focus:border-[#355E3B]"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-4">
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-500 font-bold px-4 text-sm">Cancel</button>
              <button
                onClick={handleBroadcastSubmit}
                disabled={!isGlobalBroadcast && selectedRecipients.length === 0}
                className="bg-[#355E3B] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#2a4b2f] disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Send size={16} className="text-[#EFBF04]" /> Dispatch Correspondence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;