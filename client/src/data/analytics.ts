import type { AnalyticsData } from '@/types';

export const analyticsData: AnalyticsData = {
  candidatesByStage: [
    { stage: 'Получены', count: 134 },
    { stage: 'Резюме обработаны', count: 108 },
    { stage: 'Screening', count: 72 },
    { stage: 'Интервью', count: 28 },
    { stage: 'Рекомендованы', count: 16 },
    { stage: 'Решение HR', count: 8 },
  ],
  processingSpeed: [
    { date: '22 июл', count: 8 },
    { date: '23 июл', count: 12 },
    { date: '24 июл', count: 15 },
    { date: '25 июл', count: 22 },
    { date: '26 июл', count: 18 },
    { date: '27 июл', count: 25 },
    { date: '28 июл', count: 14 },
  ],
  screeningsCompleted: 72,
  interviewsCompleted: 28,
  candidatesPassedToHR: 16,
  vacanciesInProgress: 3,
  timeSaved: '~47 часов',
  activityByVacancy: [
    { vacancy: 'Менеджер B2B', count: 47 },
    { vacancy: 'Руководитель продаж', count: 23 },
    { vacancy: 'Поддержка', count: 64 },
  ],
  hrDecisions: 12,
  sourceDistribution: [
    { source: 'hh.ru', count: 68 },
    { source: 'LinkedIn', count: 24 },
    { source: 'SuperJob', count: 18 },
    { source: 'Авито Работа', count: 14 },
    { source: 'Рекомендации', count: 10 },
  ],
  funnelData: [
    { stage: 'Отклики', count: 134 },
    { stage: 'AI-обработка', count: 108 },
    { stage: 'Screening', count: 72 },
    { stage: 'Интервью', count: 28 },
    { stage: 'Shortlist', count: 16 },
  ],
};
