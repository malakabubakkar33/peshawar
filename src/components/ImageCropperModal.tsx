import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, Move } from 'lucide-react';
import { sound } from '../lib/sound';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset transforms whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Mouse / Touch Drag Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    sound.playClick();
    setRotation(prev => (prev + 90) % 360);
  };

  // Perform High-Quality Canvas Crop Export
  const handleSaveCrop = useCallback(() => {
    if (!imageRef.current) return;
    sound.playSuccess();

    const outputSize = 512; // 512x512 high quality square/circular crop
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Circular clipping path
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Prepare transformations
    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const img = imageRef.current;
    const viewSize = 260; // diameter of preview crop circle in px
    const factor = outputSize / viewSize;

    const drawX = position.x * factor;
    const drawY = position.y * factor;
    const drawWidth = img.naturalWidth * (scale * (viewSize / Math.max(img.width, 1))) * factor;
    const drawHeight = img.naturalHeight * (scale * (viewSize / Math.max(img.height, 1))) * factor;

    // Draw image centered with applied pan and zoom
    ctx.drawImage(
      img,
      -drawWidth / 2 + drawX,
      -drawHeight / 2 + drawY,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Export crisp PNG data url
    const croppedDataUrl = canvas.toDataURL('image/png', 0.95);
    onCropComplete(croppedDataUrl);
    onClose();
  }, [position, rotation, scale, onCropComplete, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-lime-100 text-[#3ebd19] flex items-center justify-center">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Crop Profile Photo
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Drag and zoom to adjust your photo perfectly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Crop Viewport */}
          <div className="relative w-full h-72 sm:h-80 bg-slate-900 flex items-center justify-center overflow-hidden select-none cursor-move">
            {/* Draggable Image Layer */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source preview"
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  maxWidth: '260px',
                  maxHeight: '260px',
                  objectFit: 'contain'
                }}
                className="pointer-events-none drop-shadow-md"
              />
            </div>

            {/* Dark Mask Vignette with Clear Circle Cutout */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Circular Target Frame */}
              <div className="w-[260px] h-[260px] rounded-full border-2 border-dashed border-lime-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] relative">
                {/* Crosshair guide lines */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/30" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/30" />
              </div>
            </div>

            {/* Hint Badge */}
            <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 pointer-events-none border border-white/10">
              <Move className="w-3 h-3 text-lime-400" />
              <span>Drag photo to align</span>
            </div>
          </div>

          {/* Controls Bar: Zoom, Rotate & Slider */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#3ebd19]" />
                <span>Zoom</span>
              </span>

              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.max(0.6, prev - 0.15))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shadow-2xs"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3ebd19]"
                />
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.min(3, prev + 0.15))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shadow-2xs"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotate Button */}
              <button
                type="button"
                onClick={handleRotate}
                className="py-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 shadow-2xs transition"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#3ebd19]" />
                <span>Rotate</span>
              </button>
            </div>
          </div>

          {/* Actions: Cancel & Set Profile Photo */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#44b718] to-[#2ea012] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-lime-600/30 hover:brightness-105 active:scale-[0.98] transition"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply & Set Photo</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
