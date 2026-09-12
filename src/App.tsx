import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, LiveSession, DiscussionThread, NotificationItem, DatabaseStatus } from './types.js';
import { api } from './lib/api.js';
import { Navbar } from './components/Navbar.js';
import { CourseCatalog } from './components/CourseCatalog.js';
import { CourseDetailModal } from './components/CourseDetailModal.js';
import { CoursePlayer } from './components/CoursePlayer.js';
import { LiveClasses } from './components/LiveClasses.js';
import { DiscussionChannels } from './components/DiscussionChannels.js';
import { ProgressDashboard } from './components/ProgressDashboard.js';
import { CourseManager } from './components/CourseManager.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { MongoGuideModal } from './components/MongoGuideModal.js';
import { CertificateModal } from './components/CertificateModal.js';
import { Loader2, Database, AlertTriangle, Sparkles } from 'lucide-react';

const SEED_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex.chen@learner.edu',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    title: 'Full Stack Enthusiast',
    joinedDate: '2026-01-15'
  },
  {
    id: 'user_sarah',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@eduverse.org',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'AI Research Lead & Ex-Google DeepMind',
    joinedDate: '2025-06-10'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@eduverse.org',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Principal Systems Architect',
    joinedDate: '2025-08-20'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.admin@eduverse.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Academic Platform Director',
    joinedDate: '2025-01-01'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'live' | 'discussions' | 'studio'>('courses');

  // Core Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Navigation
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [activePlayerCourse, setActivePlayerCourse] = useState<Course | null>(null);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [showMongoGuide, setShowMongoGuide] = useState(false);
  const [viewingCertificateId, setViewingCertificateId] = useState<string | null>(null);

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      const [coursesData, enrollmentsData, sessionsData, threadsData, notifsData, dbData] =
        await Promise.all([
          api.getCourses(),
          api.getEnrollments(currentUser.id),
          api.getLiveSessions(),
          api.getDiscussions(),
          api.getNotifications(currentUser.id),
          api.getDbStatus()
        ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setLiveSessions(sessionsData);
      setDiscussions(threadsData);
      setNotifications(notifsData);
      setDbStatus(dbData);
    } catch (err) {
      console.error('Failed to fetch initial application state', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser.id]);

  const handleRefreshDbStatus = async () => {
    try {
      const status = await api.getDbStatus();
      setDbStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollSuccess = async () => {
    if (checkoutCourse) {
      const courseToOpen = checkoutCourse;
      setCheckoutCourse(null);
      await fetchAllData();
      setActivePlayerCourse(courseToOpen);
    }
  };

  const handleProgressUpdated = (updatedEnrollment: Enrollment) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === updatedEnrollment.id ? updatedEnrollment : e))
    );
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Find enrolled course for certificate
  const certificateCourse = courses.find((c) => {
    const enr = enrollments.find((e) => e.certificateId === viewingCertificateId);
    return enr ? enr.courseId === c.id : false;
  }) || courses[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setActivePlayerCourse(null);
        }}
        availableUsers={SEED_USERS}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setActivePlayerCourse(null);
        }}
        dbStatus={dbStatus}
        onOpenMongoGuide={() => setShowMongoGuide(true)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              Connecting to EduVerse Services & Database Engine...
            </p>
          </div>
        ) : activePlayerCourse ? (
          /* Interactive Course Player View */
          <CoursePlayer
            course={activePlayerCourse}
            enrollment={enrollments.find((e) => e.courseId === activePlayerCourse.id)}
            currentUser={currentUser}
            onBack={() => setActivePlayerCourse(null)}
            onProgressUpdated={handleProgressUpdated}
            onViewCertificate={(certId) => setViewingCertificateId(certId)}
          />
        ) : (
          /* Primary Navigation Views */
          <>
            {activeTab === 'courses' && (
              <CourseCatalog
                courses={courses}
                enrollments={enrollments}
                currentUser={currentUser}
                onOpenCourse={(c) => setActivePlayerCourse(c)}
                onSelectCourseDetails={(c) => setSelectedCourseDetails(c)}
                onEnrollCourse={(c) => setCheckoutCourse(c)}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressDashboard
                currentUser={currentUser}
                courses={courses}
                enrollments={enrollments}
                onOpenCourse={(c) => setActivePlayerCourse(c)}
                onViewCertificate={(certId) => setViewingCertificateId(certId)}
              />
            )}

            {activeTab === 'live' && (
              <LiveClasses
                sessions={liveSessions}
                currentUser={currentUser}
                onRefreshSessions={fetchAllData}
              />
            )}

            {activeTab === 'discussions' && (
              <DiscussionChannels
                threads={discussions}
                currentUser={currentUser}
                onRefreshThreads={fetchAllData}
              />
            )}

            {activeTab === 'studio' && (
              <CourseManager
                currentUser={currentUser}
                courses={courses}
                onRefreshCourses={fetchAllData}
                onPreviewCourse={(c) => setActivePlayerCourse(c)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">EduVerse Online Learning Platform</span>
            <span>•</span>
            <span>Connected to {dbStatus?.connected ? 'MongoDB Atlas' : 'Embedded MongoDB Store'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMongoGuide(true)}
              className="hover:text-indigo-600 font-semibold transition"
            >
              VS Code & MongoDB Compass Guide
            </button>
            <span>•</span>
            <span>Interactive Gemini AI Tutor Enabled</span>
          </div>
        </div>
      </footer>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourseDetails}
        isOpen={Boolean(selectedCourseDetails)}
        onClose={() => setSelectedCourseDetails(null)}
        enrollment={
          selectedCourseDetails
            ? enrollments.find((e) => e.courseId === selectedCourseDetails.id)
            : undefined
        }
        onOpenPlayer={(c) => {
          setSelectedCourseDetails(null);
          setActivePlayerCourse(c);
        }}
        onEnroll={(c) => {
          setSelectedCourseDetails(null);
          setCheckoutCourse(c);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        course={checkoutCourse}
        currentUser={currentUser}
        isOpen={Boolean(checkoutCourse)}
        onClose={() => setCheckoutCourse(null)}
        onSuccess={handleEnrollSuccess}
      />

      {/* MongoDB Compass & VS Code Guide Modal */}
      <MongoGuideModal
        isOpen={showMongoGuide}
        onClose={() => setShowMongoGuide(false)}
        dbStatus={dbStatus}
        onRefreshStatus={handleRefreshDbStatus}
      />

      {/* Certificate Viewer Modal */}
      <CertificateModal
        isOpen={Boolean(viewingCertificateId)}
        onClose={() => setViewingCertificateId(null)}
        certificateId={viewingCertificateId}
        course={certificateCourse}
        currentUser={currentUser}
      />

    </div>
  );
}
