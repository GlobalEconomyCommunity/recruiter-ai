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
  Candidate,
  Company,
  Interview,
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
  addVacancy: (vacancy: Vacancy) => void;
  updateVacancy: (id: string, updates: Partial<Vacancy>) => void;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;
  addActivity: (activity: AIActivity) => void;
}

const AppContext = createContext<AppContextType | null>(null);


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

export function AppProvider({ children }: { children: ReactNode }) {
  const [vacancies, setVacancies] = useState<Vacancy[]>(() =>
    loadCollection('vacancies', defaultVacancies)
  );

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    loadCollection('candidates', defaultCandidates)
  );

  const [interviews] = useState<Interview[]>(defaultInterviews);

  const [activities, setActivities] = useState<AIActivity[]>(() =>
    loadCollection('activities', defaultActivities)
  );

  useEffect(() => {
    setStoredData('vacancies', vacancies);
  }, [vacancies]);

  useEffect(() => {
    setStoredData('candidates', candidates);
  }, [candidates]);

  useEffect(() => {
    setStoredData('activities', activities);
  }, [activities]);

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
        user: demoUser,
        company: demoCompany,
        addVacancy,
        updateVacancy,
        updateCandidateStatus,
        addActivity,
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