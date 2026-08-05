import { useState } from 'react';
import { Link } from 'wouter';
import { Search, Users, X, UserCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { candidateStatusConfig } from '@/lib/status-config';
import { formatRelativeTime } from '@/lib/formatters';

export default function Candidates() {
  const { candidates, vacancies } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vacancyFilter, setVacancyFilter] = useState<string>('all');

  const shortlistCount = candidates.filter(
    candidate => candidate.status === 'recommended'
  ).length;

  const filtered = candidates.filter(candidate => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchSearch =
      normalizedSearch.length === 0 ||
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.currentPosition.toLowerCase().includes(normalizedSearch) ||
      candidate.vacancyTitle.toLowerCase().includes(normalizedSearch);

    const matchStatus =
      statusFilter === 'all' || candidate.status === statusFilter;

    const matchVacancy =
      vacancyFilter === 'all' || candidate.vacancyId === vacancyFilter;

    return matchSearch && matchStatus && matchVacancy;
  });

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setVacancyFilter('all');
  };

  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== 'all' ||
    vacancyFilter !== 'all';

  const showShortlist = () => {
    setStatusFilter(
      statusFilter === 'recommended' ? 'all' : 'recommended'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Кандидаты</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {candidates.length} кандидатов в базе
          </p>
        </div>

        <button
          type="button"
          onClick={showShortlist}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            statusFilter === 'recommended'
              ? 'bg-[#10B981] border-[#10B981] text-white'
              : 'bg-white border-[#D1FAE5] text-[#047857] hover:bg-[#ECFDF5]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Shortlist: {shortlistCount}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Поиск кандидатов..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="bg-transparent text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none"
        >
          <option value="all">Все статусы</option>
          {Object.entries(candidateStatusConfig).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>

        <select
          value={vacancyFilter}
          onChange={event => setVacancyFilter(event.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none"
        >
          <option value="all">Все вакансии</option>
          {vacancies.map(vacancy => (
            <option key={vacancy.id} value={vacancy.id}>
              {vacancy.title}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Сбросить
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <Users className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B]">
            {hasFilters
              ? 'Кандидаты не найдены по заданным фильтрам'
              : 'Нет кандидатов'}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 text-sm text-[#10B981] hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Кандидат
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Вакансия
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    AI-вывод
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Решение HR
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Обновлено
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(candidate => {
                  const statusConfig =
                    candidateStatusConfig[candidate.status];

                  return (
                    <tr
                      key={candidate.id}
                      className="border-b border-[#EDF2F7] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center text-xs font-semibold text-[#10B981] shrink-0">
                            {candidate.name
                              .split(' ')
                              .map(word => word[0])
                              .join('')}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[#1E293B] hover:text-[#10B981] transition-colors">
                              {candidate.name}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {candidate.currentPosition} ·{' '}
                              {candidate.experience} · {candidate.city}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-sm text-[#64748B]">
                        {candidate.vacancyTitle}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.textColor,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#64748B] max-w-[220px] truncate">
                        {candidate.aiSummary}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#64748B] max-w-[220px]">
                        {candidate.hrDecision ? (
                          <div>
                            <p className="font-medium text-[#1E293B]">
                              {candidate.hrDecision.label}
                            </p>
                            <p className="truncate mt-0.5">
                              {candidate.hrDecision.comment}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8]">Не принято</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#94A3B8]">
                        {formatRelativeTime(candidate.updatedAt)}
                      </td>
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