import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from '@phosphor-icons/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative w-full sm:max-w-lg bg-[#141414] border border-[#282828] rounded-t-xl sm:rounded-xl p-5 z-10 max-h-[85vh] overflow-y-auto text-[#EDEDED]"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#242424]">
              <h3 className="text-base font-serif-editorial font-bold text-[#EDEDED]">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-[#8E8E93] hover:text-[#EDEDED] rounded hover:bg-[#1E1E1E] transition"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
