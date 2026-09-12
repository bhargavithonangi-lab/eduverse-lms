import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db.js';
import { askGeminiTutor } from './server/gemini.js';
import { User, Course, Enrollment, PaymentReceipt, DiscussionThread, DiscussionReply } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database (MongoDB or embedded fallback)
  await dbService.initialize();

  // --- API Routes ---

  // Database Status & MongoDB Compass Export
  app.get('/api/db/status', async (req, res) => {
    try {
      const status = await dbService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/seed-export', (req, res) => {
    try {
      const exportData = dbService.getFullExportData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="eduverse-mongodb-compass-seed.json"');
      res.json(exportData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth Endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, role } = req.body;
      const user = await dbService.getUserByEmail(email);
      if (user) {
        return res.json({ user, token: `mock_jwt_token_${user.id}` });
      }

      // If user doesn't exist yet, auto-register for seamless testing
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'New Learner',
        email,
        role: role || 'learner',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        title: role === 'instructor' ? 'Course Instructor' : 'Active Learner',
        bio: 'Enthusiastic participant on the EduVerse platform.',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      await dbService.saveUser(newUser);
      res.json({ user: newUser, token: `mock_jwt_token_${newUser.id}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/users', async (req, res) => {
    const users = await dbService.getUsers();
    res.json(users);
  });

  // Course Management Endpoints
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await dbService.getCourses();
      res.json(courses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await dbService.getCourseById(req.params.id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      res.json(course);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/courses', async (req, res) => {
    try {
      const courseData: Course = req.body;
      if (!courseData.id) {
        courseData.id = `course_${Date.now()}`;
      }
      courseData.createdAt = new Date().toISOString();
      courseData.updatedAt = new Date().toISOString();
      const saved = await dbService.saveCourse(courseData);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/courses/:id', async (req, res) => {
    try {
      const existing = await dbService.getCourseById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Course not found' });
      const updated: Course = {
        ...existing,
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      const saved = await dbService.saveCourse(updated);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/courses/:id', async (req, res) => {
    try {
      const success = await dbService.deleteCourse(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Enrollments & Progress Tracking
  app.get('/api/enrollments', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'user_alex';
      const enrollments = await dbService.getEnrollments(userId);
      res.json(enrollments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/enrollments', async (req, res) => {
    try {
      const { userId, courseId } = req.body;
      let enrollment = await dbService.getEnrollment(userId, courseId);
      if (!enrollment) {
        enrollment = {
          id: `enr_${Date.now()}`,
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          completedLessonIds: [],
          progressPercent: 0,
          completed: false
        };
        await dbService.saveEnrollment(enrollment);

        // Increment enrolled count on course
        const course = await dbService.getCourseById(courseId);
        if (course) {
          course.enrolledCount += 1;
          await dbService.saveCourse(course);
        }
      }
      res.json(enrollment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/enrollments/:courseId/progress', async (req, res) => {
    try {
      const { courseId } = req.params;
      const { userId, lessonId, completed } = req.body;
      const course = await dbService.getCourseById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });

      let enrollment = await dbService.getEnrollment(userId, courseId);
      if (!enrollment) {
        enrollment = {
          id: `enr_${Date.now()}`,
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          completedLessonIds: [],
          progressPercent: 0,
          completed: false
        };
      }

      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

      const completedSet = new Set(enrollment.completedLessonIds);
      if (completed) {
        completedSet.add(lessonId);
      } else {
        completedSet.delete(lessonId);
      }

      enrollment.completedLessonIds = Array.from(completedSet);
      enrollment.lastAccessedLessonId = lessonId;
      enrollment.progressPercent = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0;
      enrollment.completed = enrollment.progressPercent === 100;

      if (enrollment.completed && !enrollment.certificateId) {
        const certId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        enrollment.certificateId = certId;
        enrollment.completedAt = new Date().toISOString();

        // Save Certificate document
        const user = await dbService.getUserById(userId);
        await dbService.saveCertificate({
          id: certId,
          userId,
          userName: user?.name || 'EduVerse Scholar',
          courseId,
          courseTitle: course.title,
          instructorName: course.instructorName,
          issuedAt: new Date().toISOString(),
          gradeScore: 98,
          verificationCode: `VERIFY-${certId}`
        });

        // Add certificate notification
        await dbService.addNotification(userId, {
          id: `notif_${Date.now()}`,
          userId,
          type: 'assignment',
          title: '🎉 Course Completed & Certificate Issued!',
          message: `Congratulations! You have completed "${course.title}". Your official verified certificate is ready.`,
          link: 'progress',
          read: false,
          timestamp: 'Just now'
        });
      }

      await dbService.saveEnrollment(enrollment);
      res.json(enrollment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Certificate Endpoint
  app.get('/api/certificates/:id', async (req, res) => {
    try {
      const cert = await dbService.getCertificate(req.params.id);
      if (!cert) return res.status(404).json({ error: 'Certificate not found' });
      res.json(cert);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Live Virtual Classroom Endpoints
  app.get('/api/live-sessions', async (req, res) => {
    try {
      const sessions = await dbService.getLiveSessions();
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/live-sessions', async (req, res) => {
    try {
      const session = req.body;
      session.id = `live_${Date.now()}`;
      session.attendeesCount = 1;
      const saved = await dbService.saveLiveSession(session);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Discussion Channels Endpoints
  app.get('/api/discussions', async (req, res) => {
    try {
      const channel = req.query.channel as string;
      const discussions = await dbService.getDiscussions(channel);
      res.json(discussions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/discussions', async (req, res) => {
    try {
      const thread: DiscussionThread = {
        id: `disc_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        repliesCount: 0
      };
      const saved = await dbService.saveDiscussion(thread);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/discussions/:id/replies', async (req, res) => {
    try {
      const replies = await dbService.getReplies(req.params.id);
      res.json(replies);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/discussions/:id/replies', async (req, res) => {
    try {
      const reply: DiscussionReply = {
        id: `rep_${Date.now()}`,
        threadId: req.params.id,
        ...req.body,
        createdAt: new Date().toISOString(),
        upvotes: 0
      };
      const saved = await dbService.addReply(reply);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/discussions/:id/vote', async (req, res) => {
    try {
      const thread = await dbService.getDiscussionById(req.params.id);
      if (!thread) return res.status(404).json({ error: 'Thread not found' });
      thread.upvotes = (thread.upvotes || 0) + 1;
      await dbService.saveDiscussion(thread);
      res.json({ upvotes: thread.upvotes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'user_alex';
      const list = await dbService.getNotifications(userId);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/read', async (req, res) => {
    try {
      const { userId } = req.body;
      await dbService.markNotificationsAsRead(userId || 'user_alex');
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Payment & Checkout Gateway Flow
  app.post('/api/payments/checkout', async (req, res) => {
    try {
      const { userId, courseId, paymentMethod, cardDetails } = req.body;
      const course = await dbService.getCourseById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const user = await dbService.getUserById(userId);
      const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const receipt: PaymentReceipt = {
        id: `pay_${Date.now()}`,
        userId,
        userEmail: user?.email || 'customer@eduverse.io',
        courseId,
        courseTitle: course.title,
        amount: course.discountPrice || course.price,
        paymentMethod: paymentMethod || 'credit_card',
        transactionId,
        status: 'completed',
        createdAt: new Date().toISOString(),
        invoiceNumber
      };

      await dbService.recordPayment(receipt);

      // Auto-enroll user in the purchased course
      let enrollment = await dbService.getEnrollment(userId, courseId);
      if (!enrollment) {
        enrollment = {
          id: `enr_${Date.now()}`,
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          completedLessonIds: [],
          progressPercent: 0,
          completed: false
        };
        await dbService.saveEnrollment(enrollment);
        course.enrolledCount += 1;
        await dbService.saveCourse(course);
      }

      // Add payment notification
      await dbService.addNotification(userId, {
        id: `notif_${Date.now()}`,
        userId,
        type: 'payment',
        title: 'Payment Confirmed & Access Granted!',
        message: `Your payment of $${receipt.amount} for "${course.title}" was successful. Order ID: ${receipt.transactionId}.`,
        link: 'courses',
        read: false,
        timestamp: 'Just now'
      });

      res.status(201).json({ receipt, enrollment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Gemini AI Interactive Tutor Endpoint
  app.post('/api/gemini/tutor', async (req, res) => {
    try {
      const result = await askGeminiTutor(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.status(500).json({ error: err.message || 'Gemini AI service error' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EduVerse Learning Platform Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
