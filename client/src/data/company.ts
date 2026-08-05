import type { Company, UserProfile } from '@/types';

export const demoCompany: Company = {
  id: 'company-1',
  name: 'ТехноСтарт',
  industry: 'IT / SaaS',
  size: '50–100 сотрудников',
  city: 'Москва',
};

export const demoUser: UserProfile = {
  id: 'user-1',
  name: 'Анна Петрова',
  role: 'HR-директор',
  email: 'a.petrova@technostart.demo',
  company: demoCompany,
};
