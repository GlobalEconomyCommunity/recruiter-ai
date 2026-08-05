import { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import {
  getStoredData,
  removeStoredData,
  setStoredData,
} from '@/lib/storage';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vacancy, VacancyFormData } from '@/types';

const steps = [
  'Основная информация',
  'Описание',
  'Требования',
  'Настройка AI',
];

const DRAFT_STORAGE_KEY = 'vacancy_form_draft';

const initialForm: VacancyFormData = {
  title: '',
  department: 'Продажи',
  headcount: 1,
  city: 'Москва',
  workFormat: 'hybrid',
  salaryMin: undefined,
  salaryMax: undefined,
  description: '',
  responsibilities: '',
  additionalComments: '',
  requiredSkills: '',
  preferredSkills: '',
  experience: 'от 2 лет',
  professionalSkills: '',
  aiGoal: 'Найти подходящих кандидатов и провести первичный screening',
  aiQuestions:
    'Опыт работы, мотивация, зарплатные ожидания, формат работы',
  hrConfirmations:
    'Приглашение на следующий этап, отклонение кандидата',
  screeningFormat: 'text',
};

interface VacancyDraft {
  form: VacancyFormData;
  currentStep: number;
  savedAt: string;
}

function loadVacancyDraft(): VacancyDraft | null {
  const storedDraft = getStoredData<unknown>(DRAFT_STORAGE_KEY, null);

  if (
    !storedDraft ||
    typeof storedDraft !== 'object' ||
    !('form' in storedDraft) ||
    !('currentStep' in storedDraft)
  ) {
    return null;
  }

  const draft = storedDraft as Partial<VacancyDraft>;

  if (!draft.form || typeof draft.currentStep !== 'number') {
    return null;
  }

  return {
    form: {
      ...initialForm,
      ...draft.form,
    },
    currentStep: Math.min(
      Math.max(draft.currentStep, 0),
      steps.length - 1
    ),
    savedAt: typeof draft.savedAt === 'string' ? draft.savedAt : '',
  };
}

const launchSteps = [
  'Анализ описания вакансии...',
  'Выделение обязательных требований...',
  'Выделение желательных требований...',
  'Формирование профиля кандидата...',
  'Подготовка screening-вопросов...',
  'Создание плана обработки кандидатов...',
  'Запуск задачи...',
];

function getStepValidationError(
  form: VacancyFormData,
  step: number
): string | null {
  if (step === 0) {
    if (!form.title.trim()) {
      return 'Укажите название вакансии';
    }

    if (!form.city.trim()) {
      return 'Укажите город';
    }

    if (!Number.isInteger(form.headcount) || form.headcount < 1) {
      return 'Количество сотрудников должно быть не меньше 1';
    }

    if (
      form.salaryMin !== undefined &&
      (!Number.isFinite(form.salaryMin) || form.salaryMin < 0)
    ) {
      return 'Зарплата «от» не может быть отрицательной';
    }

    if (
      form.salaryMax !== undefined &&
      (!Number.isFinite(form.salaryMax) || form.salaryMax < 0)
    ) {
      return 'Зарплата «до» не может быть отрицательной';
    }

    if (
      form.salaryMin !== undefined &&
      form.salaryMax !== undefined &&
      form.salaryMax < form.salaryMin
    ) {
      return 'Зарплата «до» не может быть меньше зарплаты «от»';
    }
  }

  if (step === 1) {
    if (!form.description.trim()) {
      return 'Добавьте описание вакансии';
    }

    if (!form.responsibilities.trim()) {
      return 'Добавьте хотя бы одну обязанность';
    }
  }

  if (step === 2) {
    if (!form.requiredSkills.trim()) {
      return 'Укажите обязательные требования к кандидату';
    }

    if (!form.experience.trim()) {
      return 'Укажите необходимый опыт';
    }
  }

  if (step === 3) {
    if (!form.aiGoal.trim()) {
      return 'Укажите цель подбора для Recruiter AI';
    }

    if (!form.aiQuestions.trim()) {
      return 'Укажите вопросы для первичного screening';
    }
  }

  return null;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default function VacancyNew() {
  const [, navigate] = useLocation();
  const { addVacancy } = useApp();

  const [savedDraft] = useState<VacancyDraft | null>(loadVacancyDraft);
  const [currentStep, setCurrentStep] = useState(
    savedDraft?.currentStep ?? 0
  );
  const [launching, setLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [form, setForm] = useState<VacancyFormData>(
    savedDraft?.form ?? initialForm
  );

  const updateField = <K extends keyof VacancyFormData>(
    key: K,
    value: VacancyFormData[K]
  ) => {
    setForm(previousForm => ({
      ...previousForm,
      [key]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    const error = getStepValidationError(form, step);

    if (!error) {
      return true;
    }

    setCurrentStep(step);
    toast.error(error);
    return false;
  };

  const validateEntireForm = (): boolean => {
    for (let step = 0; step < steps.length; step += 1) {
      if (!validateStep(step)) {
        return false;
      }
    }

    return true;
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    for (let step = 0; step < targetStep; step += 1) {
      if (!validateStep(step)) {
        return;
      }
    }

    setCurrentStep(targetStep);
  };

  const handleContinue = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep(previousStep =>
      Math.min(previousStep + 1, steps.length - 1)
    );
  };

  const handleSaveDraft = () => {
    const draft: VacancyDraft = {
      form,
      currentStep,
      savedAt: new Date().toISOString(),
    };

    setStoredData(DRAFT_STORAGE_KEY, draft);

    toast.success(
      'Черновик сохранён. Данные восстановятся при следующем открытии формы'
    );
  };

  const handleLaunch = async () => {
    if (!validateEntireForm()) {
      return;
    }

    setLaunching(true);
    setLaunchStep(0);

    for (let step = 0; step < launchSteps.length; step += 1) {
      setLaunchStep(step);
      await delay(step === launchSteps.length - 1 ? 500 : 800);
    }

    const now = new Date().toISOString();

    const requiredSkills = form.requiredSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

    const preferredSkills = form.preferredSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

    const newVacancy: Vacancy = {
      id: `vac-${Date.now()}`,
      title: form.title.trim(),
      status: 'active',
      department: form.department,
      workFormat: form.workFormat,
      city: form.city.trim(),
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      description: form.description.trim(),
      responsibilities: form.responsibilities
        .split('\n')
        .map(responsibility => responsibility.trim())
        .filter(Boolean),
      requiredSkills,
      preferredSkills,
      experience: form.experience.trim(),
      headcount: form.headcount,
      createdAt: now,
      updatedAt: now,
      responsiblePerson: 'Анна Петрова',
      candidatesTotal: 0,
      candidatesProcessed: 0,
      candidatesShortlisted: 0,
      currentStage: 'vacancy_analyzed',
      lastAIAction: 'Вакансия проанализирована',
      aiProfile: {
        keyExperience: requiredSkills,
        requiredCriteria: requiredSkills,
        preferredCompetencies: preferredSkills,
        screeningQuestions: form.aiQuestions
          .split(',')
          .map(question => question.trim())
          .filter(Boolean),
        infoToVerify: [],
        hrHandoffCriteria: form.hrConfirmations
          .split(',')
          .map(criterion => criterion.trim())
          .filter(Boolean),
      },
    };

    removeStoredData(DRAFT_STORAGE_KEY);
    addVacancy(newVacancy);
    toast.success('Recruiter AI запущен!');
    navigate(`/vacancies/${newVacancy.id}`);
  };

  if (launching) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 card-shadow text-center">
          <div className="w-16 h-16 rounded-2xl emerald-gradient flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-bold text-[#1E293B] mb-2">
            Запуск Recruiter AI
          </h2>

          <p className="text-sm text-[#64748B] mb-8">
            Подготовка задачи для AI-агента
          </p>

          <div className="space-y-3 text-left">
            {launchSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                {index < launchStep ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                ) : index === launchStep ? (
                  <Loader2 className="w-5 h-5 text-[#10B981] animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#CBD5E1] shrink-0" />
                )}

                <span
                  className={`text-sm ${
                    index <= launchStep
                      ? 'text-[#1E293B]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-full transition-all duration-500"
                style={{
                  width: `${((launchStep + 1) / launchSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepChange(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                index === currentStep
                  ? 'bg-[#ECFDF5] text-[#065F46] font-medium'
                  : index < currentStep
                    ? 'text-[#10B981]'
                    : 'text-[#94A3B8]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === currentStep
                    ? 'bg-[#10B981] text-white'
                    : index < currentStep
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#E2E8F0] text-[#94A3B8]'
                }`}
              >
                {index + 1}
              </span>

              <span className="hidden sm:inline">{step}</span>
            </button>

            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-[#E2E8F0]" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-shadow">
        {currentStep === 0 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">
              Основная информация
            </h3>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Название вакансии *
              </label>

              <input
                type="text"
                value={form.title}
                onChange={event =>
                  updateField('title', event.target.value)
                }
                placeholder="Например: Менеджер по продажам B2B"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Отдел
                </label>

                <select
                  value={form.department}
                  onChange={event =>
                    updateField('department', event.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                >
                  <option>Продажи</option>
                  <option>Маркетинг</option>
                  <option>Разработка</option>
                  <option>Поддержка</option>
                  <option>HR</option>
                  <option>Финансы</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Количество
                </label>

                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.headcount}
                  onChange={event =>
                    updateField(
                      'headcount',
                      Number.parseInt(event.target.value, 10)
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Город *
                </label>

                <input
                  type="text"
                  value={form.city}
                  onChange={event =>
                    updateField('city', event.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Формат работы
                </label>

                <select
                  value={form.workFormat}
                  onChange={event =>
                    updateField(
                      'workFormat',
                      event.target.value as VacancyFormData['workFormat']
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                >
                  <option value="office">Офис</option>
                  <option value="remote">Удалённо</option>
                  <option value="hybrid">Гибрид</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Зарплата от (₽)
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.salaryMin ?? ''}
                  onChange={event =>
                    updateField(
                      'salaryMin',
                      event.target.value === ''
                        ? undefined
                        : Number(event.target.value)
                    )
                  }
                  placeholder="150000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Зарплата до (₽)
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.salaryMax ?? ''}
                  onChange={event =>
                    updateField(
                      'salaryMax',
                      event.target.value === ''
                        ? undefined
                        : Number(event.target.value)
                    )
                  }
                  placeholder="250000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">
              Описание вакансии
            </h3>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Описание *
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={event =>
                  updateField('description', event.target.value)
                }
                placeholder="Опишите вакансию..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Обязанности, по одной на строку *
              </label>

              <textarea
                rows={5}
                value={form.responsibilities}
                onChange={event =>
                  updateField('responsibilities', event.target.value)
                }
                placeholder={'Активный поиск клиентов\nПроведение презентаций\n...'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Дополнительные комментарии
              </label>

              <textarea
                rows={2}
                value={form.additionalComments}
                onChange={event =>
                  updateField('additionalComments', event.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">
              Требования
            </h3>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Обязательные требования, через запятую *
              </label>

              <textarea
                rows={3}
                value={form.requiredSkills}
                onChange={event =>
                  updateField('requiredSkills', event.target.value)
                }
                placeholder="B2B-продажи от 2 лет, Опыт SaaS, CRM"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Желательные требования, через запятую
              </label>

              <textarea
                rows={3}
                value={form.preferredSkills}
                onChange={event =>
                  updateField('preferredSkills', event.target.value)
                }
                placeholder="Английский B1+, Управление командой"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Необходимый опыт *
                </label>

                <input
                  type="text"
                  value={form.experience}
                  onChange={event =>
                    updateField('experience', event.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Профессиональные навыки
                </label>

                <input
                  type="text"
                  value={form.professionalSkills}
                  onChange={event =>
                    updateField('professionalSkills', event.target.value)
                  }
                  placeholder="Переговоры, Презентации"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">
              Настройка AI
            </h3>

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
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Цель подбора *
              </label>

              <input
                type="text"
                value={form.aiGoal}
                onChange={event =>
                  updateField('aiGoal', event.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Какие вопросы уточнять *
              </label>

              <textarea
                rows={2}
                value={form.aiQuestions}
                onChange={event =>
                  updateField('aiQuestions', event.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Решения, требующие подтверждения HR
              </label>

              <textarea
                rows={2}
                value={form.hrConfirmations}
                onChange={event =>
                  updateField('hrConfirmations', event.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Формат первичного screening
              </label>

              <select
                value={form.screeningFormat}
                onChange={event =>
                  updateField('screeningFormat', event.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
              >
                <option value="text">Текстовый чат</option>
                <option value="voice">Голосовое интервью</option>
                <option value="video">Видеоинтервью</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-5 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() =>
              currentStep > 0
                ? setCurrentStep(currentStep - 1)
                : navigate('/vacancies')
            }
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep > 0 ? 'Назад' : 'Отмена'}
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Сохранить черновик
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors active:scale-[0.97]"
              >
                Продолжить
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunch}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors shadow-md active:scale-[0.97]"
              >
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
