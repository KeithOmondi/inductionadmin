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
} from "lucide-react";
import { getSocket } from "../../services/socket";
import type { Message } from "../../store/slices/userChatSlice";

const JudgeMessagePage = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?._id);
  const { chatMessages, groups } = useAppSelector(
    (state) => state.userChat
  );

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= DISPLAY NAME NORMALIZER ================= */
  const getDisplayName = (name?: string) => {
    if (!name) return "ORHC Team";

    const lower = name.toLowerCase();

    if (
      lower.includes("registry") ||
      lower.includes("orh team") ||
      lower.includes("orhc") ||
      lower.includes("admin") ||
      lower.includes("team")
    ) {
      return "ORHC Team";
    }

    return name;
  };

  /* ================= SOCKET LOGIC ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (activeChatId) {
      socket.emit("join_chat", activeChatId);
    }

    const handleNewMessage = (msg: Message) => {
      const senderId =
        typeof msg.sender === "string"
          ? msg.sender
          : msg.sender?._id;

      const isCurrentChat =
        msg.group === activeChatId ||
        senderId === activeChatId ||
        msg.isBroadcast;

      if (isCurrentChat) {
        dispatch(receiveMessage(msg));
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:broadcast", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:broadcast", handleNewMessage);
    };
  }, [activeChatId, dispatch]);

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  useEffect(() => {
    if (!activeChatId) return;

    const selected = groups.find((g) => g._id === activeChatId);
    dispatch(resetChatMessages());

    if (selected?.type === "broadcast") {
      dispatch(fetchUserMessages({ isBroadcast: true }));
    } else if (selected?.type === "private") {
      dispatch(fetchUserMessages({ receiver: activeChatId }));
    } else {
      dispatch(fetchUserMessages({ group: activeChatId }));
    }

    setMobileView("chat");
  }, [activeChatId, dispatch, groups]);

  /* ================= UTILITIES ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const activeChat = useMemo(
    () => groups.find((g) => g._id === activeChatId),
    [groups, activeChatId]
  );

  const isReplyDisabled =
    activeChat?.isReadOnly || activeChat?.type === "broadcast";

  const handleSendMessage = useCallback(async () => {
    const trimmed = messageInput.trim();
    if (!activeChatId || !trimmed || isReplyDisabled) return;

    const payload =
      activeChat?.type === "private"
        ? { receiver: activeChatId, text: trimmed }
        : { group: activeChatId, text: trimmed };

    const result = await dispatch(sendUserMessage(payload));

    if (sendUserMessage.fulfilled.match(result)) {
      getSocket()?.emit("message:send", result.payload);
      setMessageInput("");
    }
  }, [dispatch, activeChatId, messageInput, isReplyDisabled, activeChat]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F1F3F4] overflow-hidden font-sans">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#355E3B] text-white shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-md border border-white/20">
            <Scale className="text-[#EFBF04]" size={22} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide uppercase">
              ORHC
            </h1>
            <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-medium -mt-1">
              Secure Communications
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck size={14} className="text-[#EFBF04]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            ORHC Encrypted
          </span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-[400px] flex-col bg-white border-r border-slate-200`}
        >
          <div className="p-5">
            <div className="relative group">
              <Search
                className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400"
                size={18}
              />
              <input
                className="w-full bg-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm outline-none border border-transparent focus:border-[#355E3B] focus:bg-white transition-all shadow-inner"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {groups.map((group) => (
              <button
                key={group._id}
                onClick={() => setActiveChatId(group._id)}
                className={`w-full p-4 flex items-center gap-4 rounded-xl transition-all ${
                  activeChatId === group._id
                    ? "bg-[#355E3B] text-white"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-slate-100">
                  {group.type === "private" ? (
                    <UserCircle size={22} />
                  ) : (
                    <Megaphone size={22} />
                  )}
                </div>

                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="font-bold text-sm truncate w-full">
                    {getDisplayName(group.name)}
                  </span>
                  <span className="text-[10px] uppercase text-slate-400">
                    {group.type === "broadcast"
                      ? "ORHC Broadcast"
                      : "Authenticated Thread"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CHAT VIEW */}
        <section className="flex-1 flex flex-col bg-[#F8F9FA] relative">
          {activeChat ? (
            <>
              {/* HEADER */}
              <div className="px-6 py-4 border-b bg-white">
                <h2 className="font-serif font-bold text-[#355E3B] text-lg">
                  {getDisplayName(activeChat.name)}
                </h2>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg) => {
                  const senderObj =
                    typeof msg.sender === "string"
                      ? null
                      : msg.sender;

                  const senderId =
                    typeof msg.sender === "string"
                      ? msg.sender
                      : msg.sender?._id;

                  const isOutgoing = senderId === userId;

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${
                        isOutgoing ? "items-end" : "items-start"
                      }`}
                    >
                      {!isOutgoing && (
                        <span className="text-[10px] font-bold text-[#355E3B] mb-1 ml-2 uppercase">
                          {getDisplayName(senderObj?.name)}
                        </span>
                      )}

                      <div
                        className={`max-w-[80%] p-4 ${
                          isOutgoing
                            ? "bg-white text-slate-800"
                            : "bg-[#355E3B] text-white"
                        } rounded-2xl`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="p-6 bg-white border-t">
                {!isReplyDisabled && (
                  <div className="flex gap-4">
                    <textarea
                      value={messageInput}
                      onChange={(e) =>
                        setMessageInput(e.target.value)
                      }
                      className="flex-1 border rounded-xl p-3"
                      placeholder="Enter official message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-[#355E3B] text-white p-4 rounded-xl"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a conversation
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JudgeMessagePage;