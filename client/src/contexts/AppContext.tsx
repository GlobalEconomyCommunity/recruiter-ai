import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  AIActivity,
  AISettings,
  Candidate,
  CandidateDecision,
  Company,
  Interview,
  NotificationSettings,
  UserProfile,
  Vacancy,
} from '@/types';
import { defaultVacancies } from '@/data/vacancies';
import { defaultCandidates } from '@/data/candidates';
import { defaultInterviews } from '@/data/interviews';
import { defaultActivities } from '@/data/activities';
import { demoCompany, demoUser } from '@/data/company';
import { getStoredData, setStoredData } from '@/lib/storage';

interface AppContextType {
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
  activities: AIActivity[];
  user: UserProfile;
  company: Company;
  aiSettings: AISettings;
  notificationSettings: NotificationSettings;
  updateUser: (updates: Partial<Omit<UserProfile, 'company'>>) => void;
  updateCompany: (updates: Partial<Company>) => void;
  updateAISettings: (updates: Partial<AISettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  addVacancy: (vacancy: Vacancy) => void;
  updateVacancy: (id: string, updates: Partial<Vacancy>) => void;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;
  addActivity: (activity: AIActivity) => void;
  scheduleInterview: (interview: Interview) => void;
  startInterview: (interviewId: string) => void;
  completeInterview: (interview: Interview) => void;
  submitHRDecision: (
    candidateId: string,
    decision: CandidateDecision,
    comment: string
  ) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultAISettings: AISettings = {
  autoProcessApplications: true,
  autoScreening: true,
  allowAutoReject: false,
  allowAutoAdvance: false,
  communicationStyle: 'formal',
};

const defaultNotificationSettings: NotificationSettings = {
  newCandidates: true,
  screeningCompleted: true,
  hrDecisionRequired: true,
  interviewsCompleted: true,
  weeklyReport: true,
};


function createVacancyAnalyzedActivity(vacancy: Vacancy): AIActivity {
  return {
    id: `activity-vacancy-created-${vacancy.id}`,
    type: 'analysis_formed',
    title: 'Вакансия проанализирована',
    description:
      `Recruiter AI проанализировал вакансию «${vacancy.title}», ` +
      `выделил ${vacancy.requiredSkills.length} обязательных ` +
      `и ${vacancy.preferredSkills.length} желательных требований.`,
    timestamp: vacancy.updatedAt,
    vacancyId: vacancy.id,
    vacancyTitle: vacancy.title,
    status: 'completed',
  };
}

/**
 * Объединяет данные из localStorage с демонстрационными данными.
 *
 * Важно:
 * 1. Сохраняет порядок записей из localStorage.
 * 2. Пользовательские вакансии не перемещаются в конец после перезагрузки.
 * 3. Возвращает недостающие стандартные демо-записи.
 * 4. Дополняет старые записи новыми полями из исходных данных.
 */
function mergeStoredWithDefaults<T extends { id: string }>(
  storedValue: unknown,
  defaults: T[]
): T[] {
  if (!Array.isArray(storedValue)) {
    return defaults;
  }

  const storedItems = storedValue.filter(
    (item): item is T =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { id?: unknown }).id === 'string'
  );

  const defaultsById = new Map(
    defaults.map(defaultItem => [defaultItem.id, defaultItem])
  );

  const mergedStoredItems = storedItems.map(storedItem => {
    const defaultItem = defaultsById.get(storedItem.id);

    return defaultItem
      ? { ...defaultItem, ...storedItem }
      : storedItem;
  });

  const storedIds = new Set(storedItems.map(item => item.id));

  const customStoredItems = mergedStoredItems.filter(
    item => !defaultsById.has(item.id)
  );

  const storedDefaultItems = mergedStoredItems.filter(
    item => defaultsById.has(item.id)
  );

  const missingDefaults = defaults.filter(
    defaultItem => !storedIds.has(defaultItem.id)
  );

  return [
    ...customStoredItems,
    ...storedDefaultItems,
    ...missingDefaults,
  ];
}

function loadCollection<T extends { id: string }>(
  key: string,
  defaults: T[]
): T[] {
  const storedValue = getStoredData<unknown>(key, null);
  return mergeStoredWithDefaults(storedValue, defaults);
}

function getInterviewFormatLabel(format: Interview['format']): string {
  const labels: Record<Interview['format'], string> = {
    text: 'текстовый чат',
    voice: 'голосовое интервью',
    video: 'видеоинтервью',
  };

  return labels[format];
}


const hrDecisionConfig: Record<
  CandidateDecision,
  {
    label: string;
    status: Candidate['status'];
    candidateAction: string;
    activityTitle: string;
    activityStatus: AIActivity['status'];
  }
> = {
  recommend_hire: {
    label: 'Рекомендовать к найму',
    status: 'recommended',
    candidateAction: 'Кандидат включён в shortlist',
    activityTitle: 'Кандидат включён в shortlist',
    activityStatus: 'completed',
  },
  invite_final_interview: {
    label: 'Пригласить на финальное интервью',
    status: 'final_interview',
    candidateAction: 'Кандидат приглашён на финальное интервью',
    activityTitle: 'Назначен финальный этап',
    activityStatus: 'completed',
  },
  request_info: {
    label: 'Запросить дополнительную информацию',
    status: 'needs_clarification',
    candidateAction: 'HR запросил дополнительную информацию',
    activityTitle: 'HR запросил уточнение',
    activityStatus: 'needs_clarification',
  },
  postpone: {
    label: 'Отложить кандидата',
    status: 'postponed',
    candidateAction: 'Решение по кандидату отложено',
    activityTitle: 'Решение HR отложено',
    activityStatus: 'waiting',
  },
  reject: {
    label: 'Отклонить кандидата',
    status: 'rejected',
    candidateAction: 'Кандидат отклонён HR',
    activityTitle: 'Кандидат отклонён HR',
    activityStatus: 'completed',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [vacancies, setVacancies] = useState<Vacancy[]>(() =>
    loadCollection('vacancies', defaultVacancies)
  );

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    loadCollection('candidates', defaultCandidates)
  );

  const [interviews, setInterviews] = useState<Interview[]>(() =>
    loadCollection('interviews', defaultInterviews)
  );

  const [activities, setActivities] = useState<AIActivity[]>(() =>
    loadCollection('activities', defaultActivities)
  );

  const [company, setCompany] = useState<Company>(() => ({
    ...demoCompany,
    ...getStoredData<Partial<Company>>('company', {}),
  }));

  const [user, setUser] = useState<UserProfile>(() => {
    const storedCompany = {
      ...demoCompany,
      ...getStoredData<Partial<Company>>('company', {}),
    };

    return {
      ...demoUser,
      ...getStoredData<Partial<UserProfile>>('user', {}),
      company: storedCompany,
    };
  });

  const [aiSettings, setAISettings] = useState<AISettings>(() => ({
    ...defaultAISettings,
    ...getStoredData<Partial<AISettings>>('ai_settings', {}),
  }));

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() => ({
      ...defaultNotificationSettings,
      ...getStoredData<Partial<NotificationSettings>>(
        'notification_settings',
        {}
      ),
    }));

  useEffect(() => {
    setStoredData('vacancies', vacancies);
  }, [vacancies]);

  useEffect(() => {
    setStoredData('candidates', candidates);
  }, [candidates]);

  useEffect(() => {
    setStoredData('activities', activities);
  }, [activities]);

  useEffect(() => {
    setStoredData('interviews', interviews);
  }, [interviews]);

  useEffect(() => {
    setStoredData('company', company);

    setUser(previous =>
      previous.company === company
        ? previous
        : { ...previous, company }
    );
  }, [company]);

  useEffect(() => {
    setStoredData('user', user);
  }, [user]);

  useEffect(() => {
    setStoredData('ai_settings', aiSettings);
  }, [aiSettings]);

  useEffect(() => {
    setStoredData('notification_settings', notificationSettings);
  }, [notificationSettings]);

  const updateUser = useCallback(
    (updates: Partial<Omit<UserProfile, 'company'>>) => {
      setUser(previous => ({
        ...previous,
        ...updates,
        company,
      }));
    },
    [company]
  );

  const updateCompany = useCallback((updates: Partial<Company>) => {
    setCompany(previous => ({ ...previous, ...updates }));
  }, []);

  const updateAISettings = useCallback((updates: Partial<AISettings>) => {
    setAISettings(previous => ({ ...previous, ...updates }));
  }, []);

  const updateNotificationSettings = useCallback(
    (updates: Partial<NotificationSettings>) => {
      setNotificationSettings(previous => ({ ...previous, ...updates }));
    },
    []
  );

  /**
   * Добавляет стартовое событие для пользовательских вакансий,
   * которые были созданы до установки этого обновления.
   */
  useEffect(() => {
    const defaultVacancyIds = new Set(
      defaultVacancies.map(vacancy => vacancy.id)
    );

    const missingActivities = vacancies
      .filter(vacancy => !defaultVacancyIds.has(vacancy.id))
      .filter(
        vacancy =>
          !activities.some(
            activity =>
              activity.id === `activity-vacancy-created-${vacancy.id}`
          )
      )
      .map(createVacancyAnalyzedActivity);

    if (missingActivities.length === 0) {
      return;
    }

    setActivities(previous => [
      ...missingActivities,
      ...previous,
    ]);
  }, [vacancies, activities]);

  /**
   * Создаёт вакансию и одновременно добавляет первое действие Recruiter AI.
   * Новая вакансия размещается первой и остаётся первой после перезагрузки.
   */
  const addVacancy = useCallback((vacancy: Vacancy) => {
    const activityId = `activity-vacancy-created-${vacancy.id}`;

    setVacancies(previous => [
      vacancy,
      ...previous.filter(item => item.id !== vacancy.id),
    ]);

    setActivities(previous => [
      createVacancyAnalyzedActivity(vacancy),
      ...previous.filter(activity => activity.id !== activityId),
    ]);
  }, []);

  const updateVacancy = useCallback(
    (id: string, updates: Partial<Vacancy>) => {
      setVacancies(previous =>
        previous.map(vacancy =>
          vacancy.id === id
            ? {
                ...vacancy,
                ...updates,
              }
            : vacancy
        )
      );
    },
    []
  );

  const updateCandidateStatus = useCallback(
    (id: string, status: Candidate['status']) => {
      setCandidates(previous =>
        previous.map(candidate =>
          candidate.id === id
            ? {
                ...candidate,
                status,
                updatedAt: new Date().toISOString(),
              }
            : candidate
        )
      );
    },
    []
  );

  const scheduleInterview = useCallback((interview: Interview) => {
    const scheduledAt = new Date(interview.date);
    const now = new Date().toISOString();

    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(scheduledAt);

    const historyId = `history-interview-${interview.id}`;
    const activityId = `activity-interview-${interview.id}`;

    setInterviews(previous => [
      interview,
      ...previous.filter(item => item.id !== interview.id),
    ]);

    setCandidates(previous =>
      previous.map(candidate =>
        candidate.id === interview.candidateId
          ? {
              ...candidate,
              status: 'interview_scheduled' as const,
              lastAction: `AI-интервью назначено на ${formattedDate}`,
              updatedAt: now,
              history: [
                ...candidate.history.filter(event => event.id !== historyId),
                {
                  id: historyId,
                  event: 'AI-интервью назначено',
                  description:
                    `${formattedDate}, формат: ` +
                    getInterviewFormatLabel(interview.format),
                  timestamp: now,
                  type: 'interview_scheduled' as const,
                },
              ],
            }
          : candidate
      )
    );

    setVacancies(previous =>
      previous.map(vacancy =>
        vacancy.id === interview.vacancyId
          ? {
              ...vacancy,
              updatedAt: now,
              lastAIAction:
                `Назначено интервью с ${interview.candidateName}`,
            }
          : vacancy
      )
    );

    setActivities(previous => [
      {
        id: activityId,
        type: 'interview_scheduled',
        title: 'AI-интервью назначено',
        description:
          `Интервью с ${interview.candidateName} назначено ` +
          `на ${formattedDate}. Формат: ` +
          `${getInterviewFormatLabel(interview.format)}.`,
        timestamp: now,
        vacancyId: interview.vacancyId,
        vacancyTitle: interview.vacancyTitle,
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        status: 'completed',
      },
      ...previous.filter(activity => activity.id !== activityId),
    ]);
  }, []);


  const startInterview = useCallback((interviewId: string) => {
    const now = new Date().toISOString();

    setInterviews(previous =>
      previous.map(interview =>
        interview.id === interviewId
          ? {
              ...interview,
              status: 'in_progress' as const,
              shortResult: 'Интервью проводится',
            }
          : interview
      )
    );

    setCandidates(previous =>
      previous.map(candidate => {
        const interview = interviews.find(item => item.id === interviewId);

        if (!interview || candidate.id !== interview.candidateId) {
          return candidate;
        }

        return {
          ...candidate,
          lastAction: 'AI-интервью начато',
          updatedAt: now,
        };
      })
    );
  }, [interviews]);

  const completeInterview = useCallback((interview: Interview) => {
    const now = interview.report?.completedAt ?? new Date().toISOString();
    const historyId = `history-interview-completed-${interview.id}`;
    const completedActivityId = `activity-interview-completed-${interview.id}`;
    const reportActivityId = `activity-interview-report-${interview.id}`;

    setInterviews(previous => [
      interview,
      ...previous.filter(item => item.id !== interview.id),
    ]);

    setCandidates(previous =>
      previous.map(candidate =>
        candidate.id === interview.candidateId
          ? {
              ...candidate,
              status: 'needs_hr_decision' as const,
              stage: 'interviews_done' as const,
              aiSummary:
                interview.report?.summary || candidate.aiSummary,
              lastAction: 'AI-интервью завершено, отчёт готов',
              updatedAt: now,
              history: [
                ...candidate.history.filter(event => event.id !== historyId),
                {
                  id: historyId,
                  event: 'AI-интервью завершено',
                  description:
                    'Recruiter AI сформировал отчёт и передал кандидата на решение HR.',
                  timestamp: now,
                  type: 'interview_completed' as const,
                },
              ],
            }
          : candidate
      )
    );

    setVacancies(previous =>
      previous.map(vacancy =>
        vacancy.id === interview.vacancyId
          ? {
              ...vacancy,
              currentStage: 'interviews_done' as const,
              lastAIAction:
                `Сформирован отчёт по интервью с ${interview.candidateName}`,
              updatedAt: now,
            }
          : vacancy
      )
    );

    setActivities(previous => [
      {
        id: reportActivityId,
        type: 'report_formed',
        title: 'Отчёт по интервью сформирован',
        description:
          `Recruiter AI подготовил выводы по кандидату ` +
          `${interview.candidateName} и передал их HR.`,
        timestamp: now,
        vacancyId: interview.vacancyId,
        vacancyTitle: interview.vacancyTitle,
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        status: 'needs_hr',
      },
      {
        id: completedActivityId,
        type: 'interview_completed',
        title: 'AI-интервью завершено',
        description:
          `Кандидат ${interview.candidateName} ответил на ` +
          `${interview.questions.length} вопросов.`,
        timestamp: now,
        vacancyId: interview.vacancyId,
        vacancyTitle: interview.vacancyTitle,
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        status: 'completed',
      },
      ...previous.filter(
        activity =>
          activity.id !== completedActivityId &&
          activity.id !== reportActivityId
      ),
    ]);
  }, []);


  const submitHRDecision = useCallback(
    (
      candidateId: string,
      decision: CandidateDecision,
      comment: string
    ) => {
      const candidate = candidates.find(item => item.id === candidateId);

      if (!candidate) {
        return;
      }

      const config = hrDecisionConfig[decision];
      const now = new Date().toISOString();
      const decisionId = `hr-decision-${candidate.id}-${Date.now()}`;
      const historyId = `history-${decisionId}`;
      const activityId = `activity-${decisionId}`;

      const wasShortlisted = candidate.status === 'recommended';
      const willBeShortlisted = config.status === 'recommended';
      const shortlistDelta =
        Number(willBeShortlisted) - Number(wasShortlisted);

      setCandidates(previous =>
        previous.map(item =>
          item.id === candidate.id
            ? {
                ...item,
                status: config.status,
                stage:
                  decision === 'recommend_hire'
                    ? ('shortlist_forming' as const)
                    : item.stage,
                lastAction: config.candidateAction,
                updatedAt: now,
                hrDecision: {
                  id: decisionId,
                  decision,
                  label: config.label,
                  comment: comment.trim(),
                  decidedAt: now,
                  decidedBy: user.name,
                },
                history: [
                  {
                    id: historyId,
                    event: config.label,
                    description:
                      `${user.name}: ${comment.trim()}`,
                    timestamp: now,
                    type: 'hr_decision_recorded' as const,
                  },
                  ...item.history.filter(event => event.id !== historyId),
                ],
              }
            : item
        )
      );

      setVacancies(previous =>
        previous.map(vacancy =>
          vacancy.id === candidate.vacancyId
            ? {
                ...vacancy,
                candidatesShortlisted: Math.max(
                  0,
                  vacancy.candidatesShortlisted + shortlistDelta
                ),
                currentStage:
                  willBeShortlisted
                    ? ('shortlist_forming' as const)
                    : vacancy.currentStage,
                lastAIAction:
                  `${config.candidateAction}: ${candidate.name}`,
                updatedAt: now,
              }
            : vacancy
        )
      );

      setActivities(previous => [
        {
          id: activityId,
          type: 'hr_decision_recorded',
          title: config.activityTitle,
          description:
            `${user.name} принял решение по кандидату ` +
            `${candidate.name}. Комментарий: ${comment.trim()}`,
          timestamp: now,
          vacancyId: candidate.vacancyId,
          vacancyTitle: candidate.vacancyTitle,
          candidateId: candidate.id,
          candidateName: candidate.name,
          status: config.activityStatus,
        },
        ...previous,
      ]);
    },
    [candidates, user.name]
  );

  const addActivity = useCallback((activity: AIActivity) => {
    setActivities(previous => [
      activity,
      ...previous.filter(item => item.id !== activity.id),
    ]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        vacancies,
        candidates,
        interviews,
        activities,
        user,
        company,
        aiSettings,
        notificationSettings,
        updateUser,
        updateCompany,
        updateAISettings,
        updateNotificationSettings,
        addVacancy,
        updateVacancy,
        updateCandidateStatus,
        addActivity,
        scheduleInterview,
        startInterview,
        completeInterview,
        submitHRDecision,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}