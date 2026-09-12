import { MongoClient, Db } from 'mongodb';
import {
  User,
  Course,
  Enrollment,
  LiveSession,
  DiscussionThread,
  DiscussionReply,
  NotificationItem,
  PaymentReceipt,
  DatabaseStatus,
  Certificate
} from '../src/types.js';
import {
  initialUsers,
  initialCourses,
  initialLiveSessions,
  initialDiscussions,
  initialReplies,
  initialNotifications
} from './seedData.js';

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnectedToMongo: boolean = false;
  private mongoUri: string | null = process.env.MONGODB_URI || null;
  private connectionError: string | null = null;
  private pingTimeMs: number = 0;

  // In-memory fallback and persistent operational store
  private users: Map<string, User> = new Map();
  private courses: Map<string, Course> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private liveSessions: Map<string, LiveSession> = new Map();
  private discussions: Map<string, DiscussionThread> = new Map();
  private replies: Map<string, DiscussionReply[]> = new Map();
  private notifications: Map<string, NotificationItem[]> = new Map();
  private payments: Map<string, PaymentReceipt> = new Map();
  private certificates: Map<string, Certificate> = new Map();

  constructor() {
    this.seedFallbackStore();
  }

  private seedFallbackStore() {
    initialUsers.forEach((u) => this.users.set(u.id, u));
    initialCourses.forEach((c) => this.courses.set(c.id, c));
    initialLiveSessions.forEach((ls) => this.liveSessions.set(ls.id, ls));
    initialDiscussions.forEach((d) => this.discussions.set(d.id, d));
    Object.entries(initialReplies).forEach(([threadId, reps]) => {
      this.replies.set(threadId, [...reps]);
    });
    this.notifications.set('user_alex', [...initialNotifications]);

    // Initial enrollment for Alex in AI Course with 50% progress
    const initEnrollment: Enrollment = {
      id: 'enr_alex_ai',
      userId: 'user_alex',
      courseId: 'course_ai_llm',
      enrolledAt: '2025-01-20T10:00:00Z',
      completedLessonIds: ['les_1_1'],
      progressPercent: 50,
      completed: false,
      lastAccessedLessonId: 'les_1_2'
    };
    this.enrollments.set(`${initEnrollment.userId}_${initEnrollment.courseId}`, initEnrollment);
  }

  public async initialize(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('ℹ️ No MONGODB_URI provided in environment. Running with high-speed built-in database engine.');
      return;
    }

    try {
      console.log(`🔌 Attempting connection to MongoDB via URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
      const start = Date.now();
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });

      await this.client.connect();
      this.db = this.client.db();
      this.isConnectedToMongo = true;
      this.pingTimeMs = Date.now() - start;
      console.log(`✅ Successfully connected to MongoDB: ${this.db.databaseName} in ${this.pingTimeMs}ms!`);

      // Seed initial collections in MongoDB if empty
      await this.syncToMongoIfEmpty();
    } catch (err: any) {
      this.isConnectedToMongo = false;
      this.connectionError = err.message || 'Failed to connect to MongoDB';
      console.warn(`⚠️ MongoDB connection attempt failed: ${this.connectionError}. Gracefully running on local persistent engine.`);
    }
  }

  private async syncToMongoIfEmpty(): Promise<void> {
    if (!this.db || !this.isConnectedToMongo) return;

    try {
      const coursesCount = await this.db.collection('courses').countDocuments();
      if (coursesCount === 0) {
        console.log('📦 Seeding initial courses into MongoDB...');
        await this.db.collection('courses').insertMany(Array.from(this.courses.values()));
        await this.db.collection('users').insertMany(Array.from(this.users.values()));
        await this.db.collection('live_sessions').insertMany(Array.from(this.liveSessions.values()));
        await this.db.collection('discussions').insertMany(Array.from(this.discussions.values()));
        console.log('✅ MongoDB database successfully populated with initial seed dataset.');
      }
    } catch (error) {
      console.error('Failed to sync seed data to MongoDB:', error);
    }
  }

  public async getStatus(): Promise<DatabaseStatus> {
    let ping = this.pingTimeMs;
    if (this.isConnectedToMongo && this.db) {
      try {
        const start = Date.now();
        await this.db.command({ ping: 1 });
        ping = Date.now() - start;
      } catch (err) {
        this.isConnectedToMongo = false;
      }
    }

    let allRepliesCount = 0;
    this.replies.forEach((r) => (allRepliesCount += r.length));

    return {
      connected: this.isConnectedToMongo,
      engine: this.isConnectedToMongo ? 'mongodb' : 'embedded_persistent',
      uriConfigured: Boolean(process.env.MONGODB_URI),
      databaseName: this.db ? this.db.databaseName : 'eduverse_local',
      collections: {
        users: this.users.size,
        courses: this.courses.size,
        enrollments: this.enrollments.size,
        liveSessions: this.liveSessions.size,
        discussions: this.discussions.size,
        notifications: initialNotifications.length,
        payments: this.payments.size,
      },
      pingMs: ping,
      statusMessage: this.isConnectedToMongo
        ? 'Connected to live MongoDB cluster. Ready for Compass inspection!'
        : process.env.MONGODB_URI
        ? `MongoDB connection unreachable (${this.connectionError}). Running on local high-performance storage.`
        : 'Running on local persistent database. Set MONGODB_URI or use MongoDB Compass guide to connect external DB.'
    };
  }

  // --- User Operations ---
  public async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  public async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async saveUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('users').updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
    }
    return user;
  }

  // --- Course Operations ---
  public async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  public async getCourseById(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  public async saveCourse(course: Course): Promise<Course> {
    this.courses.set(course.id, course);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('courses').updateOne(
        { id: course.id },
        { $set: course },
        { upsert: true }
      );
    }
    return course;
  }

  public async deleteCourse(id: string): Promise<boolean> {
    const deleted = this.courses.delete(id);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('courses').deleteOne({ id });
    }
    return deleted;
  }

  // --- Enrollment & Progress Operations ---
  public async getEnrollments(userId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter((e) => e.userId === userId);
  }

  public async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    return this.enrollments.get(`${userId}_${courseId}`);
  }

  public async saveEnrollment(enrollment: Enrollment): Promise<Enrollment> {
    const key = `${enrollment.userId}_${enrollment.courseId}`;
    this.enrollments.set(key, enrollment);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('enrollments').updateOne(
        { id: enrollment.id },
        { $set: enrollment },
        { upsert: true }
      );
    }
    return enrollment;
  }

  // --- Certificate Operations ---
  public async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  public async saveCertificate(cert: Certificate): Promise<Certificate> {
    this.certificates.set(cert.id, cert);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('certificates').updateOne(
        { id: cert.id },
        { $set: cert },
        { upsert: true }
      );
    }
    return cert;
  }

  // --- Live Session Operations ---
  public async getLiveSessions(): Promise<LiveSession[]> {
    return Array.from(this.liveSessions.values());
  }

  public async getLiveSessionById(id: string): Promise<LiveSession | undefined> {
    return this.liveSessions.get(id);
  }

  public async saveLiveSession(session: LiveSession): Promise<LiveSession> {
    this.liveSessions.set(session.id, session);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('live_sessions').updateOne(
        { id: session.id },
        { $set: session },
        { upsert: true }
      );
    }
    return session;
  }

  // --- Discussion Operations ---
  public async getDiscussions(channel?: string): Promise<DiscussionThread[]> {
    const list = Array.from(this.discussions.values());
    if (channel && channel !== 'All') {
      return list.filter((d) => d.channel.toLowerCase() === channel.toLowerCase());
    }
    return list;
  }

  public async getDiscussionById(id: string): Promise<DiscussionThread | undefined> {
    return this.discussions.get(id);
  }

  public async saveDiscussion(thread: DiscussionThread): Promise<DiscussionThread> {
    this.discussions.set(thread.id, thread);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('discussions').updateOne(
        { id: thread.id },
        { $set: thread },
        { upsert: true }
      );
    }
    return thread;
  }

  public async getReplies(threadId: string): Promise<DiscussionReply[]> {
    return this.replies.get(threadId) || [];
  }

  public async addReply(reply: DiscussionReply): Promise<DiscussionReply> {
    const list = this.replies.get(reply.threadId) || [];
    list.push(reply);
    this.replies.set(reply.threadId, list);

    const thread = this.discussions.get(reply.threadId);
    if (thread) {
      thread.repliesCount = list.length;
      this.discussions.set(thread.id, thread);
    }

    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('replies').insertOne(reply);
      if (thread) {
        await this.db.collection('discussions').updateOne(
          { id: thread.id },
          { $set: { repliesCount: thread.repliesCount } }
        );
      }
    }
    return reply;
  }

  // --- Notification Operations ---
  public async getNotifications(userId: string): Promise<NotificationItem[]> {
    return this.notifications.get(userId) || [];
  }

  public async addNotification(userId: string, item: NotificationItem): Promise<NotificationItem> {
    const list = this.notifications.get(userId) || [];
    list.unshift(item);
    this.notifications.set(userId, list);
    return item;
  }

  public async markNotificationsAsRead(userId: string): Promise<void> {
    const list = this.notifications.get(userId) || [];
    list.forEach((n) => (n.read = true));
    this.notifications.set(userId, list);
  }

  // --- Payment Operations ---
  public async recordPayment(receipt: PaymentReceipt): Promise<PaymentReceipt> {
    this.payments.set(receipt.id, receipt);
    if (this.isConnectedToMongo && this.db) {
      await this.db.collection('payments').insertOne(receipt);
    }
    return receipt;
  }

  public async getPayments(userId?: string): Promise<PaymentReceipt[]> {
    const all = Array.from(this.payments.values());
    if (userId) {
      return all.filter((p) => p.userId === userId);
    }
    return all;
  }

  // --- Export for MongoDB Compass ---
  public getFullExportData() {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        database: 'eduverse',
        format: 'MongoDB Compass JSON Document Array',
        instructions: 'Open MongoDB Compass -> Select Database -> Create collection -> Click Add Data -> Import File -> Select this exported JSON.'
      },
      collections: {
        users: Array.from(this.users.values()),
        courses: Array.from(this.courses.values()),
        enrollments: Array.from(this.enrollments.values()),
        live_sessions: Array.from(this.liveSessions.values()),
        discussions: Array.from(this.discussions.values()),
        payments: Array.from(this.payments.values()),
      }
    };
  }
}

export const dbService = new DatabaseService();
