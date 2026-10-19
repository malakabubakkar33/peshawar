import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Send, Phone, PhoneOff, Mic, MicOff, Volume2, 
  CheckCheck, ShieldCheck, Star, Sparkles
} from 'lucide-react';
import { sound } from '../lib/sound';

export interface ChatMessage {
  id: string;
  sender: 'passenger' | 'driver';
  text: string;
  timestamp: string;
  read?: boolean;
}

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  driverRating?: number;
  vehicleModel?: string;
  vehiclePlate?: string;
  onOpenCall?: () => void;
}

const PRESET_QUICK_CHIPS = [
  "Main bahar gate pe intezar kar raha hoon",
  "Kahan tak pohanche hain?",
  "Main BRT station ke samne khara hoon",
  "White Honda Civic hai na?",
  "Please AC on rakhna",
  "2 minutes mein bahar aa raha hoon"
];

const AUTO_REPLIES = [
  { trigger: 'gate', reply: 'Theek hai bhai, main gate ke bilkul samne hazard lights on kar ke rok raha hoon.' },
  { trigger: 'kahan', reply: 'Bhai bas University Road BRT flyover cross kar raha hoon, 2 minute lagengay.' },
  { trigger: 'brt', reply: 'Zabardast, main BRT pillar ke paas slip road pe aa raha hoon.' },
  { trigger: 'civic', reply: 'Ji bilkul, White Civic PWA-7421 hai, roof pe SafarGo sticker bhi laga hai.' },
  { trigger: 'ac', reply: 'Bilkul bhai, AC high pe chal raha hai, chill ride hogi.' },
  { trigger: 'minute', reply: 'Koi jaldi nahi bhai, aaram se aa jayen main yahan wait kar raha hoon.' },
  { trigger: 'default', reply: 'Ji bhai main ne message dekh liya hai, seedha aap ki location ki taraf aa raha hoon.' }
];

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Usman Khan',
  driverRating = 4.8,
  vehicleModel = 'Honda Civic • White',
  vehiclePlate = 'PWA-7421',
  onOpenCall
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'driver',
      text: 'Assalam-o-Alaikum! Main aap ki taraf aa raha hoon. Location par puhanch kar horn doon ga.',
      timestamp: 'Just now',
      read: true
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    sound.playClick();

    const passengerMsg: ChatMessage = {
      id: `p-${Date.now()}`,
      sender: 'passenger',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    setMessages(prev => [...prev, passengerMsg]);
    setInputText('');

    // Trigger driver typing simulation
    setIsTyping(true);

    const lower = text.toLowerCase();
    const matched = AUTO_REPLIES.find(r => r.trigger !== 'default' && lower.includes(r.trigger)) || 
      AUTO_REPLIES.find(r => r.trigger === 'default')!;

    setTimeout(() => {
      setIsTyping(false);
      sound.playPop();

      const driverMsg: ChatMessage = {
        id: `d-${Date.now()}`,
        sender: 'driver',
        text: matched.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      };

      setMessages(prev => [...prev, driverMsg]);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[92vh] border border-slate-200"
      >
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 p-0.5 shadow-md">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-black text-lime-400 text-sm">
                  UK
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-white text-base leading-tight">{driverName}</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                  {driverRating}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <span>{vehicleModel}</span>
                <span className="font-mono font-bold text-lime-400 px-1.5 py-0.2 bg-slate-800/80 rounded border border-slate-700">
                  {vehiclePlate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCall && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCall();
                }}
                title="Call Driver"
                className="w-9 h-9 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 flex items-center justify-center transition-all shadow hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Safety & Encryption Banner */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end encrypted SafarGo In-App Chat</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Peshawar Dispatch</span>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]/70">
          {messages.map(msg => {
            const isPassenger = msg.sender === 'passenger';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isPassenger ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isPassenger
                      ? 'bg-slate-900 text-white rounded-br-none border border-slate-800'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {isPassenger && (
                    <CheckCheck className="w-3 h-3 text-lime-600" />
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-slate-500 text-xs bg-white px-3 py-2 rounded-2xl rounded-bl-none border border-slate-200 w-fit shadow-sm"
            >
              <span className="font-semibold text-slate-700 text-[11px]">{driverName} is typing</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-lime-600 shrink-0 ml-1" />
          {PRESET_QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 hover:bg-lime-50 hover:border-lime-300 text-slate-700 hover:text-lime-800 text-[11px] font-medium border border-slate-200/80 transition-all shrink-0 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text Input Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Type a message for driver Usman..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl bg-lime-500 hover:bg-lime-400 disabled:opacity-40 disabled:hover:bg-lime-500 text-slate-950 flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ========================================================
// SIMULATED IN-APP VOICE CALL SCREEN
// ========================================================
interface DriverCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  vehicleModel?: string;
}

export const DriverCallModal: React.FC<DriverCallModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Usman Khan',
  vehicleModel = 'Honda Civic • White (PWA-7421)'
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isOpen) {
      setCallStatus('ringing');
      setCallDuration(0);

      // Connect after 2.5 seconds
      timer = setTimeout(() => {
        setCallStatus('connected');
        sound.playSuccess();
      }, 2500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    sound.playClick();
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center border border-slate-800 text-center relative overflow-hidden"
      >
        {/* Glowing Orbs */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-lime-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* SafarGo VoIP Header */}
        <span className="text-[11px] font-bold text-lime-400 tracking-wider uppercase mb-6 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
          SafarGo Secure Voice Call
        </span>

        {/* Driver Avatar with Ripple Animation */}
        <div className="relative my-4">
          {callStatus === 'ringing' && (
            <div className="absolute inset-0 rounded-full bg-lime-400/30 animate-ping"></div>
          )}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500 p-1 relative z-10 shadow-2xl">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-lime-400">
              UK
            </div>
          </div>
        </div>

        {/* Driver Name & Status */}
        <h3 className="text-xl font-black text-white mt-2">{driverName}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{vehicleModel}</p>

        <div className="mt-3 py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold">
          {callStatus === 'ringing' && <span className="text-lime-400 animate-pulse">Ringing...</span>}
          {callStatus === 'connected' && <span className="text-emerald-400">{formatDuration(callDuration)}</span>}
          {callStatus === 'ended' && <span className="text-rose-400">Call Ended</span>}
        </div>

        {/* Audio Waveform Animation if Connected */}
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1.5 my-6 h-8">
            {[40, 75, 100, 60, 90, 45, 80, 65, 95, 50].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                transition={{ repeat: Infinity, duration: 0.6 + i * 0.1, ease: 'easeInOut' }}
                className="w-1 bg-lime-400 rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}

        {callStatus === 'ringing' && (
          <div className="h-8 my-6 flex items-center text-xs text-slate-500">
            Connecting via encrypted Peshawar network...
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-5 mt-6 w-full">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isSpeaker ? 'bg-lime-500 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
