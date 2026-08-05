import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Bell,
  Briefcase,
  CheckCheck,
  Menu,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getInitials } from '@/lib/formatters';
import { getStoredData, setStoredData } from '@/lib/storage';
import type { AIActivity } from '@/types';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Обзор',
  '/vacancies': 'Вакансии',
  '/vacancies/new': 'Создание вакансии',
  '/candidates': 'Кандидаты',
  '/candidates/compare': 'Сравнение кандидатов',
  '/interviews': 'AI-интервью',
  '/ai-activity': 'Активность AI',
  '/analytics': 'Аналитика',
  '/integrations': 'Интеграции',
  '/settings': 'Настройки',
};

interface TopBarProps {
  onMenuClick?: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  type: 'vacancy' | 'candidate';
}

function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location, navigate] = useLocation();
  const {
    user,
    vacancies,
    candidates,
    activities,
    notificationSettings,
  } = useApp();

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(
    () => getStoredData<string[]>('read_notification_ids', [])
  );

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStoredData('read_notification_ids', readNotificationIds);
  }, [readNotificationIds]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const getTitle = () => {
    if (pageTitles[location]) return pageTitles[location];
    if (location.startsWith('/vacancies/')) return 'Вакансия';
    if (location.startsWith('/candidates/')) return 'Кандидат';
    return 'Recruiter AI';
  };

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = search.trim().toLocaleLowerCase('ru-RU');

    if (query.length < 2) return [];

    const vacancyResults: SearchResult[] = vacancies
      .filter(vacancy =>
        [vacancy.title, vacancy.department, vacancy.city].some(value =>
          value.toLocaleLowerCase('ru-RU').includes(query)
        )
      )
      .map(vacancy => ({
        id: vacancy.id,
        title: vacancy.title,
        subtitle: `${vacancy.department} · ${vacancy.city}`,
        path: `/vacancies/${vacancy.id}`,
        type: 'vacancy',
      }));

    const candidateResults: SearchResult[] = candidates
      .filter(candidate =>
        [
          candidate.name,
          candidate.currentPosition,
          candidate.vacancyTitle,
          candidate.city,
        ].some(value => value.toLocaleLowerCase('ru-RU').includes(query))
      )
      .map(candidate => ({
        id: candidate.id,
        title: candidate.name,
        subtitle: `${candidate.currentPosition} · ${candidate.vacancyTitle}`,
        path: `/candidates/${candidate.id}`,
        type: 'candidate',
      }));

    return [...vacancyResults, ...candidateResults].slice(0, 8);
  }, [search, vacancies, candidates]);

  const notifications = useMemo(() => {
    const isEnabled = (activity: AIActivity) => {
      if (activity.type === 'candidate_received') {
        return notificationSettings.newCandidates;
      }

      if (activity.type === 'screening_completed') {
        return notificationSettings.screeningCompleted;
      }

      if (activity.type === 'interview_completed') {
        return notificationSettings.interviewsCompleted;
      }

      if (
        activity.type === 'hr_decision_needed' ||
        activity.type === 'report_formed' ||
        activity.status === 'needs_hr' ||
        activity.status === 'needs_clarification' ||
        activity.status === 'error'
      ) {
        return notificationSettings.hrDecisionRequired;
      }

      return false;
    };

    return activities
      .filter(isEnabled)
      .slice()
      .sort(
        (left, right) =>
          new Date(right.timestamp).getTime() -
          new Date(left.timestamp).getTime()
      )
      .slice(0, 10);
  }, [activities, notificationSettings]);

  const unreadCount = notifications.filter(
    notification => !readNotificationIds.includes(notification.id)
  ).length;

  const openSearchResult = (result: SearchResult) => {
    navigate(result.path);
    setSearch('');
    setSearchOpen(false);
  };

  const openNotification = (notification: AIActivity) => {
    setReadNotificationIds(previous =>
      previous.includes(notification.id)
        ? previous
        : [...previous, notification.id]
    );

    setNotificationsOpen(false);

    if (notification.candidateId) {
      navigate(`/candidates/${notification.candidateId}`);
      return;
    }

    if (notification.vacancyId) {
      navigate(`/vacancies/${notification.vacancyId}`);
      return;
    }

    navigate('/ai-activity');
  };

  const markAllAsRead = () => {
    setReadNotificationIds(previous =>
      Array.from(
        new Set([
          ...previous,
          ...notifications.map(notification => notification.id),
        ])
      )
    );
  };

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#64748B] hover:bg-[#F8FAFC] lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-[#1E293B]">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div ref={searchRef} className="relative hidden md:block">
          <div className="flex w-[260px] items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/10">
            <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" />
            <input
              type="search"
              value={search}
              onFocus={() => setSearchOpen(true)}
              onChange={event => {
                setSearch(event.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' && searchResults[0]) {
                  openSearchResult(searchResults[0]);
                }

                if (event.key === 'Escape') {
                  setSearchOpen(false);
                }
              }}
              placeholder="Вакансия или кандидат..."
              className="w-full bg-transparent text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
              aria-label="Глобальный поиск"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[#94A3B8] hover:text-[#64748B]"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchOpen && search.trim().length >= 2 && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[380px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
              <div className="border-b border-[#EDF2F7] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                Результаты поиска
              </div>

              {searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#64748B]">
                  Ничего не найдено
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto p-2">
                  {searchResults.map(result => {
                    const Icon =
                      result.type === 'vacancy' ? Briefcase : Users;

                    return (
                      <button
                        type="button"
                        key={`${result.type}-${result.id}`}
                        onClick={() => openSearchResult(result)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F8FAFC]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#1E293B]">
                            {result.title}
                          </span>
                          <span className="block truncate text-xs text-[#64748B]">
                            {result.subtitle}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/vacancies/new')}
          className="flex items-center gap-2 rounded-xl bg-[#10B981] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#059669] active:scale-[0.97] sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Создать вакансию</span>
        </button>

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(previous => !previous)}
            className="relative rounded-xl p-2 text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
            aria-label={`Уведомления: ${unreadCount} непрочитанных`}
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[360px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#EDF2F7] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Уведомления
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {unreadCount} непрочитанных
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#10B981] hover:text-[#059669]"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Прочитать все
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-[#CBD5E1]" />
                  <p className="text-sm text-[#64748B]">
                    Новых уведомлений нет
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {notifications.map(notification => {
                    const isRead = readNotificationIds.includes(
                      notification.id
                    );

                    return (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => openNotification(notification)}
                        className={`flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F8FAFC] ${
                          isRead ? 'opacity-70' : 'bg-[#F0FDF7]'
                        }`}
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            isRead ? 'bg-[#CBD5E1]' : 'bg-[#10B981]'
                          }`}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-[#1E293B]">
                            {notification.title}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-[#64748B]">
                            {notification.description}
                          </span>
                          <span className="mt-1 block text-[11px] text-[#94A3B8]">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate('/ai-activity');
                }}
                className="w-full border-t border-[#EDF2F7] px-4 py-3 text-center text-xs font-medium text-[#10B981] hover:bg-[#F8FAFC]"
              >
                Открыть всю активность AI
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 rounded-xl border-l border-[#E2E8F0] py-1 pl-3 pr-1 text-left transition-colors hover:bg-[#F8FAFC]"
          aria-label="Открыть настройки профиля"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECFDF5]">
            {user.name ? (
              <span className="text-xs font-semibold text-[#10B981]">
                {getInitials(user.name)}
              </span>
            ) : (
              <UserRound className="h-4 w-4 text-[#10B981]" />
            )}
          </div>
          <div className="hidden md:block">
            <p className="max-w-[150px] truncate text-sm font-medium leading-tight text-[#1E293B]">
              {user.name}
            </p>
            <p className="max-w-[150px] truncate text-xs leading-tight text-[#94A3B8]">
              {user.role}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}