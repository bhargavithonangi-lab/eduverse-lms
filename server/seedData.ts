import { Course, User, LiveSession, DiscussionThread, DiscussionReply, NotificationItem } from '../src/types.js';

export const initialUsers: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex.chen@learn.edu',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    title: 'Aspiring Full-Stack & AI Developer',
    bio: 'Passionate about building modern web applications, neural networks, and scalable distributed systems.',
    joinedDate: '2025-01-15'
  },
  {
    id: 'user_sarah',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@eduverse.io',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Senior AI Research Scientist & Educator',
    bio: 'Former ML Lead at TechCorp, 10+ years teaching artificial intelligence, deep learning, and scalable cloud architectures.',
    joinedDate: '2024-03-10'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@eduverse.io',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Principal Systems Architect',
    bio: '20+ years in full-stack web platforms, distributed databases, MongoDB clustering, and cloud resilience.',
    joinedDate: '2024-05-19'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'admin@eduverse.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'EduVerse Platform Administrator',
    bio: 'Overseeing curriculum compliance, platform security, and instructor partnerships.',
    joinedDate: '2023-11-01'
  }
];

export const initialCourses: Course[] = [
  {
    id: 'course_ai_llm',
    title: 'Mastering Generative AI & Large Language Models',
    slug: 'mastering-generative-ai-llms',
    shortDescription: 'From transformer fundamentals to building multi-agent AI systems with Gemini and RAG architectures.',
    description: 'A comprehensive journey into modern Generative Artificial Intelligence. Learn the core principles of Transformer attention mechanisms, prompt engineering methodologies, retrieval-augmented generation (RAG) with vector databases, fine-tuning techniques, and deployment of autonomous reasoning agents.',
    instructorId: 'user_sarah',
    instructorName: 'Dr. Sarah Lin',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    instructorTitle: 'Senior AI Research Scientist & Educator',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    price: 89,
    discountPrice: 69,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 428,
    enrolledCount: 3840,
    published: true,
    featured: true,
    totalDurationHours: 18.5,
    learningOutcomes: [
      'Architect and deploy high-performance RAG pipelines',
      'Integrate the Google Gemini SDK for multimodal streaming & tool use',
      'Optimize context windows, caching, and prompt chains',
      'Build autonomous AI agents with structured output schemas',
      'Deploy production-ready inference endpoints with monitoring'
    ],
    prerequisites: [
      'Basic knowledge of Python or JavaScript / TypeScript',
      'Understanding of REST APIs and JSON data exchange'
    ],
    createdAt: '2025-01-10',
    updatedAt: '2025-02-28',
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Foundations of Generative AI & Transformer Models',
        lessons: [
          {
            id: 'les_1_1',
            title: '1.1 The Evolution: From RNNs to Self-Attention Transformers',
            durationMinutes: 24,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            contentMarkdown: `### 1.1 The Evolution: From RNNs to Self-Attention Transformers

In this lesson, we explore why traditional Recurrent Neural Networks (RNNs) and LSTMs struggled with long-range dependencies due to vanishing gradients and sequential compute constraints.

#### Key Takeaways:
1. **Self-Attention Mechanism**: Allows the model to weigh the relevance of all tokens simultaneously, regardless of their distance in the text sequence.
2. **Positional Encodings**: Since self-attention is permutation-invariant, positional encodings inject sequence order information.
3. **Multi-Head Attention**: Gives the model the subspace representation power to jointly attend to information at different positions.

\`\`\`python
# Conceptual Self-Attention in PyTorch:
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(torch.tensor(d_k, dtype=torch.float32))
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    p_attn = F.softmax(scores, dim=-1)
    return torch.matmul(p_attn, V), p_attn
\`\`\`
`,
            quiz: {
              id: 'quiz_1_1',
              title: 'Self-Attention Fundamentals Check',
              passingScore: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'Why is the dot product of Query and Key scaled by sqrt(d_k)?',
                  options: [
                    'To reduce memory consumption',
                    'To prevent the dot products from growing large in magnitude, which pushes softmax into regions with tiny gradients',
                    'To ensure the output vectors are always positive',
                    'To convert matrix multiplication into addition'
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'Scaling by sqrt(d_k) stabilizes the variance of the dot products around 1, avoiding vanishing gradients in the softmax layer.'
                },
                {
                  id: 'q2',
                  question: 'What allows Transformer models to process tokens in parallel rather than sequentially?',
                  options: [
                    'Backpropagation through time',
                    'Convolutional pooling filters',
                    'Self-attention matrix computation across the entire sequence at once',
                    'Recurrent hidden states'
                  ],
                  correctAnswerIndex: 2,
                  explanation: 'Unlike recurrent architectures that must step token-by-token, self-attention computes relationships between all tokens in parallel via matrix multiplications.'
                }
              ]
            },
            flashcards: [
              {
                id: 'fc1',
                front: 'What is Query (Q), Key (K), and Value (V) in attention?',
                back: 'Q represents what the current token is seeking, K represents the identity/content of other tokens, and V contains the actual contextual representation delivered.',
                category: 'Attention'
              },
              {
                id: 'fc2',
                front: 'Why are positional encodings required in Transformer models?',
                back: 'Because standard self-attention is permutation-invariant; without positional signals, "dog bites man" and "man bites dog" would look identical to the attention mechanism.',
                category: 'Architecture'
              }
            ],
            resources: [
              {
                id: 'res_1',
                title: 'Attention Is All You Need (Annotated Paper).pdf',
                type: 'pdf',
                url: '#',
                size: '2.4 MB'
              },
              {
                id: 'res_2',
                title: 'Transformer-PyTorch-Starter.zip',
                type: 'zip',
                url: '#',
                size: '5.1 MB'
              }
            ]
          },
          {
            id: 'les_1_2',
            title: '1.2 Prompt Engineering & Structured JSON Output Schemas',
            durationMinutes: 30,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            contentMarkdown: `### 1.2 Prompt Engineering & Structured JSON Output Schemas

Building production applications requires deterministic, parsable outputs. In this session, we investigate prompt framing, few-shot conditioning, and utilizing native JSON Schema constraints.

#### Schema Enforcement Pattern:
\`\`\`typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: "Extract skill tags and difficulty from this course syllabus...",
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        difficultyScore: { type: Type.NUMBER }
      },
      required: ["skills", "difficultyScore"]
    }
  }
});
\`\`\`
`
          }
        ]
      },
      {
        id: 'mod_2',
        title: 'Module 2: Retrieval-Augmented Generation (RAG) & Vector Stores',
        lessons: [
          {
            id: 'les_2_1',
            title: '2.1 Chunking Strategies, Embeddings & Vector Similarity',
            durationMinutes: 35,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            contentMarkdown: `### 2.1 Chunking Strategies & Vector Similarity

Learn recursive text splitting, semantic chunking, embedding generation using \`gemini-embedding-2-preview\`, and cosine similarity matching.`
          }
        ]
      }
    ]
  },
  {
    id: 'course_fullstack_mongo',
    title: 'Full-Stack Web Development with React, Node.js & MongoDB',
    slug: 'fullstack-web-dev-react-node-mongodb',
    shortDescription: 'Build high-scale, production-grade applications with React 19, Express, TypeScript, and MongoDB Compass.',
    description: 'Learn end-to-end full-stack development. Master component architectures in React, create resilient REST APIs with Express & TypeScript, design scalable document schemas in MongoDB, and inspect live database clusters using MongoDB Compass.',
    instructorId: 'user_marcus',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    instructorTitle: 'Principal Systems Architect',
    category: 'Web Development',
    level: 'Beginner',
    price: 79,
    discountPrice: 49,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 312,
    enrolledCount: 4120,
    published: true,
    featured: true,
    totalDurationHours: 22.0,
    learningOutcomes: [
      'Set up and configure VS Code with production TypeScript toolchains',
      'Connect Express backends directly to MongoDB via MongoClient and Mongoose',
      'Debug and visualize data using MongoDB Compass GUI',
      'Implement JWT token authentication & role-based access control (RBAC)',
      'Build responsive client interfaces with Tailwind CSS and React state management'
    ],
    prerequisites: [
      'Basic HTML, CSS and foundational JavaScript syntax'
    ],
    createdAt: '2024-12-01',
    updatedAt: '2025-02-15',
    modules: [
      {
        id: 'mod_fs_1',
        title: 'Module 1: Modern Backend with Node, Express & MongoDB',
        lessons: [
          {
            id: 'les_fs_1_1',
            title: '1.1 Setting Up MongoDB Compass & Local/Atlas Clusters',
            durationMinutes: 28,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            contentMarkdown: `### 1.1 Setting Up MongoDB Compass & Local/Atlas Clusters

In this lesson, we guide you through connecting MongoDB Compass to your local instance (\`mongodb://localhost:27017\`) or MongoDB Atlas cloud cluster.

#### Step-by-Step Overview:
1. **Download & Launch MongoDB Compass**: Download from official MongoDB portal.
2. **Connection String**: Paste your connection string into the Compass URI bar:
   \`mongodb://localhost:27017/eduverse\`
3. **Inspect Collections**: View \`users\`, \`courses\`, \`enrollments\`, and \`payments\`.
4. **Run Aggregations & Indexes**: Optimize query execution plans with Compass Explain Plan.`,
            quiz: {
              id: 'quiz_fs_1',
              title: 'MongoDB Fundamentals Quiz',
              passingScore: 75,
              questions: [
                {
                  id: 'q_fs_1',
                  question: 'What is the default port for a local MongoDB daemon?',
                  options: ['3000', '5432', '27017', '8080'],
                  correctAnswerIndex: 2,
                  explanation: 'MongoDB defaults to TCP port 27017.'
                },
                {
                  id: 'q_fs_2',
                  question: 'What is the purpose of MongoDB Compass?',
                  options: [
                    'A JavaScript bundler',
                    'An interactive GUI tool to query, visualize, aggregate, and analyze data in MongoDB',
                    'A CSS utility framework',
                    'A code formatting extension'
                  ],
                  correctAnswerIndex: 1,
                  explanation: 'MongoDB Compass is the official graphical user interface (GUI) for MongoDB.'
                }
              ]
            }
          },
          {
            id: 'les_fs_1_2',
            title: '1.2 Document Modeling, Schemas & Aggregation Pipelines',
            durationMinutes: 32,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            contentMarkdown: `### 1.2 Document Modeling & Aggregations

Learn when to embed versus reference documents in MongoDB, and how to use aggregation pipelines (\`$match\`, \`$lookup\`, \`$group\`, \`$project\`) for rich analytical reporting.`
          }
        ]
      }
    ]
  },
  {
    id: 'course_cloud_devops',
    title: 'Cloud Native DevOps, Docker & Kubernetes for Web Platforms',
    slug: 'cloud-native-devops-docker-kubernetes',
    shortDescription: 'Automate deployments, containerize microservices, and configure robust CI/CD pipelines.',
    description: 'Master modern DevOps practices: Docker multi-stage builds, Kubernetes pod orchestration, ingress controllers, SSL automation, and GitHub Actions continuous integration pipelines.',
    instructorId: 'user_marcus',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    instructorTitle: 'Principal Systems Architect',
    category: 'Cloud & DevOps',
    level: 'Advanced',
    price: 95,
    discountPrice: 75,
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 189,
    enrolledCount: 2210,
    published: true,
    featured: false,
    totalDurationHours: 16.0,
    learningOutcomes: [
      'Containerize full-stack apps with multi-stage Dockerfiles',
      'Deploy to Kubernetes clusters with Helm charts',
      'Configure auto-scaling, health checks, and rolling updates'
    ],
    prerequisites: ['Linux command-line basics', 'Basic networking principles'],
    createdAt: '2025-01-20',
    updatedAt: '2025-02-18',
    modules: [
      {
        id: 'mod_cd_1',
        title: 'Module 1: Containerization Fundamentals',
        lessons: [
          {
            id: 'les_cd_1_1',
            title: '1.1 Docker Deep Dive: Images, Layers & Caching',
            durationMinutes: 26,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            contentMarkdown: `### 1.1 Docker Deep Dive

Learn how Docker images build through layer caching, minimizing image footprint with Alpine and distroless base images.`
          }
        ]
      }
    ]
  }
];

export const initialLiveSessions: LiveSession[] = [
  {
    id: 'live_1',
    title: 'Live Workshop: Real-Time Vector Search & RAG with Gemini Flash',
    description: 'Interactive coding lab where we build a complete vector search assistant live with audience participation and live Q&A.',
    courseId: 'course_ai_llm',
    courseTitle: 'Mastering Generative AI & Large Language Models',
    instructorId: 'user_sarah',
    instructorName: 'Dr. Sarah Lin',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    scheduledTime: '2026-09-12T19:00:00Z',
    durationMinutes: 60,
    status: 'live',
    attendeesCount: 142,
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['AI', 'Gemini', 'Live Coding', 'RAG']
  },
  {
    id: 'live_2',
    title: 'MongoDB Indexing Masterclass & Compass Query Optimization',
    description: 'Deep dive into B-tree indexes, compound indexes, explain plans, and finding query bottlenecks in MongoDB Compass.',
    courseId: 'course_fullstack_mongo',
    courseTitle: 'Full-Stack Web Development with React, Node.js & MongoDB',
    instructorId: 'user_marcus',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    scheduledTime: '2026-09-14T17:30:00Z',
    durationMinutes: 45,
    status: 'upcoming',
    attendeesCount: 88,
    tags: ['MongoDB', 'Performance', 'Compass']
  }
];

export const initialDiscussions: DiscussionThread[] = [
  {
    id: 'disc_1',
    channel: 'Generative AI',
    title: 'How do you handle context window truncation vs dynamic summarization in RAG?',
    content: 'When retrieving 10+ chunks of 500 tokens each plus historical conversation turns, what is the best strategy to keep latency low while maintaining high semantic recall?',
    authorId: 'user_alex',
    authorName: 'Alex Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorRole: 'learner',
    createdAt: '2026-09-10T14:20:00Z',
    upvotes: 16,
    hasUpvoted: false,
    tags: ['RAG', 'Gemini', 'Embeddings'],
    isSolved: true,
    repliesCount: 2,
    courseId: 'course_ai_llm'
  },
  {
    id: 'disc_2',
    channel: 'MongoDB & Databases',
    title: 'Connecting MongoDB Compass locally vs Atlas Cloud connection strings',
    content: 'Can someone verify the connection format for local replica sets vs single-instance development in Compass?',
    authorId: 'user_alex',
    authorName: 'Alex Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorRole: 'learner',
    createdAt: '2026-09-11T09:15:00Z',
    upvotes: 11,
    hasUpvoted: false,
    tags: ['MongoDB', 'Compass', 'Configuration'],
    isSolved: false,
    repliesCount: 1,
    courseId: 'course_fullstack_mongo'
  }
];

export const initialReplies: Record<string, DiscussionReply[]> = {
  disc_1: [
    {
      id: 'rep_1',
      threadId: 'disc_1',
      authorId: 'user_sarah',
      authorName: 'Dr. Sarah Lin',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      authorRole: 'instructor',
      content: 'Great question Alex! In modern systems with models like Gemini 3 series, you benefit from a massive context window (up to 1M+ tokens), so truncation is rarely necessary. However, for cost and latency optimization, a cross-encoder re-ranking step (e.g. taking top 15 results from vector search and re-ranking to top 3) delivers significantly crisper answers.',
      createdAt: '2026-09-10T15:40:00Z',
      upvotes: 14,
      isAcceptedSolution: true
    },
    {
      id: 'rep_2',
      threadId: 'disc_1',
      authorId: 'user_marcus',
      authorName: 'Marcus Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      authorRole: 'instructor',
      content: 'Also consider storing pre-computed summary metadata in MongoDB alongside your chunk embeddings. That way you can query the high-level summary first before fetching granular chunks.',
      createdAt: '2026-09-10T16:05:00Z',
      upvotes: 6,
      isAcceptedSolution: false
    }
  ],
  disc_2: [
    {
      id: 'rep_3',
      threadId: 'disc_2',
      authorId: 'user_marcus',
      authorName: 'Marcus Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      authorRole: 'instructor',
      content: 'For a local single instance, simply use: `mongodb://localhost:27017`. For Atlas, copy the URI from the "Connect" button in Atlas, which starts with `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net`.',
      createdAt: '2026-09-11T10:00:00Z',
      upvotes: 8,
      isAcceptedSolution: true
    }
  ]
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_alex',
    type: 'live_session',
    title: 'Live Workshop Starting Now!',
    message: 'Dr. Sarah Lin is streaming "Real-Time Vector Search & RAG with Gemini Flash". Click to join the classroom!',
    link: 'live',
    read: false,
    timestamp: 'Just now'
  },
  {
    id: 'notif_2',
    userId: 'user_alex',
    type: 'discussion',
    title: 'Dr. Sarah Lin replied to your thread',
    message: 'Your question "How do you handle context window truncation" received an instructor answer.',
    link: 'discussions',
    read: false,
    timestamp: '2 hours ago'
  },
  {
    id: 'notif_3',
    userId: 'user_alex',
    type: 'course_update',
    title: 'New Lesson Available in AI Course',
    message: 'Module 2: RAG & Vector Stores has been updated with new code templates.',
    link: 'courses',
    read: true,
    timestamp: 'Yesterday'
  }
];
