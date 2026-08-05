import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Users,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  candidateStatusConfig,
  workFormatLabels,
} from '@/lib/status-config';
import { getStoredData, setStoredData } from '@/lib/storage';
import type { Candidate, Interview } from '@/types';

const COMPARISON_STORAGE_KEY = 'candidate_comparison_selection';
const MAX_COMPARISON_CANDIDATES = 3;

function normalizeSelection(
  storedValue: unknown,
  candidates: Candidate[]
): string[] {
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

function getLatestInterview(
  candidateId: string,
  interviews: Interview[]
): Interview | undefined {
  return interviews
    .filter(interview => interview.candidateId === candidateId)
    .sort((first, second) => {
      const firstDate = new Date(
        first.report?.completedAt ?? first.date
      ).getTime();
      const secondDate = new Date(
        second.report?.completedAt ?? second.date
      ).getTime();

      return secondDate - firstDate;
    })[0];
}

function formatDesiredSalary(value?: number): string {
  if (!value) {
    return 'Не указана';
  }

  return `${value.toLocaleString('ru-RU')} ₽`;
}

function uniqueItems(items: string[]): string[] {
  return Array.from(
    new Set(items.map(item => item.trim()).filter(Boolean))
  );
}

interface BulletListProps {
  items: string[];
  emptyText?: string;
  tone?: 'positive' | 'warning' | 'danger' | 'neutral';
}

function BulletList({
  items,
  emptyText = 'Нет данных',
  tone = 'neutral',
}: BulletListProps) {
  const values = uniqueItems(items);

  if (values.length === 0) {
    return <span className="text-sm text-[#94A3B8]">{emptyText}</span>;
  }

  const dotClass = {
    positive: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    neutral: 'bg-[#94A3B8]',
  }[tone];

  return (
    <ul className="space-y-2">
      {values.map(item => (
        <li key={item} className="flex gap-2 text-sm text-[#475569]">
          <span
            className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dotClass}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface ComparisonRowProps {
  label: string;
  values: ReactNode[];
  columnCount: number;
  highlighted?: boolean;
}

function ComparisonRow({
  label,
  values,
  columnCount,
  highlighted = false,
}: ComparisonRowProps) {
  return (
    <div
      className={`grid border-t border-[#E2E8F0] ${
        highlighted ? 'bg-[#F8FAFC]' : 'bg-white'
      }`}
      style={{
        gridTemplateColumns: `220px repeat(${columnCount}, minmax(280px, 1fr))`,
      }}
    >
      <div className="px-4 py-4 text-sm font-semibold text-[#334155] border-r border-[#E2E8F0]">
        {label}
      </div>

      {values.map((value, index) => (
        <div
          key={`${label}-${index}`}
          className="px-4 py-4 border-r last:border-r-0 border-[#E2E8F0] min-w-0"
        >
          {value}
        </div>
      ))}
    </div>
  );
}

export default function CandidateCompare() {
  const { candidates, interviews, vacancies } = useApp();
  const [, navigate] = useLocation();
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    normalizeSelection(
      getStoredData<unknown>(COMPARISON_STORAGE_KEY, []),
      candidates
    )
  );

  const selectedCandidates = selectedIds
    .map(id => candidates.find(candidate => candidate.id === id))
    .filter((candidate): candidate is Candidate => Boolean(candidate));

  const vacancyIds = new Set(
    selectedCandidates.map(candidate => candidate.vacancyId)
  );

  const hasValidSelection =
    selectedCandidates.length >= 2 && vacancyIds.size === 1;

  const vacancy = vacancies.find(
    item => item.id === selectedCandidates[0]?.vacancyId
  );

  const saveSelection = (nextIds: string[]) => {
    setSelectedIds(nextIds);
    setStoredData(COMPARISON_STORAGE_KEY, nextIds);
  };

  const removeCandidate = (candidateId: string) => {
    saveSelection(selectedIds.filter(id => id !== candidateId));
  };

  const clearSelection = () => {
    saveSelection([]);
    navigate('/candidates');
  };

  if (!hasValidSelection) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center card-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-[#64748B]" />
          </div>

          <h1 className="text-xl font-bold text-[#1E293B]">
            Выберите кандидатов для сравнения
          </h1>
          <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">
            Нужны два или три кандидата на одну и ту же вакансию.
            Вернитесь в список и отметьте их флажками.
          </p>

          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669]"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к кандидатам
          </button>
        </div>
      </div>
    );
  }

  const columnCount = selectedCandidates.length;
  const tableMinWidth = 220 + columnCount * 280;

  const candidateInterviews = selectedCandidates.map(candidate =>
    getLatestInterview(candidate.id, interviews)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E293B] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            К списку кандидатов
          </button>

          <h1 className="text-2xl font-bold text-[#1E293B]">
            Сравнение кандидатов
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {vacancy?.title ?? selectedCandidates[0].vacancyTitle} ·{' '}
            {selectedCandidates.length} кандидата
          </p>
        </div>

        <button
          type="button"
          onClick={clearSelection}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#64748B] hover:bg-[#F8FAFC]"
        >
          <Trash2 className="w-4 h-4" />
          Очистить выбор
        </button>
      </div>

      <div className="flex gap-3 rounded-2xl border border-[#D1FAE5] bg-[#F0FDF4] p-4">
        <Bot className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#166534]">
            Сравнение основано на фактах, а не на рейтинге личности
          </p>
          <p className="text-sm text-[#15803D] mt-1">
            Recruiter AI сопоставляет резюме, подтверждённые требования,
            ответы интервью, риски и решения HR. Итоговый выбор остаётся за человеком.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${tableMinWidth}px` }}>
            <div
              className="grid bg-[#F8FAFC]"
              style={{
                gridTemplateColumns: `220px repeat(${columnCount}, minmax(280px, 1fr))`,
              }}
            >
              <div className="px-4 py-5 border-r border-[#E2E8F0] flex items-end">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Критерий
                </span>
              </div>

              {selectedCandidates.map(candidate => {
                const statusConfig =
                  candidateStatusConfig[candidate.status];

                return (
                  <div
                    key={candidate.id}
                    className="relative px-4 py-5 border-r last:border-r-0 border-[#E2E8F0]"
                  >
                    <button
                      type="button"
                      onClick={() => removeCandidate(candidate.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
                      title="Убрать из сравнения"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="inline-flex items-center gap-3 pr-8"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#ECFDF5] flex items-center justify-center text-sm font-bold text-[#047857] shrink-0">
                        {candidate.name
                          .split(' ')
                          .map(word => word[0])
                          .join('')}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[#1E293B] hover:text-[#10B981] truncate">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-[#64748B] mt-0.5 truncate">
                          {candidate.currentPosition}
                        </p>
                      </div>
                    </Link>

                    <span
                      className="inline-flex mt-3 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.textColor,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <ComparisonRow
              label="Текущая должность"
              columnCount={columnCount}
              values={selectedCandidates.map(candidate => (
                <p className="text-sm font-medium text-[#1E293B]">
                  {candidate.currentPosition}
                </p>
              ))}
            />

            <ComparisonRow
              label="Опыт"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <p className="text-sm text-[#475569]">{candidate.experience}</p>
              ))}
            />

            <ComparisonRow
              label="Город"
              columnCount={columnCount}
              values={selectedCandidates.map(candidate => (
                <p className="text-sm text-[#475569]">{candidate.city}</p>
              ))}
            />

            <ComparisonRow
              label="Зарплатные ожидания"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <p className="text-sm font-medium text-[#1E293B]">
                  {formatDesiredSalary(candidate.desiredSalary)}
                </p>
              ))}
            />

            <ComparisonRow
              label="Формат работы"
              columnCount={columnCount}
              values={selectedCandidates.map(() => (
                <div>
                  <p className="text-sm text-[#475569]">
                    {vacancy
                      ? workFormatLabels[vacancy.workFormat]
                      : 'Не указан'}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Условия вакансии
                  </p>
                </div>
              ))}
            />

            <ComparisonRow
              label="Источник"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <p className="text-sm text-[#475569]">{candidate.source}</p>
              ))}
            />

            <ComparisonRow
              label="Ключевые навыки из резюме"
              columnCount={columnCount}
              values={selectedCandidates.map(candidate => (
                <BulletList items={candidate.resume.skills} />
              ))}
            />

            <ComparisonRow
              label="Подтверждённые требования"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <BulletList
                  items={candidate.aiAnalysis.confirmedRequirements}
                  tone="positive"
                  emptyText="Не подтверждены"
                />
              ))}
            />

            <ComparisonRow
              label="Частичное соответствие"
              columnCount={columnCount}
              values={selectedCandidates.map(candidate => (
                <BulletList
                  items={candidate.aiAnalysis.partialMatch}
                  tone="warning"
                  emptyText="Нет частичных совпадений"
                />
              ))}
            />

            <ComparisonRow
              label="Недостающие требования"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <BulletList
                  items={candidate.aiAnalysis.missingRequirements}
                  tone="danger"
                  emptyText="Критичных пробелов не выявлено"
                />
              ))}
            />

            <ComparisonRow
              label="Сильные стороны"
              columnCount={columnCount}
              values={selectedCandidates.map((candidate, index) => (
                <BulletList
                  items={[
                    ...candidate.aiAnalysis.strengths,
                    ...(candidateInterviews[index]?.report?.strengths ?? []),
                  ]}
                  tone="positive"
                />
              ))}
            />

            <ComparisonRow
              label="Риски"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map((candidate, index) => (
                <BulletList
                  items={[
                    ...candidate.aiAnalysis.risks,
                    ...(candidateInterviews[index]?.report?.risks ?? []),
                  ]}
                  tone="danger"
                  emptyText="Явные риски не зафиксированы"
                />
              ))}
            />

            <ComparisonRow
              label="Что уточнить HR"
              columnCount={columnCount}
              values={selectedCandidates.map((candidate, index) => (
                <BulletList
                  items={[
                    ...candidate.aiAnalysis.toVerify,
                    ...(candidateInterviews[index]?.report?.topicsToVerify ?? []),
                  ]}
                  tone="warning"
                  emptyText="Дополнительных вопросов нет"
                />
              ))}
            />

            <ComparisonRow
              label="AI-вывод по резюме"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map(candidate => (
                <div className="flex gap-2">
                  <Bot className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {candidate.aiSummary}
                  </p>
                </div>
              ))}
            />

            <ComparisonRow
              label="Итог интервью"
              columnCount={columnCount}
              values={candidateInterviews.map(interview => (
                interview?.report ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#475569] leading-relaxed">
                        {interview.report.summary}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#1E293B]">
                      {interview.report.recommendation}
                    </p>
                  </div>
                ) : interview ? (
                  <div className="flex gap-2">
                    <HelpCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#64748B]">
                      {interview.status === 'completed'
                        ? interview.shortResult || 'Отчёт не сформирован'
                        : 'Интервью ещё не завершено'}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-[#94A3B8]">
                    Интервью не назначено
                  </span>
                )
              ))}
            />

            <ComparisonRow
              label="Рекомендация Recruiter AI"
              columnCount={columnCount}
              highlighted
              values={selectedCandidates.map((candidate, index) => (
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {candidateInterviews[index]?.report?.recommendation ??
                      candidate.aiAnalysis.recommendation}
                  </p>
                </div>
              ))}
            />

            <ComparisonRow
              label="Решение работодателя"
              columnCount={columnCount}
              values={selectedCandidates.map(candidate => (
                candidate.hrDecision ? (
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B]">
                      {candidate.hrDecision.label}
                    </p>
                    <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                      {candidate.hrDecision.comment}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-2">
                      {candidate.hrDecision.decidedBy} ·{' '}
                      {new Date(
                        candidate.hrDecision.decidedAt
                      ).toLocaleString('ru-RU')}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-[#94A3B8]">
                    Решение ещё не принято
                  </span>
                )
              ))}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/candidates')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#64748B] hover:bg-[#F8FAFC]"
        >
          <ArrowLeft className="w-4 h-4" />
          Изменить выбор
        </button>

        <p className="text-xs text-[#94A3B8] text-center sm:text-right">
          Нажмите на имя кандидата, чтобы открыть полную карточку.
        </p>
      </div>
    </div>
  );
}