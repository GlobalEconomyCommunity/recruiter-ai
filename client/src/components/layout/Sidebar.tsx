import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Activity,
  BarChart3,
  Puzzle,
  Settings,
  Bot,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { path: '/vacancies', label: 'Вакансии', icon: Briefcase },
  { path: '/candidates', label: 'Кандидаты', icon: Users },
  { path: '/interviews', label: 'AI-интервью', icon: MessageSquare },
  { path: '/ai-activity', label: 'Активность AI', icon: Activity },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { path: '/integrations', label: 'Интеграции', icon: Puzzle },
  { path: '/settings', label: 'Настройки', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, onClose, mobile }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobile && 'fixed inset-y-0 left-0 z-50 shadow-xl'
      )}
    >
      {/* Logo area */}
      <div className={cn('flex items-center gap-3 px-5 py-5 border-b border-[#E2E8F0]', collapsed && 'px-4 justify-center')}>
        <div className="w-9 h-9 rounded-xl emerald-gradient flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-[#1E293B] leading-tight">Recruiter AI</h1>
            <p className="text-[11px] text-[#94A3B8] leading-tight">AI Recruitment Platform</p>
          </div>
        )}
        {!collapsed && !mobile && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded-md hover:bg-[#F0F7F2] text-[#64748B] transition-colors"
            aria-label="Свернуть меню"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location === item.path || location.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[#ECFDF5] text-[#1E293B]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn('border-t border-[#E2E8F0] p-4', collapsed && 'p-3')}>
        <div className={cn('flex items-center gap-2 px-2 py-2 rounded-lg bg-[#ECFDF5]', collapsed && 'justify-center px-0')}>
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          {!collapsed && <span className="text-xs text-[#065F46] font-medium">AI-агент активен</span>}
        </div>
      </div>
    </aside>
  );
}
