export type PatientStatus = 'Overdue' | 'Due Today' | 'Upcoming' | 'Completed';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  village: string;
  phone: string;
  lastVisit: string;
  nextFollowUp: string;
  followUpReason: string;
  conditionNote?: string;
  priority: PriorityLevel;
  status: PatientStatus;
  notes?: string;
  ashaWorker?: string;
}

export type ChildHealthStatus = 'Overdue' | 'Due Today' | 'Upcoming' | 'Completed';

export interface ChildRecord {
  id: string;
  name: string;
  age: string;
  village: string;
  dateOfBirth: string;
  healthTask: string;
  dueDate: string;
  status: ChildHealthStatus;
  priority: PriorityLevel;
  parentName?: string;
  notes?: string;
  completedDate?: string;
  taskCategory?: 'Scheduled vaccination' | 'Growth monitoring' | 'Follow-up visit' | 'Health check-up';
}

export type MedicineStatus = 'Available' | 'Low Stock' | 'Critical';

export interface MedicineItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  lastUpdated: string;
  status: MedicineStatus;
  batchNo?: string;
  expiryDate?: string;
  supplier?: string;
  notes?: string;
}

export const calculateStockStatus = (currentStock: number, minThreshold: number): MedicineStatus => {
  if (currentStock < minThreshold) {
    return 'Critical';
  }
  if (currentStock <= Math.round(minThreshold * 1.25)) {
    return 'Low Stock';
  }
  return 'Available';
};

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface HealthTask {
  id: string;
  taskName: string;
  patientOrChild: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  category: 'Home Visit' | 'Immunization' | 'Stock Order' | 'NCD Follow-up' | 'Reporting';
  assignedTo: string;
}

export interface AISummaryResponse {
  summaryText: string;
  urgentPriorities: string[];
  stockWarning: string;
  fieldVisitPlan: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAdministrativeNotice?: boolean;
}

export interface AshaLocationHierarchy {
  state: string;
  district: string;
  block: string;
  phcSubCentre: string;
  village: string;
  habitation: string;
  assignedHouseholds: number;
  populationCovered: number;
}

export interface AshaProfile {
  id: string;
  name: string;
  phone: string;
  experienceYears: number;
  role: string;
  location: AshaLocationHierarchy;
}
