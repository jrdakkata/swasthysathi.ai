import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  RotateCcw, 
  Copy, 
  Check, 
  Bot, 
  User, 
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Patient, ChildRecord, MedicineItem, HealthTask, ChatMessage, AshaProfile } from '../types/health';
import { PriorityItem } from '../types/priorities';

interface AIAssistantViewProps {
  currentAsha?: AshaProfile;
  patients: Patient[];
  childrenRecords: ChildRecord[];
  medicines: MedicineItem[];
  tasks: HealthTask[];
  priorities?: PriorityItem[];
  language: 'en' | 'hi';
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentAsha,
  patients,
  childrenRecords,
  medicines,
  tasks,
  priorities = [],
  language,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: language === 'hi' 
        ? `नमस्ते! मैं आपका स्वास्थ्य साथी एआई (SwasthyaSathi AI) हूँ। मैं उप-केंद्र के वास्तविक आंकड़ों (live data) का विश्लेषण करके दैनिक प्राथमिकताओं और प्रशासनिक कार्यों में आपकी सहायता करता हूँ।\n\nआप मुझसे पूछ सकते हैं:\n1. **"What should I focus on today?"**\n2. **"How many high-priority tasks do I have?"**\n3. **"Which patient follow-ups are overdue?"**\n4. **"Which child-health tasks need attention?"**\n5. **"Which medicines have critical stock?"**\n6. **"Give me a summary of today's workload."**\n\n⚠️ **प्रशासनिक सीमा:** मैं केवल प्रशासनिक व्यवस्था देखता हूँ। मैं बीमारियों का निदान या दवाएं नहीं लिखता। चिकित्सीय निर्णय के लिए मेडिकल ऑफिसर से संपर्क करें।`
        : `Hello sister! I am SwasthyaSathi AI, your sub-centre administrative assistant. I analyze your CURRENT application data (patients, child immunizations, medicine inventory, and daily field tasks) to help you manage your day.\n\nQuick questions you can ask me:\n1. **"What should I focus on today?"**\n2. **"How many high-priority tasks do I have?"**\n3. **"Which patient follow-ups are overdue?"**\n4. **"Which child-health tasks need attention?"**\n5. **"Which medicines have critical stock?"**\n6. **"Give me a summary of today's workload."**\n\n⚠️ **Administrative Safety Boundary:** This assistant is strictly for administrative coordination, registers, and scheduling. It does not diagnose diseases or recommend medical prescriptions. Always consult your Medical Officer or Community Health Officer (CHO) for clinical decisions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdministrativeNotice: false,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exact 6 core questions requested
  const quickPrompts = [
    { label: "🎯 What should I focus on today?", query: "What should I focus on today?" },
    { label: "⚡ How many high-priority tasks do I have?", query: "How many high-priority tasks do I have?" },
    { label: "👵 Which patient follow-ups are overdue?", query: "Which patient follow-ups are overdue?" },
    { label: "👶 Which child-health tasks need attention?", query: "Which child-health tasks need attention?" },
    { label: "💊 Which medicines have critical stock?", query: "Which medicines have critical stock?" },
    { label: "📋 Give me a summary of today's workload", query: "Give me a summary of today's workload." },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Client-side fallback analyzer grounded in current application data
  const generateGroundedResponse = (query: string): string => {
    const q = query.toLowerCase();

    const overduePatients = patients.filter((p) => p.status === 'Overdue');
    const dueTodayPatients = patients.filter((p) => p.status === 'Due Today');
    const upcomingPatients = patients.filter((p) => p.status === 'Upcoming');

    const overdueChildren = childrenRecords.filter((c) => c.status === 'Overdue');
    const dueTodayChildren = childrenRecords.filter((c) => c.status === 'Due Today');
    const upcomingChildren = childrenRecords.filter((c) => c.status === 'Upcoming');

    const criticalMeds = medicines.filter((m) => m.status === 'Critical');
    const lowMeds = medicines.filter((m) => m.status === 'Low Stock');

    const todayTasks = tasks.filter((t) => (t.dueDate === '2026-09-30' || t.status === 'Pending') && t.status !== 'Completed');

    const highCount = overduePatients.length + overdueChildren.length + criticalMeds.length;
    const mediumCount = dueTodayPatients.length + dueTodayChildren.length + todayTasks.length + lowMeds.length;
    const lowCount = upcomingPatients.filter((p) => p.priority === 'High').length + 
                     upcomingChildren.filter((c) => c.priority === 'High').length;

    // 1. "What should I focus on today?"
    if (
      q.includes('focus') || 
      q.includes('what should i focus on today') || 
      (q.includes('priority') && q.includes('today'))
    ) {
      const topPatient = overduePatients[0];
      const topChild = overdueChildren[0];
      const topMed = criticalMeds[0];

      return `TODAY'S PRIORITIES\n\n` +
        `1. **Highest-priority administrative task:**\n` +
        (topPatient 
          ? `   • Complete overdue patient follow-up for **${topPatient.name}** in ${topPatient.village} (${topPatient.followUpReason || topPatient.conditionNote} – Due ${topPatient.nextFollowUp}).`
          : `   • Review patient register for priority maternal & chronic health check-ups.`) +
        `\n\n2. **Next highest-priority task:**\n` +
        (topChild
          ? `   • Complete overdue child-health milestone for **${topChild.name}** (${topChild.age}, ${topChild.village}) – ${topChild.healthTask} (Due ${topChild.dueDate}).`
          : `   • Conduct scheduled infant growth monitoring.`) +
        `\n\n3. **Other important pending tasks:**\n` +
        (criticalMeds.length > 0 
          ? `   • Review ${criticalMeds.length} critical medicine-stock alert(s): **${criticalMeds.map(m => m.name).slice(0, 2).join(', ')}** (Submit urgent indent to Block PHC store).\n`
          : '') +
        (todayTasks.length > 0
          ? `   • Complete ${todayTasks.length} field task(s) due today: ${todayTasks.slice(0, 2).map(t => t.taskName).join('; ')}.\n`
          : '') +
        (dueTodayPatients.length > 0
          ? `   • Check ${dueTodayPatients.length} patient follow-up(s) scheduled for today (${dueTodayPatients.map(p => p.name).join(', ')}).`
          : '') +
        `\n\nWorkload Summary:\n` +
        `"Today you have **${highCount} high-priority alerts**, **${mediumCount} medium-priority alerts** and **${lowCount} low-priority alert(s)**.\n\n` +
        `Start with the overdue patient follow-ups, then review overdue child-health tasks, then address critical medicine-stock alerts."\n\n` +
        `⚠️ **Administrative Notice:** This assistant provides administrative scheduling and inventory tracking only. It does not diagnose diseases or prescribe treatments. Consult a Medical Officer or CHO for clinical decisions.`;
    }

    // 2. "How many high-priority tasks do I have?"
    if (
      q.includes('how many high-priority') || 
      q.includes('how many high priority') || 
      (q.includes('how many') && q.includes('high'))
    ) {
      return `You currently have **${highCount} high-priority administrative tasks** across your sub-centre:\n\n` +
        `🔴 **${overduePatients.length} Overdue Patient Follow-ups:**\n` +
        (overduePatients.length > 0
          ? overduePatients.map(p => `• **${p.name}** (${p.village}) – ${p.followUpReason || p.conditionNote} (Due: ${p.nextFollowUp})`).join('\n')
          : '• None currently overdue') +
        `\n\n🔴 **${overdueChildren.length} Overdue Child-Health Tasks:**\n` +
        (overdueChildren.length > 0
          ? overdueChildren.map(c => `• **${c.name}** (${c.age}, ${c.village}) – ${c.healthTask} (Due: ${c.dueDate})`).join('\n')
          : '• None currently overdue') +
        `\n\n🔴 **${criticalMeds.length} Critical Medicine Stock Shortages:**\n` +
        (criticalMeds.length > 0
          ? criticalMeds.map(m => `• **${m.name}** – only ${m.currentStock} ${m.unit} remaining (Min threshold: ${m.minThreshold})`).join('\n')
          : '• All stock above critical threshold') +
        `\n\n💡 **Action:** Prioritize the overdue patient visits and overdue infant immunizations this morning, then submit an urgent indent order for the depleted medicines.`;
    }

    // 3. "Which patient follow-ups are overdue?"
    if (
      q.includes('which patient follow-ups are overdue') || 
      q.includes('patient follow-ups are overdue') || 
      (q.includes('patient') && q.includes('overdue'))
    ) {
      return `There are **${overduePatients.length} overdue patient follow-ups** requiring immediate field attention:\n\n` +
        (overduePatients.length > 0
          ? overduePatients.map((p, idx) => 
              `${idx + 1}. **${p.name}** (${p.age} yrs, ${p.gender}) · Village: **${p.village}**\n` +
              `   • **Reason:** ${p.followUpReason || p.conditionNote}\n` +
              `   • **Due Date:** ${p.nextFollowUp} (Overdue)\n` +
              `   • **Assigned ASHA:** ${p.ashaWorker || 'Local ASHA'}\n` +
              `   • **Priority:** ${p.priority}`
            ).join('\n\n')
          : 'There are no overdue patient follow-ups registered right now.') +
        (dueTodayPatients.length > 0
          ? `\n\n📅 **Patients Due Today (${dueTodayPatients.length}):**\n` +
            dueTodayPatients.map(p => `• **${p.name}** (${p.village}) – ${p.followUpReason || p.conditionNote}`).join('\n')
          : '') +
        `\n\n⚠️ **Administrative Notice:** Home visits serve for vital checks and visit reminders. Any clinical treatment changes or prescriptions must be decided by a Medical Officer.`;
    }

    // 4. "Which child-health tasks need attention?"
    if (
      q.includes('child-health tasks need attention') || 
      q.includes('child health tasks need attention') || 
      (q.includes('child') && (q.includes('attention') || q.includes('need') || q.includes('task')))
    ) {
      return `There are **${overdueChildren.length + dueTodayChildren.length} child-health tasks** requiring your active attention:\n\n` +
        `🔴 **Overdue Tasks (${overdueChildren.length}):**\n` +
        (overdueChildren.length > 0
          ? overdueChildren.map((c, idx) => 
              `${idx + 1}. **${c.name}** (${c.age}) · Village: **${c.village}**\n` +
              `   • **Task:** ${c.healthTask}\n` +
              `   • **Due Date:** ${c.dueDate} (Missed session)\n` +
              `   • **Mother/Guardian:** ${c.parentName || 'Recorded in MCP card'}\n` +
              `   • **Category:** ${c.taskCategory || 'Scheduled vaccination'}`
            ).join('\n\n')
          : '• No child health tasks are currently overdue.\n') +
        `\n\n🟠 **Tasks Due Today (${dueTodayChildren.length}):**\n` +
        (dueTodayChildren.length > 0
          ? dueTodayChildren.map((c, idx) => 
              `${idx + 1}. **${c.name}** (${c.age}, ${c.village}) – ${c.healthTask} (Category: ${c.taskCategory || 'General'})`
            ).join('\n')
          : '• No child tasks scheduled specifically for today.') +
        `\n\n💡 **Field Protocol:** Pack vaccine carriers with conditioned ice-packs. Report any adverse reactions immediately to the Medical Officer.`;
    }

    // 5. "Which medicines have critical stock?"
    if (
      q.includes('which medicines have critical stock') || 
      q.includes('medicines have critical stock') || 
      (q.includes('medicine') && q.includes('critical'))
    ) {
      return `There are **${criticalMeds.length} medicines with critical stock shortages** below their minimum safety thresholds:\n\n` +
        (criticalMeds.length > 0
          ? criticalMeds.map((m, idx) => 
              `${idx + 1}. **${m.name}** (${m.category})\n` +
              `   • **Current Stock:** ${m.currentStock} ${m.unit}\n` +
              `   • **Minimum Safety Threshold:** ${m.minThreshold} ${m.unit}\n` +
              `   • **Deficit:** ${m.minThreshold - m.currentStock} ${m.unit} below safety line\n` +
              `   • **Recommended Action:** Submit official Form D-2 Indent Requisition to the Block PHC store immediately.`
            ).join('\n\n')
          : '• All medicines are currently above critical stock thresholds.\n') +
        (lowMeds.length > 0
          ? `\n\n🟠 **Low Stock Items Near Threshold (${lowMeds.length}):**\n` +
            lowMeds.map(m => `• **${m.name}**: ${m.currentStock} ${m.unit} (Min: ${m.minThreshold})`).join('\n')
          : '') +
        `\n\n⚠️ **Notice:** This inventory tracking assists with sub-centre replenishment only. Medicine dispensing and prescriptions require authorized medical evaluation.`;
    }

    // 6. "Give me a summary of today's workload."
    if (
      q.includes('summary of today\'s workload') || 
      q.includes('summary of today’s workload') || 
      q.includes('today\'s workload') || 
      q.includes('workload') ||
      (q.includes('summary') && q.includes('work'))
    ) {
      const totalAlerts = highCount + mediumCount + lowCount;
      return `📋 **Sub-Centre Daily Workload Summary**\n\n` +
        `You have a total of **${totalAlerts} operational items** across your sub-centre today:\n\n` +
        `• 🔴 **${highCount} High-Priority Alerts** (Overdue follow-ups, missed infant vaccines, critical stock)\n` +
        `• 🟠 **${mediumCount} Medium-Priority Alerts** (Tasks due today, low medicine reserves)\n` +
        `• 🟡 **${lowCount} Low-Priority Alerts** (Upcoming scheduled tasks & visits)\n\n` +
        `**Module Breakdown:**\n` +
        `1. **Patient Management:** ${overduePatients.length} overdue follow-up(s), ${dueTodayPatients.length} due today, ${upcomingPatients.length} upcoming\n` +
        `2. **Child Health:** ${overdueChildren.length} overdue task(s), ${dueTodayChildren.length} due today, ${upcomingChildren.length} upcoming\n` +
        `3. **Medicine Inventory:** ${criticalMeds.length} critical shortage(s), ${lowMeds.length} low stock item(s)\n` +
        `4. **Daily Field Tasks:** ${todayTasks.length} pending task(s) for today\n\n` +
        `**Recommended Sequence:**\n` +
        `"Start with the overdue patient follow-ups, then review overdue child-health tasks, then address critical medicine-stock alerts."`;
    }

    // Safety checks
    if (
      q.includes('diagnos') || 
      q.includes('prescribe') || 
      q.includes('treatment') || 
      q.includes('cure') || 
      q.includes('disease')
    ) {
      return `⚠️ **Clinical Safety Warning:** As SwasthyaSathi AI, I am strictly an administrative and logistical support assistant. I **do not diagnose diseases**, **do not prescribe medicines**, and **cannot recommend treatment changes**.\n\nProfessional clinical judgment is required. Please refer the patient to the Medical Officer or Community Health Officer (CHO) at the Primary Health Centre.`;
    }

    // General fallback
    return `Hello sister! I am SwasthyaSathi AI, your sub-centre administrative assistant. Based on your live application records:\n\n` +
      `• **${highCount} High-Priority Alerts** (${overduePatients.length} overdue patients, ${overdueChildren.length} overdue child tasks, ${criticalMeds.length} critical medicines)\n` +
      `• **${mediumCount} Medium-Priority Alerts** (${dueTodayPatients.length} patients due today, ${dueTodayChildren.length} child tasks due today, ${todayTasks.length} tasks due today)\n` +
      `• **${lowCount} Low-Priority Alerts**\n\n` +
      `You can ask me:\n` +
      `1. *"What should I focus on today?"*\n` +
      `2. *"How many high-priority tasks do I have?"*\n` +
      `3. *"Which patient follow-ups are overdue?"*\n` +
      `4. *"Which child-health tasks need attention?"*\n` +
      `5. *"Which medicines have critical stock?"*\n` +
      `6. *"Give me a summary of today's workload."*`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          contextData: {
            patients,
            children: childrenRecords,
            medicines,
            tasks,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || generateGroundedResponse(query),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('AI Assistant API call error, using grounded local synthesis:', err);
      const groundedReply = generateGroundedResponse(query);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: groundedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am ready to analyze your sub-centre records. How can I assist you with today's administrative duties?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              SwasthyaSathi AI Field Assistant
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Admin & Priority Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time administrative companion connected directly to sub-centre patient, child-health, and drug records
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Mandatory Safety & Non-Clinical Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold block mb-0.5">
            Administrative Support Assistant – Safety Rules:
          </strong>
          <span>
            This assistant is strictly for <strong>administrative scheduling, overdue follow-up coordination, vaccine tracking, and medicine inventory monitoring</strong>. It does <strong>NOT diagnose diseases</strong>, does <strong>NOT prescribe medicines</strong>, and does <strong>NOT make clinical decisions</strong>. Professional clinical judgment is required for any patient diagnosis or treatment—always consult your Medical Officer or Community Health Officer (CHO).
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Message body */}
                  <div className="whitespace-pre-wrap font-normal">
                    {message.text}
                  </div>

                  {/* Message metadata & copy action */}
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{message.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:text-slate-600"
                        title="Copy answer"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 ml-2 font-medium">
                    Analyzing live records...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pl-1">
            Quick Queries:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-full border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask: 'What should I focus on today?', 'How many high-priority tasks do I have?'..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
