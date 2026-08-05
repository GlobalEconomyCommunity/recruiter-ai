import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Vacancy, Candidate, Interview, AIActivity, UserProfile, Company } from '@/types';
import { defaultVacancies } from '@/data/vacancies';
import { defaultCandidates } from '@/data/candidates';
import { defaultInterviews } from '@/data/interviews';
import { defaultActivities } from '@/data/activities';
import { demoUser, demoCompany } from '@/data/company';
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [vacancies, setVacancies] = useState<Vacancy[]>(() =>
    getStoredData('vacancies', defaultVacancies)
  );
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    getStoredData('candidates', defaultCandidates)
  );
  const [interviews] = useState<Interview[]>(defaultInterviews);
  const [activities, setActivities] = useState<AIActivity[]>(() =>
    getStoredData('activities', defaultActivities)
  );

  // Persist to localStorage
  useEffect(() => { setStoredData('vacancies', vacancies); }, [vacancies]);
  useEffect(() => { setStoredData('candidates', candidates); }, [candidates]);
  useEffect(() => { setStoredData('activities', activities); }, [activities]);

  const addVacancy = useCallback((vacancy: Vacancy) => {
    setVacancies(prev => [vacancy, ...prev]);
  }, []);

  const updateVacancy = useCallback((id: string, updates: Partial<Vacancy>) => {
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const updateCandidateStatus = useCallback((id: string, status: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c));
  }, []);

  const addActivity = useCallback((activity: AIActivity) => {
    setActivities(prev => [activity, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
