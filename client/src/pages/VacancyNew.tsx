import { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Vacancy, VacancyFormData } from '@/types';

const steps = ['Основная информация', 'Описание', 'Требования', 'Настройка AI'];

export default function VacancyNew() {
  const [, navigate] = useLocation();
  const { addVacancy } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [form, setForm] = useState<VacancyFormData>({
    title: '', department: 'Продажи', headcount: 1, city: 'Москва',
    workFormat: 'hybrid', salaryMin: undefined, salaryMax: undefined,
    description: '', responsibilities: '', additionalComments: '',
    requiredSkills: '', preferredSkills: '', experience: 'от 2 лет', professionalSkills: '',
    aiGoal: 'Найти подходящих кандидатов и провести первичный screening',
    aiQuestions: 'Опыт работы, мотивация, зарплатные ожидания, формат работы',
    hrConfirmations: 'Приглашение на следующий этап, отклонение кандидата',
    screeningFormat: 'text',
  });

  const updateField = (key: keyof VacancyFormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const launchSteps = [
    'Анализ описания вакансии...',
    'Выделение обязательных требований...',
    'Выделение желательных требований...',
    'Формирование профиля кандидата...',
    'Подготовка screening-вопросов...',
    'Создание плана обработки кандидатов...',
    'Запуск задачи...',
  ];

  const handleLaunch = () => {
    if (!form.title.trim()) {
      toast.error('Укажите название вакансии');
      setCurrentStep(0);
      return;
    }
    setLaunching(true);
    setLaunchStep(0);

    const interval = setInterval(() => {
      setLaunchStep(prev => {
        if (prev >= launchSteps.length - 1) {
          clearInterval(interval);
          // Create vacancy
          const newVacancy: Vacancy = {
            id: `vac-${Date.now()}`,
            title: form.title,
            status: 'active',
            department: form.department,
            workFormat: form.workFormat,
            city: form.city,
            salaryMin: form.salaryMin,
            salaryMax: form.salaryMax,
            description: form.description,
            responsibilities: form.responsibilities.split('\n').filter(Boolean),
            requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
            experience: form.experience,
            headcount: form.headcount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responsiblePerson: 'Анна Петрова',
            candidatesTotal: 0,
            candidatesProcessed: 0,
            candidatesShortlisted: 0,
            currentStage: 'vacancy_analyzed',
            lastAIAction: 'Вакансия проанализирована',
            aiProfile: {
              keyExperience: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
              requiredCriteria: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
              preferredCompetencies: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
              screeningQuestions: form.aiQuestions.split(',').map(s => s.trim()).filter(Boolean),
              infoToVerify: [],
              hrHandoffCriteria: form.hrConfirmations.split(',').map(s => s.trim()).filter(Boolean),
            },
          };
          addVacancy(newVacancy);
          toast.success('Recruiter AI запущен!');
          setTimeout(() => navigate(`/vacancies/${newVacancy.id}`), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  if (launching) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 card-shadow text-center">
          <div className="w-16 h-16 rounded-2xl emerald-gradient flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] mb-2">Запуск Recruiter AI</h2>
          <p className="text-sm text-[#64748B] mb-8">Подготовка задачи для AI-агента</p>

          <div className="space-y-3 text-left">
            {launchSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < launchStep ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                ) : i === launchStep ? (
                  <Loader2 className="w-5 h-5 text-[#10B981] animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#CBD5E1] shrink-0" />
                )}
                <span className={`text-sm ${i <= launchStep ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${((launchStep + 1) / launchSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                i === currentStep ? 'bg-[#ECFDF5] text-[#065F46] font-medium' :
                i < currentStep ? 'text-[#10B981]' : 'text-[#94A3B8]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                i === currentStep ? 'bg-[#10B981] text-white' :
                i < currentStep ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#E2E8F0] text-[#94A3B8]'
              }`}>{i + 1}</span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[#E2E8F0]" />}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-shadow">
        {currentStep === 0 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">Основная информация</h3>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Название вакансии *</label>
              <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Например: Менеджер по продажам B2B" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Отдел</label>
                <select value={form.department} onChange={e => updateField('department', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]">
                  <option>Продажи</option><option>Маркетинг</option><option>Разработка</option><option>Поддержка</option><option>HR</option><option>Финансы</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Количество</label>
                <input type="number" min={1} value={form.headcount} onChange={e => updateField('headcount', parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Город</label>
                <input type="text" value={form.city} onChange={e => updateField('city', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Формат работы</label>
                <select value={form.workFormat} onChange={e => updateField('workFormat', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]">
                  <option value="office">Офис</option><option value="remote">Удалённо</option><option value="hybrid">Гибрид</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Зарплата от (₽)</label>
                <input type="number" value={form.salaryMin || ''} onChange={e => updateField('salaryMin', parseInt(e.target.value) || undefined)} placeholder="150000" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Зарплата до (₽)</label>
                <input type="number" value={form.salaryMax || ''} onChange={e => updateField('salaryMax', parseInt(e.target.value) || undefined)} placeholder="250000" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">Описание вакансии</h3>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Описание</label>
              <textarea rows={4} value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Опишите вакансию..." className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Обязанности (по одной на строку)</label>
              <textarea rows={5} value={form.responsibilities} onChange={e => updateField('responsibilities', e.target.value)} placeholder="Активный поиск клиентов&#10;Проведение презентаций&#10;..." className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Дополнительные комментарии</label>
              <textarea rows={2} value={form.additionalComments} onChange={e => updateField('additionalComments', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">Требования</h3>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Обязательные требования (через запятую)</label>
              <textarea rows={3} value={form.requiredSkills} onChange={e => updateField('requiredSkills', e.target.value)} placeholder="B2B-продажи от 2 лет, Опыт SaaS, CRM" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Желательные требования (через запятую)</label>
              <textarea rows={3} value={form.preferredSkills} onChange={e => updateField('preferredSkills', e.target.value)} placeholder="Английский B1+, Управление командой" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Необходимый опыт</label>
                <input type="text" value={form.experience} onChange={e => updateField('experience', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Профессиональные навыки</label>
                <input type="text" value={form.professionalSkills} onChange={e => updateField('professionalSkills', e.target.value)} placeholder="Переговоры, Презентации" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">Настройка AI</h3>
            <div className="bg-[#F0F7F2] rounded-xl p-4 text-sm text-[#065F46]">
              <p className="font-medium mb-1">Recruiter AI будет:</p>
              <ul className="list-disc list-inside space-y-1 text-[#064E3B]">
                <li>Анализировать входящие отклики</li>
                <li>Проводить первичный screening</li>
                <li>Задавать уточняющие вопросы</li>
                <li>Формировать shortlist для HR</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Цель подбора</label>
              <input type="text" value={form.aiGoal} onChange={e => updateField('aiGoal', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Какие вопросы уточнять</label>
              <textarea rows={2} value={form.aiQuestions} onChange={e => updateField('aiQuestions', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Решения, требующие подтверждения HR</label>
              <textarea rows={2} value={form.hrConfirmations} onChange={e => updateField('hrConfirmations', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none" />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#E2E8F0]">
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/vacancies')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep > 0 ? 'Назад' : 'Отмена'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => toast.success('Черновик сохранён')} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Сохранить черновик
            </button>
            {currentStep < steps.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors active:scale-[0.97]">
                Продолжить <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleLaunch} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors shadow-md active:scale-[0.97]">
                <Bot className="w-4 h-4" />
                Запустить Recruiter AI
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
