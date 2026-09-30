import React from 'react';
import { 
  Activity, 
  Users, 
  Baby, 
  Pill, 
  CheckSquare, 
  Sparkles, 
  Bell, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';

export type NavTab = 'dashboard' | 'patients' | 'child-health' | 'medicines' | 'tasks' | 'ai-assistant';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  urgentCount: number;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  onOpenQuickAdd: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  urgentCount,
  language,
  onToggleLanguage,
  onOpenQuickAdd,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; labelEn: string; labelHi: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: <Activity className="w-4 h-4" /> },
    { id: 'patients', labelEn: 'Patients', labelHi: 'मरीज़', icon: <Users className="w-4 h-4" /> },
    { id: 'child-health', labelEn: 'Child Health', labelHi: 'शिशु स्वास्थ्य', icon: <Baby className="w-4 h-4" /> },
    { id: 'medicines', labelEn: 'Medicine Stock', labelHi: 'दवा भंडार', icon: <Pill className="w-4 h-4" /> },
    { id: 'tasks', labelEn: 'Daily Tasks', labelHi: 'कार्य सूची', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'ai-assistant', labelEn: 'AI Assistant', labelHi: 'एआई साथी', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <span className="leading-none">स्व</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                SwasthyaSathi AI
              </span>
            </button>
          </div>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions & mobile menu trigger */}
          <div className="flex items-center gap-2.5">
            {/* Urgent alert counter / Notifications trigger button */}
            <button
              onClick={onOpenNotifications}
              title={`${urgentCount} active notifications`}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs tabular-nums">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Switch language"
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenQuickAdd}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <span>+</span>
              <span>{language === 'hi' ? 'नया दर्ज करें' : 'Quick Record'}</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-500">
              Rampur Sub-Centre · Ayushman Arogya Mandir
            </span>
            <button
              onClick={onOpenQuickAdd}
              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 rounded-md"
            >
              + Quick Record
            </button>
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </div>
                {item.id === 'dashboard' && urgentCount > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {urgentCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
