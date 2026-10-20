import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { passengerStorage, type SupportTicket } from '../../lib/passengerStorage';
import { SAMPLE_RIDE_HISTORY } from '../../lib/peshawarData';
import { sound } from '../../lib/sound';

interface ReportIssuePageProps {
  userId: string;
  onBack: () => void;
  onTicketSubmitted?: (ticket: SupportTicket) => void;
  initialRideId?: string;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  userId,
  onBack,
  onTicketSubmitted,
  initialRideId
}) => {
  const [category, setCategory] = useState<SupportTicket['category']>('Fares & Payments');
  const [subject, setSubject] = useState(initialRideId ? `Trip Inquiry for Booking ${initialRideId}` : '');
  const [description, setDescription] = useState('');
  const [relatedRideId, setRelatedRideId] = useState(initialRideId || '');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out both the issue summary and description.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    setTimeout(() => {
      const ticket = passengerStorage.createSupportTicket(userId, {
        category,
        subject: subject.trim(),
        description: description.trim(),
        relatedRideId: relatedRideId || undefined,
        priority
      });

      setIsSubmitting(false);
      setSubmittedTicket(ticket);
      sound.playSuccess();
      onTicketSubmitted?.(ticket);
    }, 700);
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
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Report an Issue
          </span>
        </div>
      </div>

      {submittedTicket ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border border-emerald-200 p-6 text-center shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#16a34a] mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">Issue Ticket Filed Successfully!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Your inquiry reference ID is <strong className="text-[#16a34a]">{submittedTicket.id}</strong>. Our Peshawar operations dispatch will review your report within 2 hours.
          </p>

          <button
            onClick={onBack}
            className="mt-6 px-6 py-2.5 rounded-2xl bg-[#16a34a] text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-colors"
          >
            Back to Account
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-slate-50"
              >
                <option value="Fares & Payments">Fares & Payments (Dispute, Overcharge)</option>
                <option value="Rides">Ride Quality & Navigation Glitch</option>
                <option value="Driver Conduct">Captain Conduct & Behavior</option>
                <option value="Lost Item">Lost Item in Bike or Vehicle</option>
                <option value="Account & Security">Account & Security Inquiry</option>
                <option value="App Feedback">App Feedback & Suggestions</option>
              </select>
            </div>

            {/* Related Ride Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Related Recent Ride (Optional)</label>
              <select
                value={relatedRideId}
                onChange={(e) => setRelatedRideId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-slate-50"
              >
                <option value="">No specific ride / General issue</option>
                {SAMPLE_RIDE_HISTORY.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} &bull; {r.from.split(' ')[0]} to {r.to.split(' ')[0]} (PKR {r.fare})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Issue Title / Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Overcharged by PKR 40 on Saddar trip"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred with as much detail as possible..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      priority === p 
                        ? p === 'High' ? 'bg-rose-600 text-white border-rose-600' : 'bg-[#16a34a] text-white border-[#16a34a]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Filing Ticket...' : 'Submit Support Ticket'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
