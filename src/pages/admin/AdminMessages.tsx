import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Send,
  Image as ImageIcon,
  Search,
  MoreVertical,
  Scale,
  Plus,
  Users,
  X,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import {
  sendMessage,
  clearError,
  fetchChatMessages,
  createGroup,
  fetchGroups,
  receiveMessage,
  resetChatMessages,
} from "../../store/slices/adminMessageSlice"; 
import { fetchUsers } from "../../store/slices/adminUserSlice";
import { getSocket } from "../../services/socket";

const AdminMessages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- UI State ---
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    isGroup: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // --- Redux State ---
  const { chatMessages, groups, loading: adminLoading } = useSelector(
    (state: RootState) => state.adminChat
  );
  const { user: admin } = useSelector((state: RootState) => state.auth);
  const { users: personnel } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(resetChatMessages());
      dispatch(clearError());
      const params: { groupId?: string; receiverId?: string } = {};
      if (selectedChat.isGroup) params.groupId = selectedChat.id;
      else params.receiverId = selectedChat.id;
      dispatch(fetchChatMessages(params));
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (!selectedChat) return;
      const isGroupMessage = selectedChat.isGroup && msg.group === selectedChat.id;
      const isDirectMessage =
        !selectedChat.isGroup &&
        (String(msg.sender) === String(selectedChat.id) || 
         String(msg.receiver) === String(selectedChat.id) || 
         String(msg.sender?._id) === String(selectedChat.id));

      if (isGroupMessage || isDirectMessage) {
        dispatch(receiveMessage(msg));
      }
    };

    socket.on("message:new", handleNewMessage);
    return () => { socket.off("message:new", handleNewMessage); };
  }, [selectedChat, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Group name required");
    if (selectedMembers.length === 0) return toast.error("Select at least one member");
    try {
      await dispatch(createGroup({ name: newGroupName, members: selectedMembers })).unwrap();
      toast.success(`Group "${newGroupName}" established.`);
      setNewGroupName("");
      setSelectedMembers([]);
      setIsModalOpen(false);
    } catch { toast.error("Creation failed."); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageFile) || !selectedChat) return;
    try {
      const payload: any = { text: inputText, image: imageFile || undefined };
      if (selectedChat.isGroup) payload.group = selectedChat.id;
      else payload.receiver = selectedChat.id;
      await dispatch(sendMessage(payload)).unwrap();
      setInputText("");
      setImageFile(null);
    } catch (err: any) { toast.error(err || "Failed to deliver message."); }
  };

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPersonnel = personnel.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search personnel/groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[#355E3B]/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Groups</h2>
            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-slate-200 rounded text-[#355E3B]">
              <Plus size={16} />
            </button>
          </div>
          {filteredGroups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedChat({ id: group._id, name: group.name, isGroup: true })}
              className={`w-full p-3 px-4 flex items-center gap-3 transition-colors ${
                selectedChat?.id === group._id ? "bg-white border-r-4 border-[#EFBF04]" : "hover:bg-white"
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                <Users size={16} />
              </div>
              <span className="text-sm font-bold text-slate-700 truncate">{group.name}</span>
            </button>
          ))}

          <div className="p-4 mt-2">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</h2>
          </div>
          {filteredPersonnel.map((staff) => (
            <button
              key={staff._id}
              onClick={() => setSelectedChat({ id: staff._id, name: staff.name, isGroup: false })}
              className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-50 ${
                selectedChat?.id === staff._id ? "bg-white border-r-4 border-[#EFBF04]" : "hover:bg-white"
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${staff.isActive ? "bg-[#355E3B]" : "bg-slate-400"}`}>
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">{staff.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{staff.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CHAT AREA ================= */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <h3 className="font-serif font-bold text-slate-800">{selectedChat.name}</h3>
              <MoreVertical size={20} className="text-slate-400 cursor-pointer" />
            </div>

            {/* MESSAGE LIST WITH FORCED SEPARATION */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfc] flex flex-col">
              {chatMessages.map((msg, idx) => {
                const senderId = msg.sender && typeof msg.sender === "object" ? msg.sender._id : msg.sender;
                const isFromMe = String(senderId) === String(admin?._id);

                return (
                  <div key={msg._id || idx} className="w-full flex flex-col mb-4">
                    <div 
                      className={`max-w-[75%] p-4 shadow-sm relative ${
                        isFromMe 
                          ? "self-end bg-[#355E3B] text-white rounded-2xl rounded-tr-none" 
                          : "self-start bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none"
                      }`}
                    >
                      {selectedChat.isGroup && !isFromMe && (
                        <p className="text-[10px] font-black text-[#355E3B] mb-1 uppercase tracking-tighter">
                          {typeof msg.sender === "object" ? msg.sender.name : "Personnel"}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[9px] mt-2 uppercase font-bold tracking-tighter opacity-60 ${isFromMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} className="h-2" />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
              <label className="cursor-pointer text-slate-400 hover:text-[#355E3B] transition-colors">
                <ImageIcon size={20} />
                <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type official correspondence..."
                className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none font-medium focus:bg-slate-200/50 transition-colors"
              />
              <button
                type="submit"
                disabled={adminLoading || (!inputText.trim() && !imageFile)}
                className="bg-[#355E3B] text-white p-3 rounded-xl hover:bg-[#2a4b2f] disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <Scale size={60} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-serif italic text-sm text-slate-400">Select personnel or group to communicate</p>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Establish Registry Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Group Name</label>
                <input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Judicial Support"
                  className="w-full p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#355E3B]/20 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Assign Personnel ({selectedMembers.length})</label>
                <div className="space-y-1 border border-slate-100 rounded-xl overflow-hidden">
                  {personnel.map((staff) => (
                    <button
                      key={staff._id}
                      onClick={() => toggleMember(staff._id)}
                      className={`w-full p-3 flex items-center justify-between transition-colors ${selectedMembers.includes(staff._id) ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{staff.name.charAt(0)}</div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">{staff.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase">{staff.role}</p>
                        </div>
                      </div>
                      {selectedMembers.includes(staff._id) && <CheckCircle2 size={18} className="text-[#355E3B]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={handleCreateGroup} className="w-full bg-[#355E3B] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#2a4b2f] transition-all">Confirm Official Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;