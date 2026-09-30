import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  Baby, 
  Pill, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  RotateCw,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Patient, ChildRecord, MedicineItem, HealthTask, AISummaryResponse, AshaProfile } from '../types/health';
import { PriorityItem } from '../types/priorities';
import { NavTab } from './Header';
import { TodaysPrioritiesSection } from './TodaysPrioritiesSection';

interface DashboardViewProps {
  currentAsha: AshaProfile;
  onOpenAreaSelector: () => void;
  patients: Patient[];
  childrenRecords: ChildRecord[];
  medicines: MedicineItem[];
  tasks: HealthTask[];
  priorities: PriorityItem[];
  aiSummary: AISummaryResponse | null;
  isLoadingSummary: boolean;
  onRefreshSummary: () => void;
  onNavigate: (tab: NavTab) => void;
  onCompleteTask: (taskId: string) => void;
  onOpenQuickAdd: () => void;
  onResolveItem: (item: PriorityItem) => void;
  onOpenNotifications: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentAsha,
  onOpenAreaSelector,
  patients,
  childrenRecords,
  medicines,
  tasks,
  priorities,
  aiSummary,
  isLoadingSummary,
  onRefreshSummary,
  onNavigate,
  onCompleteTask,
  onOpenQuickAdd,
  onResolveItem,
  onOpenNotifications,
}) => {
  const [completedNotification, setCompletedNotification] = useState<string | null>(null);

  // Computed metrics
  const totalPatients = patients.length;
  const overdueFollowUps = patients.filter((p) => p.status === 'Overdue').length;

  const todayStr = '2026-09-30'; // Anchor date aligned with demo system context
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || t.status === 'Pending'
  ).length;

  const childHealthAlerts = childrenRecords.filter(
    (c) => c.status === 'Overdue' || c.status === 'Due Today'
  ).length;

  const medicineAlerts = medicines.filter(
    (m) => m.status === 'Critical' || m.status === 'Low Stock'
  ).length;

  // Urgent subsets
  const overduePatientsList = patients.filter((p) => p.status === 'Overdue').slice(0, 4);
  const urgentChildren = childrenRecords.filter((c) => c.status === 'Overdue' || c.status === 'Due Today').slice(0, 3);
  const criticalMedicines = medicines.filter((m) => m.status === 'Critical' || m.status === 'Low Stock').slice(0, 4);
  const pendingTasksList = tasks.filter((t) => t.status === 'Pending').slice(0, 4);

  const handleTaskDone = (taskId: string, taskName: string) => {
    onCompleteTask(taskId);
    setCompletedNotification(`Marked done: "${taskName}"`);
    setTimeout(() => setCompletedNotification(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Hero Section with Selected ASHA Location Hierarchy */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span>{currentAsha.location.phcSubCentre}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">
                {currentAsha.location.block}, {currentAsha.location.district}, {currentAsha.location.state}
              </span>
              <span aria-hidden="true">·</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                DEMO DATA ONLY
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{currentAsha.location.village} Health Dashboard</span>
            </h1>

            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">ASHA: {currentAsha.name}</span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {currentAsha.id}
              </span>
              <span>·</span>
              <span>Assigned Habitation: <strong>{currentAsha.location.habitation}</strong></span>
              <span>·</span>
              <span>Assigned Households: <strong>{currentAsha.location.assignedHouseholds}</strong></span>
              <span>·</span>
              <span>Covered Population: <strong>~{currentAsha.location.populationCovered}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAreaSelector}
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch Area ({currentAsha.location.village})</span>
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              + Quick Record
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {completedNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{completedNotification}</span>
          </div>
          <button onClick={() => setCompletedNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Patients */}
        <button
          onClick={() => onNavigate('patients')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Patients</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalPatients}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Registered in sub-centre
          </div>
        </button>

        {/* Overdue Follow-ups */}
        <button
          onClick={() => onNavigate('patients')}
          className="bg-white border border-rose-200/80 rounded-xl p-4 text-left hover:border-rose-300 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold">Overdue Follow-ups</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            {overdueFollowUps}
          </div>
          <div className="text-xs text-rose-700/80 mt-1">
            Needs home outreach
          </div>
        </button>

        {/* Today's Tasks */}
        <button
          onClick={() => onNavigate('tasks')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Today's Tasks</span>
            <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {todayTasks}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active daily items
          </div>
        </button>

        {/* Child-Health Alerts */}
        <button
          onClick={() => onNavigate('child-health')}
          className="bg-white border border-amber-200/80 rounded-xl p-4 text-left hover:border-amber-300 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Child-Health Alerts</span>
            <Baby className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700 tabular-nums">
            {childHealthAlerts}
          </div>
          <div className="text-xs text-amber-800/80 mt-1">
            Vaccine & milestone due
          </div>
        </button>

        {/* Medicine Stock Alerts */}
        <button
          onClick={() => onNavigate('medicines')}
          className="col-span-2 sm:col-span-1 bg-white border border-orange-200/80 rounded-xl p-4 text-left hover:border-orange-300 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-orange-700 mb-2">
            <span className="text-xs font-semibold">Medicine Alerts</span>
            <Pill className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-orange-700 tabular-nums">
            {medicineAlerts}
          </div>
          <div className="text-xs text-orange-800/80 mt-1">
            Critical or low stock
          </div>
        </button>
      </div>

      {/* Unified Today's Priorities Section */}
      <TodaysPrioritiesSection
        priorities={priorities}
        onResolveItem={onResolveItem}
        onOpenNotifications={onOpenNotifications}
      />

      {/* AI Daily Executive Summary Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  AI Daily Field Briefing
                </h2>
                <span className="text-xs text-slate-500">
                  Generated {aiSummary?.generatedAt || 'just now'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated administrative synthesis of patient rosters, vaccine due dates, and inventory
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshSummary}
            disabled={isLoadingSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLoadingSummary ? 'Synthesizing...' : 'Regenerate Briefing'}</span>
          </button>
        </div>

        {/* Content of AI Summary */}
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {aiSummary?.summaryText ||
              "Today's sub-centre priority focuses on 3 overdue patient follow-ups and 4 urgent child immunization checks across Rampur Ward 3 and Shivpur Khurd. Immediate medicine indenting is required for low stocks."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Urgent Priorities */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                1. Field Priority Focus
              </span>
              <ul className="text-xs text-slate-600 space-y-2">
                {aiSummary?.urgentPriorities?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">·</span>
                    <span>{item}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">·</span>
                      <span>Prioritize Sunita Devi (ANC-3) & Aarav Kumar (MR-1 vaccine) in Rampur Ward 3.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">·</span>
                      <span>Check blood pressure adherence for Rameshwar Prasad in Shivpur Khurd.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Critical Medicine Indent */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                2. Urgent Drug Indent Warning
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiSummary?.stockWarning ||
                  "Critical shortage of Maternal IFA tablets (18 left, min 100) and ORS Sachets (24 left, min 80). Place indent with CHC pharmacist immediately."}
              </p>
              <button
                onClick={() => onNavigate('medicines')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Review Drug Indent List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Field Route Suggestion */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                3. Recommended Field Route
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiSummary?.fieldVisitPlan ||
                  "Morning: Ward 3 cluster (Sunita Devi + Aarav Kumar). Afternoon: Shivpur Khurd (Rameshwar Prasad + Vihaan Patel) to conserve transit time."}
              </p>
              <button
                onClick={() => onNavigate('tasks')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View Route Task Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Administrative Safety Boundary:</strong> SwasthyaSathi AI coordinates field logistics, appointment tracking, and inventory logs. It does not replace medical officers or provide clinical diagnostic decisions.
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Operational Action Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Overdue Follow-ups & Child Immunization Alerts */}
        <div className="space-y-6">
          {/* Overdue Patients */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Overdue Patient Follow-ups</h3>
                <p className="text-xs text-slate-500">Patients overdue for field check-up or clinic review</p>
              </div>
              <button
                onClick={() => onNavigate('patients')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All ({overdueFollowUps})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {overduePatientsList.map((p) => (
                <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-500">
                        {p.age}y · {p.gender}
                      </span>
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{p.followUpReason || p.conditionNote}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{p.village}</span>
                      </span>
                      <span className="text-rose-600 font-medium tabular-nums">
                        Due was: {p.nextFollowUp}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('patients')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 whitespace-nowrap transition-colors"
                  >
                    Log Visit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Child Health Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Child Immunization Due / Overdue</h3>
                <p className="text-xs text-slate-500">Scheduled universal immunization program milestones</p>
              </div>
              <button
                onClick={() => onNavigate('child-health')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All ({childHealthAlerts})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {urgentChildren.map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                      <span className="text-xs text-slate-500">
                        {c.age} · Mother: {c.parentName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          c.status === 'Overdue'
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-emerald-800 mt-1">
                      {c.healthTask}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{c.village}</span>
                      <span>·</span>
                      <span className="tabular-nums">Due: {c.dueDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('child-health')}
                    className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 whitespace-nowrap transition-colors"
                  >
                    Record Dose
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Medicine Stock Shortages & Today's Field Task List */}
        <div className="space-y-6">
          {/* Medicine Stock Shortages */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medicine Stock Alerts</h3>
                <p className="text-xs text-slate-500">Items below minimum safety threshold</p>
              </div>
              <button
                onClick={() => onNavigate('medicines')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Inventory ({medicines.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {criticalMedicines.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{m.name}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          m.status === 'Critical'
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Current: <strong className="text-slate-900 tabular-nums">{m.currentStock} {m.unit}</strong> (Min Threshold: {m.minThreshold})
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('medicines')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 whitespace-nowrap transition-colors"
                  >
                    + Restock
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Tasks Quick Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Field Tasks Checklist</h3>
                <p className="text-xs text-slate-500">Directly check off completed administrative duties</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>All Tasks ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {pendingTasksList.map((t) => (
                <div key={t.id} className="py-3 flex items-start gap-3">
                  <button
                    onClick={() => handleTaskDone(t.id, t.taskName)}
                    className="mt-0.5 w-4 h-4 rounded border border-slate-300 text-white hover:border-emerald-600 flex items-center justify-center transition-colors shrink-0"
                    title="Mark task completed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-300 hover:text-emerald-600" />
                  </button>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-900 leading-snug">
                      {t.taskName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{t.patientOrChild}</span>
                      <span>·</span>
                      <span className="font-semibold text-amber-700">{t.priority} Priority</span>
                      <span>·</span>
                      <span className="tabular-nums">Due: {t.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
