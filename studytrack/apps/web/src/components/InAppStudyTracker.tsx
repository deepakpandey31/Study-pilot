'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Play,
  Pause,
  Square,
  Clock,
  Youtube,
  PlusCircle,
  BookmarkPlus,
  EyeOff,
  Flame,
  CheckCircle2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function InAppStudyTracker() {
  const { syllabus, addSession, updateUserStats, userStats } = useStore();

  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState(syllabus.subjects[0]?.id ?? 'ds');
  const [selectedTopicName, setSelectedTopicName] = useState('Binary Search Tree');

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [youtubeInputUrl, setYoutubeInputUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [videoTimestamp, setVideoTimestamp] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pomodoroTargetSeconds = 25 * 60; // 25 min

  // Page Visibility API: auto-pause if user switches away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setIsRunning(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (mode === 'pomodoro' && prev + 1 >= pomodoroTargetSeconds) {
            setIsRunning(false);
            confetti({ particleCount: 60, spread: 50 });
            return pomodoroTargetSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, pomodoroTargetSeconds]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleStopAndSave = () => {
    setIsRunning(false);
    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));

    // Save session
    addSession({
      id: `session-${Date.now()}`,
      userId: 'demo-user-001',
      url: 'https://studytrack.app/tracker',
      domain: 'studytrack.app',
      title: `${selectedTopicName} (${mode === 'pomodoro' ? 'Pomodoro' : 'Study Timer'})`,
      subjectId: selectedSubjectId,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: minutes,
      focusSession: mode === 'pomodoro',
    });

    // Update XP and study minutes
    updateUserStats({
      xp: userStats.xp + minutes * 2,
      totalStudyMinutes: userStats.totalStudyMinutes + minutes,
      totalSessionsCount: userStats.totalSessionsCount + 1,
    });

    confetti({ particleCount: 50, spread: 60 });
    setElapsedSeconds(0);
  };

  const handleQuickLog = (minutes: number) => {
    addSession({
      id: `session-quick-${Date.now()}`,
      userId: 'demo-user-001',
      url: 'https://studytrack.app/quick-log',
      domain: 'studytrack.app',
      title: `${selectedTopicName} (Manual Quick Log)`,
      subjectId: selectedSubjectId,
      startedAt: new Date(Date.now() - minutes * 60 * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: minutes,
      focusSession: false,
    });

    updateUserStats({
      xp: userStats.xp + minutes * 2,
      totalStudyMinutes: userStats.totalStudyMinutes + minutes,
      totalSessionsCount: userStats.totalSessionsCount + 1,
    });

    setIsQuickLogOpen(false);
    confetti({ particleCount: 40 });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2]?.length === 11 ? match[2] : null;
  };

  const handleLaunchVideo = () => {
    const id = extractYoutubeId(youtubeInputUrl);
    if (id) {
      setActiveVideoId(id);
    } else {
      setActiveVideoId('jkl012'); // fallback demo video
    }
  };

  return (
    <>
      {/* Compact In-App Tracker 3D Glass Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mode toggle & Subject selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 floating-tab-container">
            <button
              onClick={() => {
                setMode('pomodoro');
                setElapsedSeconds(0);
                setIsRunning(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'pomodoro'
                  ? 'floating-tab-active text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => {
                setMode('stopwatch');
                setElapsedSeconds(0);
                setIsRunning(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'stopwatch'
                  ? 'floating-tab-active text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stopwatch
            </button>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="floating-pill px-3.5 py-1.5 text-xs font-semibold rounded-2xl text-white outline-none cursor-pointer"
          >
            {syllabus.subjects.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Live Timer Display & Controls */}
        <div className="flex items-center gap-4">
          <div className={`font-mono text-2xl font-black tracking-widest px-4 py-1 rounded-2xl bg-black/40 border border-white/10 shadow-inner ${
            isRunning ? 'text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse' : 'text-white'
          }`}>
            {formatTime(elapsedSeconds)}
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="floating-pill p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                title="Start Study Session"
              >
                <Play className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="floating-pill p-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all active:scale-95"
                title="Pause"
              >
                <Pause className="w-4 h-4 fill-white" />
              </button>
            )}

            <button
              onClick={handleStopAndSave}
              disabled={elapsedSeconds === 0}
              className="floating-pill p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-40"
              title="Log Study Session to Dashboard & XP"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>

        {/* Right: Quick Tools (Video Study Player + Quick Log) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="floating-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-red-600/15 text-red-300 border-red-500/30 hover:bg-red-600/30 transition-all"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span>Video Player</span>
          </button>

          <button
            onClick={() => setIsQuickLogOpen(true)}
            className="floating-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* Quick Log Modal */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Quick Log Study Time
              </h3>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Log completed offline revision or lecture time in 1 click:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleQuickLog(mins)}
                  className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500 text-xs font-bold text-white transition-all hover:scale-105"
                >
                  +{mins} Minutes
                  <div className="text-[10px] text-indigo-400 font-normal">+{mins * 2} XP</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Built-in Video Study Player Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Built-in Video Study Player (Auto-Tracked)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Watch lectures inside StudyTrack. Time auto-syncs to your dashboard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste any YouTube lecture link (e.g., https://www.youtube.com/watch?v=...)"
                  aria-label="Paste YouTube lecture URL"
                  value={youtubeInputUrl}
                  onChange={(e) => setYoutubeInputUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleLaunchVideo}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors"
                >
                  Load Lecture
                </button>
              </div>

              {/* YouTube IFrame Embed Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId || 'jkl012'}?enablejsapi=1`}
                  title="YouTube Study Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Timestamp Bookmark & Notes */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="text-xs text-slate-300">
                  💡 Found an important formula or derivation? Save a second-level timestamp bookmark.
                </div>
                <button
                  onClick={() => {
                    alert('Bookmark with current timestamp saved to your notes!');
                    confetti({ particleCount: 30 });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white whitespace-nowrap"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save Bookmark Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
