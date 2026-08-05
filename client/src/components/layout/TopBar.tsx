import { useLocation } from 'wouter';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getInitials } from '@/lib/formatters';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Обзор',
  '/vacancies': 'Вакансии',
  '/vacancies/new': 'Создание вакансии',
  '/candidates': 'Кандидаты',
  '/interviews': 'AI-интервью',
  '/ai-activity': 'Активность AI',
  '/analytics': 'Аналитика',
  '/integrations': 'Интеграции',
  '/settings': 'Настройки',
};

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location, navigate] = useLocation();
  const { user } = useApp();

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location === path) return title;
    }
    if (location.startsWith('/vacancies/')) return 'Вакансия';
    if (location.startsWith('/candidates/')) return 'Кандидат';
    return 'Recruiter AI';
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-[#1E293B]">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-[240px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Поиск..."
            className="bg-transparent text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none w-full"
          />
        </div>

        {/* Create vacancy button */}
        <button
          onClick={() => navigate('/vacancies/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium transition-colors shadow-sm active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Создать вакансию</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <span className="text-xs font-semibold text-[#10B981]">{getInitials(user.name)}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#1E293B] leading-tight">{user.name}</p>
            <p className="text-xs text-[#94A3B8] leading-tight">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
