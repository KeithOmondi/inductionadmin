import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSwearingPreferences,
  deleteSwearingPreference,
  clearSwearingPreferenceState,
} from "../../store/slices/swearingPreferenceSlice";
import type { AppDispatch, RootState } from "../../store/store";

const AdminOath = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { preferences, loading, error } = useSelector(
    (state: RootState) => state.swearingPreference,
  );

  useEffect(() => {
    dispatch(getAllSwearingPreferences());
    return () => {
      dispatch(clearSwearingPreferenceState());
    };
  }, [dispatch]);

  const handleDelete = (userId: string) => {
    if (window.confirm("Confirm: Permanently delete this preference record?")) {
      dispatch(deleteSwearingPreference(userId));
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1a3a32] uppercase tracking-tighter">
            Oath & Affirmation Registry
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Institutional Preference Management
          </p>
        </div>
        <button
          onClick={() => dispatch(getAllSwearingPreferences())}
          className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          Refresh Database
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest p-4 rounded-xl">
          Error Log: {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#1a3a32]">
                <th className="px-8 py-5 text-left text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                  Name of Judge
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                  Oath/Affirmation
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                  Selected Religious Text
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                  Management
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && preferences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#b48222] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Querying Records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : preferences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                      No Preference Records Found in Registry
                    </p>
                  </td>
                </tr>
              ) : (
                preferences.map((pref) => (
                  <tr
                    key={pref._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-xs font-black text-[#1a3a32] uppercase tracking-tight">
                        {pref.user?.name}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {pref.user?.email}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                          pref.ceremonyChoice === "oath"
                            ? "bg-[#b48222]/5 text-[#b48222] border-[#b48222]/20"
                            : "bg-[#1a3a32]/5 text-[#1a3a32] border-[#1a3a32]/20"
                        }`}
                      >
                        {pref.ceremonyChoice}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {pref.religiousText || (
                          <span className="text-slate-200 italic font-normal">
                            N/A (Affirmation)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(pref.updatedAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(pref.user?._id)}
                        className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all underline underline-offset-4"
                      >
                        Delete Record
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-center">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Internal Judicial Use Only • Confidential Registry
        </p>
      </div>
    </div>
  );
};

export default AdminOath;
