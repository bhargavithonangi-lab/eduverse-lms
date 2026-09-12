import React, { useState, useEffect } from 'react';
import { LiveSession, LiveChatMessage, User } from '../types.js';
import { api } from '../lib/api.js';
import {
  Radio,
  Video,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  Hand,
  MessageSquare,
  Users,
  Send,
  Calendar,
  Clock,
  Sparkles,
  PlusCircle,
  HelpCircle,
  PenTool,
  Check
} from 'lucide-react';

interface LiveClassesProps {
  sessions: LiveSession[];
  currentUser: User;
  onRefreshSessions: () => void;
}

export const LiveClasses: React.FC<LiveClassesProps> = ({
  sessions,
  currentUser,
  onRefreshSessions
}) => {
  const [activeSession, setActiveSession] = useState<LiveSession | null>(
    sessions.find((s) => s.status === 'live') || null
  );

  // Classroom controls
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'whiteboard' | 'attendees'>('chat');

  // Chat messages
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    {
      id: 'm1',
      sessionId: activeSession?.id || 'live_1',
      userId: 'user_sarah',
      userName: 'Dr. Sarah Lin',
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      userRole: 'instructor',
      text: 'Welcome everyone! In today’s live workshop, we are demonstrating RAG with Gemini Flash. Feel free to post questions anytime!',
      timestamp: '19:01'
    },
    {
      id: 'm2',
      sessionId: activeSession?.id || 'live_1',
      userId: 'user_alex',
      userName: 'Alex Chen',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      userRole: 'learner',
      text: 'Excited to be here! Can we see how vector chunk overlap affects retrieval recall?',
      timestamp: '19:03',
      isQuestion: true
    }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Whiteboard notes state
  const [whiteboardContent, setWhiteboardContent] = useState(
    `# Collaborative Class Notes & Whiteboard\n\n- Architecture: Client -> Express (port 3000) -> MongoDB\n- Vector embeddings: gemini-embedding-2-preview\n- RAG Retrieval: Cross-encoder ranking with top-3 chunks`
  );

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeSession) return;

    const message: LiveChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId: activeSession.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      text: newMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuestion: newMsg.includes('?')
    };

    setChatMessages([...chatMessages, message]);
    setNewMsg('');
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    try {
      await api.createLiveSession({
        title: scheduleTitle,
        description: scheduleDesc || 'Interactive hands-on session with live Q&A.',
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        instructorAvatar: currentUser.avatar,
        scheduledTime: scheduleTime || new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 60,
        status: 'upcoming',
        tags: ['Live', 'Workshop']
      });

      setShowScheduleModal(false);
      setScheduleTitle('');
      setScheduleDesc('');
      onRefreshSessions();
    } catch (err) {
      console.error('Failed to create live session', err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Live Classroom Active Stage */}
      {activeSession ? (
        <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-0">
          
          {/* Top Session Header */}
          <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm animate-pulse">
                <Radio className="w-3.5 h-3.5" /> LIVE CLASSROOM
              </span>
              <h2 className="text-base sm:text-lg font-bold line-clamp-1">{activeSession.title}</h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-slate-300">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{activeSession.attendeesCount + (handRaised ? 1 : 0)} Attending</span>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Classroom Body Grid: Video Stage (Left) + Interactive Sidepanel (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
            {/* Left 8 cols: Video Stage */}
            <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-black relative">
              
              {/* Main Feed Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                {screenShareOn ? (
                  <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-center text-emerald-400 font-mono text-xs">
                    <p className="text-slate-400 mb-2">// Screen Share: Live Coding Session</p>
                    <pre className="text-indigo-300 overflow-x-auto">
{`// MongoDB Atlas Connection & Gemini RAG Indexing
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const client = new MongoClient(process.env.MONGODB_URI);

async function indexLessonEmbeddings() {
  const db = client.db("eduverse");
  console.log("Vector collection indexed successfully!");
}`}
                    </pre>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <video
                      src={activeSession.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                      <span>{activeSession.instructorName} (Instructor Stream)</span>
                    </div>
                  </div>
                )}

                {/* Picture in Picture learner avatar */}
                {camOn && (
                  <div className="absolute top-4 right-4 w-32 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-xl flex items-center justify-center">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-2 text-[9px] text-white font-bold bg-black/60 px-1 rounded">You</span>
                  </div>
                )}
              </div>

              {/* Classroom Action Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`p-3 rounded-full font-semibold transition ${
                    micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600/20 text-rose-400 border border-rose-600/30'
                  }`}
                  title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setCamOn(!camOn)}
                  className={`p-3 rounded-full font-semibold transition ${
                    camOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600/20 text-rose-400 border border-rose-600/30'
                  }`}
                  title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setScreenShareOn(!screenShareOn)}
                  className={`p-3 rounded-full font-semibold transition ${
                    screenShareOn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Screen Share"
                >
                  <MonitorUp className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setHandRaised(!handRaised)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition ${
                    handRaised
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  {handRaised ? 'Hand Raised ✋' : 'Raise Hand'}
                </button>
              </div>

            </div>

            {/* Right 4 cols: Interactive Sidepanel (Live Chat / Whiteboard / Attendees) */}
            <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-800 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex-1 py-3 border-b-2 text-center transition ${
                    sidebarTab === 'chat'
                      ? 'border-indigo-500 text-white font-bold bg-slate-800/40'
                      : 'border-transparent hover:text-white'
                  }`}
                >
                  Live Chat
                </button>
                <button
                  onClick={() => setSidebarTab('whiteboard')}
                  className={`flex-1 py-3 border-b-2 text-center transition ${
                    sidebarTab === 'whiteboard'
                      ? 'border-indigo-500 text-white font-bold bg-slate-800/40'
                      : 'border-transparent hover:text-white'
                  }`}
                >
                  Class Notes
                </button>
                <button
                  onClick={() => setSidebarTab('attendees')}
                  className={`flex-1 py-3 border-b-2 text-center transition ${
                    sidebarTab === 'attendees'
                      ? 'border-indigo-500 text-white font-bold bg-slate-800/40'
                      : 'border-transparent hover:text-white'
                  }`}
                >
                  Roster ({activeSession.attendeesCount})
                </button>
              </div>

              {/* Tab 1: Live Chat */}
              {sidebarTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                  <div className="overflow-y-auto space-y-3 flex-1 pr-1 max-h-[380px] text-xs">
                    {chatMessages.map((m) => (
                      <div key={m.id} className="space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                            {m.userName}
                            {m.userRole === 'instructor' && (
                              <span className="bg-purple-900/60 text-purple-300 px-1 rounded text-[9px]">
                                Instructor
                              </span>
                            )}
                          </span>
                          <span>{m.timestamp}</span>
                        </div>
                        <div
                          className={`p-2.5 rounded-xl leading-relaxed ${
                            m.isQuestion
                              ? 'bg-amber-950/40 text-amber-200 border border-amber-800/40'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="pt-3 flex gap-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder="Type a message or question..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Shared Whiteboard / Notes */}
              {sidebarTab === 'whiteboard' && (
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <textarea
                    value={whiteboardContent}
                    onChange={(e) => setWhiteboardContent(e.target.value)}
                    rows={14}
                    className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Collaborative Real-time Notes</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Auto-syncing
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: Attendees Roster */}
              {sidebarTab === 'attendees' && (
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Instructor & Host
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 text-xs text-white">
                    <img
                      src={activeSession.instructorAvatar}
                      alt={activeSession.instructorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold">{activeSession.instructorName}</div>
                      <div className="text-purple-400 text-[10px]">Host • Instructor</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider pt-2">
                    Active Students
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <img src={currentUser.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <span>{currentUser.name} (You)</span>
                      </div>
                      {handRaised && <span className="text-amber-400 text-xs">✋ Raised Hand</span>}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                          JD
                        </div>
                        <span>Jordan Davis</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      ) : null}

      {/* Live & Upcoming Classes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              Live Virtual Classes & Workshops
            </h2>
            <p className="text-xs text-slate-500">Interactive live coding, masterclasses, and group office hours</p>
          </div>

          {(currentUser.role === 'instructor' || currentUser.role === 'admin') && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Schedule Live Class
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {session.status === 'live' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span> LIVE NOW
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(session.scheduledTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} min
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{session.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{session.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={session.instructorAvatar}
                    alt={session.instructorName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800">{session.instructorName}</span>
                </div>

                <button
                  onClick={() => setActiveSession(session)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    session.status === 'live'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {session.status === 'live' ? 'Join Classroom Now' : 'Set Reminder'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Live Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Schedule New Live Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="e.g. MongoDB Aggregations & Query Plans Live Coding"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={scheduleDesc}
                  onChange={(e) => setScheduleDesc(e.target.value)}
                  rows={3}
                  placeholder="What will students learn in this live interactive class?"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
