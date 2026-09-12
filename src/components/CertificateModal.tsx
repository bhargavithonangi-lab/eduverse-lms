import React from 'react';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import { Course, User } from '../types.js';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string | null;
  course: Course | null;
  currentUser: User;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateId,
  course,
  currentUser
}) => {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden space-y-0">
        
        {/* Top actions bar */}
        <div className="bg-slate-900 px-6 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Verified Certificate</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card Content */}
        <div className="p-8 sm:p-12 text-center bg-radial from-white to-amber-50/40 relative overflow-hidden border-8 border-double border-amber-200 m-4 rounded-2xl">
          
          {/* Subtle watermark seal */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full pointer-events-none flex items-center justify-center">
            <Award className="w-32 h-32 text-amber-500/10" />
          </div>

          <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-200">
                <Award className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-amber-700">
                Certificate of Completion
              </h4>
              <p className="text-xs text-slate-500">This official accreditation certifies that</p>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight underline decoration-amber-300 underline-offset-8">
              {currentUser.name}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              has satisfactorily completed all modules, practical laboratory assignments, quizzes, and curriculum objectives for:
            </p>

            <h2 className="text-lg sm:text-xl font-bold text-indigo-950">
              {course.title}
            </h2>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-left text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Instructor</div>
                <div className="font-serif text-slate-800 text-sm italic font-semibold">{course.instructorName}</div>
                <div className="text-[10px] text-slate-500">{course.instructorTitle}</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Verification ID</div>
                <div className="font-mono text-slate-800 text-xs font-bold">{certificateId || 'CERT-98234-AI'}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Verified on MongoDB Ledger</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Shareable link: https://eduverse.learn/verify/{certificateId}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
