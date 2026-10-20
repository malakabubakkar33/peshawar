import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { sound } from '../lib/sound';

export interface TopErrorToastProps {
  message: string | null;
  onDismiss: () => void;
  title?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

export const TopErrorToast: React.FC<TopErrorToastProps> = ({
  message,
  onDismiss,
  title,
  type = 'error',
  duration = 5000
}) => {
  useEffect(() => {
    if (!message) return;

    if (type === 'error') {
      sound.playError();
    } else if (type === 'success') {
      sound.playSuccess();
    } else {
      sound.playPop();
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss, type]);

  if (!message) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 text-white border-emerald-500/40 shadow-emerald-950/20',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          titleColor: 'text-emerald-300',
          defaultTitle: 'Success',
          icon: <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 text-white border-amber-500/40 shadow-amber-950/20',
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          titleColor: 'text-amber-300',
          defaultTitle: 'Warning',
          icon: <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        };
      case 'info':
        return {
          bg: 'bg-slate-900/90 text-white border-sky-500/40 shadow-slate-950/20',
          iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
          titleColor: 'text-sky-300',
          defaultTitle: 'Information',
          icon: <Info className="w-5 h-5 stroke-[2.2]" />
        };
      case 'error':
      default:
        return {
          bg: 'bg-slate-950/95 text-white border-red-500/40 shadow-[0_16px_40px_rgba(220,38,38,0.18)]',
          iconBg: 'bg-red-500/20 text-red-400 border border-red-500/30',
          titleColor: 'text-red-400',
          defaultTitle: 'Validation Error',
          icon: <AlertCircle className="w-5 h-5 stroke-[2.2]" />
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      <div className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-4 max-w-md mx-auto z-[9999] pointer-events-none select-none">
        <motion.div
          drag="y"
          dragConstraints={{ top: -120, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y < -30 || info.velocity.y < -300) {
              onDismiss();
            }
          }}
          initial={{ opacity: 0, y: -40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.94, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          onClick={onDismiss}
          className={`pointer-events-auto cursor-pointer backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border shadow-2xl flex items-start gap-3 transition-transform active:scale-[0.98] ${theme.bg}`}
          role="alert"
          aria-live="assertive"
        >
          {/* Icon Pod */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${theme.iconBg}`}>
            {theme.icon}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className={`text-xs font-extrabold uppercase tracking-wider leading-tight ${theme.titleColor}`}>
                {title || theme.defaultTitle}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                Swipe up or tap to dismiss
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-200 mt-1 leading-snug font-medium">
              {message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
