import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../../store/hooks";

// Icons
import { 
  Users, FileCheck, Clock,
  UserCheck, Download, Filter, MoreHorizontal 
} from 'lucide-react';

// Thunks
import { fetchUsers } from '../../store/slices/adminUserSlice';
import { fetchAllGuestLists } from '../../store/slices/guestSlice';
import { fetchFiles } from '../../store/slices/filesSlice';
import { fetchStats } from '../../store/slices/adminMessageSlice';

// Interfaces for TypeScript safety
import { type IUser } from '../../store/slices/adminUserSlice';
import { type IJudgeGuest } from '../../store/slices/guestSlice';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();

  // 1. Extract data with corrected state keys (state.guest and state.adminChat)
  const { users } = useAppSelector((state) => state.users);
  const { allGuestLists, loading: guestsLoading } = useAppSelector((state) => state.guest);
  const { files } = useAppSelector((state) => state.files);
  const { stats: chatStats } = useAppSelector((state) => state.adminChat);

  // 2. Fetch all required data on mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllGuestLists());
    dispatch(fetchFiles());
    dispatch(fetchStats());
  }, [dispatch]);

  // 3. Calculate Real-Time Stats with typed parameters
  const totalJudges = users.filter((u: IUser) => u.role === 'judge').length;
  const submittedGuestLists = allGuestLists.filter((g: IJudgeGuest) => g.status === 'SUBMITTED').length;
  const totalFiles = files.length;

  const stats = [
    { label: "Total Judges", value: totalJudges, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Guest Lists", value: submittedGuestLists, icon: FileCheck, color: "text-[#355E3B]", bg: "bg-[#355E3B]/10" },
    { label: "Documents", value: totalFiles, icon: Download, color: "text-[#C5A059]", bg: "bg-[#C5A059]/10" },
    { label: "Messages", value: chatStats?.totalMessages || 0, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // 4. Transform Guest Lists for the Table with typed parameter
  const recentRegistrations = allGuestLists.slice(0, 5).map((list: IJudgeGuest) => ({
    id: list._id,
    judge: typeof list.user === 'object' ? list.user.name : "Unknown Officer",
    guests: list.guests.length,
    status: list.status === 'SUBMITTED' ? 'Verified' : 'Pending',
    date: new Date(list.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-[#355E3B] font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Real-time ORHC Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* 2. Statistical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                Live
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl font-serif font-black text-[#355E3B] mt-1">
              {guestsLoading ? "..." : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* 3. Main Oversight Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[#355E3B] text-xs font-black uppercase tracking-widest">Recent Filings</h3>
          <button className="text-slate-400 hover:text-[#355E3B]">
            <Filter size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Judicial Officer</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Guests</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Time</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#355E3B]">{reg.judge}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {reg.guests}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      reg.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                    {reg.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-[#355E3B]">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Activity Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#355E3B] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.3em] mb-2">System Health</h4>
            <h3 className="text-2xl font-serif font-bold mb-4">Registry Portal is Online</h3>
            <div className="mt-6 flex gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-[8px] uppercase font-bold text-white/50 tracking-widest">Active Users</p>
                <p className="text-lg font-bold">{users.filter((u: IUser) => u.isActive).length}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-[8px] uppercase font-bold text-white/50 tracking-widest">Unverified</p>
                <p className="text-lg font-bold">{users.filter((u: IUser) => !u.isVerified).length}</p>
              </div>
            </div>
          </div>
          <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={240} />
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h4 className="text-[#355E3B] text-[10px] font-black uppercase tracking-widest mb-6">Staff Overview</h4>
          <div className="space-y-6">
            {users.filter((u: IUser) => u.role === 'admin').slice(0, 3).map((admin: IUser) => (
              <div key={admin._id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#C5A059]">
                  <UserCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{admin.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Administrator</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
  </svg>
);

export default AdminDashboard;