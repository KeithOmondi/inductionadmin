import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMySwearingPreference,
  saveSwearingPreference,
  clearSwearingPreferenceState,
} from "../../store/slices/swearingPreferenceSlice";
import type { AppDispatch, RootState } from "../../store/store";

const RELIGIOUS_TEXTS = [
  
  "Bible",
  "Quran",
  "Bhagavad Gita",
  "Other",
];

const JudgesReligion = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { myPreference, loading, error } = useSelector(
    (state: RootState) => state.swearingPreference,
  );

  const [isOath, setIsOath] = useState<boolean>(true);
  const [religiousText, setReligiousText] = useState("");

  useEffect(() => {
    dispatch(getMySwearingPreference());
    return () => {
      dispatch(clearSwearingPreferenceState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (myPreference) {
      setIsOath(myPreference.ceremonyChoice === "oath");
      setReligiousText(myPreference.religiousText || "");
    }
  }, [myPreference]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ceremonyChoice: isOath ? ("oath" as const) : ("affirmation" as const),
      religiousText: isOath ? religiousText : "",
    };
    dispatch(saveSwearingPreference(payload));
  };

  if (loading && !myPreference) {
    return (
      <div className="flex h-64 items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-[#1a3a32] animate-pulse">
        Retrieving Preferences...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#1a3a32] p-8 text-white">
          <h2 className="text-xl font-black uppercase tracking-tighter">
            Ceremony Preference
          </h2>
          <p className="text-[9px] font-bold text-[#b48222] uppercase tracking-[0.2em] mt-1">
            For purposes of the swearing-in ceremony, do you wish to take the
            prescribed oath (which includes a reference to God) or would you
            prefer to make a solemn affirmation?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Ceremony Type Selection */}
          <div className="space-y-4">
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsOath(true)}
                className={`flex-1 p-4 rounded-2xl border transition-all duration-300 text-left ${
                  isOath
                    ? "border-[#b48222] bg-[#b48222]/5 ring-1 ring-[#b48222]"
                    : "border-slate-100 bg-slate-50 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="block text-xs font-black text-[#1a3a32] uppercase">
                  Take the prescribed Oath
                </span>
                <span className="text-[9px] font-medium text-slate-500">
                  
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsOath(false)}
                className={`flex-1 p-4 rounded-2xl border transition-all duration-300 text-left ${
                  !isOath
                    ? "border-[#b48222] bg-[#b48222]/5 ring-1 ring-[#b48222]"
                    : "border-slate-100 bg-slate-50 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="block text-xs font-black text-[#1a3a32] uppercase">
                  Make a Solemn Affirmation
                </span>
                <span className="text-[9px] font-medium text-slate-500">
                  
                </span>
              </button>
            </div>
          </div>

          {/* Dropdown Section */}
          <div
            className={`space-y-3 transition-all duration-500 ${isOath ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
          >
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Selected Religious Text
            </label>
            <div className="relative group">
              <select
                value={religiousText}
                onChange={(e) => setReligiousText(e.target.value)}
                required={isOath}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-[#1a3a32] text-[11px] font-bold uppercase tracking-wider py-4 px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b48222]/20 focus:border-[#b48222] transition-all cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Sacred Text --
                </option>
                {RELIGIOUS_TEXTS.map((text) => (
                  <option key={text} value={text}>
                    {text}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#b48222]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a32] hover:bg-[#112621] text-white text-[11px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Synchronizing..." : "Authorize & Save Selection"}
            </button>
          </div>
        </form>

        {myPreference && (
          <div className="bg-slate-50 p-4 border-t border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">
              Last Formalized:{" "}
              {new Date(myPreference.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgesReligion;
