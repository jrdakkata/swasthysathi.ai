import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Baby, 
  AlertTriangle, 
  Eye, 
  X, 
  Calendar, 
  MapPin, 
  Activity, 
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import { ChildRecord, ChildHealthStatus, PriorityLevel } from '../types/health';

interface ChildHealthViewProps {
  childrenRecords: ChildRecord[];
  onAddChild: () => void;
  onUpdateChildStatus: (childId: string, status: ChildHealthStatus) => void;
}

export const ChildHealthView: React.FC<ChildHealthViewProps> = ({
  childrenRecords,
  onAddChild,
  onUpdateChildStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ChildHealthStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedChildDetail, setSelectedChildDetail] = useState<ChildRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Computed summary metrics
  const overdueChildren = childrenRecords.filter((c) => c.status === 'Overdue');
  const dueTodayChildren = childrenRecords.filter((c) => c.status === 'Due Today');
  const upcomingChildren = childrenRecords.filter((c) => c.status === 'Upcoming');
  const completedChildren = childrenRecords.filter((c) => c.status === 'Completed');

  // Filter logic
  const filteredChildren = childrenRecords.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.healthTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.parentName && child.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      child.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || child.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || child.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === 'All' || (child.taskCategory && child.taskCategory === categoryFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleMarkCompleted = (child: ChildRecord) => {
    onUpdateChildStatus(child.id, 'Completed');
    setActionNotice(`Task marked completed: ${child.healthTask} for ${child.name}`);
    setTimeout(() => setActionNotice(null), 3500);

    if (selectedChildDetail && selectedChildDetail.id === child.id) {
      setSelectedChildDetail({
        ...selectedChildDetail,
        status: 'Completed',
        completedDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleReopenTask = (child: ChildRecord) => {
    onUpdateChildStatus(child.id, 'Upcoming');
    setActionNotice(`Task reopened for ${child.name}`);
    setTimeout(() => setActionNotice(null), 3500);

    if (selectedChildDetail && selectedChildDetail.id === child.id) {
      setSelectedChildDetail({
        ...selectedChildDetail,
        status: 'Upcoming',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Child Health & Administrative Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Universal immunization sessions, growth monitoring milestones, and newborn follow-up visits
          </p>
        </div>

        <button
          onClick={onAddChild}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Child Task</span>
        </button>
      </div>

      {/* User Action Feedback Notification */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Overdue Child Health Alerts Banner */}
      {overdueChildren.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <span>Overdue Child-Health Tasks ({overdueChildren.length} Children)</span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Critical immunization milestones (e.g. MR-1, DPT Booster) have passed their due dates. Immediate Anganwadi or home outreach required.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStatusFilter('Overdue');
              setPriorityFilter('All');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
          >
            Show Overdue ({overdueChildren.length})
          </button>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('Overdue')}
          className="bg-white border border-rose-200/80 rounded-xl p-4 text-left hover:border-rose-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-rose-600 flex items-center justify-between">
            <span>Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-700 mt-1 tabular-nums">
            {overdueChildren.length}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Vaccination missed</div>
        </button>

        <button
          onClick={() => setStatusFilter('Due Today')}
          className="bg-white border border-amber-200/80 rounded-xl p-4 text-left hover:border-amber-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-amber-700 flex items-center justify-between">
            <span>Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-800 mt-1 tabular-nums">
            {dueTodayChildren.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Today's session tasks</div>
        </button>

        <button
          onClick={() => setStatusFilter('Upcoming')}
          className="bg-white border border-sky-200/80 rounded-xl p-4 text-left hover:border-sky-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-sky-700 flex items-center justify-between">
            <span>Upcoming</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-sky-800 mt-1 tabular-nums">
            {upcomingChildren.length}
          </div>
          <div className="text-[11px] text-sky-700/80 mt-0.5">Scheduled this month</div>
        </button>

        <button
          onClick={() => setStatusFilter('Completed')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-nums">
            {completedChildren.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recorded in register</div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by child name, ID (e.g. CHD-201), task, village, parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority filter */}
          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Task Types</option>
              <option value="Scheduled vaccination">Scheduled vaccination</option>
              <option value="Growth monitoring">Growth monitoring</option>
              <option value="Follow-up visit">Follow-up visit</option>
              <option value="Health check-up">Health check-up</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-slate-400 mr-2">Filter by Status:</span>
            {(['All', 'Overdue', 'Due Today', 'Upcoming', 'Completed'] as const).map((status) => {
              const isActive = statusFilter === status;
              const count =
                status === 'All'
                  ? childrenRecords.length
                  : childrenRecords.filter((c) => c.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : status === 'Overdue' && count > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 tabular-nums">
            Showing <strong>{filteredChildren.length}</strong> of <strong>{childrenRecords.length}</strong> children
          </div>
        </div>
      </div>

      {/* Children Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Child ID</th>
                <th className="py-3 px-4">Child Name & Age</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Administrative Health Task</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    No child records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child) => {
                  const isOverdue = child.status === 'Overdue';
                  const isDueToday = child.status === 'Due Today';
                  const isCompleted = child.status === 'Completed';

                  return (
                    <tr
                      key={child.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Child ID */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {child.id}
                      </td>

                      {/* Name & Age */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedChildDetail(child)}
                          className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline text-left block"
                        >
                          {child.name}
                        </button>
                        <div className="text-xs text-slate-500">
                          {child.age} {child.parentName && `· Mother: ${child.parentName}`}
                        </div>
                      </td>

                      {/* Village */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{child.village}</span>
                        </div>
                      </td>

                      {/* Date of Birth */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums">
                        {child.dateOfBirth}
                      </td>

                      {/* Health Task */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {child.healthTask}
                        </div>
                        {child.taskCategory && (
                          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            {child.taskCategory}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-xs tabular-nums">
                        <div
                          className={`font-semibold ${
                            isOverdue
                              ? 'text-rose-600'
                              : isDueToday
                              ? 'text-amber-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {child.dueDate}
                        </div>
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                            Missed Due Date
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            child.priority === 'High'
                              ? 'text-rose-700 bg-rose-50'
                              : child.priority === 'Medium'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {child.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded inline-flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-700 bg-rose-100 border border-rose-200'
                              : isDueToday
                              ? 'text-amber-800 bg-amber-100 border border-amber-200'
                              : isCompleted
                              ? 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                              : 'text-sky-800 bg-sky-100 border border-sky-200'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          <span>{child.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedChildDetail(child)}
                            title="View Child Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isCompleted ? (
                            <span className="text-xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkCompleted(child)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Child Detail View Modal */}
      {selectedChildDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedChildDetail.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {selectedChildDetail.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Age: {selectedChildDetail.age} · DOB: {selectedChildDetail.dateOfBirth} · {selectedChildDetail.village}
                </div>
              </div>
              <button
                onClick={() => setSelectedChildDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Overdue alert if overdue */}
              {selectedChildDetail.status === 'Overdue' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900">
                    <strong className="font-semibold block">⚠️ Overdue Child-Health Milestone</strong>
                    <span>
                      This task was due on {selectedChildDetail.dueDate}. Timely immunization and growth monitoring are essential to prevent milestone drop-outs.
                    </span>
                  </div>
                </div>
              )}

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Task Status
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 ${
                        selectedChildDetail.status === 'Overdue'
                          ? 'text-rose-700 bg-rose-100'
                          : selectedChildDetail.status === 'Due Today'
                          ? 'text-amber-800 bg-amber-100'
                          : selectedChildDetail.status === 'Completed'
                          ? 'text-emerald-800 bg-emerald-100'
                          : 'text-sky-800 bg-sky-100'
                      }`}
                    >
                      {selectedChildDetail.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                      <span>{selectedChildDetail.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Priority
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded ${
                        selectedChildDetail.priority === 'High'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : selectedChildDetail.priority === 'Medium'
                          ? 'text-amber-800 bg-amber-50 border border-amber-200'
                          : 'text-slate-700 bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {selectedChildDetail.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Task Card */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Administrative Health Task
                </h4>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-950 leading-relaxed">
                  {selectedChildDetail.healthTask}
                </div>
                {selectedChildDetail.taskCategory && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    Category: <strong>{selectedChildDetail.taskCategory}</strong>
                  </div>
                )}
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Due Date</div>
                  <div
                    className={`text-sm font-bold mt-1 tabular-nums ${
                      selectedChildDetail.status === 'Overdue'
                        ? 'text-rose-600'
                        : selectedChildDetail.status === 'Due Today'
                        ? 'text-amber-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {selectedChildDetail.dueDate}
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedChildDetail.status === 'Completed' ? 'Completion Date' : 'Registration Date'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedChildDetail.completedDate || selectedChildDetail.dateOfBirth}
                  </div>
                </div>
              </div>

              {/* Family & Location */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mother / Guardian:</span>
                  <span className="font-semibold text-slate-900">{selectedChildDetail.parentName || 'Recorded in MCP Register'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Habitation Village:</span>
                  <span className="font-semibold text-slate-900">{selectedChildDetail.village}</span>
                </div>
              </div>

              {/* Field Coordinator Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Field Notes & Session Reminders
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  {selectedChildDetail.notes || 'No extra notes recorded. Routine Anganwadi session follow-up scheduled.'}
                </div>
              </div>

              {/* Safety notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Non-clinical tracking: This module manages vaccination schedules and growth logs. Diagnosis and clinical treatment must be referred to a Medical Officer.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedChildDetail(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedChildDetail.status === 'Completed' ? (
                  <button
                    type="button"
                    onClick={() => handleReopenTask(selectedChildDetail)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Reopen Task
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(selectedChildDetail)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Mark Task Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
