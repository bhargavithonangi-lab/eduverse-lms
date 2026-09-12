import React, { useState } from 'react';
import { DatabaseStatus } from '../types.js';
import { Database, CheckCircle2, AlertCircle, Copy, Check, Download, Terminal, HardDrive, RefreshCw, ExternalLink, Cpu } from 'lucide-react';

interface MongoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DatabaseStatus | null;
  onRefreshStatus: () => void;
}

export const MongoGuideModal: React.FC<MongoGuideModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onRefreshStatus
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'compass' | 'vscode' | 'architecture' | 'schema'>('compass');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadSeedJson = () => {
    window.open('/api/db/seed-export', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Database className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">MongoDB Compass & VS Code Integration Guide</h2>
              <p className="text-emerald-200 text-sm mt-0.5">Step-by-step setup for local database storage, API connection, and Compass inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Storage Engine:</span>
            {dbStatus?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Connected to MongoDB ({dbStatus.databaseName})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Embedded Persistent Store ({dbStatus?.collections.courses} courses active)
              </span>
            )}
            {dbStatus?.pingMs ? (
              <span className="text-xs text-slate-500">Latency: {dbStatus.pingMs}ms</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStatus}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Check Connection
            </button>
            <button
              onClick={handleDownloadSeedJson}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Compass JSON
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('compass')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'compass'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            1. MongoDB Compass Setup
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'vscode'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            2. VS Code & API Key Guide
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            3. Database Collections & Schema
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            4. Architecture Flow
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'compass' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  What is MongoDB Compass?
                </h3>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  MongoDB Compass is the official Graphical User Interface (GUI) for MongoDB. It lets you visually query, insert, update, analyze aggregation pipelines, and inspect your documents, indexes, and document performance without writing command-line queries.
                </p>
              </div>

              {/* Step 1 */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Install & Launch MongoDB Compass
                  </span>
                  <a
                    href="https://www.mongodb.com/try/download/compass"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    Download Compass <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-600">
                  Open MongoDB Compass on your machine. You will see the initial connection screen prompting for a Connection String.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Paste Connection String into Compass
                </span>
                <p className="text-xs text-slate-600">
                  If running MongoDB locally via Docker or local community service, paste this URI into MongoDB Compass:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>mongodb://localhost:27017/eduverse</span>
                  <button
                    onClick={() => copyToClipboard('mongodb://localhost:27017/eduverse', 'uri_local')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {copiedSection === 'uri_local' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  If using <strong>MongoDB Atlas (Cloud)</strong>, copy your SRV connection string:
                </p>
                <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/eduverse?retryWrites=true&w=majority</span>
                  <button
                    onClick={() => copyToClipboard('mongodb+srv://<username>:<password>@cluster0.mongodb.net/eduverse?retryWrites=true&w=majority', 'uri_atlas')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {copiedSection === 'uri_atlas' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  Import Pre-Seeded Dataset into Compass
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We have prepared the complete collections JSON array. You can export it right here and import it into Compass with 2 clicks:
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadSeedJson}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" /> Download Complete Seed JSON
                  </button>
                  <span className="text-xs text-slate-500">
                    Contains courses, lessons, quizzes, users, discussions, and live classes.
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p><strong>In Compass:</strong></p>
                  <p>1. In the left sidebar, click <strong>Create Database</strong> &gt; Name it <code>eduverse</code> &gt; Collection <code>courses</code>.</p>
                  <p>2. Click <strong>Add Data</strong> &gt; <strong>Import File</strong> &gt; Select the downloaded JSON file.</p>
                  <p>3. Compass will instantly populate all documents!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  Running in VS Code Locally
                </h3>
                <p className="text-xs text-slate-600">
                  Follow these terminal commands inside VS Code to run this full-stack platform:
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">1. Install Dependencies:</p>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                    <span>npm install</span>
                    <button onClick={() => copyToClipboard('npm install', 'cmd_install')} className="text-slate-400 hover:text-white">
                      {copiedSection === 'cmd_install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">2. Configure Environment Variables in <code>.env</code>:</p>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1 relative">
                    <p className="text-emerald-400"># Google Gemini AI API Key for interactive learning tutor</p>
                    <p>GEMINI_API_KEY="AIzaSyYourKeyHere..."</p>
                    <p className="text-emerald-400 mt-2"># MongoDB Connection String</p>
                    <p>MONGODB_URI="mongodb://localhost:27017/eduverse"</p>
                    <button
                      onClick={() => copyToClipboard('GEMINI_API_KEY="your_api_key_here"\nMONGODB_URI="mongodb://localhost:27017/eduverse"', 'env_code')}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white"
                    >
                      {copiedSection === 'env_code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">3. Start the Unified Express + Vite Server:</p>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                    <span>npm run dev</span>
                    <button onClick={() => copyToClipboard('npm run dev', 'cmd_dev')} className="text-slate-400 hover:text-white">
                      {copiedSection === 'cmd_dev' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    The Express server runs on port 3000, serving both the REST APIs and the responsive React 19 frontend seamlessly!
                  </p>
                </div>
              </div>

              {/* API Key Connection Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-indigo-50/50">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Connecting Gemini AI API Key
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In Google AI Studio, your API key is securely injected into <code>process.env.GEMINI_API_KEY</code> on the server-side.
                  When developing in VS Code locally, acquire your free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">aistudio.google.com/app/apikey</a> and add it to your <code>.env</code> file.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                The platform models your learning data into clear, indexable MongoDB collections:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">collection: courses</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">Core</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
{`{
  id: "course_ai_llm",
  title: "Mastering Generative AI",
  category: "Artificial Intelligence",
  price: 69,
  rating: 4.9,
  modules: [
    {
      title: "Module 1",
      lessons: [
        {
          title: "1.1 Self-Attention",
          videoUrl: "https://...",
          quiz: { ... },
          flashcards: [ ... ]
        }
      ]
    }
  ]
}`}
                  </pre>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">collection: enrollments</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">Tracking</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
{`{
  id: "enr_alex_ai",
  userId: "user_alex",
  courseId: "course_ai_llm",
  progressPercent: 50,
  completedLessonIds: ["les_1_1"],
  completed: false,
  certificateId: "CERT-XYZ"
}`}
                  </pre>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">collection: live_sessions</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">Real-Time</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
{`{
  id: "live_1",
  title: "RAG Masterclass",
  instructorName: "Dr. Sarah Lin",
  status: "live",
  scheduledTime: "2026-09-12...",
  attendeesCount: 142
}`}
                  </pre>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">collection: payments</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">Transactions</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
{`{
  id: "pay_123",
  userId: "user_alex",
  amount: 69,
  transactionId: "TXN-A8F9K",
  invoiceNumber: "INV-928172",
  status: "completed"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-3 font-mono text-xs">
                <p className="text-emerald-400 font-bold">DATA & INTEGRATION FLOW:</p>
                <div className="pl-2 border-l-2 border-slate-700 space-y-2">
                  <p>1. [User Action] → React 19 Frontend (Vite)</p>
                  <p>2. [HTTP Request] → Express Server (server.ts) on Port 3000</p>
                  <p>3. [AI Request] → @google/genai SDK (gemini-3.8-flash) using GEMINI_API_KEY</p>
                  <p>4. [Database Tier] → DatabaseService (server/db.ts):</p>
                  <p className="text-slate-400 pl-4">↳ If MONGODB_URI exists: updates MongoDB cluster via MongoClient</p>
                  <p className="text-slate-400 pl-4">↳ Fallback: updates local persistent store with zero downtime</p>
                  <p>5. [Inspection] → Open MongoDB Compass to inspect collections and query data</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current DB status: <strong>{dbStatus?.statusMessage}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
