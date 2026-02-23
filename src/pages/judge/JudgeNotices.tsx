import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotices,
  downloadNotice,
  type NoticeType,
} from "../../store/slices/noticeSlice";

const JudgeNoticesPage = () => {
  const dispatch = useAppDispatch();
  const { notices, loading } = useAppSelector((state) => state.notices);

  const [filter, setFilter] = useState<"ALL" | NoticeType>("ALL");
  const [search, setSearch] = useState("");

  const categories: ("ALL" | NoticeType)[] = [
    "ALL",
    "CIRCULAR",
    "EVENTS",
    "NOTICE",
    "URGENT",
  ];

  /* ================= FETCH ================= */
  useEffect(() => {
    const params: any = {};

    if (filter !== "ALL") params.type = filter;
    if (search) params.search = search;

    dispatch(fetchNotices(params));
  }, [dispatch, filter, search]);

  /* ================= UI ================= */
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-[#355E3B] font-serif text-3xl lg:text-4xl font-bold mb-2">
          Notice Board
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Official documents, circulars and publications from the Judiciary
        </p>
      </div>

      {/* FILTER + SEARCH */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                filter === cat
                  ? "bg-[#355E3B] border-[#355E3B] text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-400 hover:border-[#C5A059]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registry files..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#355E3B]/10 focus:border-[#355E3B]"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && <p className="text-slate-400 text-sm">Loading notices...</p>}

      {/* GRID */}
      <div className="grid gap-6">
        {notices.map((notice) => (
          <div
            key={notice._id}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#355E3B]/20 transition-all"
          >
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded tracking-widest bg-emerald-50 text-emerald-700">
                      {notice.type}
                    </span>

                    {notice.isUrgent && (
                      <span className="flex items-center gap-1 text-red-600 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <AlertCircle size={10} /> Urgent
                      </span>
                    )}
                  </div>

                  <h3 className="text-[#355E3B] font-serif text-xl lg:text-2xl font-bold">
                    {notice.title}
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-4xl">
                {notice.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
                <div className="flex items-center gap-6 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(notice.createdAt).toDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {notice.views} Views
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(downloadNotice(notice._id))}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#355E3B]/5 hover:bg-[#355E3B] text-[#355E3B] hover:text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  <Download size={16} />
                  Download • {notice.size}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="bg-[#C5A059]/5 border border-[#C5A059]/20 p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-white rounded-full text-[#C5A059] shadow-sm">
          <FileText size={24} />
        </div>
        <div>
          <h4 className="text-[#355E3B] font-bold text-sm">Archived Notices</h4>
          <p className="text-slate-500 text-xs">
            For documents older than 6 months, contact registry archives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JudgeNoticesPage;
