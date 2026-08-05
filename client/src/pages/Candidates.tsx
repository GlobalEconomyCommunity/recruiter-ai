import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Check,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { candidateStatusConfig } from '@/lib/status-config';
import { formatRelativeTime } from '@/lib/formatters';
import { getStoredData, setStoredData } from '@/lib/storage';
import type { Candidate } from '@/types';

const COMPARISON_STORAGE_KEY = 'candidate_comparison_selection';
const MAX_COMPARISON_CANDIDATES = 3;

function loadComparisonSelection(candidates: Candidate[]): string[] {
  const storedValue = getStoredData<unknown>(
    COMPARISON_STORAGE_KEY,
    []
  );

  if (!Array.isArray(storedValue)) {
    return [];
  }

  const uniqueIds = Array.from(
    new Set(storedValue.filter((value): value is string => typeof value === 'string'))
  );

  const validCandidates = uniqueIds
    .map(id => candidates.find(candidate => candidate.id === id))
    .filter((candidate): candidate is Candidate => Boolean(candidate));

  const firstVacancyId = validCandidates[0]?.vacancyId;

  return validCandidates
    .filter(candidate => candidate.vacancyId === firstVacancyId)
    .slice(0, MAX_COMPARISON_CANDIDATES)
    .map(candidate => candidate.id);
}

export default function Candidates() {
  const { candidates, vacancies } = useApp();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vacancyFilter, setVacancyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    loadComparisonSelection(candidates)
  );

  useEffect(() => {
    setStoredData(COMPARISON_STORAGE_KEY, selectedIds);
  }, [selectedIds]);

  const selectedCandidates = selectedIds
    .map(id => candidates.find(candidate => candidate.id === id))
    .filter((candidate): candidate is Candidate => Boolean(candidate));

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

  const toggleCandidateSelection = (candidate: Candidate) => {
    if (selectedIds.includes(candidate.id)) {
      setSelectedIds(previous =>
        previous.filter(id => id !== candidate.id)
      );
      return;
    }

    if (selectedIds.length >= MAX_COMPARISON_CANDIDATES) {
      toast.error('Можно сравнить не более трёх кандидатов');
      return;
    }

    const selectedVacancyId = selectedCandidates[0]?.vacancyId;

    if (
      selectedVacancyId &&
      selectedVacancyId !== candidate.vacancyId
    ) {
      toast.error(
        'Для сравнения выберите кандидатов на одну и ту же вакансию'
      );
      return;
    }

    setSelectedIds(previous => [...previous, candidate.id]);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const openComparison = () => {
    if (selectedIds.length < 2) {
      toast.error('Выберите минимум двух кандидатов');
      return;
    }

    navigate('/candidates/compare');
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

        <div className="flex flex-wrap items-center gap-2">
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

          <button
            type="button"
            onClick={openComparison}
            disabled={selectedIds.length < 2}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              selectedIds.length >= 2
                ? 'bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#0F172A]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <Users className="w-4 h-4" />
            Сравнить: {selectedIds.length}
          </button>
        </div>
      </div>

      {selectedCandidates.length > 0 && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#166534]">
                Выбрано для сравнения: {selectedCandidates.length} из 3
              </p>
              <p className="text-xs text-[#15803D] mt-1">
                Сравнивать можно только кандидатов на одну вакансию.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCandidates.map(candidate => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => toggleCandidateSelection(candidate)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#BBF7D0] text-xs font-medium text-[#166534] hover:border-[#86EFAC]"
                  title="Убрать из сравнения"
                >
                  <Check className="w-3.5 h-3.5" />
                  {candidate.name}
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}

              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#64748B] hover:bg-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <th className="w-16 text-center px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Сравнить
                  </th>
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
                  const isSelected = selectedIds.includes(candidate.id);

                  return (
                    <tr
                      key={candidate.id}
                      className={`border-b border-[#EDF2F7] transition-colors ${
                        isSelected
                          ? 'bg-[#F0FDF4]'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCandidateSelection(candidate)}
                          aria-label={`Выбрать ${candidate.name} для сравнения`}
                          className="w-4 h-4 rounded border-[#CBD5E1] accent-[#10B981] cursor-pointer"
                        />
                      </td>

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