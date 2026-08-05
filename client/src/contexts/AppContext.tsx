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

/**
 * В прототипе данные сохраняются в localStorage. После обновления исходных
 * демо-данных в браузере может остаться старая или неполная версия массива.
 * Эта функция возвращает недостающие стандартные записи и сохраняет
 * пользовательские изменения для уже существующих записей.
 */
function mergeStoredWithDefaults<T extends { id: string }>(
  storedValue: unknown,
  defaults: T[]
): T[] {
  if (!Array.isArray(storedValue)) return defaults;

  const storedItems = storedValue.filter(
    (item): item is T =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { id?: unknown }).id === 'string'
  );

  const storedById = new Map(storedItems.map(item => [item.id, item]));
  const defaultIds = new Set(defaults.map(item => item.id));

  const mergedDefaults = defaults.map(defaultItem => {
    const storedItem = storedById.get(defaultItem.id);
    return storedItem ? { ...defaultItem, ...storedItem } : defaultItem;
  });

  const customItems = storedItems.filter(item => !defaultIds.has(item.id));

  return [...mergedDefaults, ...customItems];
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

  const addVacancy = useCallback((vacancy: Vacancy) => {
    setVacancies(previous => [vacancy, ...previous]);
  }, []);

  const updateVacancy = useCallback(
    (id: string, updates: Partial<Vacancy>) => {
      setVacancies(previous =>
        previous.map(vacancy =>
          vacancy.id === id ? { ...vacancy, ...updates } : vacancy
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
    setActivities(previous => [activity, ...previous]);
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