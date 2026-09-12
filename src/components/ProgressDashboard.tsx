import React from 'react';
import { Course, Enrollment, User } from '../types.js';
import {
  BarChart3,
  Award,
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ProgressDashboardProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  onOpenCourse: (course: Course) => void;
  onViewCertificate: (certificateId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  currentUser,
  courses,
  enrollments,
  onOpenCourse,
  onViewCertificate
}) => {
  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));

  const activeEnrollments = enrollments.filter((e) => !e.completed);
  const completedEnrollments = enrollments.filter((e) => e.completed);

  const totalLessonsCompleted = enrollments.reduce(
    (acc, e) => acc + (e.completedLessonIds?.length || 0),
    0
  );

  const totalStudyHours = Math.round(totalLessonsCompleted * 0.5 + 4);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Welcome & Stats Row */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md"
            />
            <div>
              <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                Learner Profile & Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {currentUser.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Keep up the momentum! You are in the top 5% of active learners this week.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-2xl border border-indigo-500/30">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
            <div>
              <div className="text-sm font-extrabold text-white">14 Days</div>
              <div className="text-[10px] text-indigo-300 uppercase font-semibold">Active Streak</div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-indigo-200 flex items-center gap-1.5 font-medium">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Enrolled Courses
            </div>
            <div className="text-2xl font-black">{enrollments.length}</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-emerald-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
            </div>
            <div className="text-2xl font-black">{completedEnrollments.length}</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-amber-200 flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-400" /> Total Hours
            </div>
            <div className="text-2xl font-black">{totalStudyHours}h</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-purple-200 flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-purple-400" /> Certificates
            </div>
            <div className="text-2xl font-black">{completedEnrollments.length}</div>
          </div>
        </div>
      </div>

      {/* In-Progress Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-indigo-600" />
          Active Courses ({activeEnrollments.length})
        </h2>

        {activeEnrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No in-progress courses. Browse the catalog to start learning!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEnrollments.map((enr) => {
              const course = courseMap.get(enr.courseId);
              if (!course) return null;

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1 truncate">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm truncate">{course.title}</h3>
                      <p className="text-xs text-slate-500">Instructor: {course.instructorName}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Course Progress</span>
                      <span>{enr.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCourse(course)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Resume Next Lesson
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Courses & Certificates */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          Completed Courses & Verified Credentials
        </h2>

        {completedEnrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Complete all lessons in a course to earn official, verifiable credentials!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedEnrollments.map((enr) => {
              const course = courseMap.get(enr.courseId);
              if (!course) return null;

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4 bg-emerald-50/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> Accredited & Verified
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
                      <p className="text-xs text-slate-500">
                        Completed on {new Date(enr.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                    <span className="text-xs font-mono text-slate-500">{enr.certificateId}</span>
                    <button
                      onClick={() => onViewCertificate(enr.certificateId!)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Award className="w-3.5 h-3.5" />
                      View Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
