import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  UserPlus,
  Trash2,
  Users,
  UserCog,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  clearUserError,
  createAdminUser,
  deleteAdminUser,
  fetchUsers,
  updateAdminUser,
} from "../../store/slices/adminUserSlice";

type UserRole = "admin" | "judge" | "guest";

// 🔑 Access master admin email from environment variables
const MASTER_ADMIN_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL;

const AdminUsers = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error, profile } = useAppSelector(
    (state) => state.users,
  );

  // Determine if current logged-in user is the master
  const isMasterAdmin = !!MASTER_ADMIN_EMAIL && profile?.email === MASTER_ADMIN_EMAIL;

  // Form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("guest");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
  }, [error, dispatch]);

  const handleCreateUser = async () => {
    if (!isMasterAdmin) return toast.error("Unauthorized: Master Admin access required");
    
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      return toast.error("All fields are mandatory for onboarding");
    }

    try {
      await dispatch(
        createAdminUser({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
          password: newUserPassword,
        }),
      ).unwrap();

      toast.success("Personnel successfully added to registry");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("guest");
    } catch (err: any) {
      toast.error(err || "Failed to register personnel");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!isMasterAdmin) return toast.error("Unauthorized action");
    if (!window.confirm("Confirm: Permanent removal of user from ORHC records?")) return;

    try {
      await dispatch(deleteAdminUser(id)).unwrap();
      toast.success("Record purged from registry");
    } catch (err: any) {
      toast.error(err || "Failed to delete record");
    }
  };

  const handleChangeRole = async (currentRole: UserRole, newRole: UserRole, id: string) => {
    // Permission Logic
    if (currentRole === "guest" && (newRole === "admin" || newRole === "judge") && !isMasterAdmin) {
      return toast.error("Promotion requires Master Admin authorization");
    }

    if (currentRole === newRole) return;

    try {
      await dispatch(updateAdminUser({ id, updates: { role: newRole } })).unwrap();
      toast.success(`Authorization updated: ${newRole.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err || "Failed to update authorization level");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-[#F1F3F4] font-sans">
      {/* HEADER */}
      <header className="bg-[#355E3B] text-white px-8 py-6 shadow-md border-b-4 border-[#EFBF04]">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-[#EFBF04] p-2.5 rounded-lg shadow-inner text-[#355E3B]">
              <UserCog size={28} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl tracking-tight uppercase">
                Registry Management
              </h1>
              <p className="text-[10px] text-white/70 uppercase tracking-[0.3em] font-medium italic">
                Secure Personnel Directory
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(fetchUsers())}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#EFBF04]"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* ONBOARDING FORM */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* Locked State Overlay */}
          {!isMasterAdmin && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all">
               <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-full text-red-500">
                    <Lock size={20} />
                  </div>
                  <span className="text-slate-800 font-bold text-xs uppercase tracking-widest">Master Admin Only</span>
               </div>
            </div>
          )}

          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
            <UserPlus size={18} className="text-[#355E3B]" />
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
              Personnel Onboarding
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <input
                type="text"
                disabled={!isMasterAdmin}
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] outline-none disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Secure Email</label>
              <input
                type="email"
                disabled={!isMasterAdmin}
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] outline-none disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Access Key</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={!isMasterAdmin}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Designation</label>
              <select
                disabled={!isMasterAdmin}
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#355E3B] font-bold text-slate-700 outline-none disabled:cursor-not-allowed"
              >
                <option value="guest">Guest</option>
                <option value="judge">Judge</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              onClick={handleCreateUser}
              disabled={loading || !isMasterAdmin}
              className="bg-[#355E3B] hover:bg-[#2a4b2f] text-white rounded-xl px-6 py-2.5 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
            >
              <UserPlus size={18} /> {loading ? "..." : "Onboard"}
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
                {users.length} Registered
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs w-full md:w-80 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Personnel Information</th>
                  <th className="px-6 py-4">Current Clearance</th>
                  <th className="px-6 py-4">Authorization Control</th>
                  <th className="px-6 py-4 text-right">Registry Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#355E3B] flex items-center justify-center text-[#EFBF04] font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[14px]">{user.name}</p>
                          <span className="text-[10px] text-slate-500 uppercase tracking-tight">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                        user.role === "admin" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : user.role === "judge" 
                            ? "bg-[#EFBF04]/10 text-[#355E3B] border-[#EFBF04]/30"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={user.role}
                        disabled={user.email === MASTER_ADMIN_EMAIL} // Cannot change master admin role
                        onChange={(e) => handleChangeRole(user.role, e.target.value as UserRole, user._id)}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        <option value="guest">GUEST</option>
                        <option value="judge">JUDGE</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user.email !== MASTER_ADMIN_EMAIL && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={!isMasterAdmin}
                          className="p-2 text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminUsers;