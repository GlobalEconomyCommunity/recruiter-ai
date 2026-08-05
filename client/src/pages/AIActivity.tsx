import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Link } from 'wouter';
import { Bot, Filter, Search, ExternalLink } from 'lucide-react';
import { aiActivityStatusConfig } from '@/lib/status-config';
import { formatRelativeTime, formatDate } from '@/lib/formatters';

export default function AIActivityPage() {
  const { activities } = useApp();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = activities.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, act) => {
    const date = new Date(act.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(act);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Активность AI</h1>
        <p className="text-sm text-[#64748B] mt-1">Лента действий Recruiter AI</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input type="text" placeholder="Поиск событий..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none w-full" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none">
          <option value="all">Все типы</option>
          <option value="candidate_received">Получен кандидат</option>
          <option value="resume_processed">Резюме обработано</option>
          <option value="screening_completed">Screening завершён</option>
          <option value="interview_scheduled">Интервью назначено</option>
          <option value="interview_completed">Интервью завершено</option>
          <option value="hr_decision_needed">Требуется HR</option>
          <option value="report_formed">Отчёт сформирован</option>
        </select>
      </div>

      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-[#64748B] mb-3">{date}</h3>
          <div className="space-y-2">
            {acts.map(act => {
              const sCfg = aiActivityStatusConfig[act.status];
              return (
                <div key={act.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start gap-3 hover:border-[#A7F3D0] transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: sCfg.bg }}>
                    <Bot className="w-4 h-4" style={{ color: sCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1E293B]">{act.title}</p>
                      <span className="text-xs text-[#94A3B8] shrink-0 ml-2">{formatRelativeTime(act.timestamp)}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{act.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {act.vacancyTitle && <span className="text-xs text-[#94A3B8]">Вакансия: {act.vacancyTitle}</span>}
                      {act.candidateName && (
                        <Link href={`/candidates/${act.candidateId}`} className="text-xs text-[#10B981] hover:underline flex items-center gap-0.5">
                          {act.candidateName} <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sCfg.bg, color: sCfg.color }}>{sCfg.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
