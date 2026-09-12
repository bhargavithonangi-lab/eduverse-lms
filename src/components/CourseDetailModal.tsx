import React from 'react';
import { Course, Enrollment } from '../types.js';
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Video,
  FileText,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  enrollment?: Enrollment;
  onOpenPlayer: (course: Course) => void;
  onEnroll: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  enrollment,
  onOpenPlayer,
  onEnroll
}) => {
  if (!isOpen || !course) return null;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const isEnrolled = Boolean(enrollment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header with thumbnail backdrop */}
        <div className="relative bg-slate-900 text-white p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
                {course.category}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-300">{course.level}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
              {course.title}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{course.rating}</span>
                <span>({course.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{course.totalDurationHours} total hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4 text-slate-400" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-slate-800 text-sm">
          
          {/* What you'll learn */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Modules */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Course Syllabus ({course.modules.length} Modules, {totalLessons} Lessons)
            </h3>

            <div className="space-y-3">
              {course.modules.map((module, mIdx) => (
                <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 px-4 py-3 font-semibold text-xs text-slate-800 flex items-center justify-between">
                    <span>{module.title}</span>
                    <span className="text-slate-500 font-normal">{module.lessons.length} lessons</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          {lesson.quiz && (
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              Quiz
                            </span>
                          )}
                          <span>{lesson.durationMinutes} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="border-t border-slate-200 pt-6 flex items-start gap-4">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
            />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{course.instructorName}</div>
              <div className="text-indigo-600 font-medium">{course.instructorTitle}</div>
              <p className="text-slate-500 pt-1 leading-relaxed">
                Expert educator committed to helping learners master production technology and artificial intelligence architectures.
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-slate-900">
              ${course.discountPrice || course.price}
            </div>
            {course.discountPrice && (
              <span className="text-xs text-slate-400 line-through">Regular ${course.price}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
            {isEnrolled ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlayer(course);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                Continue Learning
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onEnroll(course);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                Enroll Now
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
