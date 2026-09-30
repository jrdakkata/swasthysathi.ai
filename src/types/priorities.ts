import { Patient, ChildRecord, MedicineItem, HealthTask } from './health';

export type PrioritySeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityItem {
  id: string;
  severity: PrioritySeverity;
  category: 'patient' | 'child' | 'medicine' | 'task';
  title: string;
  relatedName: string;
  details: string;
  dueOrStockInfo: string;
  badgeLabel: string;
  targetId: string;
  actionLabel: string;
  timestamp: string;
}

/**
 * Priority Rules:
 * HIGH PRIORITY:
 * - Overdue patient follow-up
 * - Overdue child-health task
 * - Critical medicine stock
 * 
 * MEDIUM PRIORITY:
 * - Patient follow-up due today
 * - Child-health task due today
 * - Task due today / Pending high priority
 * - Low medicine stock
 * 
 * LOW PRIORITY:
 * - Upcoming patient follow-up
 * - Upcoming child-health task
 * - Upcoming health-centre tasks
 */
export function computePriorities(
  patients: Patient[],
  children: ChildRecord[],
  medicines: MedicineItem[],
  tasks: HealthTask[]
): PriorityItem[] {
  const items: PriorityItem[] = [];
  const todayStr = '2026-09-30';

  // 1. PATIENT MANAGEMENT
  patients.forEach((p) => {
    if (p.status === 'Overdue') {
      items.push({
        id: `patient-${p.id}`,
        severity: 'HIGH',
        category: 'patient',
        title: `${p.name} — overdue follow-up`,
        relatedName: p.name,
        details: `${p.followUpReason || p.conditionNote} (${p.village})`,
        dueOrStockInfo: `Due: ${p.nextFollowUp} (Overdue)`,
        badgeLabel: 'Overdue Follow-up',
        targetId: p.id,
        actionLabel: 'Complete Follow-up',
        timestamp: p.nextFollowUp,
      });
    } else if (p.status === 'Due Today') {
      items.push({
        id: `patient-${p.id}`,
        severity: 'MEDIUM',
        category: 'patient',
        title: `${p.name} — follow-up due today`,
        relatedName: p.name,
        details: `${p.followUpReason || p.conditionNote} (${p.village})`,
        dueOrStockInfo: `Due: Today (${todayStr})`,
        badgeLabel: 'Due Today',
        targetId: p.id,
        actionLabel: 'Complete Follow-up',
        timestamp: p.nextFollowUp,
      });
    } else if (p.status === 'Upcoming' && p.priority === 'High') {
      items.push({
        id: `patient-${p.id}`,
        severity: 'LOW',
        category: 'patient',
        title: `${p.name} — upcoming high-risk visit`,
        relatedName: p.name,
        details: `${p.followUpReason || p.conditionNote} (${p.village})`,
        dueOrStockInfo: `Scheduled: ${p.nextFollowUp}`,
        badgeLabel: 'Upcoming Follow-up',
        targetId: p.id,
        actionLabel: 'View Record',
        timestamp: p.nextFollowUp,
      });
    }
  });

  // 2. CHILD HEALTH
  children.forEach((c) => {
    if (c.status === 'Overdue') {
      items.push({
        id: `child-${c.id}`,
        severity: 'HIGH',
        category: 'child',
        title: `${c.name} — overdue child-health task`,
        relatedName: c.name,
        details: `${c.healthTask} (${c.village})`,
        dueOrStockInfo: `Due: ${c.dueDate} (Missed)`,
        badgeLabel: 'Overdue Child Task',
        targetId: c.id,
        actionLabel: 'Mark Task Done',
        timestamp: c.dueDate,
      });
    } else if (c.status === 'Due Today') {
      items.push({
        id: `child-${c.id}`,
        severity: 'MEDIUM',
        category: 'child',
        title: `${c.name} — child task due today`,
        relatedName: c.name,
        details: `${c.healthTask} (${c.village})`,
        dueOrStockInfo: `Due: Today (${todayStr})`,
        badgeLabel: 'Child Task Due',
        targetId: c.id,
        actionLabel: 'Mark Task Done',
        timestamp: c.dueDate,
      });
    } else if (c.status === 'Upcoming' && c.priority === 'High') {
      items.push({
        id: `child-${c.id}`,
        severity: 'LOW',
        category: 'child',
        title: `${c.name} — upcoming immunization milestone`,
        relatedName: c.name,
        details: `${c.healthTask} (${c.village})`,
        dueOrStockInfo: `Due: ${c.dueDate}`,
        badgeLabel: 'Upcoming Child Task',
        targetId: c.id,
        actionLabel: 'View Child',
        timestamp: c.dueDate,
      });
    }
  });

  // 3. MEDICINE INVENTORY
  medicines.forEach((m) => {
    if (m.status === 'Critical') {
      items.push({
        id: `med-${m.id}`,
        severity: 'HIGH',
        category: 'medicine',
        title: `${m.name} — critical stock`,
        relatedName: m.name,
        details: `${m.category} (Min reserve: ${m.minThreshold} ${m.unit})`,
        dueOrStockInfo: `Current stock: ${m.currentStock} ${m.unit} (Critically Low)`,
        badgeLabel: 'Critical Stock Shortage',
        targetId: m.id,
        actionLabel: '+ Restock Stock',
        timestamp: m.lastUpdated,
      });
    } else if (m.status === 'Low Stock') {
      items.push({
        id: `med-${m.id}`,
        severity: 'MEDIUM',
        category: 'medicine',
        title: `${m.name} — low medicine stock`,
        relatedName: m.name,
        details: `${m.category} (Min reserve: ${m.minThreshold} ${m.unit})`,
        dueOrStockInfo: `Current stock: ${m.currentStock} ${m.unit} (Threshold: ${m.minThreshold})`,
        badgeLabel: 'Low Stock Alert',
        targetId: m.id,
        actionLabel: '+ Restock Stock',
        timestamp: m.lastUpdated,
      });
    }
  });

  // 4. DAILY ADMINISTRATIVE TASKS
  tasks.forEach((t) => {
    if (t.status !== 'Completed') {
      if (t.dueDate === todayStr || t.status === 'Pending') {
        items.push({
          id: `task-${t.id}`,
          severity: 'MEDIUM',
          category: 'task',
          title: `${t.taskName} — due today`,
          relatedName: t.patientOrChild || 'Sub-Centre',
          details: `Field task for ${t.patientOrChild}`,
          dueOrStockInfo: `Due: Today (${t.dueDate})`,
          badgeLabel: 'Task Due Today',
          targetId: t.id,
          actionLabel: 'Mark Done',
          timestamp: t.dueDate,
        });
      } else if (t.dueDate > todayStr) {
        items.push({
          id: `task-${t.id}`,
          severity: 'LOW',
          category: 'task',
          title: `Upcoming health-centre task: ${t.taskName}`,
          relatedName: t.patientOrChild || 'Sub-Centre',
          details: `Scheduled field activity`,
          dueOrStockInfo: `Due: ${t.dueDate}`,
          badgeLabel: 'Upcoming Task',
          targetId: t.id,
          actionLabel: 'Mark Done',
          timestamp: t.dueDate,
        });
      }
    }
  });

  // Sort order: HIGH -> MEDIUM -> LOW
  const severityOrder: Record<PrioritySeverity, number> = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
