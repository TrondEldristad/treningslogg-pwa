import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#222]">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a2a2a] text-[#666] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[80vh] overflow-y-auto pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
