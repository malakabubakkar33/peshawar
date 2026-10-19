import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSubtitle = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { img: 'w-14 h-14', title: 'text-2xl', sub: 'text-[9px] tracking-[0.2em]' },
    md: { img: 'w-20 h-20', title: 'text-3xl sm:text-[34px]', sub: 'text-[11px] tracking-[0.26em]' },
    lg: { img: 'w-28 h-28', title: 'text-4xl', sub: 'text-xs tracking-[0.28em]' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Exact Monogram Logo from reference */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="relative flex items-center justify-center cursor-pointer"
      >
        <img 
          src="/safar-go-monogram-exact.png" 
          alt="Safar Go Monogram" 
          className={`${currentSize.img} object-contain select-none drop-shadow-sm`}
        />
      </motion.div>

      {/* App Name: 'Safar Go' */}
      <div className="mt-2 text-center">
        <h1 className={`font-display font-extrabold ${currentSize.title} tracking-tight flex items-center justify-center gap-1.5`}>
          <span className="text-[#1e293b]">Safar</span>
          <span className="text-[#3ebd19]">Go</span>
        </h1>
        {showSubtitle && (
          <p className={`${currentSize.sub} text-slate-500 font-semibold uppercase mt-0.5 select-none`}>
            Ride &bull; Explore &bull; Peshawar
          </p>
        )}
      </div>
    </div>
  );
};
