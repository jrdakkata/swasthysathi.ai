import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Calendar, User } from 'lucide-react';
import { HealthTask, TaskStatus, PriorityLevel } from '../types/health';

interface TasksViewProps {
  tasks: HealthTask[];
  onAddTask: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.patientOrChild.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Administrative & Field Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Routine field visits, immunization outreach, NCD check-ins, and health reporting
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field Task</span>
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-rose-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-rose-700">Pending Tasks</div>
          <div className="text-2xl font-bold tracking-tight text-rose-700 mt-1 tabular-nums">{pendingCount}</div>
          <div className="text-xs text-rose-600/80 mt-0.5">Awaiting field action</div>
        </div>

        <div className="bg-white border border-sky-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-sky-700">In Progress</div>
          <div className="text-2xl font-bold tracking-tight text-sky-800 mt-1 tabular-nums">{inProgressCount}</div>
          <div className="text-xs text-sky-700/80 mt-0.5">Currently being coordinated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Completed</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-nums">{completedCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Verified & recorded</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search task title, patient name, worker name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
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
        </div>

        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-2">Filter Status:</span>
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Task Name & Scope</th>
                <th className="py-3 px-4">Patient / Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    No tasks match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isPending = task.status === 'Pending';
                  const isInProgress = task.status === 'In Progress';
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Task Name */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className={`font-semibold text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {task.taskName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Assigned: {task.assignedTo}</span>
                        </div>
                      </td>

                      {/* Patient/Child */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {task.patientOrChild}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {task.category}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-xs font-semibold tabular-nums text-slate-700">
                        {task.dueDate}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            task.priority === 'High'
                              ? 'text-rose-700 bg-rose-50'
                              : task.priority === 'Medium'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isPending
                              ? 'text-rose-700 bg-rose-50'
                              : isInProgress
                              ? 'text-sky-800 bg-sky-50'
                              : 'text-emerald-800 bg-emerald-50'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                              className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {!isCompleted ? (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                            >
                              Done
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'Pending')}
                              className="text-xs text-slate-400 hover:text-slate-600 underline"
                            >
                              Reopen
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
    </div>
  );
};
