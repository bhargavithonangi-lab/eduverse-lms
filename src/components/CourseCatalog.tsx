import React, { useState, useMemo } from 'react';
import { Course, Enrollment, User } from '../types.js';
import {
  Search,
  BookOpen,
  Clock,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  PlayCircle,
  Layers
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  enrollments: Enrollment[];
  currentUser: User;
  onOpenCourse: (course: Course) => void;
  onSelectCourseDetails: (course: Course) => void;
  onEnrollCourse: (course: Course) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  enrollments,
  currentUser,
  onOpenCourse,
  onSelectCourseDetails,
  onEnrollCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = ['All', 'Artificial Intelligence', 'Web Development', 'Cloud & DevOps'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Map of courseId -> enrollment
  const enrollmentMap = useMemo(() => {
    const map = new Map<string, Enrollment>();
    enrollments.forEach((e) => map.set(e.courseId, e));
    return map;
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchLevel = selectedLevel === 'All' || c.level === selectedLevel;
      return matchSearch && matchCategory && matchLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-900/50 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Gen Interactive Learning Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Accelerate Your Tech Journey with Interactive Mastery
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Hands-on courses with real-time Gemini AI tutoring, live virtual classrooms, interactive quizzes, and scalable MongoDB storage architecture.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Learning Assistant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Certificates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>MongoDB Data Storage</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Level:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedLevel === lvl
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Explore Courses ({filteredCourses.length})
          </h2>
          <span className="text-xs text-slate-500">Self-paced with interactive labs</span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No courses found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search filters or browse all categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrollment = enrollmentMap.get(course.id);
              const isEnrolled = Boolean(enrollment);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                      <span>{course.category}</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{course.totalDurationHours}h</span>
                    </div>

                    {course.featured && (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                        Popular
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] text-slate-600">
                          {course.level}
                        </span>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{course.rating}</span>
                          <span className="text-slate-400 font-normal">({course.reviewCount})</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => onSelectCourseDetails(course)}
                        className="font-bold text-slate-900 text-base line-clamp-2 hover:text-indigo-600 cursor-pointer transition"
                      >
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="text-xs truncate">
                        <div className="font-semibold text-slate-800">{course.instructorName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{course.instructorTitle}</div>
                      </div>
                    </div>

                    {/* Enrolled Progress or Pricing */}
                    {isEnrolled ? (
                      <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                          <span>Progress</span>
                          <span>{enrollment?.progressPercent || 0}% Complete</span>
                        </div>
                        <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${enrollment?.progressPercent || 0}%` }}
                          />
                        </div>
                        <button
                          onClick={() => onOpenCourse(course)}
                          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Resume Lesson
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-black text-slate-900">
                            ${course.discountPrice || course.price}
                          </div>
                          {course.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ${course.price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectCourseDetails(course)}
                            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onEnrollCourse(course)}
                            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-1"
                          >
                            Enroll Now
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

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
