// src/pages/admin/AdminDashboard.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

// Icons
import {
  Users,
  FileCheck,
  Clock,
  Download,
  Filter,
  MoreHorizontal,
  FileText,
  TrendingUp,
} from "lucide-react";

// Thunks
import { fetchUsers } from "../../store/slices/adminUserSlice";
import { fetchAllGuestLists } from "../../store/slices/guestSlice";
import { fetchStats } from "../../store/slices/adminMessageSlice";
import { fetchNotices } from "../../store/slices/noticeSlice"; // Updated to noticeSlice

// Interfaces
import { type IUser } from "../../store/slices/adminUserSlice";
import { type IJudgeGuest } from "../../store/slices/guestSlice";
import { type INotice } from "../../store/slices/noticeSlice";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();

  // 1. Extract data from Redux Store
  const { users = [] } = useAppSelector((state) => state.users);
  const { allGuestLists = [], loading: guestsLoading } = useAppSelector(
    (state) => state.guest,
  );
  const { notices = [], loading: noticesLoading } = useAppSelector(
    (state) => state.notices,
  );
  const { stats: chatStats } = useAppSelector((state) => state.adminChat);

  // 2. Fetch all required data on mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllGuestLists());
    dispatch(fetchStats());
    dispatch(fetchNotices()); // Corrected thunk for documents
  }, [dispatch]);

  // 3. Calculate Real-Time Stats
  const totalJudges =
    users?.filter((u: IUser) => u?.role === "judge").length || 0;
  const submittedGuestLists =
    allGuestLists?.filter((g: IJudgeGuest) => g?.status === "SUBMITTED")
      .length || 0;
  const totalDocuments = notices?.length || 0;

  const stats = [
    {
      label: "Total Judges",
      value: totalJudges,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Guest Lists",
      value: submittedGuestLists,
      icon: FileCheck,
      color: "text-[#355E3B]",
      bg: "bg-[#355E3B]/10",
    },
    {
      label: "Uploaded Documents",
      value: totalDocuments,
      icon: Download,
      color: "text-[#C5A059]",
      bg: "bg-[#C5A059]/10",
    },
    {
      label: "Sent Messages",
      value: chatStats?.totalMessages || 0,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  // 4. Data Transformation for Tables
  const recentRegistrations =
    allGuestLists
      ?.slice(0, 5)
      .map((list: IJudgeGuest) => {
        if (!list) return null;
        return {
          id: list._id,
          judge:
            list.user && typeof list.user === "object" && "name" in list.user
              ? (list.user as any).name
              : "Unknown Officer",
          guests: list.guests?.length || 0,
          status: list.status === "SUBMITTED" ? "Verified" : "Pending",
          date: list.updatedAt
            ? new Date(list.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
        };
      })
      .filter(Boolean) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-[#355E3B] font-serif text-3xl font-bold">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Real-time ORHC Monitoring & Registry Oversight
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <TrendingUp size={14} /> System Analytics
          </button>
        </div>
      </div>

      {/* 2. Statistical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
              >
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                Live
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {stat.label}
            </p>
            <h3 className="text-2xl font-serif font-black text-[#355E3B] mt-1">
              {guestsLoading || noticesLoading ? (
                <div className="h-8 w-12 bg-slate-100 animate-pulse rounded" />
              ) : (
                stat.value
              )}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 3. Recent Submissions Table (Registry Oversight) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[#355E3B] text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <FileCheck size={16} /> Recent Guest Submissions
            </h3>
            <button className="text-slate-400 hover:text-[#355E3B]">
              <Filter size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Judge
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Guests
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Time of Submission
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRegistrations.length > 0 ? (
                  recentRegistrations.map((reg: any) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#355E3B]">
                          {reg.judge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 text-center">
                        {reg.guests}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            reg.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                        {reg.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-[#355E3B] transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-400 text-xs italic"
                    >
                      No recent submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Document Library Summary (New Section) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[#355E3B] text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} /> Latest Documents
            </h3>
            <span className="text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
              {totalDocuments} Total
            </span>
          </div>
          <div className="p-2 divide-y divide-slate-50">
            {notices.slice(0, 4).map((doc: INotice) => (
              <div
                key={doc._id}
                className="p-4 hover:bg-slate-50 transition-all rounded-xl group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-[#355E3B]/10 group-hover:text-[#355E3B] transition-colors">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-tighter">
                        {doc.type}
                      </span>
                      
                      <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                        <Download size={10} /> {doc.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No documents uploaded.
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link to="/admin/notice">
            <button className="text-[10px] font-black uppercase tracking-widest text-[#355E3B] hover:underline">
              View All Documents
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
