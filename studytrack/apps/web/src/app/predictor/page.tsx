'use client';

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MonteCarloChart } from '../../components/MonteCarloChart';
import { CalculationPanel } from '../../components/CalculationPanel';
import { SampleDataBadge, EstimateBadge } from '../../components/SampleDataBadge';
import {
  Calculator,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Sliders,
  HelpCircle,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';

export default function PredictorPage() {
  const { prediction, monteCarlo, updateInternalMarks, updateConfidence } = useStore();
  const [activeTab, setActiveTab] = useState<'montecarlo' | 'calculation' | 'sensitivity'>('montecarlo');

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
              Mode B: Progress-Based Academic Estimator
            </h1>
            <SampleDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculates dynamic SGPA by synthesizing <strong>actual syllabus covered</strong> + <strong>5-year AKTU PYQ repeat weights</strong> + <strong>10,000 Monte Carlo runs</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/what-if"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch What-If Simulator</span>
          </Link>
        </div>
      </div>

      {/* Hero Prediction Display Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/30 relative overflow-hidden">
        {/* Glow orb background */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                Official AKTU Ordinance Model
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Mode B Engine Active
              </span>
              <EstimateBadge className="bg-white/10 text-indigo-100 border-white/20" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow">
                {prediction.sgpa.toFixed(2)}
              </span>
              <span className="text-lg text-indigo-200 font-medium">/ 10.0 SGPA</span>
            </div>
            <p className="text-xs md:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              Estimated performance across {prediction.totalCredits} credits.
              10,000 Monte Carlo runs confirm an 80% confidence interval of{' '}
              <strong className="text-white font-black underline decoration-indigo-400">
                {monteCarlo.percentile10.toFixed(2)} – {monteCarlo.percentile90.toFixed(2)}
              </strong>.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[11px] text-indigo-200 font-medium">Expected Grade</div>
              <div className="text-xl font-bold text-white mt-1">
                {prediction.sgpa >= 9.0 ? 'O (Outstanding)' : prediction.sgpa >= 8.0 ? 'A+ (Excellent)' : prediction.sgpa >= 7.0 ? 'A (Very Good)' : 'B+ (Good)'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[11px] text-indigo-200 font-medium">Monte Carlo Median</div>
              <div className="text-xl font-bold text-white mt-1">
                {monteCarlo.median.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Floating Air Tabs */}
      <div className="floating-tab-container flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('montecarlo')}
          className={`floating-tab px-4 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === 'montecarlo'
              ? 'floating-tab-active text-white'
              : 'text-slate-300 hover:text-white glass-panel'
          }`}
        >
          Monte Carlo Simulation (10,000 Runs)
        </button>
        <button
          onClick={() => setActiveTab('calculation')}
          className={`floating-tab px-4 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === 'calculation'
              ? 'floating-tab-active text-white'
              : 'text-slate-300 hover:text-white glass-panel'
          }`}
        >
          Formula Calculation Panel (Explainable)
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`floating-tab px-4 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === 'sensitivity'
              ? 'floating-tab-active text-white'
              : 'text-slate-300 hover:text-white glass-panel'
          }`}
        >
          Subject Sensitivity & Tuning
        </button>
      </div>

      {/* Tab 1: Monte Carlo */}
      {activeTab === 'montecarlo' && <MonteCarloChart />}

      {/* Tab 2: Formula Calculation */}
      {activeTab === 'calculation' && <CalculationPanel />}

      {/* Tab 3: Sensitivity & Tuning */}
      {activeTab === 'sensitivity' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject Sensitivity Analysis & Live Internal Marks Tuner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust your expected internal marks (/30) and confidence (1–5) to see the immediate impact on your final SGPA.
            </p>
          </div>

          <div className="space-y-4">
            {prediction.subjects.map((sub) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-[200px]">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {sub.subjectName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {sub.credits} Credits • Predicted Total: {sub.predictedTotal}/100 ({sub.predictedGrade})
                  </div>
                </div>

                {/* Internal Marks Slider */}
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Internal Marks:</span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {sub.internalMarks} / 30
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="1"
                    value={sub.internalMarks}
                    onChange={(e) =>
                      updateInternalMarks(sub.subjectId, parseInt(e.target.value))
                    }
                    aria-label={`Internal Marks for ${sub.subjectName}`}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Marginal Impact Tag */}
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    +{(sub.credits * 0.06).toFixed(2)} SGPA per grade jump
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
