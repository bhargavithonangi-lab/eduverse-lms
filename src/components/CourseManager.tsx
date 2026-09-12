import React, { useState } from 'react';
import { Course, User } from '../types.js';
import { api } from '../lib/api.js';
import {
  PlusCircle,
  BookOpen,
  DollarSign,
  Users,
  Star,
  Sparkles,
  Check,
  Trash2,
  Edit,
  Video,
  Eye,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface CourseManagerProps {
  currentUser: User;
  courses: Course[];
  onRefreshCourses: () => void;
  onPreviewCourse: (course: Course) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  currentUser,
  courses,
  onRefreshCourses,
  onPreviewCourse
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // New Course Builder State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [price, setPrice] = useState('59');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');

  // Lessons builder state
  const [modules, setModules] = useState([
    {
      id: 'mod_1',
      title: 'Module 1: Foundations & Architecture',
      order: 1,
      lessons: [
        {
          id: `les_${Date.now()}_1`,
          title: '1.1 System Design & API Contract',
          durationMinutes: 18,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          contentMarkdown: '# Lesson Overview\n\nIn this lesson, we study the core architectural principles and data storage models.',
          order: 1
        }
      ]
    }
  ]);

  // AI Syllabus Generator
  const handleGenerateAiCurriculum = async () => {
    if (!title.trim()) {
      alert('Please enter a course title first!');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const prompt = `Generate a realistic 2-module course curriculum for "${title}" in the category of "${category}".`;
      const res = await api.askTutor({
        action: 'chat',
        message: prompt,
        courseTitle: title
      });

      setShortDesc(`Complete hands-on masterclass on ${title}.`);
      setDesc(res.text || `Comprehensive practical curriculum on ${title}, covering architecture, state machines, and real-world deployment patterns.`);

      // Add a second module automatically
      setModules([
        {
          id: 'mod_1',
          title: 'Module 1: Core Fundamentals & Principles',
          order: 1,
          lessons: [
            {
              id: `les_${Date.now()}_1`,
              title: `1.1 Introduction to ${title}`,
              durationMinutes: 15,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              contentMarkdown: `# Core Foundations\n\nMaster the essential primitives and design patterns for ${title}.`,
              order: 1
            },
            {
              id: `les_${Date.now()}_2`,
              title: `1.2 Implementation Deep-Dive`,
              durationMinutes: 22,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              contentMarkdown: `# Implementation\n\nStep-by-step practical coding patterns and best practices.`,
              order: 2
            }
          ]
        },
        {
          id: 'mod_2',
          title: 'Module 2: Production Scale & Deployment',
          order: 2,
          lessons: [
            {
              id: `les_${Date.now()}_3`,
              title: `2.1 Database Integration & Optimization`,
              durationMinutes: 25,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
              contentMarkdown: `# Production Patterns\n\nConnecting external MongoDB Compass databases and managing environment secrets.`,
              order: 1
            }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.createCourse({
        title,
        shortDescription: shortDesc || 'Hands-on practical curriculum.',
        description: desc || 'Detailed course content and comprehensive modules.',
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        instructorAvatar: currentUser.avatar,
        instructorTitle: currentUser.title || 'Senior Instructor',
        category,
        level,
        price: parseFloat(price) || 49,
        thumbnail,
        modules,
        learningOutcomes: [
          `Master ${title} architecture and core APIs`,
          'Build and deploy production-ready cloud applications',
          'Integrate scalable MongoDB databases and Gemini AI'
        ],
        prerequisites: ['Basic programming knowledge', 'Familiarity with web technologies'],
        tags: [category, level, 'Tech']
      });

      setShowBuilder(false);
      setTitle('');
      setShortDesc('');
      setDesc('');
      onRefreshCourses();
    } catch (err) {
      console.error('Failed to create course', err);
    }
  };

  // Instructor metrics
  const instructorCourses = courses.filter(
    (c) => currentUser.role === 'admin' || c.instructorId === currentUser.id
  );
  const totalStudents = instructorCourses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const totalRevenue = instructorCourses.reduce((acc, c) => acc + c.price * c.enrolledCount, 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Studio Banner & Metrics */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-purple-400 tracking-wider">
              Instructor Studio & Course Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create, Curate & Distribute Courses
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Add curriculum lessons, attach quizzes and video URLs, and persist everything directly into MongoDB.
            </p>
          </div>

          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            {showBuilder ? 'Close Builder' : 'Create New Course'}
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-purple-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" /> Total Active Students
            </div>
            <div className="text-2xl font-black">{totalStudents.toLocaleString()}</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-emerald-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Platform Revenue
            </div>
            <div className="text-2xl font-black">${totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 space-y-1">
            <div className="text-xs text-amber-200 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" /> Average Rating
            </div>
            <div className="text-2xl font-black">4.9 / 5.0</div>
          </div>
        </div>
      </div>

      {/* Course Builder Modal / Form */}
      {showBuilder && (
        <div className="bg-white rounded-3xl border border-purple-200 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">New Course Authoring Studio</h2>
              <p className="text-xs text-slate-500">
                Craft syllabus modules, setup interactive videos, and utilize Gemini AI for automatic syllabus generation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiCurriculum}
              disabled={isGeneratingAi}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingAi ? 'Generating Curriculum...' : 'Gemini AI Auto-Generate'}
            </button>
          </div>

          <form onSubmit={handleSaveCourse} className="space-y-6 text-xs sm:text-sm">
            
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js & MongoDB Production Architecture"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={level}
                  onChange={(e: any) => setLevel(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="One-line summary for course card..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Curriculum Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Comprehensive syllabus overview..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Modules and Lessons preview */}
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700">Course Curriculum Modules ({modules.length})</label>
              {modules.map((m, mIdx) => (
                <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="font-bold text-slate-800 text-xs">{m.title}</div>
                  <div className="space-y-2">
                    {m.lessons.map((les) => (
                      <div key={les.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-medium">{les.title}</span>
                        </div>
                        <span className="text-slate-400">{les.durationMinutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-sm"
              >
                Publish & Save Course to Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Published Courses Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Live Courses Under Management ({instructorCourses.length})
          </h2>
          <span className="text-xs text-slate-500">Auto-synchronized with MongoDB</span>
        </div>

        <div className="divide-y divide-slate-100">
          {instructorCourses.map((course) => (
            <div key={course.id} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{course.title}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">{course.category}</span>
                    <span>${course.price}</span>
                    <span>{course.enrolledCount} learners</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onPreviewCourse(course)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Player
                </button>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                  Published
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
