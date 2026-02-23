import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  UserCheck, 
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock Stats for the Registry
  const stats = [
    { label: "Total Judges", value: "48", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Forms Filed", value: "32", icon: FileCheck, color: "text-[#355E3B]", bg: "bg-[#355E3B]/10" },
    { label: "Pending Review", value: "12", icon: Clock, color: "text-[#C5A059]", bg: "bg-[#C5A059]/10" },
    { label: "Urgent Actions", value: "04", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const recentRegistrations = [
    { id: 1, judge: "Hon. Justice K. Mwangi", guests: 5, status: "Verified", date: "2 mins ago" },
    { id: 2, judge: "Hon. Justice S. Omondi", guests: 3, status: "Pending", date: "15 mins ago" },
    { id: 3, judge: "Hon. Justice A. Bekele", guests: 5, status: "Verified", date: "1 hour ago" },
    { id: 4, judge: "Hon. Justice M. Thuku", guests: 2, status: "Flagged", date: "3 hours ago" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-[#355E3B] font-serif text-3xl font-bold">Registry Oversight</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">High Court Onboarding Monitoring System</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={14} /> Export Master List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#355E3B] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#2a4b2f] transition-all shadow-md">
            Publish New Notice
          </button>
        </div>
      </div>

      {/* 2. Statistical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <TrendingUp size={12} /> +12%
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl font-serif font-black text-[#355E3B] mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 3. Main Oversight Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[#355E3B] text-xs font-black uppercase tracking-widest">Recent Guest Filings</h3>
          <button className="text-slate-400 hover:text-[#355E3B]">
            <Filter size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Judicial Officer</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Guest Count</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#355E3B] font-bold text-[10px]">
                        {reg.judge.split(' ').pop()?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#355E3B]">{reg.judge}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">{reg.guests} / 5</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      reg.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' :
                      reg.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {reg.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-[#355E3B] transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-center">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#355E3B] transition-colors">
            View All Registry Filings
          </button>
        </div>
      </div>

      {/* 4. Activity Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#355E3B] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.3em] mb-2">System Health</h4>
            <h3 className="text-2xl font-serif font-bold mb-4">Registry Portal is Online</h3>
            <p className="text-white/70 text-sm max-w-md leading-relaxed">
              All data encryption protocols are active. Automated backups were completed at 04:00 AM today.
            </p>
            <div className="mt-6 flex gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-[8px] uppercase font-bold text-white/50 tracking-widest">Active Sessions</p>
                <p className="text-lg font-bold">14 Judges</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-[8px] uppercase font-bold text-white/50 tracking-widest">Server Load</p>
                <p className="text-lg font-bold">12%</p>
              </div>
            </div>
          </div>
          <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={240} />
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h4 className="text-[#355E3B] text-[10px] font-black uppercase tracking-widest mb-6">Recent Logins</h4>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <UserCheck className="text-[#C5A059]" size={18} />
                <div>
                  <p className="text-xs font-bold text-slate-800">Registry Clerk #{i+100}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Login: 08:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon for the background
const ShieldCheck = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default AdminDashboard;