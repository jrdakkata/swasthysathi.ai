import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { ChildHealthView } from './components/ChildHealthView';
import { MedicineInventoryView } from './components/MedicineInventoryView';
import { TasksView } from './components/TasksView';
import { AIAssistantView } from './components/AIAssistantView';
import { 
  AddPatientModal, 
  AddChildModal, 
  AddTaskModal 
} from './components/Modals';
import { 
  INITIAL_PATIENTS, 
  INITIAL_CHILDREN, 
  INITIAL_MEDICINES, 
  INITIAL_TASKS 
} from './data/demoData';
import { 
  Patient, 
  ChildRecord, 
  MedicineItem, 
  HealthTask, 
  AISummaryResponse, 
  PatientStatus, 
  ChildHealthStatus, 
  TaskStatus, 
  MedicineStatus,
  calculateStockStatus,
  AshaProfile
} from './types/health';
import { computePriorities, PriorityItem } from './types/priorities';
import { NotificationsPanel } from './components/NotificationsPanel';
import { AshaAreaSelector } from './components/AshaAreaSelector';
import { DEMO_ASHA_PROFILES, getAshaDataSet } from './data/ashaProfilesData';
import { Building2, Heart, Users, Baby, Pill, CheckSquare } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Active ASHA Profile & Assigned Geographic Area (Meena Devi / Sunita Kumari / Kavita Devi)
  const [currentAsha, setCurrentAsha] = useState<AshaProfile>(() => {
    try {
      const saved = localStorage.getItem('swasthya_current_asha');
      if (saved) {
        const parsed: AshaProfile = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved asha profile:', e);
    }
    return DEMO_ASHA_PROFILES[0]; // Default: Meena Devi (Rampur, Andhra Pradesh)
  });

  const [showAreaModal, setShowAreaModal] = useState(false);

  // Application State with local storage persistence per ASHA area
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const ashaId = currentAsha ? currentAsha.id : 'ASHA-DEMO-001';
      const saved = localStorage.getItem(`swasthya_patients_${ashaId}`) || localStorage.getItem('swasthya_patients');
      if (saved) {
        const parsed: Patient[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved patients:', e);
    }
    return getAshaDataSet(currentAsha?.id || 'ASHA-DEMO-001').patients;
  });

  const [childrenRecords, setChildrenRecords] = useState<ChildRecord[]>(() => {
    try {
      const ashaId = currentAsha ? currentAsha.id : 'ASHA-DEMO-001';
      const saved = localStorage.getItem(`swasthya_children_${ashaId}`) || localStorage.getItem('swasthya_children');
      if (saved) {
        const parsed: ChildRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved children:', e);
    }
    return getAshaDataSet(currentAsha?.id || 'ASHA-DEMO-001').children;
  });

  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    try {
      const ashaId = currentAsha ? currentAsha.id : 'ASHA-DEMO-001';
      const saved = localStorage.getItem(`swasthya_medicines_${ashaId}`) || localStorage.getItem('swasthya_medicines');
      if (saved) {
        const parsed: MedicineItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          return parsed.map((m) => ({
            ...m,
            status: calculateStockStatus(m.currentStock, m.minThreshold),
            lastUpdated: m.lastUpdated || '2026-09-30',
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved medicines:', e);
    }
    return getAshaDataSet(currentAsha?.id || 'ASHA-DEMO-001').medicines;
  });

  const [tasks, setTasks] = useState<HealthTask[]>(() => {
    try {
      const ashaId = currentAsha ? currentAsha.id : 'ASHA-DEMO-001';
      const saved = localStorage.getItem(`swasthya_tasks_${ashaId}`) || localStorage.getItem('swasthya_tasks');
      if (saved) {
        const parsed: HealthTask[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved tasks:', e);
    }
    return getAshaDataSet(currentAsha?.id || 'ASHA-DEMO-001').tasks;
  });

  // Switch ASHA Profile and reload that ASHA's assigned village demo dataset
  const handleSelectAsha = (profile: AshaProfile) => {
    setCurrentAsha(profile);
    localStorage.setItem('swasthya_current_asha', JSON.stringify(profile));

    const defaultData = getAshaDataSet(profile.id);
    let ashaPatients = defaultData.patients;
    let ashaChildren = defaultData.children;
    let ashaMedicines = defaultData.medicines;
    let ashaTasks = defaultData.tasks;

    try {
      const saved = localStorage.getItem(`swasthya_patients_${profile.id}`);
      if (saved) ashaPatients = JSON.parse(saved);
    } catch {}

    try {
      const saved = localStorage.getItem(`swasthya_children_${profile.id}`);
      if (saved) ashaChildren = JSON.parse(saved);
    } catch {}

    try {
      const saved = localStorage.getItem(`swasthya_medicines_${profile.id}`);
      if (saved) ashaMedicines = JSON.parse(saved);
    } catch {}

    try {
      const saved = localStorage.getItem(`swasthya_tasks_${profile.id}`);
      if (saved) ashaTasks = JSON.parse(saved);
    } catch {}

    setPatients(ashaPatients);
    setChildrenRecords(ashaChildren);
    setMedicines(ashaMedicines);
    setTasks(ashaTasks);
  };

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Modals state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showQuickRecordChoice, setShowQuickRecordChoice] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  // Save to localStorage per ASHA profile
  useEffect(() => {
    localStorage.setItem(`swasthya_patients_${currentAsha.id}`, JSON.stringify(patients));
  }, [patients, currentAsha.id]);

  useEffect(() => {
    localStorage.setItem(`swasthya_children_${currentAsha.id}`, JSON.stringify(childrenRecords));
  }, [childrenRecords, currentAsha.id]);

  useEffect(() => {
    localStorage.setItem(`swasthya_medicines_${currentAsha.id}`, JSON.stringify(medicines));
  }, [medicines, currentAsha.id]);

  useEffect(() => {
    localStorage.setItem(`swasthya_tasks_${currentAsha.id}`, JSON.stringify(tasks));
  }, [tasks, currentAsha.id]);

  // Priority Engine: Automatically collect and categorize pending items
  const priorities = computePriorities(patients, childrenRecords, medicines, tasks);

  // Resolution handler: Resolving an item updates source state and clears from notifications
  const handleResolvePriorityItem = (item: PriorityItem) => {
    if (item.category === 'patient') {
      handleUpdatePatientFollowUp(item.targetId, '2026-10-30', 'Completed');
    } else if (item.category === 'child') {
      handleUpdateChildStatus(item.targetId, 'Completed');
    } else if (item.category === 'medicine') {
      const med = medicines.find((m) => m.id === item.targetId);
      if (med) {
        // Restock to safe level above threshold
        const safeStock = Math.max(med.minThreshold * 2, med.currentStock + 50);
        handleUpdateStock(item.targetId, safeStock);
      }
    } else if (item.category === 'task') {
      handleUpdateTaskStatus(item.targetId, 'Completed');
    }
  };

  // Fetch AI daily summary
  const fetchAISummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patients,
          children: childrenRecords,
          medicines,
          tasks,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
      }
    } catch (err) {
      console.warn('Failed to fetch AI summary, using default:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchAISummary();
  }, []);

  // Update handlers
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleUpdatePatientFollowUp = (patientId: string, nextDate: string, status: PatientStatus) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, nextFollowUp: nextDate, status, lastVisit: new Date().toISOString().split('T')[0] } : p
      )
    );
  };

  const handleAddChild = (newChild: ChildRecord) => {
    setChildrenRecords((prev) => [newChild, ...prev]);
  };

  const handleUpdateChildStatus = (childId: string, status: ChildHealthStatus) => {
    setChildrenRecords((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, status, completedDate: '2026-09-30' } : c))
    );
  };

  const handleUpdateStock = (medicineId: string, newStock: number) => {
    const today = new Date().toISOString().split('T')[0];
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== medicineId) return m;
        const validStock = Math.max(0, newStock);
        const status: MedicineStatus = calculateStockStatus(validStock, m.minThreshold);
        return { ...m, currentStock: validStock, status, lastUpdated: today };
      })
    );
  };

  const handleAddMedicine = (newMed: MedicineItem) => {
    setMedicines((prev) => [newMed, ...prev]);
  };

  const handleAddTask = (newTask: HealthTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // Notification count driven directly by the Priority Engine
  const notificationCount = priorities.length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Scalable Location Hierarchy & ASHA Profile Selector Bar */}
      <AshaAreaSelector
        currentProfile={currentAsha}
        onSelectProfile={handleSelectAsha}
        isModalOpen={showAreaModal}
        onModalOpenChange={setShowAreaModal}
      />

      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        urgentCount={notificationCount}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        onOpenQuickAdd={() => setShowQuickRecordChoice(true)}
        onOpenNotifications={() => setShowNotificationsPanel(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            currentAsha={currentAsha}
            onOpenAreaSelector={() => setShowAreaModal(true)}
            patients={patients}
            childrenRecords={childrenRecords}
            medicines={medicines}
            tasks={tasks}
            priorities={priorities}
            aiSummary={aiSummary}
            isLoadingSummary={isLoadingSummary}
            onRefreshSummary={fetchAISummary}
            onNavigate={setCurrentTab}
            onCompleteTask={(taskId) => handleUpdateTaskStatus(taskId, 'Completed')}
            onOpenQuickAdd={() => setShowQuickRecordChoice(true)}
            onResolveItem={handleResolvePriorityItem}
            onOpenNotifications={() => setShowNotificationsPanel(true)}
          />
        )}

        {currentTab === 'patients' && (
          <PatientsView
            patients={patients}
            onAddPatient={() => setShowAddPatientModal(true)}
            onUpdatePatientFollowUp={handleUpdatePatientFollowUp}
          />
        )}

        {currentTab === 'child-health' && (
          <ChildHealthView
            childrenRecords={childrenRecords}
            onAddChild={() => setShowAddChildModal(true)}
            onUpdateChildStatus={handleUpdateChildStatus}
          />
        )}

        {currentTab === 'medicines' && (
          <MedicineInventoryView
            medicines={medicines}
            onUpdateStock={handleUpdateStock}
            onAddMedicine={handleAddMedicine}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onAddTask={() => setShowAddTaskModal(true)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AIAssistantView
            currentAsha={currentAsha}
            patients={patients}
            childrenRecords={childrenRecords}
            medicines={medicines}
            tasks={tasks}
            priorities={priorities}
            language={language}
          />
        )}
      </main>

      {/* Clean Footer adhering to design constitution */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SwasthyaSathi AI</span>
            <span aria-hidden="true">·</span>
            <span>Rampur Primary Health Sub-Centre Prototype</span>
            <span aria-hidden="true">·</span>
            <span>Ayushman Bharat Arogya Mandir</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Powered by gemini-3.8-flash (Free Tier) · Frontline Healthcare Companion</span>
          </div>
        </div>
      </footer>

      {/* Quick Record Selection Modal */}
      {showQuickRecordChoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">What would you like to record?</h3>
              <button
                onClick={() => setShowQuickRecordChoice(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowQuickRecordChoice(false);
                  setShowAddPatientModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors"
              >
                <div className="p-2 rounded-md bg-emerald-100 text-emerald-800">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Register New Patient</div>
                  <div className="text-[11px] text-slate-500">Maternal ANC/PNC or general follow-up</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickRecordChoice(false);
                  setShowAddChildModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors"
              >
                <div className="p-2 rounded-md bg-amber-100 text-amber-800">
                  <Baby className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Record Child Milestone</div>
                  <div className="text-[11px] text-slate-500">Immunization dose or growth check</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickRecordChoice(false);
                  setShowAddTaskModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors"
              >
                <div className="p-2 rounded-md bg-sky-100 text-sky-800">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Add Field Task</div>
                  <div className="text-[11px] text-slate-500">Home outreach or clinic session</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickRecordChoice(false);
                  setCurrentTab('medicines');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors"
              >
                <div className="p-2 rounded-md bg-purple-100 text-purple-800">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Update Drug Inventory</div>
                  <div className="text-[11px] text-slate-500">Record medicine receipt or stock adjustment</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Creation Modals */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onAdd={handleAddPatient}
      />

      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAdd={handleAddChild}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={handleAddTask}
      />

      {/* Slide-over Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotificationsPanel}
        onClose={() => setShowNotificationsPanel(false)}
        priorities={priorities}
        onResolveItem={handleResolvePriorityItem}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setShowNotificationsPanel(false);
        }}
      />
    </div>
  );
}
