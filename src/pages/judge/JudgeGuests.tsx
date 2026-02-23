import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  Save,
  ArrowRight,
  Loader2,
  CheckCircle,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyGuestList,
  saveGuestList,
  submitGuestList,
  addGuests,
  type IGuest,
  type GuestType,
  type Gender,
  type AgeGroup,
} from "../../store/slices/guestSlice";

/* =====================================================
    TYPES & HELPERS
===================================================== */

interface IGuestWithId extends IGuest {
  id: number;
}

const emptyGuest = (): IGuestWithId => ({
  id: Date.now() + Math.random(),
  name: "",
  type: "ADULT",
  gender: "MALE",
  ageGroup: "26_40",
  idNumber: "",
  phone: "",
  email: "",
});

const JudgeGuestsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { guestList, loading, error } = useAppSelector((state) => state.guest);
  const [guests, setGuests] = useState<IGuestWithId[]>([emptyGuest()]);

  /* =====================================================
      LIFECYCLE
  ===================================================== */

  useEffect(() => {
    dispatch(fetchMyGuestList());
  }, [dispatch]);

  useEffect(() => {
    if (guestList?.guests?.length) {
      setGuests(
        guestList.guests.map((g, idx) => ({
          ...g,
          id: Date.now() + idx,
        }))
      );
    }
  }, [guestList]);

  /* =====================================================
      HANDLERS
  ===================================================== */

  const addGuestHandler = () => {
    if (guests.length < 5) {
      setGuests([...guests, emptyGuest()]);
      toast.success("New guest row added to protocol.");
    } else {
      toast.error("Maximum allocation (5) reached.");
    }
  };

  const removeGuest = (id: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((g) => g.id !== id));
      toast.success("Guest row removed.");
    }
  };

  const updateField = <K extends keyof IGuestWithId>(
    id: number,
    field: K,
    value: IGuestWithId[K]
  ) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const cleanGuestsForApi = (): IGuest[] =>
    guests.map(({ id, ...rest }) => rest);

  const handleSaveDraft = async () => {
    try {
      await dispatch(saveGuestList(cleanGuestsForApi())).unwrap();
      toast.success("Draft saved to secure registry.");
    } catch (err: any) {
      toast.error(err || "Failed to save draft.");
    }
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitGuestList(cleanGuestsForApi())).unwrap();
      toast.success("Protocol finalized & submitted.", {
        icon: "⚖️",
        duration: 5000,
      });
    } catch (err: any) {
      toast.error(err || "Submission rejected.");
    }
  };

  const handleAddMoreAfterSubmit = async () => {
    if (!guestList) return;
    const existingCount = guestList.guests.length;
    const newGuests = cleanGuestsForApi().slice(existingCount);

    if (newGuests.length > 0) {
      try {
        await dispatch(addGuests(newGuests)).unwrap();
        toast.success("Additional guests verified.");
      } catch (err: any) {
        toast.error(err || "Update failed.");
      }
    } else {
      toast("No new guests detected to add.", { icon: "ℹ️" });
    }
  };

  const isSubmitted = guestList?.status === "SUBMITTED";

  if (loading && !guestList) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#355E3B]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-xl",
          duration: 3000,
        }}
      />

      {/* --- EXECUTIVE SECURITY NOTICE --- */}
      <div className="bg-[#355E3B]/5 border border-[#355E3B]/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left transition-all hover:bg-[#355E3B]/10">
        <div className="bg-[#355E3B] p-4 rounded-2xl text-white shadow-xl shadow-[#355E3B]/20 shrink-0">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-[#355E3B] text-[11px] font-black uppercase tracking-[0.25em]">
            Security Clearance Protocol
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
            Please provide the following details in respect of the{" "}
            <span className="font-bold text-slate-900 underline decoration-[#C5A059] decoration-2 underline-offset-4">5 guests</span> accompanying 
            the Judge to the swearing-in ceremony.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#C5A059]">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-wider">
              Ensure information matches identification documents exactly.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#355E3B]">
            Ceremony Registry
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Protocol Status:
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                isSubmitted
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {guestList?.status || "DRAFT"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-700 tracking-tighter">
            {guests.length} <span className="text-slate-300">/</span> 5 GUESTS
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-wide">
          ⚠️ {error}
        </div>
      )}

      {/* Guest Cards */}
      <div className="space-y-6">
        {guests.map((guest, index) => (
          <div
            key={guest.id}
            className={`bg-white border rounded-2xl p-6 transition-all duration-300 ${
              isSubmitted && index < (guestList?.guests.length || 0)
                ? "border-slate-100 opacity-70 grayscale-[0.5]"
                : "border-slate-200 shadow-sm shadow-[#355E3B]/5 hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#355E3B] text-white text-[10px] font-black">
                {index + 1}
              </span>
              {!isSubmitted && (
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name (as per ID)"
                value={guest.name}
                onChange={(v) => updateField(guest.id, "name", v)}
              />

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Guest Classification
                </label>
                <div className="flex gap-2">
                  {(["ADULT", "MINOR"] as GuestType[]).map((t) => (
                    <Toggle
                      key={t}
                      active={guest.type === t}
                      label={t}
                      onClick={() => updateField(guest.id, "type", t)}
                    />
                  ))}
                </div>
              </div>

              <Select
                label="Gender"
                value={guest.gender}
                options={["MALE", "FEMALE", "OTHER"]}
                onChange={(v) => updateField(guest.id, "gender", v as Gender)}
              />

              <Select
                label="Age Group"
                value={guest.ageGroup}
                options={[
                  "UNDER_5",
                  "6_12",
                  "13_17",
                  "18_25",
                  "26_40",
                  "41_60",
                  "60_PLUS",
                ]}
                onChange={(v) =>
                  updateField(guest.id, "ageGroup", v as AgeGroup)
                }
              />

              {guest.type === "ADULT" && (
                <>
                  <Input
                    label="National ID / Passport Number"
                    value={guest.idNumber}
                    onChange={(v) => updateField(guest.id, "idNumber", v)}
                  />
                  <Input
                    label="Primary Phone Number"
                    value={guest.phone}
                    onChange={(v) => updateField(guest.id, "phone", v)}
                  />
                  <Input
                    label="Email Address"
                    value={guest.email}
                    onChange={(v) => updateField(guest.id, "email", v)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-100">
        <button
          onClick={addGuestHandler}
          disabled={guests.length >= 5 || loading}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#355E3B] disabled:opacity-30 transition-opacity hover:underline underline-offset-8"
        >
          <UserPlus size={16} /> Add Guest Row
        </button>

        <div className="flex gap-4">
          {!isSubmitted ? (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Save size={14} />
                )}{" "}
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-[#355E3B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2a4a2e] shadow-lg shadow-[#355E3B]/20 transition-all flex items-center gap-2"
              >
                Finalize & Submit <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {guests.length > (guestList?.guests.length || 0) && (
                <button
                  onClick={handleAddMoreAfterSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-[#C5A059] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C5A059]/20 transition-all"
                >
                  Update Guest Additions
                </button>
              )}
              <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <CheckCircle size={16} /> Locked & Submitted
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- Reusable Components (Typed) --- */

interface InputProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}
const Input = ({ label, value, onChange }: InputProps) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#355E3B] focus:ring-1 focus:ring-[#355E3B]/20 transition-all placeholder:text-slate-300"
      placeholder="Type here..."
    />
  </div>
);

interface SelectProps {
  label: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
}
const Select = ({ label, value, options, onChange }: SelectProps) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#355E3B] transition-all appearance-none"
    >
      <option value="" disabled>
        Select...
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace("_", " ")}
        </option>
      ))}
    </select>
  </div>
);

interface ToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}
const Toggle = ({ active, label, onClick }: ToggleProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
      active
        ? "bg-[#355E3B] border-[#355E3B] text-white shadow-lg shadow-[#355E3B]/20"
        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
    }`}
  >
    {label}
  </button>
);

export default JudgeGuestsPage;