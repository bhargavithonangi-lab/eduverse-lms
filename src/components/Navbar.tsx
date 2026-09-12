import React, { useState } from 'react';
import { User, DatabaseStatus, NotificationItem } from '../types.js';
import {
  GraduationCap,
  BookOpen,
  Radio,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Database,
  Bell,
  Check,
  ChevronDown,
  UserCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  availableUsers: User[];
  activeTab: 'courses' | 'progress' | 'live' | 'discussions' | 'studio';
  onSelectTab: (tab: 'courses' | 'progress' | 'live' | 'discussions' | 'studio') => void;
  dbStatus: DatabaseStatus | null;
  onOpenMongoGuide: () => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  availableUsers,
  activeTab,
  onSelectTab,
  dbStatus,
  onOpenMongoGuide,
  notifications,
  onMarkNotificationsRead
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab('courses')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 bg-clip-text text-transparent">
                  EduVerse
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1.5 border border-indigo-200">
                  Online Learning
                </span>
              </div>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectTab('courses')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'courses'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </button>

              <button
                onClick={() => onSelectTab('progress')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'progress'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                My Learning
              </button>

              <button
                onClick={() => onSelectTab('live')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition relative ${
                  activeTab === 'live'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Radio className="w-4 h-4 text-rose-500" />
                Live Classes
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-1.5"></span>
              </button>

              <button
                onClick={() => onSelectTab('discussions')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                  activeTab === 'discussions'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Community
              </button>

              {(currentUser.role === 'instructor' || currentUser.role === 'admin') && (
                <button
                  onClick={() => onSelectTab('studio')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                    activeTab === 'studio'
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Course Studio
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* MongoDB Compass Guide Trigger */}
            <button
              onClick={onOpenMongoGuide}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition shadow-xs hover:border-emerald-400 bg-white"
              title="MongoDB Compass & Local Setup Guide"
            >
              <Database className={`w-3.5 h-3.5 ${dbStatus?.connected ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span className="hidden sm:inline text-slate-700">
                {dbStatus?.connected ? 'MongoDB Live' : 'Compass Guide'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Menu Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <span className="text-xs text-slate-500">{notifications.length} alerts</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 transition text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-normal text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-300"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Profile Switcher
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Test multi-role experiences (Learner, Instructor, Admin)
                    </p>
                  </div>
                  <div className="py-1">
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition ${
                          currentUser.id === u.id ? 'bg-indigo-50/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              <span
                                className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-rose-100 text-rose-700'
                                    : u.role === 'instructor'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[170px]">{u.title || u.email}</div>
                          </div>
                        </div>
                        {currentUser.id === u.id && <Check className="w-4 h-4 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => onSelectTab('courses')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 ${
              activeTab === 'courses' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 ${
              activeTab === 'progress' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            My Learning
          </button>
          <button
            onClick={() => onSelectTab('live')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 ${
              activeTab === 'live' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Live Classes
          </button>
          <button
            onClick={() => onSelectTab('discussions')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 ${
              activeTab === 'discussions' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Community
          </button>
          {(currentUser.role === 'instructor' || currentUser.role === 'admin') && (
            <button
              onClick={() => onSelectTab('studio')}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 ${
                activeTab === 'studio' ? 'bg-purple-600 text-white font-semibold' : 'text-purple-700'
              }`}
            >
              Studio
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
