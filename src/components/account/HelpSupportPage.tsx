import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';
import { passengerStorage } from '../../lib/passengerStorage';
import { sound } from '../../lib/sound';

interface HelpSupportPageProps {
  userId: string;
  onBack: () => void;
  onNavigateToReportIssue?: () => void;
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({
  userId,
  onBack,
  onNavigateToReportIssue
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const tickets = passengerStorage.getSupportTickets(userId);

  const faqs = [
    {
      q: 'How does SafarGo Peshawar calculate ride fares?',
      a: 'Fares in Peshawar are calculated transparently based on actual route distance and local road conditions. Bike rides start at base PKR 60, Cars at PKR 150, and Suzuki Bolan Cargo at PKR 280, with no surge price gouging.'
    },
    {
      q: 'What should I do if I forget an item in a ride?',
      a: 'Immediately open "Report an Issue" or call the emergency driver helpline. Our Peshawar support center contacts your captain directly and secures your item for immediate handover.'
    },
    {
      q: 'How do I add money to my SafarGo Cash Wallet?',
      a: 'Go to Wallet > Top Up Balance. You can reload instantly using EasyPaisa, JazzCash, or pay cash directly to any verified SafarGo captain at the end of your trip.'
    },
    {
      q: 'Are drivers in Peshawar police-verified?',
      a: 'Yes, 100% of SafarGo Peshawar captains undergo CNIC verification, driving license authentication, vehicle inspection, and police record checks before activation.'
    },
    {
      q: 'Can I book rides across all Peshawar sectors and BRT stations?',
      a: 'Yes! SafarGo covers all Hayatabad Phases (1 to 7), Saddar Cantt, University Town, KTH Hospital, Ring Road, Karkhano Markets, and Old City Heritage gates.'
    }
  ];

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
          <HelpCircle className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Help & Support
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Quick Ticket Action */}
        {onNavigateToReportIssue && (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Need direct assistance?</h3>
                <p className="text-xs text-slate-500">Submit a support ticket or report a trip issue</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onNavigateToReportIssue();
              }}
              className="px-4 py-2 rounded-xl bg-[#16a34a] text-white text-xs font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
            >
              New Ticket
            </button>
          </div>
        )}

        {/* Support Tickets Section */}
        <div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 block mb-3">
            Your Support Tickets ({tickets.length})
          </span>

          {tickets.length === 0 ? (
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 text-center text-xs text-slate-400">
              No open tickets. Everything is running smoothly!
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map(t => (
                <div key={t.id} className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {t.id} &bull; {t.category}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'Resolved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : t.status === 'In Review' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-500">{t.description}</p>

                  {t.responseMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 mt-2">
                      <span className="font-extrabold block text-[10px] uppercase text-emerald-800 mb-0.5">SafarGo Support Response:</span>
                      {t.responseMessage}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Filed: {t.createdAt}</span>
                    <span>Last Update: {t.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQs Accordion */}
        <div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 block mb-3">
            Frequently Asked Questions
          </span>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => {
                      sound.playPop();
                      setActiveFaq(isOpen ? null : index);
                    }}
                    className="w-full p-4 text-left flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
