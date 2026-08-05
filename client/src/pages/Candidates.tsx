import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import { useState } from 'react';
import { Search, Filter, Users, X } from 'lucide-react';
import { candidateStatusConfig } from '@/lib/status-config';
import { formatRelativeTime } from '@/lib/formatters';
import type { CandidateStatus } from '@/types';

export default function Candidates() {
  const { candidates, vacancies } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vacancyFilter, setVacancyFilter] = useState<string>('all');

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.currentPosition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchVacancy = vacancyFilter === 'all' || c.vacancyId === vacancyFilter;
    return matchSearch && matchStatus && matchVacancy;
  });

  const resetFilters = () => { setSearch(''); setStatusFilter('all'); setVacancyFilter('all'); };
  const hasFilters = search || statusFilter !== 'all' || vacancyFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Кандидаты</h1>
          <p className="text-sm text-[#64748B] mt-1">{candidates.length} кандидатов в базе</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input type="text" placeholder="Поиск кандидатов..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none">
          <option value="all">Все статусы</option>
          {Object.entries(candidateStatusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <select value={vacancyFilter} onChange={e => setVacancyFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none">
          <option value="all">Все вакансии</option>
          {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <X className="w-3.5 h-3.5" /> Сбросить
          </button>
        )}
      </div>

      {/* Candidates list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <Users className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B]">{hasFilters ? 'Кандидаты не найдены по заданным фильтрам' : 'Нет кандидатов'}</p>
          {hasFilters && <button onClick={resetFilters} className="mt-2 text-sm text-[#10B981] hover:underline">Сбросить фильтры</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Кандидат</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Вакансия</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">AI-вывод</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Обновлено</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sCfg = candidateStatusConfig[c.status];
                  return (
                    <tr key={c.id} className="border-b border-[#EDF2F7] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/candidates/${c.id}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center text-xs font-semibold text-[#10B981] shrink-0">
                            {c.name.split(' ').map(w => w[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1E293B] hover:text-[#10B981] transition-colors">{c.name}</p>
                            <p className="text-xs text-[#64748B]">{c.currentPosition} · {c.experience} · {c.city}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{c.vacancyTitle}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sCfg.bg, color: sCfg.textColor }}>{sCfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B] max-w-[200px] truncate">{c.aiSummary}</td>
                      <td className="px-4 py-3 text-xs text-[#94A3B8]">{formatRelativeTime(c.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
