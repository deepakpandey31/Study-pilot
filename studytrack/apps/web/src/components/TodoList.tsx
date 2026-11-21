'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TodoTask } from '@studytrack/data';

export function TodoList() {
  const { todoTasks, toggleTodoTask, addTodoTask, deleteTodoTask, syllabus } = useStore();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('ds');
  const [newPriority, setNewPriority] = useState<'critical' | 'important' | 'optional'>('critical');

  const filteredTasks = todoTasks.filter((task) => {
    if (filterSubject !== 'all' && task.subjectId !== filterSubject) return false;
    return true;
  });

  const completedCount = todoTasks.filter((t) => t.completed).length;
  const totalCount = todoTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTodoTask({
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subjectId: newSubjectId,
      priority: newPriority,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]!,
      completed: false,
      estimatedMinutes: 45,
      order: todoTasks.length,
    });

    setNewTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className="p-6 rounded-3xl glass-panel border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] space-y-4">
      {/* Header with Progress Ring */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Circular Progress Ring */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-indigo-500 transition-all duration-500"
                fill="transparent"
                strokeDasharray={100}
                strokeDashoffset={100 - progressPercent}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">
              {progressPercent}%
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Study To-Do List</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {completedCount}/{totalCount} Completed
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Tasks tied directly to high-yield PYQ topics. Completed tasks award +20 XP.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <form onSubmit={handleCreate} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <input
            type="text"
            placeholder="What do you need to study or practice?"
            aria-label="New study task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-indigo-500"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-black/40 border border-white/10 text-white outline-none"
              >
                {syllabus.subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-lg bg-black/40 border border-white/10 text-white outline-none"
              >
                <option value="critical" className="bg-slate-900">Critical</option>
                <option value="important" className="bg-slate-900">Important</option>
                <option value="optional" className="bg-slate-900">Optional</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subject Filter Pills with 3D Float */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs floating-tab-container">
        <button
          onClick={() => setFilterSubject('all')}
          className={`floating-pill px-3 py-1 rounded-xl font-bold transition-all ${
            filterSubject === 'all'
              ? 'floating-pill-active text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({todoTasks.length})
        </button>
        {syllabus.subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilterSubject(s.id)}
            className={`floating-pill px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
              filterSubject === s.id
                ? 'floating-pill-active text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {s.name.split(' ')[0]} ({todoTasks.filter((t) => t.subjectId === s.id).length})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredTasks.map((task) => {
          const isDone = task.completed;
          const subject = syllabus.subjects.find((s) => s.id === task.subjectId);

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-white/5 border border-white/5 opacity-60'
                  : 'glass-card-interactive border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    toggleTodoTask(task.id);
                    if (!isDone) confetti({ particleCount: 30 });
                  }}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 hover:text-indigo-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <div
                    className={`text-xs font-medium truncate ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="font-semibold text-indigo-300">
                      {subject?.name || task.subjectId.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>Due {task.dueDate}</span>
                    <span>•</span>
                    <span>~{task.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    task.priority === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'important'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => deleteTodoTask(task.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
