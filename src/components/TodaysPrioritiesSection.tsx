import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  Baby, 
  Pill, 
  CheckSquare, 
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { PriorityItem, PrioritySeverity } from '../types/priorities';

interface TodaysPrioritiesSectionProps {
  priorities: PriorityItem[];
  onResolveItem: (item: PriorityItem) => void;
  onOpenNotifications: () => void;
}

export const TodaysPrioritiesSection: React.FC<TodaysPrioritiesSectionProps> = ({
  priorities,
  onResolveItem,
  onOpenNotifications,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | PrioritySeverity>('ALL');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const highCount = priorities.filter((p) => p.severity === 'HIGH').length;
  const mediumCount = priorities.filter((p) => p.severity === 'MEDIUM').length;
  const lowCount = priorities.filter((p) => p.severity === 'LOW').length;

  const filteredItems = priorities.filter((item) => {
    if (selectedSeverity === 'ALL') return true;
    return item.severity === selectedSeverity;
  });

  const handleActionClick = (item: PriorityItem) => {
    onResolveItem(item);
    setSuccessNotice(`Resolved: ${item.title}`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const getSeverityBadge = (severity: PrioritySeverity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>LOW</span>
          </span>
        );
    }
  };

  const getCategoryIcon = (category: PriorityItem['category']) => {
    switch (category) {
      case 'patient':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'child':
        return <Baby className="w-4 h-4 text-teal-600" />;
      case 'medicine':
        return <Pill className="w-4 h-4 text-indigo-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
              Today's Priorities
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white tabular-nums">
              {priorities.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified administrative priority engine: overdue follow-ups, tasks due today, and critical medicine stock
          </p>
        </div>

        {/* Action button to open full notifications panel */}
        <button
          onClick={onOpenNotifications}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Open Full Notifications Panel ({priorities.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Success Notice Feedback */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          onClick={() => setSelectedSeverity('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            selectedSeverity === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <span>All Priorities</span>
          <span className="text-[11px] font-bold opacity-80 tabular-nums">({priorities.length})</span>
        </button>

        <button
          onClick={() => setSelectedSeverity('HIGH')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            selectedSeverity === 'HIGH'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <span>🔴 HIGH</span>
          <span className="text-[11px] font-bold opacity-80 tabular-nums">({highCount})</span>
        </button>

        <button
          onClick={() => setSelectedSeverity('MEDIUM')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            selectedSeverity === 'MEDIUM'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <span>🟠 MEDIUM</span>
          <span className="text-[11px] font-bold opacity-80 tabular-nums">({mediumCount})</span>
        </button>

        <button
          onClick={() => setSelectedSeverity('LOW')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            selectedSeverity === 'LOW'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
          }`}
        >
          <span>🟡 LOW</span>
          <span className="text-[11px] font-bold opacity-80 tabular-nums">({lowCount})</span>
        </button>
      </div>

      {/* Priorities List */}
      <div className="space-y-3 pt-2">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-800">No active priorities in this view</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              All tasks and inventory thresholds for this filter level have been addressed.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isHigh = item.severity === 'HIGH';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isHigh
                    ? 'bg-rose-50/30 border-rose-200/90 hover:border-rose-300'
                    : item.severity === 'MEDIUM'
                    ? 'bg-amber-50/20 border-amber-200/80 hover:border-amber-300'
                    : 'bg-slate-50/40 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <span className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.badgeLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.details}
                    </p>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 pt-0.5">
                    <span className="tabular-nums">{item.dueOrStockInfo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <button
                    onClick={() => handleActionClick(item)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap ${
                      isHigh
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : item.severity === 'MEDIUM'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safety Notice */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Administrative task prioritization only. Clinical diagnosis or medical treatment requires a qualified Medical Officer.</span>
      </div>
    </div>
  );
};
