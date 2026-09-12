import React, { useState } from 'react';
import { DiscussionThread, DiscussionReply, User } from '../types.js';
import { api } from '../lib/api.js';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  PlusCircle,
  Search,
  Filter,
  UserCheck,
  Send,
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';

interface DiscussionChannelsProps {
  threads: DiscussionThread[];
  currentUser: User;
  onRefreshThreads: () => void;
}

export const DiscussionChannels: React.FC<DiscussionChannelsProps> = ({
  threads,
  currentUser,
  onRefreshThreads
}) => {
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
  const [threadReplies, setThreadReplies] = useState<DiscussionReply[]>([]);
  const [newReplyText, setNewReplyText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Thread Form state
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('Generative AI');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const channels = ['All', 'Generative AI', 'MongoDB & Databases', 'Web Development', 'Career'];

  const filteredThreads = threads.filter((t) => {
    const matchChannel = selectedChannel === 'All' || t.channel.toLowerCase() === selectedChannel.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchChannel && matchSearch;
  });

  const openThreadDetails = async (thread: DiscussionThread) => {
    setActiveThread(thread);
    try {
      const replies = await api.getReplies(thread.id);
      setThreadReplies(replies);
    } catch (err) {
      console.error('Failed to fetch replies', err);
    }
  };

  const handleVote = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.voteThread(threadId);
      onRefreshThreads();
    } catch (err) {
      console.error('Failed to vote', err);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !newReplyText.trim()) return;

    try {
      const reply = await api.addReply(activeThread.id, {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        content: newReplyText.trim(),
        isAcceptedSolution: currentUser.role === 'instructor'
      });

      setThreadReplies([...threadReplies, reply]);
      setNewReplyText('');
      onRefreshThreads();
    } catch (err) {
      console.error('Failed to post reply', err);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await api.createDiscussion({
        title: newTitle.trim(),
        channel: newChannel,
        content: newContent.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean)
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      onRefreshThreads();
    } catch (err) {
      console.error('Failed to create discussion thread', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & New Thread trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Learning Community & Discussion Channels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with peers, get direct answers from instructors, and discuss architecture patterns
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Discussion
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                selectedChannel === ch
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">No discussions found in this channel</h3>
            <p className="text-xs text-slate-500">Be the first to start a conversation!</p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => openThreadDetails(thread)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {thread.channel}
                    </span>
                    {thread.isSolved && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                    {thread.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {thread.content}
                  </p>
                </div>

                {/* Upvotes Button */}
                <button
                  onClick={(e) => handleVote(thread.id, e)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-600 transition shrink-0"
                >
                  <ThumbsUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold mt-1 text-slate-800">{thread.upvotes}</span>
                </button>
              </div>

              {/* Thread Footer Metadata */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img src={thread.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-semibold text-slate-800">{thread.authorName}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      thread.authorRole === 'instructor'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {thread.authorRole}
                  </span>
                  <span>•</span>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  {thread.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                  <span className="font-semibold text-indigo-600 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {thread.repliesCount} replies
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread Details Drawer / Modal */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {activeThread.channel}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{activeThread.title}</h2>
              </div>
              <button
                onClick={() => setActiveThread(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Content & Replies Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Question Body */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <img src={activeThread.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                  <span className="font-bold text-slate-800">{activeThread.authorName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{new Date(activeThread.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{activeThread.content}</p>
              </div>

              {/* Replies Header */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Replies & Solutions ({threadReplies.length})
                </h3>

                {threadReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      reply.isAcceptedSolution
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={reply.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                        <span className="font-bold text-slate-900">{reply.authorName}</span>
                        {reply.authorRole === 'instructor' && (
                          <span className="bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded text-[9px]">
                            Instructor Answer
                          </span>
                        )}
                      </div>
                      {reply.isAcceptedSolution && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Accepted Solution
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Reply Composer */}
            <form onSubmit={handlePostReply} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                placeholder="Write an answer or reply..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newReplyText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Create New Thread Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Start a New Discussion</h3>

            <form onSubmit={handleCreateThread} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  {channels.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to optimize compound indexes in MongoDB Compass?"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content / Question</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Describe your question, code problem, or conceptual discussion topic..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="MongoDB, Indexes, Performance"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
