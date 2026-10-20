import React, { useState } from 'react';
import { 
  ArrowLeft, PhoneCall, AlertTriangle, Share2, 
  Users, Plus, Trash2, ShieldCheck
} from 'lucide-react';
import { passengerStorage, type TrustedContact } from '../../lib/passengerStorage';
import { sound } from '../../lib/sound';

interface SafetyCenterPageProps {
  userId: string;
  onBack: () => void;
  onReportSafetyConcern?: () => void;
}

export const SafetyCenterPage: React.FC<SafetyCenterPageProps> = ({
  userId,
  onBack,
  onReportSafetyConcern
}) => {
  const [contacts, setContacts] = useState<TrustedContact[]>(() => 
    passengerStorage.getTrustedContacts(userId)
  );

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRel] = useState('Family');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Please provide contact name and phone number.');
      return;
    }
    sound.playSuccess();
    passengerStorage.addTrustedContact(userId, {
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRel
    });
    setContacts(passengerStorage.getTrustedContacts(userId));
    setIsAddingContact(false);
    setNewName('');
    setNewPhone('');
  };

  const handleDeleteContact = (id: string) => {
    sound.playPop();
    passengerStorage.deleteTrustedContact(userId, id);
    setContacts(passengerStorage.getTrustedContacts(userId));
  };

  const handleShareLiveTrip = () => {
    sound.playClick();
    const shareMessage = `I am traveling with SafarGo in Peshawar. Track my ride in real time: https://safargo.pk/track?ride=LIVE-PESHAWAR`;
    if (navigator.share) {
      navigator.share({
        title: 'SafarGo Live Trip Safety',
        text: shareMessage,
        url: 'https://safargo.pk'
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareMessage);
      alert('Safety tracking link copied to clipboard. Share it via WhatsApp or SMS.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#16a34a] hover:border-emerald-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Safety Center
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. EMERGENCY HELPLINES IN PESHAWAR (VERIFIED OFFICIAL NUMBERS) */}
        <div className="rounded-3xl bg-rose-50 border border-rose-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950">Peshawar Emergency Helplines</h3>
              <p className="text-[11px] text-rose-800">Tap below to directly dial emergency responders</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-rose-200/60">
            <a
              href="tel:15"
              className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-100/50 flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div>
                <span className="text-xs font-black text-slate-900 block group-hover:text-rose-700">Police Emergency</span>
                <span className="text-[10px] text-slate-500 font-medium">KPK Police 24/7</span>
              </div>
              <span className="text-base font-black text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-xl">15</span>
            </a>

            <a
              href="tel:1122"
              className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-100/50 flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div>
                <span className="text-xs font-black text-slate-900 block group-hover:text-rose-700">Rescue 1122</span>
                <span className="text-[10px] text-slate-500 font-medium">Medical & Fire</span>
              </div>
              <span className="text-base font-black text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-xl">1122</span>
            </a>

            <a
              href="tel:1099"
              className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-100/50 flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div>
                <span className="text-xs font-black text-slate-900 block group-hover:text-rose-700">Women Protection</span>
                <span className="text-[10px] text-slate-500 font-medium">KP Commission Helpline</span>
              </div>
              <span className="text-base font-black text-rose-700 bg-rose-100/80 px-2 py-1 rounded-xl">1099</span>
            </a>

            <a
              href="tel:1915"
              className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-100/50 flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div>
                <span className="text-xs font-black text-slate-900 block group-hover:text-rose-700">Traffic Police</span>
                <span className="text-[10px] text-slate-500 font-medium">Peshawar City</span>
              </div>
              <span className="text-base font-black text-rose-700 bg-rose-100/80 px-2 py-1 rounded-xl">1915</span>
            </a>
          </div>
        </div>

        {/* 2. SHARE LIVE TRIP WITH FAMILY */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Share Live Trip Status</h3>
                <p className="text-xs text-slate-500">Send live GPS tracking link to your trusted contacts</p>
              </div>
            </div>

            <button
              onClick={handleShareLiveTrip}
              className="px-4 py-2 rounded-xl bg-[#16a34a] text-white text-xs font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
            >
              Share Link
            </button>
          </div>
        </div>

        {/* 3. TRUSTED CONTACTS LIST */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-black text-slate-900">Trusted Safety Contacts</h3>
            </div>
            <button
              onClick={() => setIsAddingContact(true)}
              className="text-xs font-extrabold text-[#16a34a] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {contacts.map(c => (
              <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                  <span className="text-[11px] text-slate-500">{c.phone} &bull; {c.relationship}</span>
                </div>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Contact Modal / Inline Form */}
          {isAddingContact && (
            <form onSubmit={handleAddContact} className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <span className="text-xs font-black text-emerald-950 block">New Trusted Contact</span>
              <input
                type="text"
                placeholder="Contact Name (e.g. Brother Ahmad)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold focus:outline-none bg-white"
              />
              <input
                type="tel"
                placeholder="Mobile Number (e.g. 03001234567)"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold focus:outline-none bg-white"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded-lg bg-[#16a34a] text-white text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. REPORT SAFETY CONCERN ACTION */}
        {onReportSafetyConcern && (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Report a Safety Concern</h4>
                <p className="text-[11px] text-slate-400">File a confidential safety incident with Peshawar admin</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onReportSafetyConcern();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              Report &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
