import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Patient, ChildRecord, ChildHealthStatus, MedicineItem, HealthTask } from '../types/health';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Add Patient Modal
interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (patient: Patient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [village, setVillage] = useState('Rampur Ward 3');
  const [phone, setPhone] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<Patient['status']>('Upcoming');
  const [ashaWorker, setAshaWorker] = useState('ASHA Sunita');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const todayStr = '2026-09-30';
    let computedStatus: Patient['status'] = status;
    if (nextFollowUp < todayStr) computedStatus = 'Overdue';
    else if (nextFollowUp === todayStr) computedStatus = 'Due Today';

    const newPatient: Patient = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      age: Number(age) || 20,
      gender,
      village,
      phone: phone || '+91 98765-00000',
      lastVisit: new Date().toISOString().split('T')[0],
      nextFollowUp,
      followUpReason: followUpReason.trim() || 'General health follow-up',
      conditionNote: followUpReason.trim() || 'General health follow-up',
      status: computedStatus,
      priority,
      ashaWorker,
      notes: 'Registered at Rampur Sub-Centre. Initial assessment recorded.',
    };

    onAdd(newPatient);
    onClose();
    setName('');
    setFollowUpReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Radhika Devi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
            <input
              type="number"
              min="0"
              max="110"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Ward</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              placeholder="+91 98765-XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Reason</label>
          <input
            type="text"
            required
            placeholder="e.g. Antenatal Care (ANC-2), Anemia check, Hypertension review"
            value={followUpReason}
            onChange={(e) => setFollowUpReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="High">High (High Risk / Urgent)</option>
              <option value="Medium">Medium (Routine Follow-up)</option>
              <option value="Low">Low (General Check)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned ASHA Worker</label>
            <input
              type="text"
              value={ashaWorker}
              onChange={(e) => setAshaWorker(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Save Patient Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Add Child Health Modal
interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (child: ChildRecord) => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [age, setAge] = useState('9 Months');
  const [dateOfBirth, setDateOfBirth] = useState('2025-12-25');
  const [taskCategory, setTaskCategory] = useState<ChildRecord['taskCategory']>('Scheduled vaccination');
  const [healthTask, setHealthTask] = useState('Scheduled vaccination: Measles-Rubella (MR-1) + Vitamin A');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<ChildRecord['priority']>('High');
  const [village, setVillage] = useState('Rampur Ward 3');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const todayStr = '2026-09-30';
    let computedStatus: ChildHealthStatus = 'Upcoming';
    if (dueDate < todayStr) computedStatus = 'Overdue';
    else if (dueDate === todayStr) computedStatus = 'Due Today';

    const newChild: ChildRecord = {
      id: `CHD-${Math.floor(200 + Math.random() * 800)}`,
      name: name.trim(),
      parentName: parentName || 'Mother/Guardian',
      age,
      dateOfBirth,
      taskCategory,
      healthTask,
      dueDate,
      status: computedStatus,
      priority,
      village,
      notes: notes || 'Registered at sub-centre session',
    };

    onAdd(newChild);
    onClose();
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Child Health Milestone">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Child Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age / Duration</label>
            <input
              type="text"
              placeholder="e.g. 6 Weeks, 9 Months, 1.5 Yrs"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Category</label>
            <select
              value={taskCategory}
              onChange={(e) => {
                const cat = e.target.value as any;
                setTaskCategory(cat);
                if (cat === 'Scheduled vaccination') setHealthTask('Scheduled vaccination: Pentavalent-1 booster');
                else if (cat === 'Growth monitoring') setHealthTask('Growth monitoring: Weight, length & MUAC screening');
                else if (cat === 'Follow-up visit') setHealthTask('Follow-up visit: Home-Based Newborn Care check');
                else if (cat === 'Health check-up') setHealthTask('Health check-up: Routine infant developmental check');
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Scheduled vaccination">Scheduled vaccination</option>
              <option value="Growth monitoring">Growth monitoring</option>
              <option value="Follow-up visit">Follow-up visit</option>
              <option value="Health check-up">Health check-up</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Health Task</label>
          <input
            type="text"
            required
            value={healthTask}
            onChange={(e) => setHealthTask(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian</label>
            <input
              type="text"
              placeholder="e.g. Sunita Devi"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Ward</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Field Notes / Special Instructions</label>
          <input
            type="text"
            placeholder="e.g. Coordinate with local Anganwadi worker"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Save Child Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Add Task Modal
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: HealthTask) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [taskName, setTaskName] = useState('');
  const [patientOrChild, setPatientOrChild] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [category, setCategory] = useState<HealthTask['category']>('Home Visit');
  const [assignedTo, setAssignedTo] = useState('ANM & ASHA Team');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newTask: HealthTask = {
      id: `TSK-${Math.floor(400 + Math.random() * 600)}`,
      taskName: taskName.trim(),
      patientOrChild: patientOrChild.trim() || 'General Centre',
      dueDate,
      priority,
      status: 'Pending',
      category,
      assignedTo,
    };

    onAdd(newTask);
    onClose();
    setTaskName('');
    setPatientOrChild('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Daily Health Centre Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Home visit for BP check & danger sign review"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Patient / Subject</label>
            <input
              type="text"
              placeholder="e.g. Sunita Devi (ANC-3)"
              value={patientOrChild}
              onChange={(e) => setPatientOrChild(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Home Visit">Home Visit</option>
              <option value="Immunization">Immunization Session</option>
              <option value="Stock Order">Drug Indent / Stock</option>
              <option value="NCD Follow-up">NCD Follow-up</option>
              <option value="Reporting">Portal Reporting</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="High">High (Immediate)</option>
              <option value="Medium">Medium (This Week)</option>
              <option value="Low">Low (Routine)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Health Worker</label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
