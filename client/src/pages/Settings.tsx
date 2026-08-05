import { useEffect, useState } from 'react';
import {
  Bell,
  Bot,
  Building2,
  Database,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { clearAllStoredData } from '@/lib/storage';
import { getInitials } from '@/lib/formatters';
import type {
  AISettings,
  Company,
  NotificationSettings,
  UserProfile,
} from '@/types';

type SectionKey =
  | 'company'
  | 'profile'
  | 'team'
  | 'ai'
  | 'notifications'
  | 'security'
  | 'data';

const sections: Array<{
  key: SectionKey;
  label: string;
  icon: typeof Building2;
}> = [
  { key: 'company', label: 'Компания', icon: Building2 },
  { key: 'profile', label: 'Профиль', icon: User },
  { key: 'team', label: 'Команда и роли', icon: Users },
  { key: 'ai', label: 'Настройки AI', icon: Bot },
  { key: 'notifications', label: 'Уведомления', icon: Bell },
  { key: 'security', label: 'Безопасность', icon: Shield },
  { key: 'data', label: 'Данные прототипа', icon: Database },
];

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 ${
        checked ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

const inputClassName =
  'w-full rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10';

export default function SettingsPage() {
  const {
    user,
    company,
    aiSettings,
    notificationSettings,
    updateUser,
    updateCompany,
    updateAISettings,
    updateNotificationSettings,
  } = useApp();

  const [activeSection, setActiveSection] = useState<SectionKey>('company');
  const [companyForm, setCompanyForm] = useState<Company>(company);
  const [userForm, setUserForm] = useState<UserProfile>(user);

  useEffect(() => {
    setCompanyForm(company);
  }, [company]);

  useEffect(() => {
    setUserForm(user);
  }, [user]);

  const saveCompany = () => {
    if (!companyForm.name.trim()) {
      toast.error('Укажите название компании');
      return;
    }

    if (!companyForm.city.trim()) {
      toast.error('Укажите город компании');
      return;
    }

    updateCompany({
      name: companyForm.name.trim(),
      industry: companyForm.industry.trim(),
      size: companyForm.size.trim(),
      city: companyForm.city.trim(),
    });

    toast.success('Данные компании сохранены');
  };

  const saveProfile = () => {
    const email = userForm.email.trim();

    if (!userForm.name.trim()) {
      toast.error('Укажите имя пользователя');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Укажите корректный email');
      return;
    }

    updateUser({
      name: userForm.name.trim(),
      role: userForm.role.trim(),
      email,
      avatar: userForm.avatar,
    });

    toast.success('Профиль сохранён');
  };

  const updateAI = <K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
  ) => {
    updateAISettings({ [key]: value } as Pick<AISettings, K>);
  };

  const updateNotification = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    updateNotificationSettings(
      { [key]: value } as Pick<NotificationSettings, K>
    );
  };

  const resetDemoData = () => {
    const confirmed = window.confirm(
      'Удалить вакансии, кандидатов, интервью, решения HR и настройки, сохранённые в этом браузере?'
    );

    if (!confirmed) return;

    clearAllStoredData();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Настройки</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Управление профилем, компанией и поведением Recruiter AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="h-fit rounded-2xl border border-[#E2E8F0] bg-white p-3">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;

            return (
              <button
                type="button"
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#ECFDF5] font-medium text-[#1E293B]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'
                  }`}
                />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 lg:col-span-3">
          {activeSection === 'company' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Компания
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Эти данные используются в кабинете работодателя.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#1E293B]">
                  Название
                  <input
                    value={companyForm.name}
                    onChange={event =>
                      setCompanyForm(previous => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>

                <label className="text-sm font-medium text-[#1E293B]">
                  Отрасль
                  <input
                    value={companyForm.industry}
                    onChange={event =>
                      setCompanyForm(previous => ({
                        ...previous,
                        industry: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>

                <label className="text-sm font-medium text-[#1E293B]">
                  Размер
                  <input
                    value={companyForm.size}
                    onChange={event =>
                      setCompanyForm(previous => ({
                        ...previous,
                        size: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>

                <label className="text-sm font-medium text-[#1E293B]">
                  Город
                  <input
                    value={companyForm.city}
                    onChange={event =>
                      setCompanyForm(previous => ({
                        ...previous,
                        city: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={saveCompany}
                className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
              >
                Сохранить компанию
              </button>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Профиль
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Изменения сразу отобразятся в верхней панели.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#1E293B]">
                  Имя
                  <input
                    value={userForm.name}
                    onChange={event =>
                      setUserForm(previous => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>

                <label className="text-sm font-medium text-[#1E293B]">
                  Роль
                  <input
                    value={userForm.role}
                    onChange={event =>
                      setUserForm(previous => ({
                        ...previous,
                        role: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>

                <label className="text-sm font-medium text-[#1E293B] sm:col-span-2">
                  Email
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={event =>
                      setUserForm(previous => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    className={`${inputClassName} mt-1.5`}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
              >
                Сохранить профиль
              </button>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Команда и роли
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  В демонстрационной версии доступен один администратор.
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-semibold text-[#10B981]">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1E293B]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {user.role} · {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#065F46]">
                    Администратор
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Настройки Recruiter AI
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Настройки сохраняются автоматически в браузере.
                </p>
              </div>

              <div className="divide-y divide-[#EDF2F7]">
                <div className="flex items-center justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      Автоматическая обработка откликов
                    </p>
                    <p className="text-xs text-[#64748B]">
                      AI начинает анализ сразу после получения кандидата.
                    </p>
                  </div>
                  <Toggle
                    checked={aiSettings.autoProcessApplications}
                    onChange={value =>
                      updateAI('autoProcessApplications', value)
                    }
                    label="Автоматическая обработка откликов"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      Автоматический screening
                    </p>
                    <p className="text-xs text-[#64748B]">
                      AI проводит первичный screening без ручного запуска.
                    </p>
                  </div>
                  <Toggle
                    checked={aiSettings.autoScreening}
                    onChange={value => updateAI('autoScreening', value)}
                    label="Автоматический screening"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      Автоматическое отклонение
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Для v0.1 рекомендуется оставлять подтверждение HR.
                    </p>
                  </div>
                  <Toggle
                    checked={aiSettings.allowAutoReject}
                    onChange={value => updateAI('allowAutoReject', value)}
                    label="Автоматическое отклонение кандидатов"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      Автоматическое приглашение
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Разрешить AI переводить кандидата на следующий этап.
                    </p>
                  </div>
                  <Toggle
                    checked={aiSettings.allowAutoAdvance}
                    onChange={value => updateAI('allowAutoAdvance', value)}
                    label="Автоматическое приглашение на следующий этап"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      Стиль коммуникации
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Используется в сообщениях и вопросах кандидату.
                    </p>
                  </div>
                  <select
                    value={aiSettings.communicationStyle}
                    onChange={event =>
                      updateAI(
                        'communicationStyle',
                        event.target.value as AISettings['communicationStyle']
                      )
                    }
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                  >
                    <option value="formal">Формальный</option>
                    <option value="friendly">Дружелюбный</option>
                    <option value="neutral">Нейтральный</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-[#EFF6FF] p-4 text-xs text-[#1E40AF]">
                Окончательные решения о найме и отказе остаются за человеком.
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Уведомления
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Выберите события, которые будут появляться под колокольчиком.
                </p>
              </div>

              <div className="divide-y divide-[#EDF2F7]">
                {(
                  [
                    ['newCandidates', 'Новые кандидаты'],
                    ['screeningCompleted', 'Завершённый screening'],
                    ['hrDecisionRequired', 'Требуется решение HR'],
                    ['interviewsCompleted', 'Завершённые интервью'],
                    ['weeklyReport', 'Еженедельный отчёт'],
                  ] as Array<[keyof NotificationSettings, string]>
                ).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <span className="text-sm text-[#1E293B]">{label}</span>
                    <Toggle
                      checked={notificationSettings[key]}
                      onChange={value => updateNotification(key, value)}
                      label={label}
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8]">
                Настройки применяются сразу и сохраняются автоматически.
              </p>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Безопасность
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  В демо-версии нет серверной авторизации и реальных аккаунтов.
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] p-4 text-sm text-[#64748B]">
                <p className="font-medium text-[#1E293B]">
                  Двухфакторная аутентификация
                </p>
                <p className="mt-1">
                  Будет доступна после подключения backend и системы входа.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Данные прототипа
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Все изменения этой версии сохраняются только в localStorage
                  текущего браузера.
                </p>
              </div>

              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                <p className="text-sm font-medium text-[#991B1B]">
                  Сброс демонстрационных данных
                </p>
                <p className="mt-1 text-xs text-[#B91C1C]">
                  Будут удалены созданные вакансии, интервью, решения HR,
                  настройки и выбранные кандидаты для сравнения.
                </p>
                <button
                  type="button"
                  onClick={resetDemoData}
                  className="mt-4 rounded-xl border border-[#FCA5A5] bg-white px-4 py-2 text-sm font-medium text-[#DC2626] transition-colors hover:bg-[#FFF7F7]"
                >
                  Сбросить все демо-данные
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}