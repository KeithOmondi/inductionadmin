import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  UploadCloud, 
  FileText, 
  X, 
  Eye, 
  Download,
  Loader2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotices,
  createNotice,
  deleteNotice,
  type NoticeType,
} from "../../store/slices/noticeSlice";

const AdminNoticesPage = () => {
  const dispatch = useAppDispatch();
  const { notices, loading } = useAppSelector((state) => state.notices);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "CIRCULAR" as NoticeType,
    isUrgent: false,
  });

  useEffect(() => {
    dispatch(fetchNotices(undefined));
  }, [dispatch]);

  const handleCreate = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("isUrgent", String(form.isUrgent));

    await dispatch(createNotice(formData));
    setOpen(false);
    setFile(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently remove this notice from the registry?")) {
      dispatch(deleteNotice(id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Notices</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
            High Court Onboarding Notice board
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#355E3B] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2a4a2e] transition-all shadow-lg shadow-[#355E3B]/20"
        >
          <Plus size={16} />
          Add Notice
        </button>
      </div>

      {/* TABLE / LIST */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Notice Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Engagement</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && notices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <Loader2 className="animate-spin text-slate-300 mx-auto" size={24} />
                  </td>
                </tr>
              ) : (
                notices.map((n) => (
                  <tr key={n._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${n.isUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {n.title}
                            {n.isUrgent && (
                              <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Urgent</span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{n.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#355E3B]/5 text-[#355E3B] text-[10px] font-black uppercase tracking-widest border border-[#355E3B]/10">
                        {n.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-4 text-slate-400 text-[11px] font-medium">
                        <span className="flex items-center gap-1.5"><Eye size={14} /> {n.views}</span>
                        <span className="flex items-center gap-1.5"><Download size={14} /> {n.downloads}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#355E3B]">New Official Gazette</h2>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notice Title</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#355E3B] transition-all"
                    placeholder="e.g. Protocol Update for Q3 Ceremony"
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#355E3B] transition-all"
                    placeholder="Provide context for the recipients..."
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notice Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#355E3B] appearance-none"
                      onChange={(e) => setForm({ ...form, type: e.target.value as NoticeType })}
                    >
                      <option value="CIRCULAR">CIRCULAR</option>
                      <option value="EVENTS">EVENTS</option>
                      <option value="NOTICE">NOTICE</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-checked:bg-red-500 rounded-full transition-all" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-500 transition-colors">Mark as Urgent</span>
                    </label>
                  </div>
                </div>

                <label className="group border-2 border-dashed border-slate-200 rounded-[1.5rem] p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#355E3B] hover:bg-[#355E3B]/5 transition-all">
                  <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:text-[#355E3B] group-hover:bg-white transition-all">
                    <UploadCloud size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-600">
                      {file ? file.name : "Select Gazette PDF/Document"}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Maximum 10MB</p>
                  </div>
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!file || !form.title}
                  className="flex-1 px-6 py-4 bg-[#355E3B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2a4a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#355E3B]/20"
                >
                  Broadcast Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticesPage;