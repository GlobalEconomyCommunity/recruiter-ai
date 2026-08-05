import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsData } from '@/data/analytics';
import { Bot, Users, MessageSquare, Clock, Briefcase, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const stats = [
    { label: 'AI Screening', value: analyticsData.screeningsCompleted, icon: Bot },
    { label: 'Интервью завершено', value: analyticsData.interviewsCompleted, icon: MessageSquare },
    { label: 'Передано HR', value: analyticsData.candidatesPassedToHR, icon: Users },
    { label: 'Вакансий в работе', value: analyticsData.vacanciesInProgress, icon: Briefcase },
    { label: 'Сэкономлено', value: analyticsData.timeSaved, icon: Clock },
    { label: 'Решений HR', value: analyticsData.hrDecisions, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Аналитика</h1>
          <p className="text-sm text-[#64748B] mt-1">Демонстрационные данные прототипа</p>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-xs font-medium text-[#065F46]">Демо-данные</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 card-shadow">
              <Icon className="w-5 h-5 text-[#10B981] mb-2" />
              <p className="text-xl font-bold text-[#1E293B]">{s.value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">Воронка кандидатов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: '#64748B' }} width={100} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {analyticsData.funnelData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#34D399' : '#10B981'} fillOpacity={1 - i * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Processing speed */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">Скорость обработки</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analyticsData.processingSpeed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sources */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">Источники кандидатов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.sourceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity by vacancy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">Активность по вакансиям</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.activityByVacancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="vacancy" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#34D399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
