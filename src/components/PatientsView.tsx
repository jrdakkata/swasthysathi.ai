import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Eye, 
  X, 
  User, 
  CheckCircle2, 
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { Patient, PatientStatus, PriorityLevel } from '../types/health';

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: () => void;
  onUpdatePatientFollowUp: (patientId: string, nextDate: string, status: PatientStatus) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onAddPatient,
  onUpdatePatientFollowUp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [villageFilter, setVillageFilter] = useState('All');
  
  // Patient Detail View state
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null);

  // Reschedule modal state
  const [selectedPatientForUpdate, setSelectedPatientForUpdate] = useState<Patient | null>(null);
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState<PatientStatus>('Upcoming');

  // Quick feedback alert
  const [notification, setNotification] = useState<string | null>(null);

  // Extract unique villages
  const villages = ['All', ...Array.from(new Set(patients.map((p) => p.village)))];

  // Overdue count calculation
  const overduePatients = patients.filter((p) => p.status === 'Overdue');
  const dueTodayPatients = patients.filter((p) => p.status === 'Due Today');

  // Filtering
  const filteredPatients = patients.filter((patient) => {
    const reasonText = patient.followUpReason || patient.conditionNote || '';
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reasonText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || patient.priority === priorityFilter;
    const matchesVillage = villageFilter === 'All' || patient.village === villageFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesVillage;
  });

  const handleOpenReschedule = (patient: Patient) => {
    setSelectedPatientForUpdate(patient);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setNewFollowUpDate(d.toISOString().split('T')[0]);
    setNewStatus('Upcoming');
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForUpdate || !newFollowUpDate) return;

    onUpdatePatientFollowUp(selectedPatientForUpdate.id, newFollowUpDate, newStatus);
    setNotification(`Updated follow-up for ${selectedPatientForUpdate.name} to ${newFollowUpDate}`);
    setTimeout(() => setNotification(null), 3500);

    // If detail view was open, update detail reference as well
    if (selectedPatientDetail && selectedPatientDetail.id === selectedPatientForUpdate.id) {
      setSelectedPatientDetail({
        ...selectedPatientDetail,
        nextFollowUp: newFollowUpDate,
        status: newStatus,
      });
    }

    setSelectedPatientForUpdate(null);
  };

  const handleMarkCompleted = (patient: Patient) => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() + 28);
    const futureDate = d.toISOString().split('T')[0];

    onUpdatePatientFollowUp(patient.id, futureDate, 'Completed');
    setNotification(`Follow-up marked completed for ${patient.name}`);
    setTimeout(() => setNotification(null), 3500);

    if (selectedPatientDetail && selectedPatientDetail.id === patient.id) {
      setSelectedPatientDetail({
        ...selectedPatientDetail,
        lastVisit: today,
        nextFollowUp: futureDate,
        status: 'Completed',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patient Follow-up Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Active tracking for maternal care (ANC/PNC), infant health, chronic illness, and elderly care
          </p>
        </div>

        <button
          onClick={onAddPatient}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* User Feedback Notice */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Clear Overdue Alert Banner */}
      {overduePatients.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <span>Critical Follow-up Alert: {overduePatients.length} Overdue Patients</span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                These patients have missed their scheduled sub-centre review dates. Frontline ASHA home visits are recommended immediately.
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
            Show Overdue ({overduePatients.length})
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID (e.g. PAT-101), reason, village, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority Filter */}
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

          {/* Village Filter */}
          <div className="sm:col-span-3">
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v === 'All' ? 'All Villages' : v}
                </option>
              ))}
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
                  ? patients.length
                  : patients.filter((p) => p.status === status).length;

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
            Showing <strong>{filteredPatients.length}</strong> of <strong>{patients.length}</strong> patients
          </div>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4">Follow-up Reason</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    No patients match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const isOverdue = patient.status === 'Overdue';
                  const isDueToday = patient.status === 'Due Today';
                  const isUpcoming = patient.status === 'Upcoming';
                  const isCompleted = patient.status === 'Completed';

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Patient ID */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {patient.id}
                      </td>

                      {/* Name & Demographics */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedPatientDetail(patient)}
                          className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline text-left"
                        >
                          {patient.name}
                        </button>
                        <div className="text-xs text-slate-500">
                          {patient.age}y · {patient.gender} · {patient.phone}
                        </div>
                      </td>

                      {/* Village */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{patient.village}</span>
                        </div>
                      </td>

                      {/* Last Visit Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums">
                        {patient.lastVisit}
                      </td>

                      {/* Next Follow-up Date */}
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
                          {patient.nextFollowUp}
                        </div>
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>Overdue Alert</span>
                          </span>
                        )}
                      </td>

                      {/* Follow-up Reason */}
                      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">
                        <span className="line-clamp-2">
                          {patient.followUpReason || patient.conditionNote}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            patient.priority === 'High'
                              ? 'text-rose-700 bg-rose-50'
                              : patient.priority === 'Medium'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {patient.priority}
                        </span>
                      </td>

                      {/* Follow-up Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded inline-flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-700 bg-rose-100 border border-rose-200'
                              : isDueToday
                              ? 'text-amber-800 bg-amber-100 border border-amber-200'
                              : isUpcoming
                              ? 'text-sky-800 bg-sky-100 border border-sky-200'
                              : 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          <span>{patient.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatientDetail(patient)}
                            title="View Patient Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMarkCompleted(patient)}
                            title="Mark follow-up completed"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(patient)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Reschedule
                          </button>
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

      {/* Patient Detail View Modal */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedPatientDetail.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {selectedPatientDetail.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedPatientDetail.age} years · {selectedPatientDetail.gender} · {selectedPatientDetail.village}
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Overdue alert banner if patient is overdue */}
              {selectedPatientDetail.status === 'Overdue' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900">
                    <strong className="font-semibold block">⚠️ Follow-up Overdue Alert</strong>
                    <span>
                      This patient was scheduled for review on {selectedPatientDetail.nextFollowUp} and has missed their visit. Please assign ASHA outreach to verify health condition.
                    </span>
                  </div>
                </div>
              )}

              {/* Status and Priority Row */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Follow-up Status
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 ${
                        selectedPatientDetail.status === 'Overdue'
                          ? 'text-rose-700 bg-rose-100'
                          : selectedPatientDetail.status === 'Due Today'
                          ? 'text-amber-800 bg-amber-100'
                          : selectedPatientDetail.status === 'Upcoming'
                          ? 'text-sky-800 bg-sky-100'
                          : 'text-emerald-800 bg-emerald-100'
                      }`}
                    >
                      {selectedPatientDetail.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                      <span>{selectedPatientDetail.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Priority Level
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded ${
                        selectedPatientDetail.priority === 'High'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : selectedPatientDetail.priority === 'Medium'
                          ? 'text-amber-800 bg-amber-50 border border-amber-200'
                          : 'text-slate-700 bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {selectedPatientDetail.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Visit Schedule Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Last Visit Date</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedPatientDetail.lastVisit}
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Next Follow-up Date</div>
                  <div
                    className={`text-sm font-bold mt-1 tabular-nums ${
                      selectedPatientDetail.status === 'Overdue'
                        ? 'text-rose-600'
                        : selectedPatientDetail.status === 'Due Today'
                        ? 'text-amber-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {selectedPatientDetail.nextFollowUp}
                  </div>
                </div>
              </div>

              {/* Follow-up Reason */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Reason for Follow-up
                </h4>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-950 font-medium leading-relaxed">
                  {selectedPatientDetail.followUpReason || selectedPatientDetail.conditionNote}
                </div>
              </div>

              {/* Field Coordinator Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Field Notes & Observations
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  {selectedPatientDetail.notes || 'No extra notes recorded. Routine follow-up scheduled.'}
                </div>
              </div>

              {/* Contact & Field Staff */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{selectedPatientDetail.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{selectedPatientDetail.ashaWorker || 'Assigned ANM / ASHA'}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedPatientDetail(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReschedule(selectedPatientDetail);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMarkCompleted(selectedPatientDetail);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Mark Follow-up Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Date Modal */}
      {selectedPatientForUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Reschedule Follow-up
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: <strong>{selectedPatientForUpdate.name}</strong> ({selectedPatientForUpdate.id})
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Follow-up Date
                </label>
                <input
                  type="date"
                  required
                  value={newFollowUpDate}
                  onChange={(e) => {
                    setNewFollowUpDate(e.target.value);
                    if (e.target.value === '2026-09-30') {
                      setNewStatus('Due Today');
                    } else if (e.target.value > '2026-09-30') {
                      setNewStatus('Upcoming');
                    } else {
                      setNewStatus('Overdue');
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Due Today">Due Today</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForUpdate(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
