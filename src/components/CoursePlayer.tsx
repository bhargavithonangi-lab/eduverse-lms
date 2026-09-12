import React, { useState, useEffect } from 'react';
import { Course, Lesson, Enrollment, User, QuizQuestion } from '../types.js';
import { api } from '../lib/api.js';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BookMarked,
  FileCode,
  Download,
  Send,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Award,
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
  enrollment?: Enrollment;
  currentUser: User;
  onBack: () => void;
  onProgressUpdated: (enrollment: Enrollment) => void;
  onViewCertificate?: (certId: string) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  enrollment,
  currentUser,
  onBack,
  onProgressUpdated,
  onViewCertificate
}) => {
  // Find initial lesson
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const initialLesson =
    allLessons.find((l) => l.id === enrollment?.lastAccessedLessonId) ||
    allLessons[0] ||
    null;

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeToolTab, setActiveToolTab] = useState<'ai' | 'quiz' | 'flashcards' | 'notes' | 'resources'>('ai');

  // AI Tutor State
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; quizData?: any }>>([
    {
      sender: 'ai',
      text: `Hello ${currentUser.name}! I am your Gemini AI Tutor for **${course.title}**. Ask me to explain concepts simply, generate practice questions, or debug your code!`
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  // Notes State
  const [notesText, setNotesText] = useState(
    `# My Lesson Notes: ${currentLesson?.title || ''}\n\n- Key takeaway:\n- Questions to revisit:\n`
  );
  const [notesSaved, setNotesSaved] = useState(false);

  const completedIds = new Set(enrollment?.completedLessonIds || []);
  const isCurrentCompleted = currentLesson ? completedIds.has(currentLesson.id) : false;

  useEffect(() => {
    // Reset quiz and card index when lesson changes
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    if (currentLesson) {
      setNotesText(`# My Lesson Notes: ${currentLesson.title}\n\n- Key takeaway:\n- Questions to revisit:\n`);
    }
  }, [currentLesson?.id]);

  const toggleLessonCompletion = async () => {
    if (!currentLesson) return;
    try {
      const updated = await api.updateProgress(
        course.id,
        currentUser.id,
        currentLesson.id,
        !isCurrentCompleted
      );
      onProgressUpdated(updated);
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!currentLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  // AI Tutor prompt actions
  const sendTutorRequest = async (action: 'explain' | 'quiz' | 'summarize' | 'debug' | 'chat', customPrompt?: string) => {
    const query = customPrompt || tutorQuery;
    if (!query.trim()) return;

    const newMessages = [...tutorMessages, { sender: 'user' as const, text: query }];
    setTutorMessages(newMessages);
    setTutorQuery('');
    setIsAiLoading(true);

    try {
      const res = await api.askTutor({
        action,
        message: query,
        courseTitle: course.title,
        lessonTitle: currentLesson?.title,
        lessonContent: currentLesson?.contentMarkdown,
        codeSnippet: notesText
      });

      if (action === 'quiz' && res.questions) {
        setTutorMessages([
          ...newMessages,
          {
            sender: 'ai',
            text: `Here is a custom AI-generated quiz on **${currentLesson?.title || 'Key Concepts'}**:`,
            quizData: res
          }
        ]);
      } else {
        setTutorMessages([
          ...newMessages,
          { sender: 'ai', text: res.text || 'I analyzed the lesson and provided guidance above.' }
        ]);
      }
    } catch (err: any) {
      setTutorMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `Here is intuitive advice on this concept:\n\nRemember to break complex problems into smaller, testable functions and verify your boundary conditions.`
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quiz submission handler
  const handleQuizSubmit = () => {
    if (!currentLesson?.quiz) return;
    const questions = currentLesson.quiz.questions;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= currentLesson.quiz.passingScore && !isCurrentCompleted) {
      toggleLessonCompletion();
    }
  };

  const currentFlashcards = currentLesson?.flashcards || [
    {
      id: 'fc_def_1',
      front: 'What is the primary objective of this lesson?',
      back: 'To understand the fundamental data structures, API boundaries, and architecture patterns.'
    },
    {
      id: 'fc_def_2',
      front: 'How do we ensure reproducible deployments?',
      back: 'By isolating dependencies using containerization and explicit environment variables.'
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Bar Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{course.category}</div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{course.title}</h1>
          </div>
        </div>

        {/* Progress bar & Certificate status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">
              {enrollment?.progressPercent || 0}% Completed
            </div>
            <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${enrollment?.progressPercent || 0}%` }}
              />
            </div>
          </div>

          {enrollment?.completed && enrollment?.certificateId && (
            <button
              onClick={() => onViewCertificate && onViewCertificate(enrollment.certificateId!)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition animate-pulse"
            >
              <Award className="w-4 h-4" />
              View Certificate
            </button>
          )}

          <button
            onClick={toggleLessonCompletion}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isCurrentCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCurrentCompleted ? 'Completed' : 'Mark as Complete'}
          </button>
        </div>
      </div>

      {/* Main Grid: Player Area (Left) + Syllabus Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 cols: Video + Interactive Learning Tools */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Video Player Container */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {currentLesson?.videoUrl ? (
                <video
                  key={currentLesson.id}
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={course.thumbnail}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  playbackRate={playbackSpeed}
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Play className="w-12 h-12 mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm">Video lesson stream loading...</p>
                </div>
              )}
            </div>

            {/* Video Controls Sub-bar */}
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-0.5 rounded font-mono ${
                      playbackSpeed === s ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Prev / Next Lesson Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevLesson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={handleNextLesson}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 font-semibold"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Title & Text Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{currentLesson?.title}</h2>
              <span className="text-xs text-slate-500 font-medium">{currentLesson?.durationMinutes} minutes</span>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
              {currentLesson?.contentMarkdown}
            </div>
          </div>

          {/* Interactive Learning Tools Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Tool Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveToolTab('ai')}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeToolTab === 'ai'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Gemini AI Tutor
              </button>

              <button
                onClick={() => setActiveToolTab('quiz')}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeToolTab === 'quiz'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                Interactive Quiz
              </button>

              <button
                onClick={() => setActiveToolTab('flashcards')}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeToolTab === 'flashcards'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookMarked className="w-4 h-4 text-amber-600" />
                Flashcards
              </button>

              <button
                onClick={() => setActiveToolTab('notes')}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeToolTab === 'notes'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-4 h-4 text-emerald-600" />
                Code & Notes Scratchpad
              </button>

              <button
                onClick={() => setActiveToolTab('resources')}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeToolTab === 'resources'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Download className="w-4 h-4 text-blue-600" />
                Downloads & Assets
              </button>
            </div>

            {/* Tool Tab 1: Gemini AI Tutor */}
            {activeToolTab === 'ai' && (
              <div className="p-6 space-y-4">
                
                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => sendTutorRequest('explain', `Explain ${currentLesson?.title || 'this concept'} simply using the Feynman technique.`)}
                    className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition flex items-center gap-1 border border-indigo-200"
                  >
                    <Zap className="w-3 h-3 text-indigo-600" /> Explain Simply
                  </button>
                  <button
                    onClick={() => sendTutorRequest('summarize', `Summarize the top 3 critical takeaways from ${currentLesson?.title || 'this lesson'}.`)}
                    className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition border border-purple-200"
                  >
                    📝 Summarize Lesson
                  </button>
                  <button
                    onClick={() => sendTutorRequest('quiz', `Generate 3 practice questions for ${currentLesson?.title || 'this topic'}.`)}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition border border-emerald-200"
                  >
                    🎯 Test My Knowledge
                  </button>
                  <button
                    onClick={() => sendTutorRequest('debug', `Review my code notes for potential bugs or performance bottlenecks.`)}
                    className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition border border-amber-200"
                  >
                    🐞 Debug Code Notes
                  </button>
                </div>

                {/* Conversation Scroll */}
                <div className="max-h-80 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                  {tutorMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.sender === 'ai' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl max-w-xl leading-relaxed whitespace-pre-line ${
                          m.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        {m.text}

                        {/* If AI returned a structured quiz */}
                        {m.quizData && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                            <h4 className="font-bold text-indigo-700">{m.quizData.title}</h4>
                            {m.quizData.questions?.map((q: any, qIdx: number) => (
                              <div key={q.id || qIdx} className="bg-slate-50 p-3 rounded-lg space-y-1">
                                <p className="font-semibold text-slate-900">{qIdx + 1}. {q.question}</p>
                                <ul className="pl-4 list-disc space-y-0.5 text-xs text-slate-600">
                                  {q.options?.map((opt: string, optIdx: number) => (
                                    <li key={optIdx} className={optIdx === q.correctAnswerIndex ? 'font-bold text-emerald-700' : ''}>
                                      {opt} {optIdx === q.correctAnswerIndex && '✓ (Correct)'}
                                    </li>
                                  ))}
                                </ul>
                                <p className="text-[11px] text-slate-500 italic mt-1">Explanation: {q.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini is generating intuitive explanation...
                    </div>
                  )}
                </div>

                {/* Input box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendTutorRequest('chat');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    placeholder="Ask Gemini AI tutor about this lesson..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !tutorQuery.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* Tool Tab 2: Interactive Quiz */}
            {activeToolTab === 'quiz' && (
              <div className="p-6 space-y-6">
                {currentLesson?.quiz ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{currentLesson.quiz.title}</h3>
                        <p className="text-xs text-slate-500">Passing score: {currentLesson.quiz.passingScore}%</p>
                      </div>
                      {quizSubmitted && (
                        <div
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            quizScore! >= currentLesson.quiz.passingScore
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Your Score: {quizScore}% {quizScore! >= currentLesson.quiz.passingScore ? '• Passed! 🎉' : '• Try Again'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {currentLesson.quiz.questions.map((question, qIdx) => {
                        const selectedOption = selectedAnswers[qIdx];
                        const isCorrect = selectedOption === question.correctAnswerIndex;

                        return (
                          <div key={question.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {qIdx + 1}. {question.question}
                            </h4>

                            <div className="space-y-2">
                              {question.options.map((opt, optIdx) => {
                                let style = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700';

                                if (quizSubmitted) {
                                  if (optIdx === question.correctAnswerIndex) {
                                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                                  } else if (selectedOption === optIdx && !isCorrect) {
                                    style = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                                  }
                                } else if (selectedOption === optIdx) {
                                  style = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                                    className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition ${style}`}
                                  >
                                    <span>{opt}</span>
                                    {quizSubmitted && optIdx === question.correctAnswerIndex && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && (
                              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                                <span className="font-bold text-slate-800">Explanation: </span>
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      {quizSubmitted ? (
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(null);
                          }}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                        </button>
                      ) : (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(selectedAnswers).length < currentLesson.quiz.questions.length}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Submit Answers
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3">
                    <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800">No static quiz for this lesson</p>
                    <button
                      onClick={() => {
                        setActiveToolTab('ai');
                        sendTutorRequest('quiz', `Generate a custom practice quiz for ${currentLesson?.title}`);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Generate AI Quiz with Gemini
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tool Tab 3: Spaced Repetition Flashcards */}
            {activeToolTab === 'flashcards' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Card {currentCardIndex + 1} of {currentFlashcards.length}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    Mastered: {masteredCards.size} / {currentFlashcards.length}
                  </span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-56 p-8 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl cursor-pointer flex flex-col justify-between items-center text-center shadow-lg border border-slate-800 hover:scale-[1.01] transition"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                    {isFlipped ? 'Answer / Solution' : 'Question / Concept (Click to flip)'}
                  </span>

                  <p className="text-base sm:text-lg font-bold leading-relaxed px-4 max-w-lg">
                    {isFlipped
                      ? currentFlashcards[currentCardIndex].back
                      : currentFlashcards[currentCardIndex].front}
                  </p>

                  <span className="text-[11px] text-slate-400">Click card to rotate</span>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                    }}
                    disabled={currentCardIndex === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
                  >
                    Previous Card
                  </button>

                  <button
                    onClick={() => {
                      const newSet = new Set(masteredCards);
                      newSet.add(currentFlashcards[currentCardIndex].id);
                      setMasteredCards(newSet);
                      if (currentCardIndex < currentFlashcards.length - 1) {
                        setIsFlipped(false);
                        setCurrentCardIndex(currentCardIndex + 1);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> I Know This
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(Math.min(currentFlashcards.length - 1, currentCardIndex + 1));
                    }}
                    disabled={currentCardIndex === currentFlashcards.length - 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}

            {/* Tool Tab 4: Code & Notes Scratchpad */}
            {activeToolTab === 'notes' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Markdown & Code Editor</span>
                  {notesSaved && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Notes Saved Locally
                    </span>
                  )}
                </div>

                <textarea
                  value={notesText}
                  onChange={(e) => {
                    setNotesText(e.target.value);
                    setNotesSaved(false);
                  }}
                  rows={10}
                  className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-800"
                  placeholder="Write your notes, code snippets, or test questions here..."
                />

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setActiveToolTab('ai');
                      sendTutorRequest('debug', `Please analyze my code scratchpad:\n${notesText}`);
                    }}
                    className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-purple-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Ask Gemini to Review Code
                  </button>

                  <button
                    onClick={() => setNotesSaved(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}

            {/* Tool Tab 5: Downloads & Assets */}
            {activeToolTab === 'resources' && (
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Downloadable Lesson Resources</h3>
                {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {currentLesson.resources.map((res) => (
                      <div key={res.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          <Download className="w-4 h-4 text-indigo-600" />
                          <span>{res.title}</span>
                          {res.size && <span className="text-slate-400">({res.size})</span>}
                        </div>
                        <button
                          onClick={() => alert(`Downloading resource: ${res.title}`)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                    All starter assets are provided in the interactive sandbox above.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right 4 cols: Syllabus / Lesson List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Course Syllabus</span>
              <span className="text-xs text-slate-500 font-normal">
                {completedIds.size} / {allLessons.length} Done
              </span>
            </h3>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {course.modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-2">
                  <div className="font-bold text-xs text-slate-800 uppercase tracking-wider text-[10px] bg-slate-50 p-2 rounded-lg">
                    {module.title}
                  </div>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isSelected = lesson.id === currentLesson?.id;
                      const isCompleted = completedIds.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 truncate">
                            <div className="truncate">{lesson.title}</div>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              {lesson.durationMinutes} min {lesson.quiz ? '• Quiz' : ''}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
