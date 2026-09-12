import {
  Course,
  Enrollment,
  LiveSession,
  DiscussionThread,
  DiscussionReply,
  NotificationItem,
  PaymentReceipt,
  DatabaseStatus,
  User,
  Certificate
} from '../types.js';

export const api = {
  // Database status
  async getDbStatus(): Promise<DatabaseStatus> {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  // Auth
  async login(email: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourse(id: string): Promise<Course> {
    const res = await fetch(`/api/courses/${id}`);
    if (!res.ok) throw new Error('Failed to fetch course');
    return res.json();
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    if (!res.ok) throw new Error('Failed to update course');
    return res.json();
  },

  async deleteCourse(id: string): Promise<boolean> {
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete course');
    const data = await res.json();
    return data.success;
  },

  // Enrollments
  async getEnrollments(userId: string): Promise<Enrollment[]> {
    const res = await fetch(`/api/enrollments?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId })
    });
    if (!res.ok) throw new Error('Failed to enroll');
    return res.json();
  },

  async updateProgress(courseId: string, userId: string, lessonId: string, completed: boolean): Promise<Enrollment> {
    const res = await fetch(`/api/enrollments/${courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, completed })
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  async getCertificate(id: string): Promise<Certificate> {
    const res = await fetch(`/api/certificates/${id}`);
    if (!res.ok) throw new Error('Failed to fetch certificate');
    return res.json();
  },

  // Live Sessions
  async getLiveSessions(): Promise<LiveSession[]> {
    const res = await fetch('/api/live-sessions');
    if (!res.ok) throw new Error('Failed to fetch live sessions');
    return res.json();
  },

  async createLiveSession(session: Partial<LiveSession>): Promise<LiveSession> {
    const res = await fetch('/api/live-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to create live session');
    return res.json();
  },

  // Discussions
  async getDiscussions(channel?: string): Promise<DiscussionThread[]> {
    const url = channel && channel !== 'All' ? `/api/discussions?channel=${encodeURIComponent(channel)}` : '/api/discussions';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch discussions');
    return res.json();
  },

  async createDiscussion(thread: Partial<DiscussionThread>): Promise<DiscussionThread> {
    const res = await fetch('/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thread)
    });
    if (!res.ok) throw new Error('Failed to create discussion');
    return res.json();
  },

  async getReplies(threadId: string): Promise<DiscussionReply[]> {
    const res = await fetch(`/api/discussions/${threadId}/replies`);
    if (!res.ok) throw new Error('Failed to fetch replies');
    return res.json();
  },

  async addReply(threadId: string, reply: Partial<DiscussionReply>): Promise<DiscussionReply> {
    const res = await fetch(`/api/discussions/${threadId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    });
    if (!res.ok) throw new Error('Failed to post reply');
    return res.json();
  },

  async voteThread(threadId: string): Promise<{ upvotes: number }> {
    const res = await fetch(`/api/discussions/${threadId}/vote`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationsRead(userId: string): Promise<void> {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  },

  // Checkout & Payment
  async checkout(payload: {
    userId: string;
    courseId: string;
    paymentMethod: string;
    cardDetails?: any;
  }): Promise<{ receipt: PaymentReceipt; enrollment: Enrollment }> {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Checkout failed');
    return res.json();
  },

  async processPayment(payload: {
    userId: string;
    courseId: string;
    amount?: number;
    paymentMethod: string;
    cardDetails?: any;
  }): Promise<{ payment: any; enrollment: Enrollment }> {
    const result = await this.checkout(payload);
    return {
      payment: result.receipt,
      enrollment: result.enrollment
    };
  },

  // Gemini AI Tutor
  async askTutor(payload: {
    action: 'explain' | 'quiz' | 'summarize' | 'debug' | 'chat';
    message: string;
    courseTitle?: string;
    lessonTitle?: string;
    lessonContent?: string;
    codeSnippet?: string;
  }): Promise<any> {
    const res = await fetch('/api/gemini/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI Assistant request failed');
    return res.json();
  }
};
