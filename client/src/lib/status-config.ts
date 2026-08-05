import type { CandidateStatus, VacancyStatus, AIActivityStatus, IntegrationStatus, RecruitmentStage } from '@/types';

// Centralized status configuration — labels, colors, and descriptions

export const candidateStatusConfig: Record<CandidateStatus, { label: string; color: string; bg: string; textColor: string }> = {
  new: { label: 'Новый', color: '#64748B', bg: '#F1F5F9', textColor: '#475569' },
  ai_analyzing: { label: 'AI анализирует', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  needs_clarification: { label: 'Требуется уточнение', color: '#F59E0B', bg: '#FFFBEB', textColor: '#92400E' },
  screening_done: { label: 'Screening завершён', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  interview_scheduled: { label: 'Интервью назначено', color: '#3B82F6', bg: '#EFF6FF', textColor: '#1E40AF' },
  interview_done: { label: 'Интервью завершено', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  recommended: { label: 'Рекомендован', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  needs_hr_decision: { label: 'Требуется решение HR', color: '#3B82F6', bg: '#EFF6FF', textColor: '#1E40AF' },
  postponed: { label: 'Отложен', color: '#64748B', bg: '#F1F5F9', textColor: '#475569' },
  rejected: { label: 'Отклонён HR', color: '#EF4444', bg: '#FEF2F2', textColor: '#991B1B' },
};

export const vacancyStatusConfig: Record<VacancyStatus, { label: string; color: string; bg: string; textColor: string }> = {
  active: { label: 'Активна', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  paused: { label: 'Приостановлена', color: '#F59E0B', bg: '#FFFBEB', textColor: '#92400E' },
  draft: { label: 'Черновик', color: '#64748B', bg: '#F1F5F9', textColor: '#475569' },
  closed: { label: 'Закрыта', color: '#64748B', bg: '#F1F5F9', textColor: '#475569' },
  completed: { label: 'Завершена', color: '#10B981', bg: '#D1FAE5', textColor: '#065F46' },
};

export const aiActivityStatusConfig: Record<AIActivityStatus, { label: string; color: string; bg: string }> = {
  completed: { label: 'Завершено', color: '#10B981', bg: '#ECFDF5' },
  in_progress: { label: 'Выполняется', color: '#10B981', bg: '#ECFDF5' },
  waiting: { label: 'Ожидает', color: '#64748B', bg: '#F1F5F9' },
  needs_hr: { label: 'Требуется HR', color: '#3B82F6', bg: '#EFF6FF' },
  needs_clarification: { label: 'Уточнение', color: '#F59E0B', bg: '#FFFBEB' },
  error: { label: 'Ошибка', color: '#EF4444', bg: '#FEF2F2' },
};

export const integrationStatusConfig: Record<IntegrationStatus, { label: string; color: string; bg: string; textColor: string }> = {
  planned: { label: 'Планируется', color: '#3B82F6', bg: '#EFF6FF', textColor: '#1E40AF' },
  demo: { label: 'Демонстрация', color: '#10B981', bg: '#ECFDF5', textColor: '#065F46' },
  unavailable: { label: 'Недоступно в v0.1', color: '#64748B', bg: '#F1F5F9', textColor: '#475569' },
};

export const recruitmentStageConfig: Record<RecruitmentStage, { label: string; order: number }> = {
  vacancy_analyzed: { label: 'Вакансия проанализирована', order: 1 },
  criteria_formed: { label: 'Критерии сформированы', order: 2 },
  candidates_received: { label: 'Кандидаты получены', order: 3 },
  resumes_processed: { label: 'Резюме обработаны', order: 4 },
  screening_in_progress: { label: 'Screening проводится', order: 5 },
  interviews_done: { label: 'Интервью завершены', order: 6 },
  shortlist_forming: { label: 'Shortlist формируется', order: 7 },
};

export const workFormatLabels: Record<string, string> = {
  office: 'Офис',
  remote: 'Удалённо',
  hybrid: 'Гибрид',
};
