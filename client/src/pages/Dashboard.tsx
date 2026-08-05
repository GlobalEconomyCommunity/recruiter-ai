import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import {
  Briefcase,
  Users,
  Clock,
  MessageSquare,
  Timer,
  CheckCircle2,
  Circle,
  ArrowRight,
  Bot,
  Pause,
  Play,
  ExternalLink,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/formatters';
import type { RecruitmentStage } from '@/types';

type StageState = 'done' | 'active' | 'pending';

const stageDefinitions: Array<{
  key: RecruitmentStage;
  label: string;
}> = [
  { key: 'vacancy_analyzed', label: 'Вакансия проанализирована' },
  { key: 'criteria_formed', label: 'Критерии сформированы' },
  { key: 'candidates_received', label: 'Кандидаты получены' },
  { key: 'resumes_processed', label: 'Резюме обработаны' },
  { key: 'screening_in_progress', label: 'Screening проводится' },
  { key: 'interviews_done', label: 'Интервью завершены' },
  { key: 'shortlist_forming', label: 'Shortlist формируется' },
];

export default function Dashboard() {
  const {
    vacancies,
    candidates,
    activities,
    interviews,
    updateVacancy,
    addActivity,
  } = useApp();

// Dashboard управляет одной закреплённой вакансией.
// Изменение её статуса не должно переключать карточку на другую вакансию.
const primaryVacancy = vacancies[0];

  const pendingDecisions = candidates.filter(
    candidate => candidate.status === 'needs_hr_decision'
  );
  const completedInterviews = interviews.filter(
    interview => interview.status === 'completed'
  );
  const recentActivities = [...activities]
    .sort(
      (first, second) =>
        new Date(second.timestamp).getTime() -
        new Date(first.timestamp).getTime()
    )
    .slice(0, 5);
  const upcomingInterviews = interviews
    .filter(interview => interview.status === 'scheduled')
    .sort(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime()
    );

  const stats = [
    {
      label: 'Активные вакансии',
      value: vacancies.filter(vacancy => vacancy.status === 'active').length,
      icon: Briefcase,
      trend: '+1 за неделю',
    },
    {
      label: 'Новые кандидаты',
      value: candidates.filter(candidate => candidate.status === 'new').length,
      icon: Users,
      trend: '+3 сегодня',
    },
    {
      label: 'Ожидают решения',
      value: pendingDecisions.length,
      icon: Clock,
      trend: 'Требуется внимание',
    },
    {
      label: 'AI-интервью завершено',
      value: completedInterviews.length,
      icon: MessageSquare,
      trend: '+2 за неделю',
    },
    {
      label: 'Сэкономлено времени',
      value: '~47ч',
      icon: Timer,
      trend: 'Демо-данные',
    },
  ];

  const vacancyCandidates = primaryVacancy
    ? candidates.filter(candidate => candidate.vacancyId === primaryVacancy.id)
    : [];
  const vacancyInterviews = primaryVacancy
    ? interviews.filter(interview => interview.vacancyId === primaryVacancy.id)
    : [];
  const completedVacancyInterviews = vacancyInterviews.filter(
    interview => interview.status === 'completed'
  );
  const activeDialogs = vacancyCandidates.filter(candidate =>
    ['ai_analyzing', 'needs_clarification', 'screening_done'].includes(
      candidate.status
    )
  ).length;

  const currentStageIndex = primaryVacancy
    ? stageDefinitions.findIndex(
        stage => stage.key === primaryVacancy.currentStage
      )
    : -1;
  const progress =
    currentStageIndex >= 0
      ? Math.round(
          ((currentStageIndex + 1) / stageDefinitions.length) * 100
        )
      : 0;

  const getStageInfo = (stage: RecruitmentStage) => {
    if (!primaryVacancy) return '';

    switch (stage) {
      case 'vacancy_analyzed':
        return `Создано ${new Date(primaryVacancy.createdAt).toLocaleDateString(
          'ru-RU',
          { day: 'numeric', month: 'short' }
        )}`;
      case 'criteria_formed':
        return `${primaryVacancy.requiredSkills.length} обязательных, ${primaryVacancy.preferredSkills.length} желательных`;
      case 'candidates_received':
        return `${primaryVacancy.candidatesTotal} откликов`;
      case 'resumes_processed':
        return `${primaryVacancy.candidatesProcessed} из ${primaryVacancy.candidatesTotal}`;
      case 'screening_in_progress':
        return `${activeDialogs} в работе`;
      case 'interviews_done':
        return `${completedVacancyInterviews.length} завершено`;
      case 'shortlist_forming':
        return `${primaryVacancy.candidatesShortlisted} кандидатов`;
      default:
        return '';
    }
  };

  const stages = stageDefinitions.map((stage, index) => {
    let status: StageState = 'pending';

    if (index < currentStageIndex) status = 'done';
    if (index === currentStageIndex) status = 'active';

    return {
      ...stage,
      status,
      info: getStageInfo(stage.key),
    };
  });

  const togglePause = () => {
    if (!primaryVacancy) return;

    const newStatus =
      primaryVacancy.status === 'paused' ? 'active' : 'paused';
    const now = new Date().toISOString();
    const isPaused = newStatus === 'paused';

    updateVacancy(primaryVacancy.id, {
      status: newStatus,
      updatedAt: now,
      lastAIAction: isPaused
        ? 'Задача AI приостановлена HR'
        : 'Задача AI возобновлена HR',
    });

    addActivity({
      id: `activity-${Date.now()}`,
      type: isPaused ? 'task_paused' : 'task_resumed',
      title: isPaused ? 'Задача AI приостановлена' : 'Задача AI продолжена',
      description: `${primaryVacancy.title}: действие выполнено пользователем`,
      timestamp: now,
      vacancyId: primaryVacancy.id,
      vacancyTitle: primaryVacancy.title,
      status: 'completed',
    });

    toast.success(
      isPaused ? 'Задача приостановлена' : 'Задача продолжена'
    );
  };

  const isPaused = primaryVacancy?.status === 'paused';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] w-fit">
        <Bot className="w-4 h-4 text-[#10B981]" />
        <span className="text-xs font-medium text-[#065F46]">
          Демонстрационные данные прототипа v0.1
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow hover:card-shadow-hover transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1E293B]">
                {stat.value}
              </p>
              <p className="text-sm text-[#64748B] mt-0.5">{stat.label}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {primaryVacancy ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Центр управления Recruiter AI
                </h3>
                <p className="text-sm text-[#64748B]">
                  {isPaused ? 'Задача приостановлена' : 'Активная задача'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                {isPaused ? 'Продолжить' : 'Приостановить'}
              </button>

              <Link
                href={`/vacancies/${primaryVacancy.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] text-sm text-white hover:bg-[#059669] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Открыть
              </Link>
            </div>
          </div>

          <div className="bg-[#F0F7F2] rounded-xl p-4 mb-5">
            <p className="text-sm font-medium text-[#1E293B] mb-2">
              Найти {primaryVacancy.title.toLowerCase()} с опытом{' '}
              {primaryVacancy.experience}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#64748B]">Вакансия:</span>{' '}
                <span className="text-[#1E293B] font-medium">
                  {primaryVacancy.title}
                </span>
              </div>
              <div>
                <span className="text-[#64748B]">Обработано:</span>{' '}
                <span className="text-[#1E293B] font-medium">
                  {primaryVacancy.candidatesProcessed} кандидатов
                </span>
              </div>
              <div>
                <span className="text-[#64748B]">Диалогов:</span>{' '}
                <span className="text-[#1E293B] font-medium">
                  {activeDialogs} активных
                </span>
              </div>
              <div>
                <span className="text-[#64748B]">Интервью:</span>{' '}
                <span className="text-[#1E293B] font-medium">
                  {completedVacancyInterviews.length} завершено
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#64748B]">Общий прогресс</span>
              <span className="font-medium text-[#10B981]">{progress}%</span>
            </div>
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {stages.map(stage => (
              <div key={stage.key} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {stage.status === 'done' && (
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  )}
                  {stage.status === 'active' && (
                    <div className="w-5 h-5 rounded-full border-2 border-[#10B981] flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full bg-[#10B981] ${
                          isPaused ? '' : 'animate-pulse'
                        }`}
                      />
                    </div>
                  )}
                  {stage.status === 'pending' && (
                    <Circle className="w-5 h-5 text-[#CBD5E1]" />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between py-1">
                  <span
                    className={`text-sm ${
                      stage.status === 'active'
                        ? 'font-medium text-[#1E293B]'
                        : stage.status === 'done'
                          ? 'text-[#64748B]'
                          : 'text-[#94A3B8]'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    {stage.info}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center card-shadow">
          <Bot className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1E293B]">
            Нет вакансий для запуска AI
          </h3>
          <p className="text-sm text-[#64748B] mt-1 mb-4">
            Создайте первую вакансию, чтобы Recruiter AI начал работу.
          </p>
          <Link
            href="/vacancies/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10B981] text-sm text-white hover:bg-[#059669] transition-colors"
          >
            Создать вакансию
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1E293B]">
              Последние действия AI
            </h3>
            <Link
              href="/ai-activity"
              className="text-sm text-[#10B981] hover:text-[#059669] font-medium flex items-center gap-1"
            >
              Все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-2 border-b border-[#EDF2F7] last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1E293B] font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-[#64748B] truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1E293B]">
                Ожидают решения HR
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EFF6FF] text-[#1E40AF]">
                {pendingDecisions.length}
              </span>
            </div>
            {pendingDecisions.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">
                Нет ожидающих решений
              </p>
            ) : (
              <div className="space-y-2">
                {pendingDecisions.map(candidate => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1E293B]">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {candidate.vacancyTitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">
              Ближайшие интервью
            </h3>
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">
                Нет запланированных интервью
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingInterviews.map(interview => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8FAFC]"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">
                        {interview.candidateName}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {interview.vacancyTitle}
                      </p>
                    </div>
                    <span className="text-xs text-[#10B981] font-medium">
                      {new Date(interview.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}