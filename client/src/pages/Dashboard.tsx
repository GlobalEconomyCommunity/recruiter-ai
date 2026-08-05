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
import { formatRelativeTime } from '@/lib/formatters';
import { candidateStatusConfig } from '@/lib/status-config';

const stages = [
  { key: 'vacancy_analyzed', label: 'Вакансия проанализирована', status: 'done', info: 'Завершено 15 июл' },
  { key: 'criteria_formed', label: 'Критерии сформированы', status: 'done', info: '12 обязательных, 5 желательных' },
  { key: 'candidates_received', label: 'Кандидаты получены', status: 'done', info: '47 откликов' },
  { key: 'resumes_processed', label: 'Резюме обработаны', status: 'done', info: '38 из 47' },
  { key: 'screening_in_progress', label: 'Screening проводится', status: 'active', info: '5 в процессе' },
  { key: 'interviews_done', label: 'Интервью завершены', status: 'pending', info: '2 из 5' },
  { key: 'shortlist_forming', label: 'Shortlist формируется', status: 'pending', info: 'Ожидает' },
];

export default function Dashboard() {
  const { vacancies, candidates, activities, interviews } = useApp();

  const activeCandidates = candidates.filter(c => c.status !== 'rejected' && c.status !== 'postponed');
  const pendingDecisions = candidates.filter(c => c.status === 'needs_hr_decision');
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const recentActivities = activities.slice(0, 5);
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');

  const stats = [
    { label: 'Активные вакансии', value: vacancies.filter(v => v.status === 'active').length, icon: Briefcase, trend: '+1 за неделю' },
    { label: 'Новые кандидаты', value: candidates.filter(c => c.status === 'new').length, icon: Users, trend: '+3 сегодня' },
    { label: 'Ожидают решения', value: pendingDecisions.length, icon: Clock, trend: 'Требуется внимание' },
    { label: 'AI-интервью завершено', value: completedInterviews.length, icon: MessageSquare, trend: '+2 за неделю' },
    { label: 'Сэкономлено времени', value: '~47ч', icon: Timer, trend: 'Демо-данные' },
  ];

  return (
    <div className="space-y-6">
      {/* Demo badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] w-fit">
        <Bot className="w-4 h-4 text-[#10B981]" />
        <span className="text-xs font-medium text-[#065F46]">Демонстрационные данные прототипа v0.1</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
              <p className="text-sm text-[#64748B] mt-0.5">{stat.label}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* AI Control Center */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-shadow">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B]">Центр управления Recruiter AI</h3>
              <p className="text-sm text-[#64748B]">Активная задача</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              <Pause className="w-3.5 h-3.5" />
              Приостановить
            </button>
            <Link href="/vacancies/vac-1" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] text-sm text-white hover:bg-[#059669] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Открыть
            </Link>
          </div>
        </div>

        {/* Task info */}
        <div className="bg-[#F0F7F2] rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-[#1E293B] mb-2">Найти менеджера по продажам B2B с опытом от двух лет</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-[#64748B]">Вакансия:</span> <span className="text-[#1E293B] font-medium">Менеджер по продажам B2B</span></div>
            <div><span className="text-[#64748B]">Обработано:</span> <span className="text-[#1E293B] font-medium">38 кандидатов</span></div>
            <div><span className="text-[#64748B]">Диалогов:</span> <span className="text-[#1E293B] font-medium">5 активных</span></div>
            <div><span className="text-[#64748B]">Интервью:</span> <span className="text-[#1E293B] font-medium">2 завершено</span></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#64748B]">Общий прогресс</span>
            <span className="font-medium text-[#10B981]">71%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-full transition-all duration-500" style={{ width: '71%' }} />
          </div>
        </div>

        {/* Stages stepper */}
        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                {stage.status === 'done' && <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
                {stage.status === 'active' && (
                  <div className="w-5 h-5 rounded-full border-2 border-[#10B981] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  </div>
                )}
                {stage.status === 'pending' && <Circle className="w-5 h-5 text-[#CBD5E1]" />}
              </div>
              <div className="flex-1 flex items-center justify-between py-1">
                <span className={`text-sm ${stage.status === 'active' ? 'font-medium text-[#1E293B]' : stage.status === 'done' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  {stage.label}
                </span>
                <span className="text-xs text-[#94A3B8]">{stage.info}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Activity */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1E293B]">Последние действия AI</h3>
            <Link href="/ai-activity" className="text-sm text-[#10B981] hover:text-[#059669] font-medium flex items-center gap-1">
              Все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.map(act => (
              <div key={act.id} className="flex items-start gap-3 py-2 border-b border-[#EDF2F7] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1E293B] font-medium truncate">{act.title}</p>
                  <p className="text-xs text-[#64748B] truncate">{act.description}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{formatRelativeTime(act.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending HR decisions + Upcoming interviews */}
        <div className="space-y-6">
          {/* HR Decisions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1E293B]">Ожидают решения HR</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EFF6FF] text-[#1E40AF]">{pendingDecisions.length}</span>
            </div>
            {pendingDecisions.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">Нет ожидающих решений</p>
            ) : (
              <div className="space-y-2">
                {pendingDecisions.map(c => (
                  <Link key={c.id} href={`/candidates/${c.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1E293B]">{c.name}</p>
                        <p className="text-xs text-[#64748B]">{c.vacancyTitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming interviews */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">Ближайшие интервью</h3>
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">Нет запланированных интервью</p>
            ) : (
              <div className="space-y-2">
                {upcomingInterviews.map(int => (
                  <div key={int.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8FAFC]">
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{int.candidateName}</p>
                      <p className="text-xs text-[#64748B]">{int.vacancyTitle}</p>
                    </div>
                    <span className="text-xs text-[#10B981] font-medium">{new Date(int.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
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
