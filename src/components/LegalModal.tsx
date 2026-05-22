import { useEffect } from 'react';
import { X, Scale } from 'lucide-react';
import { LEGAL_DOCS, LegalKey } from '../lib/legalContent';

interface LegalModalProps {
  docKey: LegalKey | null;
  onClose: () => void;
}

export function LegalModal({ docKey, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!docKey) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [docKey, onClose]);

  if (!docKey) return null;
  const doc = LEGAL_DOCS[docKey];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-lago-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-lago-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-lago-800 flex-shrink-0 bg-gray-50 dark:bg-lago-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lago-100 dark:bg-lago-700 flex items-center justify-center">
              <Scale className="w-5 h-5 text-lago-600 dark:text-lago-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{doc.title}</h2>
              <p className="text-xs text-gray-500 dark:text-lago-400">SPET ONLINE | Effective 14 May 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-lago-700 border border-gray-200 dark:border-lago-600 text-gray-600 dark:text-lago-200 hover:bg-gray-100 dark:hover:bg-lago-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
          {doc.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                {section.heading}
              </h3>
              <div className="text-sm text-gray-600 dark:text-lago-200 leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-lago-800/50 border-t border-gray-200 dark:border-lago-800 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-lago-400">
            <span className="font-semibold">South African Law Reference: </span>
            {doc.legal}
          </p>
        </div>
      </div>
    </div>
  );
}
