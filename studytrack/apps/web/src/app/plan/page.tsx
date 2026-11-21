'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SampleDataBadge } from '../../components/SampleDataBadge';
import { generateStudyPlan } from '@studytrack/engine';
import {
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

export default function PlanPage() {
  const { syllabus, progress, priorities, addSession } = useStore();
  const [examDate, setExamDate] = useState('2024-12-15');
  const [dailyHours, setDailyHours] = useState(3);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  const plan = useMemo(() => {
    return generateStudyPlan(
      syllabus.subjects,
      progress,
      priorities,
      examDate,
      dailyHours,
      '2024-11-20',
    );
  }, [syllabus, progress, priorities, examDate, dailyHours]);

  // Group plan days into 7-day weeks
  const weeks = useMemo(() => {
    const chunks: Array<typeof plan.days> = [];
    for (let i = 0; i < plan.days.length; i += 7) {
      chunks.push(plan.days.slice(i, i + 7));
    }
    return chunks;
  }, [plan]);

  const handleExportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyTrack//AKTU Exam Plan//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;

    for (const day of plan.days) {
      for (const topic of day.topics) {
        const dateStr = day.date.replace(/-/g, '');
        icsContent += `BEGIN:VEVENT\nSUMMARY:StudyTrack: ${topic.topicName}\nDESCRIPTION:Priority: ${topic.priority.toUpperCase()} - Estimated duration: ${topic.estimatedMinutes} min\nDTSTART;VALUE=DATE:${dateStr}\nDTEND;VALUE=DATE:${dateStr}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
      }
    }
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyTrack_AKTU_Exam_Plan.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleTopic = (topicKey: string, topicName: string, minutes: number) => {
    const next = new Set(completedTopicIds);
    if (next.has(topicKey)) {
      next.delete(topicKey);
    } else {
      next.add(topicKey);
      // Auto log a study session to award XP!
      addSession({
        id: `sess-${Date.now()}`,
        userId: 'demo-user-001',
        url: 'https://studytrack.app/plan',
        domain: 'studytrack.app',
        title: `${topicName} (Exam Plan Session)`,
        subjectId: 'ds',
        startedAt: new Date().toISOString(),
        durationMinutes: minutes || 45,
        focusSession: true,
      });
    }
    setCompletedTopicIds(next);
  };

  const currentDays = weeks[activeWeek - 1] ?? [];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Hero Feature
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Personalized Daily Study Calendar
            </h1>
            <SampleDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Day-by-day exam roadmap prioritizing <strong>Critical PYQs</strong> first with automatic spaced review intervals.
          </p>
        </div>

        <button
          onClick={handleExportICS}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export to Calendar (.ics)</span>
        </button>
      </div>

      {/* Controls & Summary Bar */}
      <div className="p-6 rounded-3xl glass-panel border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Exam Start Date:
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            aria-label="Exam Start Date"
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Daily Study Capacity:
          </label>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              aria-label="Daily Study Capacity in Hours"
              className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">
              {dailyHours}h / day
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400">Days to Exam:</div>
            <div className="text-xl font-black text-indigo-400 drop-shadow">
              {plan.totalDays} Days
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">Uncovered Critical:</div>
            <div className="text-xl font-black text-rose-400 drop-shadow">
              {plan.uncoveredCritical} Topics
            </div>
          </div>
        </div>
      </div>

      {/* 3D Floating Week Selector Tabs */}
      <div className="floating-tab-container flex flex-wrap items-center gap-2.5">
        {weeks.map((_, idx) => {
          const weekNum = idx + 1;
          const isActive = activeWeek === weekNum;
          return (
            <button
              key={weekNum}
              onClick={() => setActiveWeek(weekNum)}
              className={`floating-tab px-4 py-2 text-xs font-bold rounded-2xl transition-all ${
                isActive
                  ? 'floating-tab-active text-white'
                  : 'text-slate-300 hover:text-white glass-panel'
              }`}
            >
              Week {weekNum} ({weeks[idx]?.[0]?.date} — {weeks[idx]?.[weeks[idx]!.length - 1]?.date})
            </button>
          );
        })}
      </div>

      {/* Plan Timeline Grid for Current Week with Glass Cards */}
      <div className="space-y-4">
        {currentDays.map((day) => (
          <div
            key={day.date}
            className={`p-6 rounded-3xl border transition-all ${
              day.isReviewDay
                ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.15)]'
                : 'glass-panel border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                  Day {day.dayNumber}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {day.date}
                </span>
                {day.isReviewDay && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    Spaced Repetition Review Day
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {day.totalMinutes} min scheduled
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {day.topics.length > 0 ? (
                day.topics.map((t, idx) => {
                  const topicKey = `${day.date}-${t.topicId}-${idx}`;
                  const isDone = completedTopicIds.has(topicKey);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleTopic(topicKey, t.topicName, t.estimatedMinutes)}
                      className={`p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-all ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          readOnly
                          aria-label={`Mark ${t.topicName} as completed`}
                          className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                        />
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            t.priority === 'critical'
                              ? 'bg-rose-500/15 text-rose-600'
                              : t.priority === 'important'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-emerald-500/15 text-emerald-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span
                          className={`font-semibold ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {t.topicName}
                        </span>
                        {t.type === 'review' && (
                          <span className="text-[10px] text-slate-400 italic">(Review slot)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            +45 XP Logged
                          </span>
                        )}
                        <span className="text-slate-500 font-mono">{t.estimatedMinutes} min</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic p-2">
                  No new topics scheduled. Rest or buffer day.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
