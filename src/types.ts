export type UserRole = 'learner' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  joinedDate: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'zip' | 'code' | 'link';
  url: string;
  size?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  contentMarkdown: string;
  quiz?: Quiz;
  flashcards?: Flashcard[];
  resources?: ResourceItem[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  discountPrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  published: boolean;
  featured?: boolean;
  totalDurationHours: number;
  modules: CourseModule[];
  learningOutcomes: string[];
  prerequisites: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  progressPercent: number;
  completed: boolean;
  completedAt?: string;
  certificateId?: string;
  lastAccessedLessonId?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  gradeScore: number;
  verificationCode: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'upcoming' | 'live' | 'completed';
  attendeesCount: number;
  streamUrl?: string;
  tags: string[];
}

export interface LiveChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
  isQuestion?: boolean;
}

export interface DiscussionThread {
  id: string;
  channel: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  tags: string[];
  isSolved?: boolean;
  repliesCount: number;
  courseId?: string;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  upvotes: number;
  isAcceptedSolution?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'live_session' | 'assignment' | 'course_update' | 'discussion' | 'payment';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: string;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  paymentMethod: 'credit_card' | 'upi' | 'paypal' | 'apple_pay';
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  invoiceNumber: string;
}

export interface DatabaseStatus {
  connected: boolean;
  engine: 'mongodb' | 'embedded_persistent';
  uriConfigured: boolean;
  databaseName: string;
  collections: {
    users: number;
    courses: number;
    enrollments: number;
    liveSessions: number;
    discussions: number;
    notifications: number;
    payments: number;
  };
  pingMs?: number;
  statusMessage: string;
}
