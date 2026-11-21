'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Target, HelpCircle, TrendingUp } from 'lucide-react';

export function MonteCarloChart() {
  const { monteCarlo, prediction } = useStore();
  const [targetSgpa, setTargetSgpa] = useState(8.5);

  const targetProb = monteCarlo.targetProbability(targetSgpa);
  const probPercentage = Math.round(targetProb * 100);

  // Find max count for scaling histogram bars
  const maxCount = Math.max(...monteCarlo.histogram.map((b) => b.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Title & Target Probability Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monte Carlo SGPA Distribution (10,000 Runs)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Web Worker ML
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulates uncertainty from topic coverage gaps, internal viva randomness, and question choices.
          </p>
        </div>

        {/* Live Probability Result Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              Probability of <strong className="text-slate-900 dark:text-white">≥ {targetSgpa.toFixed(1)} SGPA</strong>:
            </div>
            <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {probPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Target SGPA Interactive Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Target SGPA Goal Slider:
          </label>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {targetSgpa.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="5.0"
          max="10.0"
          step="0.1"
          value={targetSgpa}
          onChange={(e) => setTargetSgpa(parseFloat(e.target.value))}
          aria-label="Target SGPA Goal Slider"
          className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>5.0</span>
          <span>6.0</span>
          <span>7.0</span>
          <span>8.0</span>
          <span>9.0</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Simulated Frequency Distribution:</span>
          <span>Median: <strong className="text-indigo-600 dark:text-indigo-400">{monteCarlo.median.toFixed(2)}</strong></span>
        </div>

        <div className="h-44 w-full flex items-end gap-1 px-2 pt-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {monteCarlo.histogram.map((bin, idx) => {
            const heightPercent = Math.max(4, (bin.count / maxCount) * 100);
            const isTargetReached = bin.binEnd >= targetSgpa;
            const isMedian =
              bin.binStart <= monteCarlo.median && monteCarlo.median < bin.binEnd;

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {bin.binStart.toFixed(1)} - {bin.binEnd.toFixed(1)} SGPA: {bin.count} runs ({bin.percentage}%)
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isMedian
                      ? 'bg-indigo-600 dark:bg-indigo-500 ring-2 ring-indigo-400'
                      : isTargetReached
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono px-1">
          <span>0.0</span>
          <span>2.5</span>
          <span>5.0</span>
          <span>7.5</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Statistical Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] text-slate-500">10th Percentile (Floor)</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {monteCarlo.percentile10.toFixed(2)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Expected (Median)</div>
          <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            {monteCarlo.median.toFixed(2)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] text-slate-500">90th Percentile (Ceiling)</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {monteCarlo.percentile90.toFixed(2)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] text-slate-500">Std Deviation (Uncertainty)</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            ±{monteCarlo.stdDev.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
