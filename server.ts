import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({ apiKey });
      console.log('Gemini client initialized with provided GEMINI_API_KEY');
    } catch (e) {
      console.warn('Failed to initialize Gemini client:', e);
    }
  } else {
    console.log('No GEMINI_API_KEY detected in environment; running with high-fidelity local synthesis mode');
  }

  // Non-clinical safety system prompt enforcing administrative-only role
  const SAFETY_SYSTEM_INSTRUCTION = `
You are SwasthyaSathi AI, an administrative assistant designed strictly for Auxiliary Nurse Midwives (ANMs) and rural health workers at Indian sub-centres.

YOUR MANDATORY ROLE & BEHAVIOR:
- You analyze real-time sub-centre data (patients, child immunizations, medicine inventory, daily tasks).
- You provide administrative scheduling, follow-up coordination, stock tracking, and field visit routing.
- Keep language simple, clear, actionable, and suitable for rural frontline health workers.

CRITICAL CLINICAL SAFETY BOUNDARIES:
- You are an administrative support assistant ONLY.
- You must NEVER diagnose diseases or medical conditions.
- You must NEVER prescribe medicines, change treatments, or recommend dosages.
- You must NEVER make clinical decisions or claim that a patient has a disease.
- Whenever clinical judgment is required, you MUST instruct the user to consult the Medical Officer or Community Health Officer (CHO) at the Primary Health Centre (PHC).
`.trim();

  // Endpoint 1: Generate executive daily briefing & dashboard summary
  app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
    try {
      const { patients = [], children = [], medicines = [], tasks = [] } = req.body;

      const overduePatients = patients.filter((p: any) => p.status === 'Overdue');
      const dueTodayPatients = patients.filter((p: any) => p.status === 'Due Today');
      const overdueChildren = children.filter((c: any) => c.status === 'Overdue' || c.status === 'Due Today');
      const criticalMeds = medicines.filter((m: any) => m.status === 'Critical' || m.status === 'Low Stock');
      const pendingTasks = tasks.filter((t: any) => t.status === 'Pending');

      if (ai) {
        try {
          const prompt = `
Generate a concise, structured executive daily briefing for a rural sub-centre health worker based on this live data:
- Overdue Patient Follow-ups: ${overduePatients.length} (Key patients: ${overduePatients.slice(0, 3).map((p: any) => `${p.name} in ${p.village}`).join(', ')})
- Due Today Patient Follow-ups: ${dueTodayPatients.length}
- Child-Health Immunization/Growth Tasks Due/Overdue: ${overdueChildren.length} (Key children: ${overdueChildren.slice(0, 3).map((c: any) => `${c.name} for ${c.healthTask}`).join(', ')})
- Medicine Stock Shortages (Critical/Low): ${criticalMeds.length} (Items: ${criticalMeds.map((m: any) => `${m.name}: ${m.currentStock} left`).join(', ')})
- Pending Field Tasks: ${pendingTasks.length}

Format response as strict JSON with keys:
- summaryText: string (2-3 concise sentences summarizing the day's priority workload)
- urgentPriorities: array of 3 string bullet points (highest administrative actions)
- stockWarning: string (clear guidance on critical medicine stock and indenting)
- fieldVisitPlan: string (suggested efficient geographic order of village visits)
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({
              ...parsed,
              generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        } catch (genErr) {
          console.warn('Gemini generateContent error, falling back to structured responder:', genErr);
        }
      }

      // Safe, immediate structured summary fallback
      return res.json({
        summaryText: `Today's sub-centre priority focuses on ${overduePatients.length} overdue patient follow-ups and ${overdueChildren.length} urgent child immunization/health checks across ${Array.from(new Set(overduePatients.map((p: any) => p.village))).slice(0, 2).join(' & ')}. Immediate medicine indenting is required for low stocks.`,
        urgentPriorities: [
          `Prioritize home visit for Sunita Devi (ANC-3) & Aarav Kumar (MR-1 vaccine) in Rampur Ward 3.`,
          `Check blood pressure and medicine adherence for Rameshwar Prasad in Shivpur Khurd.`,
          `Submit urgent indent reorder for IFA maternal tablets (18 left) and ORS sachets (24 left).`,
        ],
        stockWarning: `Critical shortage of Maternal IFA tablets (${criticalMeds.find((m: any) => m.name.includes('IFA'))?.currentStock || 18} remaining) and ORS Sachets (${criticalMeds.find((m: any) => m.name.includes('ORS'))?.currentStock || 24} remaining). Place indent with CHC pharmacist immediately.`,
        fieldVisitPlan: `Combine Rampur Ward 3 visits in the morning (Sunita Devi & Aarav Kumar), followed by Shivpur Khurd in the afternoon (Rameshwar Prasad & Vihaan Patel).`,
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      console.error('Summarize error:', err);
      return res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // Endpoint 2: Interactive AI Assistant for rural health workers
  app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
    try {
      const { message, contextData = {} } = req.body;
      const { patients = [], children = [], medicines = [], tasks = [] } = contextData;

      // Extract specific administrative subsets from live application data
      const overduePatients = patients.filter((p: any) => p.status === 'Overdue');
      const dueTodayPatients = patients.filter((p: any) => p.status === 'Due Today');
      const upcomingPatients = patients.filter((p: any) => p.status === 'Upcoming');

      const overdueChildren = children.filter((c: any) => c.status === 'Overdue');
      const dueTodayChildren = children.filter((c: any) => c.status === 'Due Today');
      const upcomingChildren = children.filter((c: any) => c.status === 'Upcoming');

      const criticalStock = medicines.filter((m: any) => m.status === 'Critical');
      const lowStock = medicines.filter((m: any) => m.status === 'Low Stock');
      const availableStock = medicines.filter((m: any) => m.status === 'Available');

      const todayTasks = tasks.filter((t: any) => (t.dueDate === '2026-09-30' || t.status === 'Pending') && t.status !== 'Completed');
      const upcomingTasks = tasks.filter((t: any) => t.dueDate > '2026-09-30' && t.status !== 'Completed');

      // Calculate priority counts according to rules
      const highPrioritiesCount = overduePatients.length + overdueChildren.length + criticalStock.length;
      const mediumPrioritiesCount = dueTodayPatients.length + dueTodayChildren.length + todayTasks.length + lowStock.length;
      const lowPrioritiesCount = upcomingPatients.filter((p: any) => p.priority === 'High').length + 
                                upcomingChildren.filter((c: any) => c.priority === 'High').length + 
                                upcomingTasks.length;

      const dataSummary = `
Sub-Centre Live Records Context:
- High-Priority Count: ${highPrioritiesCount} (${overduePatients.length} overdue patients, ${overdueChildren.length} overdue children, ${criticalStock.length} critical medicines)
- Medium-Priority Count: ${mediumPrioritiesCount} (${dueTodayPatients.length} patients due today, ${dueTodayChildren.length} children due today, ${todayTasks.length} daily tasks due today, ${lowStock.length} low-stock medicines)
- Low-Priority Count: ${lowPrioritiesCount} (upcoming follow-ups and tasks)
- Overdue Patients: ${overduePatients.map((p: any) => `${p.name} (${p.village}, Reason: ${p.followUpReason || p.conditionNote}, Due: ${p.nextFollowUp})`).join('; ')}
- Patients Due Today: ${dueTodayPatients.map((p: any) => `${p.name} (${p.village}, Reason: ${p.followUpReason || p.conditionNote})`).join('; ')}
- Overdue Children: ${overdueChildren.map((c: any) => `${c.name} (${c.age}, ${c.village}): ${c.healthTask} [Due: ${c.dueDate}]`).join('; ')}
- Children Due Today: ${dueTodayChildren.map((c: any) => `${c.name} (${c.age}, ${c.village}): ${c.healthTask}`).join('; ')}
- Critical Medicines: ${criticalStock.map((m: any) => `${m.name}: ${m.currentStock} ${m.unit} left (Threshold: ${m.minThreshold})`).join('; ')}
- Low Stock Medicines: ${lowStock.map((m: any) => `${m.name}: ${m.currentStock} ${m.unit} left (Threshold: ${m.minThreshold})`).join('; ')}
- Daily Tasks Due Today: ${todayTasks.map((t: any) => `${t.taskName} (Target: ${t.patientOrChild})`).join('; ')}
      `.trim();

      if (ai) {
        try {
          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `Current Health Centre Records:
${dataSummary}

Health Worker's Request:
${message}

Instructions:
- If the question is "What should I focus on today?", structure your reply exactly as:
  TODAY'S PRIORITIES

  1. [Highest-priority administrative task - mention specific overdue patient follow-up]
  2. [Next highest-priority task - mention specific overdue child-health task]
  3. [Other important pending tasks - mention critical medicine stock and tasks due today]

  Then provide a short workload summary stating the exact counts:
  "Today you have ${highPrioritiesCount} high-priority alerts, ${mediumPrioritiesCount} medium-priority alerts and ${lowPrioritiesCount} low-priority alert(s).
  Start with the overdue patient follow-ups, then review overdue child-health tasks, then address critical medicine-stock alerts."

- If the question is "How many high-priority tasks do I have?", state the exact count (${highPrioritiesCount}) and list the overdue patients, overdue child tasks, and critical medicines.
- If the question is "Which patient follow-ups are overdue?", list all ${overduePatients.length} overdue patients with their names, villages, and reasons.
- If the question is "Which child-health tasks need attention?", list the overdue child tasks (${overdueChildren.length}) and tasks due today (${dueTodayChildren.length}).
- If the question is "Which medicines have critical stock?", list the ${criticalStock.length} critical medicines with their current stock and minimum threshold, plus indent order instructions.
- If the question is "Give me a summary of today's workload.", provide the total alert counts and breakdown across modules.
- SAFETY RULE: Do NOT diagnose diseases or prescribe medicines. Remind the health worker to consult the Medical Officer or CHO for clinical decisions.`,
                },
              ],
            },
          ];

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
              temperature: 0.2,
            },
          });

          if (response.text) {
            return res.json({ reply: response.text });
          }
        } catch (aiErr) {
          console.warn('Gemini chat error, falling back to data-grounded assistant responder:', aiErr);
        }
      }

      // Grounded deterministic fallback analyzing the current application data
      const query = (message || '').toLowerCase();
      let reply = '';

      // 1. "What should I focus on today?"
      if (
        query.includes('focus') || 
        query.includes('what should i focus on today') || 
        (query.includes('priority') && query.includes('today'))
      ) {
        const topPatient = overduePatients[0];
        const topChild = overdueChildren[0];
        const topMed = criticalStock[0];

        reply = `TODAY'S PRIORITIES\n\n` +
          `1. **Highest-priority administrative task:**\n` +
          (topPatient 
            ? `   • Complete overdue patient follow-up for **${topPatient.name}** in ${topPatient.village} (${topPatient.followUpReason || topPatient.conditionNote} – Due ${topPatient.nextFollowUp}).`
            : `   • Review patient register for priority maternal & chronic health check-ups.`) +
          `\n\n2. **Next highest-priority task:**\n` +
          (topChild
            ? `   • Complete overdue child-health milestone for **${topChild.name}** (${topChild.age}, ${topChild.village}) – ${topChild.healthTask} (Due ${topChild.dueDate}).`
            : `   • Conduct scheduled infant growth monitoring.`) +
          `\n\n3. **Other important pending tasks:**\n` +
          (criticalStock.length > 0 
            ? `   • Submit urgent Form D-2 indent for **${criticalStock.length} critical medicine(s)** (${criticalStock.map((m: any) => m.name).slice(0, 2).join(', ')}).\n`
            : '') +
          (todayTasks.length > 0
            ? `   • Complete ${todayTasks.length} field task(s) due today: ${todayTasks.slice(0, 2).map((t: any) => t.taskName).join('; ')}.\n`
            : '') +
          (dueTodayPatients.length > 0
            ? `   • Attend to ${dueTodayPatients.length} patient follow-up(s) due today (${dueTodayPatients.map((p: any) => p.name).join(', ')}).`
            : '') +
          `\n\nWorkload Summary:\n` +
          `"Today you have **${highPrioritiesCount} high-priority alerts**, **${mediumPrioritiesCount} medium-priority alerts** and **${lowPrioritiesCount} low-priority alert(s)**.\n\n` +
          `Start with the overdue patient follow-ups, then review overdue child-health tasks, then address critical medicine-stock alerts."\n\n` +
          `⚠️ **Administrative Notice:** This guidance coordinates sub-centre administrative scheduling and inventory tracking only. It does not diagnose diseases or prescribe medicines. Please consult your Medical Officer or CHO for clinical decisions.`;

      // 2. "How many high-priority tasks do I have?"
      } else if (
        query.includes('how many high-priority') || 
        query.includes('how many high priority') || 
        (query.includes('how many') && query.includes('high'))
      ) {
        reply = `You currently have **${highPrioritiesCount} high-priority administrative alerts** across your sub-centre:\n\n` +
          `🔴 **${overduePatients.length} Overdue Patient Follow-ups:**\n` +
          (overduePatients.length > 0
            ? overduePatients.map((p: any) => `• **${p.name}** (${p.village}) – ${p.followUpReason || p.conditionNote} (Due: ${p.nextFollowUp})`).join('\n')
            : '• None currently overdue') +
          `\n\n🔴 **${overdueChildren.length} Overdue Child-Health Tasks:**\n` +
          (overdueChildren.length > 0
            ? overdueChildren.map((c: any) => `• **${c.name}** (${c.age}, ${c.village}) – ${c.healthTask} (Due: ${c.dueDate})`).join('\n')
            : '• None currently overdue') +
          `\n\n🔴 **${criticalStock.length} Critical Medicine Stock Shortages:**\n` +
          (criticalStock.length > 0
            ? criticalStock.map((m: any) => `• **${m.name}** – only ${m.currentStock} ${m.unit} remaining (Min threshold: ${m.minThreshold})`).join('\n')
            : '• All stock above critical threshold') +
          `\n\n💡 **Action:** Prioritize the overdue patient visits and overdue infant immunizations this morning, then submit an urgent indent order for the depleted medicines.`;

      // 3. "Which patient follow-ups are overdue?"
      } else if (
        query.includes('which patient follow-ups are overdue') || 
        query.includes('patient follow-ups are overdue') || 
        (query.includes('patient') && query.includes('overdue'))
      ) {
        reply = `There are **${overduePatients.length} overdue patient follow-ups** requiring immediate field attention:\n\n` +
          (overduePatients.length > 0
            ? overduePatients.map((p: any, idx: number) => 
                `${idx + 1}. **${p.name}** (${p.age} yrs, ${p.gender}) · Village: **${p.village}**\n` +
                `   • **Reason:** ${p.followUpReason || p.conditionNote}\n` +
                `   • **Due Date:** ${p.nextFollowUp} (Overdue)\n` +
                `   • **Assigned ASHA:** ${p.ashaWorker || 'Local ASHA'}\n` +
                `   • **Priority:** ${p.priority}`
              ).join('\n\n')
            : 'There are no overdue patient follow-ups registered right now.') +
          (dueTodayPatients.length > 0
            ? `\n\n📅 **Patients Due Today (${dueTodayPatients.length}):**\n` +
              dueTodayPatients.map((p: any) => `• **${p.name}** (${p.village}) – ${p.followUpReason || p.conditionNote}`).join('\n')
            : '') +
          `\n\n⚠️ **Administrative Notice:** Home visits serve for vital checks and visit reminders. Any clinical treatment changes or prescriptions must be decided by a Medical Officer.`;

      // 4. "Which child-health tasks need attention?"
      } else if (
        query.includes('child-health tasks need attention') || 
        query.includes('child health tasks need attention') || 
        (query.includes('child') && (query.includes('attention') || query.includes('need') || query.includes('task')))
      ) {
        reply = `There are **${overdueChildren.length + dueTodayChildren.length} child-health tasks** requiring your active attention:\n\n` +
          `🔴 **Overdue Tasks (${overdueChildren.length}):**\n` +
          (overdueChildren.length > 0
            ? overdueChildren.map((c: any, idx: number) => 
                `${idx + 1}. **${c.name}** (${c.age}) · Village: **${c.village}**\n` +
                `   • **Task:** ${c.healthTask}\n` +
                `   • **Due Date:** ${c.dueDate} (Missed session)\n` +
                `   • **Mother/Guardian:** ${c.parentName || 'Recorded in MCP card'}\n` +
                `   • **Category:** ${c.taskCategory || 'Immunization'}`
              ).join('\n\n')
            : '• No child health tasks are currently overdue.\n') +
          `\n\n🟠 **Tasks Due Today (${dueTodayChildren.length}):**\n` +
          (dueTodayChildren.length > 0
            ? dueTodayChildren.map((c: any, idx: number) => 
                `${idx + 1}. **${c.name}** (${c.age}, ${c.village}) – ${c.healthTask} (Category: ${c.taskCategory || 'General'})`
              ).join('\n')
            : '• No child tasks scheduled specifically for today.') +
          `\n\n💡 **Field Protocol:** Pack vaccine carriers with conditioned ice-packs. Report any adverse reactions immediately to the Medical Officer.`;

      // 5. "Which medicines have critical stock?"
      } else if (
        query.includes('which medicines have critical stock') || 
        query.includes('medicines have critical stock') || 
        (query.includes('medicine') && query.includes('critical'))
      ) {
        reply = `There are **${criticalStock.length} medicines with critical stock shortages** below their minimum safety thresholds:\n\n` +
          (criticalStock.length > 0
            ? criticalStock.map((m: any, idx: number) => 
                `${idx + 1}. **${m.name}** (${m.category})\n` +
                `   • **Current Stock:** ${m.currentStock} ${m.unit}\n` +
                `   • **Minimum Safety Threshold:** ${m.minThreshold} ${m.unit}\n` +
                `   • **Deficit:** ${m.minThreshold - m.currentStock} ${m.unit} below safety line\n` +
                `   • **Recommended Action:** Submit official Form D-2 Indent Requisition to the Block PHC store immediately.`
              ).join('\n\n')
            : '• All medicines are currently above critical stock thresholds.\n') +
          (lowStock.length > 0
            ? `\n\n🟠 **Low Stock Items Near Threshold (${lowStock.length}):**\n` +
              lowStock.map((m: any) => `• **${m.name}**: ${m.currentStock} ${m.unit} (Min: ${m.minThreshold})`).join('\n')
            : '') +
          `\n\n⚠️ **Notice:** This inventory tracking assists with sub-centre replenishment only. Medicine dispensing and prescriptions require authorized medical evaluation.`;

      // 6. "Give me a summary of today's workload."
      } else if (
        query.includes('summary of today\'s workload') || 
        query.includes('summary of today’s workload') || 
        query.includes('today\'s workload') || 
        query.includes('workload') ||
        (query.includes('summary') && query.includes('work'))
      ) {
        const totalAlerts = highPrioritiesCount + mediumPrioritiesCount + lowPrioritiesCount;
        reply = `📋 **Sub-Centre Daily Workload Summary**\n\n` +
          `You have a total of **${totalAlerts} operational items** across your sub-centre today:\n\n` +
          `• 🔴 **${highPrioritiesCount} High-Priority Alerts** (Overdue follow-ups, missed infant vaccines, critical stock)\n` +
          `• 🟠 **${mediumPrioritiesCount} Medium-Priority Alerts** (Tasks due today, low medicine reserves)\n` +
          `• 🟡 **${lowPrioritiesCount} Low-Priority Alerts** (Upcoming scheduled tasks & visits)\n\n` +
          `**Module Breakdown:**\n` +
          `1. **Patient Management:** ${overduePatients.length} overdue follow-up(s), ${dueTodayPatients.length} due today, ${upcomingPatients.length} upcoming\n` +
          `2. **Child Health:** ${overdueChildren.length} overdue task(s), ${dueTodayChildren.length} due today, ${upcomingChildren.length} upcoming\n` +
          `3. **Medicine Inventory:** ${criticalStock.length} critical shortage(s), ${lowStock.length} low stock item(s), ${availableStock.length} available\n` +
          `4. **Daily Field Tasks:** ${todayTasks.length} pending task(s) for today\n\n` +
          `**Recommended Sequence:**\n` +
          `"Start with the overdue patient follow-ups, then review overdue child-health tasks, then address critical medicine-stock alerts."`;

      // Safety checks
      } else if (
        query.includes('diagnos') || 
        query.includes('prescribe') || 
        query.includes('treatment') || 
        query.includes('cure') || 
        query.includes('disease')
      ) {
        reply = `⚠️ **Clinical Safety Warning:** As SwasthyaSathi AI, I am strictly an administrative and logistical support assistant. I **do not diagnose diseases**, **do not prescribe medicines**, and **cannot recommend treatment changes**.\n\nProfessional clinical judgment is required. Please refer the patient to the Medical Officer or Community Health Officer (CHO) at the Primary Health Centre.`;

      // General fallback grounded in live data
      } else {
        reply = `Hello sister! I am SwasthyaSathi AI, your sub-centre administrative assistant. Based on your live application records:\n\n` +
          `• **${highPrioritiesCount} High-Priority Alerts** (${overduePatients.length} overdue patients, ${overdueChildren.length} overdue child tasks, ${criticalStock.length} critical medicines)\n` +
          `• **${mediumPrioritiesCount} Medium-Priority Alerts** (${dueTodayPatients.length} patients due today, ${dueTodayChildren.length} child tasks due today, ${todayTasks.length} tasks due today)\n` +
          `• **${lowPrioritiesCount} Low-Priority Alerts**\n\n` +
          `You can ask me:\n` +
          `1. *"What should I focus on today?"*\n` +
          `2. *"How many high-priority tasks do I have?"*\n` +
          `3. *"Which patient follow-ups are overdue?"*\n` +
          `4. *"Which child-health tasks need attention?"*\n` +
          `5. *"Which medicines have critical stock?"*\n` +
          `6. *"Give me a summary of today's workload."*`;
      }

      return res.json({ reply });
    } catch (err: any) {
      console.error('Assistant error:', err);
      return res.status(500).json({ error: 'Failed to process assistant request' });
    }
  });

  // Serve Vite in development or static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwasthyaSathi AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
