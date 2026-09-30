import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Pill,
  Users,
  Baby,
  CheckSquare
} from 'lucide-react';
import { PriorityItem, PrioritySeverity } from '../types/priorities';
import { NavTab } from './Header';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: PriorityItem[];
  onResolveItem: (item: PriorityItem) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  priorities,
  onResolveItem,
  onNavigateTab,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | PrioritySeverity>('ALL');

  if (!isOpen) return null;

  const highCount = priorities.filter((p) => p.severity === 'HIGH').length;
  const mediumCount = priorities.filter((p) => p.severity === 'MEDIUM').length;
  const lowCount = priorities.filter((p) => p.severity === 'LOW').length;

  const filteredPriorities = priorities.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: PrioritySeverity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
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

  const handleAction = (item: PriorityItem) => {
    onResolveItem(item);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Active Notifications</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold tabular-nums">
                  {priorities.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Live operational & priority engine alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-80 tabular-nums">({priorities.length})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterSeverity === 'HIGH'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>🔴 High</span>
            <span className="text-[10px] opacity-80 tabular-nums">({highCount})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterSeverity === 'MEDIUM'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span>🟠 Medium</span>
            <span className="text-[10px] opacity-80 tabular-nums">({mediumCount})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterSeverity === 'LOW'
                ? 'bg-sky-600 text-white'
                : 'text-sky-700 hover:bg-sky-50'
            }`}
          >
            <span>🟡 Low</span>
            <span className="text-[10px] opacity-80 tabular-nums">({lowCount})</span>
          </button>
        </div>

        {/* Priority Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {filteredPriorities.length === 0 ? (
            <div className="py-16 text-center px-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-bold text-slate-800">All Clear!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No active notifications under this priority filter. As tasks are scheduled or items fall below thresholds, they will appear here.
              </p>
            </div>
          ) : (
            filteredPriorities.map((item) => {
              const isHigh = item.severity === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all ${
                    isHigh
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : item.severity === 'MEDIUM'
                      ? 'border-amber-200/80 hover:border-amber-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(item.severity)}
                      <span className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                      {item.badgeLabel}
                    </span>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {item.details}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 text-[11px] tabular-nums">
                      {item.dueOrStockInfo}
                    </span>

                    <button
                      onClick={() => handleAction(item)}
                      className={`px-3 py-1 text-xs font-semibold rounded shadow-xs transition-colors ${
                        isHigh
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
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

        {/* Panel Footer */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Resolving an item removes it from active alerts.</span>
            <span className="font-bold tabular-nums text-slate-900">{priorities.length} remaining</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Administrative task prioritization only. Clinical diagnosis must be referred to a Medical Officer.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
