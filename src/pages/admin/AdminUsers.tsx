import { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearUserError,
} from "../../store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Mail, 
  ShieldAlert, 
  UserCog,
  Search,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

type UserRole = "admin" | "judge" | "guest";

const AdminUsers = () => {
  const dispatch = useAppDispatch();
  
  // MATCHING STORE KEY: state.user (singular) from your store/index.ts
  const { users = [], loading, error } = useAppSelector((state) => state.user);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("guest");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Global error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
  }, [error, dispatch]);

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    /* NOTE: Your backend controller REQUIRES a password. 
      We pass a temporary one here that the user can change later.
    */
    const result = await dispatch(
      createUser({ 
        name: newUserName.trim(), 
        email: newUserEmail.trim(), 
        role: newUserRole,
        // @ts-ignore - adding password to satisfy backend controller
        password: "TemporaryPassword123!" 
      })
    );

    if (createUser.fulfilled.match(result)) {
      toast.success("Personnel registered successfully");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("guest");
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Permanently delete this user from ORHC records?")) {
      dispatch(deleteUser(id));
      toast.success("Record purged from registry");
    }
  };

  const handleChangeRole = (id: string, role: UserRole) => {
    dispatch(updateUser({ id, updates: { role } }));
    toast.success(`Access level updated: ${role.toUpperCase()}`);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F1F3F4] font-sans">
      {/* HEADER SECTION */}
      <header className="bg-[#355E3B] text-white px-8 py-6 shadow-md border-b-4 border-[#EFBF04]">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-[#EFBF04] p-2.5 rounded-lg shadow-inner text-[#355E3B]">
              <UserCog size={28} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl tracking-tight uppercase">Registry Management</h1>
              <p className="text-[10px] text-white/70 uppercase tracking-[0.3em] font-medium italic">Secure Personnel Directory</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => dispatch(fetchUsers())}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#EFBF04]"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck size={16} className="text-[#EFBF04]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">Root Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* REGISTRATION FORM */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
            <UserPlus size={18} className="text-[#355E3B]" />
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">New Personnel Onboarding</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Legal Name</label>
              <input
                type="text"
                placeholder="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Secure Email</label>
              <input
                type="email"
                placeholder="Email Address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Access Designation</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] font-bold text-slate-700 outline-none"
              >
                <option value="guest">Guest (Observer)</option>
                <option value="judge">Judge (Official)</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <button 
              onClick={handleCreateUser} 
              disabled={loading}
              className="bg-[#355E3B] hover:bg-[#2a4b2f] text-white rounded-xl px-6 py-2.5 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
            >
              <UserPlus size={18}/> {loading ? "Registering..." : "Onboard User"}
            </button>
          </div>
        </section>

        {/* DIRECTORY TABLE */}
        <section className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#355E3B]" />
              <h2 className="font-bold text-slate-800 text-lg font-serif">Registry Directory</h2>
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                {users.length} Total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Filter by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs w-full md:w-80 focus:ring-2 focus:ring-[#355E3B] focus:bg-white transition-all outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth Level</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role Adjustment</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={32} className="animate-spin text-[#355E3B]" />
                        <span className="text-sm font-medium text-slate-500">Querying secure records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                      No matching records found in the ORHC registry.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-[#F8F9FA] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-[#355E3B] flex items-center justify-center text-[#EFBF04] font-bold text-lg shadow-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[15px]">{user.name}</p>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail size={12} />
                              <span className="text-[11px] font-medium uppercase tracking-tighter">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                          user.role === 'judge' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <ShieldAlert size={10} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value as UserRole)}
                          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-[#355E3B] shadow-sm outline-none cursor-pointer"
                        >
                          <option value="guest">GUEST</option>
                          <option value="judge">JUDGE</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Purge Access"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               <ShieldCheck size={14} className="text-[#355E3B]" />
               Authorized Registry Content
             </div>
             <p className="text-[10px] text-slate-400 italic font-medium">
               Last synced: {new Date().toLocaleTimeString()}
             </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminUsers;