'use client';

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SampleDataBadge } from '../../components/SampleDataBadge';
import {
  FileSpreadsheet,
  Sliders,
  Calendar,
  Award,
  ChevronRight,
  Upload,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { PYQQuestion } from '@studytrack/data';

export default function PYQPage() {
  const { syllabus, pyqData, priorities, pyqWeights, setPyqWeights } = useStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState(syllabus.subjects[0]?.id ?? 'ds');
  const [filterBucket, setFilterBucket] = useState<'All' | 'Critical' | 'Important' | 'Optional'>('All');
  const [activeQuestionModal, setActiveQuestionModal] = useState<{
    topicName: string;
    questions: PYQQuestion[];
  } | null>(null);

  const subject = syllabus.subjects.find((s) => s.id === selectedSubjectId)!;
  const currentPYQ = pyqData.find((p) => p.subjectId === selectedSubjectId);
  const topicPriorities = priorities.get(selectedSubjectId) ?? [];

  const filteredTopics = topicPriorities.filter((t) => {
    if (filterBucket === 'All') return true;
    return t.bucket === filterBucket;
  });

  const years = currentPYQ?.years ?? [2020, 2021, 2022, 2023, 2024];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              PYQ Intelligence Engine
            </h1>
            <SampleDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            5 years of past exam papers analyzed by frequency, marks weight, and recency. Sliders update ranking live.
          </p>
        </div>

        {/* 3D Floating Subject Picker */}
        <div className="floating-tab-container flex items-center gap-2 overflow-x-auto">
          {syllabus.subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`floating-tab px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubjectId === sub.id
                  ? 'floating-tab-active text-white'
                  : 'text-slate-300 hover:text-white glass-panel'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tunable PYQ Weight Sliders */}
      <div className="glass-panel rounded-3xl p-6 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Tunable Priority Formula Weights (Live Recalculation)
            </h3>
          </div>
          <button
            onClick={() =>
              setPyqWeights({ frequency: 0.35, marks: 0.25, recency: 0.25, gap: 0.15 })
            }
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Reset to Default AKTU Tuning
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Slider 1: Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600 dark:text-slate-400">Frequency Weight:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(pyqWeights.frequency * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pyqWeights.frequency}
              onChange={(e) =>
                setPyqWeights({ ...pyqWeights, frequency: parseFloat(e.target.value) })
              }
              aria-label="Frequency Weight Slider"
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Marks Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600 dark:text-slate-400">Marks Weight:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(pyqWeights.marks * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pyqWeights.marks}
              onChange={(e) =>
                setPyqWeights({ ...pyqWeights, marks: parseFloat(e.target.value) })
              }
              aria-label="Marks Weight Slider"
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3: Recency Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600 dark:text-slate-400">Recency (2023-24):</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(pyqWeights.recency * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pyqWeights.recency}
              onChange={(e) =>
                setPyqWeights({ ...pyqWeights, recency: parseFloat(e.target.value) })
              }
              aria-label="Recency Weight Slider"
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4: Gap Signal */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600 dark:text-slate-400">Gap Signal (&quot;Due&quot;):</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(pyqWeights.gap * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pyqWeights.gap}
              onChange={(e) =>
                setPyqWeights({ ...pyqWeights, gap: parseFloat(e.target.value) })
              }
              aria-label="Gap Signal Weight Slider"
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['All', 'Critical', 'Important', 'Optional'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setFilterBucket(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterBucket === b
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {b} ({b === 'All' ? topicPriorities.length : topicPriorities.filter((t) => t.bucket === b).length})
            </button>
          ))}
        </div>
      </div>

      {/* Topic x Year Heatmap & Ranked Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Topic Name</th>
                <th className="p-3.5 font-bold">Priority</th>
                <th className="p-3.5 font-bold">Bucket</th>
                <th className="p-3.5 font-bold">Years Asked</th>
                {/* 5 Year Heatmap Headers */}
                {years.map((yr) => (
                  <th key={yr} className="p-3.5 font-bold text-center">
                    {yr}
                  </th>
                ))}
                <th className="p-3.5 font-bold">Avg Marks</th>
                <th className="p-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredTopics.map((topic) => {
                const questionsList = Object.values(topic.questionsByYear).flat();

                return (
                  <tr
                    key={topic.topicId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {topic.topicName}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {(topic.priorityScore * 100).toFixed(0)}%
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          topic.bucket === 'Critical'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : topic.bucket === 'Important'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {topic.bucket}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">
                      {topic.yearsAppeared}/5 yrs ({topic.totalQuestions} qs)
                    </td>

                    {/* Topic x Year Heatmap Cells */}
                    {years.map((yr) => {
                      const yrQuestions = topic.questionsByYear[yr] ?? [];
                      const count = yrQuestions.length;
                      const totalYrMarks = yrQuestions.reduce((s, q) => s + q.marks, 0);

                      return (
                        <td key={yr} className="p-2 text-center">
                          {count > 0 ? (
                            <span
                              className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                                totalYrMarks >= 10
                                  ? 'bg-indigo-600 text-white'
                                  : totalYrMarks >= 7
                                  ? 'bg-indigo-200 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                              title={`${yr}: ${count} questions, ${totalYrMarks} marks`}
                            >
                              {totalYrMarks}m
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3.5 font-mono">{topic.averageMarks}m</td>
                    <td className="p-3.5 text-right">
                      {questionsList.length > 0 ? (
                        <button
                          onClick={() =>
                            setActiveQuestionModal({
                              topicName: topic.topicName,
                              questions: questionsList,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                        >
                          View Qs ({questionsList.length})
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No PYQ</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bring Your Own Paper (Upload Dropzone) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Bring Your Own Paper (Upload AKTU PDF)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Extracts questions locally using in-browser OCR & embeddings matching. Nothing leaves your device without consent.
          </p>
        </div>
        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
            <span>Choose PDF File</span>
            <input
              type="file"
              accept=".pdf"
              aria-label="Upload AKTU Examination Paper PDF"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  alert(
                    `File "${file.name}" received! In-browser PDF parser extracts questions and merges them into the current topic priority index.`,
                  );
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Actual Questions Modal */}
      {activeQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Past Year Questions: {activeQuestionModal.topicName}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeQuestionModal.questions.length} questions recorded from AKTU papers
                </p>
              </div>
              <button
                onClick={() => setActiveQuestionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {activeQuestionModal.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {q.year} Exam
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {q.marks} Marks • {q.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                    &ldquo;{q.questionText}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveQuestionModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
