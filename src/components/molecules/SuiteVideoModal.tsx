import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SuiteVideoModalProps {
  isOpen: boolean;
  title: string;
  videoUrl: string;
  onClose: () => void;
}

export default function SuiteVideoModal({
  isOpen,
  title,
  videoUrl,
  onClose,
}: SuiteVideoModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Video de ${title}`}
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/85"
            aria-label="Cerrar video"
            onClick={onClose}
          />

          {/* Marco vertical 9:16 acotado al viewport (estilo Stories / Reels) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-[min(calc(100vw-1.5rem),calc((94svh-4rem)*9/16),420px)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0D0D11] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-3 py-2.5 sm:px-4">
              <div className="min-w-0 pr-3 text-left">
                <p className="font-heading text-[10px] uppercase tracking-[0.28em] text-magenta-digital">
                  Video de suite
                </p>
                <h3 className="truncate font-heading text-sm uppercase tracking-wide text-white sm:text-base">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition hover:border-magenta-digital/45 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-[9/16] w-full bg-black">
              <video
                key={videoUrl}
                src={videoUrl}
                className="absolute inset-0 h-full w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
