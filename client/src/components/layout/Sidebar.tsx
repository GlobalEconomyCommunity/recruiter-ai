import { Link, useLocation } from 'wouter';
import {
  Activity,
  BarChart3,
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Puzzle,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

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

export default function Sidebar({
  collapsed = false,
  onToggle,
  onClose,
  mobile = false,
}: SidebarProps) {
  const [location] = useLocation();
  const { vacancies } = useApp();

  const activeVacancies = vacancies.filter(
    vacancy => vacancy.status === 'active'
  ).length;

  const agentActive = activeVacancies > 0;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobile && 'fixed inset-y-0 left-0 z-50 w-[280px] shadow-xl'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-5',
          collapsed && !mobile && 'justify-center px-4'
        )}
      >
        <div className="emerald-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Bot className="h-5 w-5 text-white" />
        </div>

        {(!collapsed || mobile) && (
          <div className="min-w-0 overflow-hidden">
            <h1 className="truncate text-[15px] font-bold leading-tight text-[#1E293B]">
              Recruiter AI
            </h1>
            <p className="truncate text-[11px] leading-tight text-[#94A3B8]">
              AI Recruitment Platform
            </p>
          </div>
        )}

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
            aria-label="Закрыть меню"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'rounded-md p-1 text-[#64748B] transition-colors hover:bg-[#F0F7F2]',
              collapsed ? 'absolute left-[56px] top-6 z-10 bg-white shadow-sm' : 'ml-auto'
            )}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map(item => {
          const isActive =
            location === item.path || location.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              title={collapsed && !mobile ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150',
                collapsed && !mobile && 'justify-center px-0',
                isActive
                  ? 'bg-[#ECFDF5] text-[#1E293B]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'
                )}
              />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          'border-t border-[#E2E8F0] p-4',
          collapsed && !mobile && 'p-3'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-2',
            collapsed && !mobile && 'justify-center px-0',
            agentActive ? 'bg-[#ECFDF5]' : 'bg-[#F8FAFC]'
          )}
          title={
            agentActive
              ? `AI-агент активен: ${activeVacancies} вакансий`
              : 'Нет активных вакансий'
          }
        >
          <div
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              agentActive
                ? 'animate-pulse bg-[#10B981]'
                : 'bg-[#94A3B8]'
            )}
          />
          {(!collapsed || mobile) && (
            <span
              className={cn(
                'text-xs font-medium',
                agentActive ? 'text-[#065F46]' : 'text-[#64748B]'
              )}
            >
              {agentActive
                ? `AI-агент активен · ${activeVacancies}`
                : 'AI-агент ожидает'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}