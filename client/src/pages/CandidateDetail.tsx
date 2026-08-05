import { useParams, Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ArrowLeft, UserPlus, Calendar, HelpCircle, Clock, XCircle, CheckCircle2, Bot, FileText, MessageCircle, History, AlertTriangle, Info, Play, Sparkles, ClipboardCheck } from 'lucide-react';
import { candidateStatusConfig } from '@/lib/status-config';
import { formatDate, formatDateTime, formatSalary, getInitials } from '@/lib/formatters';
import { toast } from 'sonner';
import type { CandidateDecision, Interview, InterviewFormat } from '@/types';


function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

function getDefaultInterviewDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return toDateTimeLocalValue(date);
}

const interviewFormatLabels: Record<InterviewFormat, string> = {
  text: 'Текстовый чат',
  voice: 'Голосовое интервью',
  video: 'Видеоинтервью',
};

const interviewStatusLabels: Record<Interview['status'], string> = {
  scheduled: 'Запланировано',
  in_progress: 'Проводится',
  completed: 'Завершено',
  cancelled: 'Отменено',
};


const hrDecisionOptions: Array<{
  value: CandidateDecision;
  label: string;
  description: string;
}> = [
  {
    value: 'recommend_hire',
    label: 'Рекомендовать к найму',
    description: 'Добавить кандидата в shortlist работодателя.',
  },
  {
    value: 'invite_final_interview',
    label: 'Пригласить на финальное интервью',
    description: 'Передать кандидата на заключительный этап с руководителем.',
  },
  {
    value: 'request_info',
    label: 'Запросить дополнительную информацию',
    description: 'Вернуть кандидата на уточнение недостающих данных.',
  },
  {
    value: 'postpone',
    label: 'Отложить кандидата',
    description: 'Сохранить кандидата без окончательного решения.',
  },
  {
    value: 'reject',
    label: 'Отклонить кандидата',
    description: 'Завершить работу с кандидатом по этой вакансии.',
  },
];

const hrDecisionLabels = Object.fromEntries(
  hrDecisionOptions.map(option => [option.value, option.label])
) as Record<CandidateDecision, string>;

function getAnswerAnalysis(answer: string): string {
  const normalizedAnswer = answer.trim();

  if (normalizedAnswer.length >= 180) {
    return 'Развёрнутый ответ с конкретными деталями и примерами.';
  }

  if (normalizedAnswer.length >= 80) {
    return 'Содержательный ответ. Основные факты зафиксированы.';
  }

  return 'Ответ получен, но отдельные детали стоит уточнить у кандидата.';
}

function extractKeyFacts(answer: string): string[] {
  return answer
    .split(/[.!?\n]+/)
    .map(item => item.trim())
    .filter(item => item.length >= 12)
    .slice(0, 3);
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    candidates,
    interviews,
    user,
    scheduleInterview,
    startInterview,
    completeInterview,
    submitHRDecision,
  } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedDecision, setSelectedDecision] =
    useState<CandidateDecision>('recommend_hire');
  const [decisionComment, setDecisionComment] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState(getDefaultInterviewDate);
  const [interviewFormat, setInterviewFormat] =
    useState<InterviewFormat>('text');
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});

  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return <div className="text-center py-12 text-[#64748B]">Кандидат не найден</div>;

  const candidateInterviews = interviews
    .filter(interview => interview.candidateId === id)
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime()
    );

  const scheduledInterview = candidateInterviews.find(
    interview =>
      interview.status === 'scheduled' || interview.status === 'in_progress'
  );

  const candidateInterview = scheduledInterview ?? candidateInterviews[0];
  const sCfg = candidateStatusConfig[candidate.status];

  const openInterviewModal = () => {
    if (scheduledInterview) {
      setInterviewDate(
        toDateTimeLocalValue(new Date(scheduledInterview.date))
      );
      setInterviewFormat(scheduledInterview.format);
    } else {
      setInterviewDate(getDefaultInterviewDate());
      setInterviewFormat('text');
    }

    setShowInterviewModal(true);
  };

  const handleScheduleInterview = () => {
    const selectedDate = new Date(interviewDate);

    if (
      !interviewDate ||
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() <= Date.now()
    ) {
      toast.error('Выберите будущую дату и время интервью');
      return;
    }

    const sourceQuestions =
      candidate.aiAnalysis.interviewQuestions.length > 0
        ? candidate.aiAnalysis.interviewQuestions
        : [
            'Расскажите о вашем наиболее релевантном опыте.',
            'Почему вас заинтересовала эта вакансия?',
            'Какие условия работы для вас наиболее важны?',
          ];

    const questions = sourceQuestions.map((question, index) => ({
      id: `${scheduledInterview?.id ?? candidate.id}-q-${index + 1}`,
      question,
      answer: '',
      analysis: '',
      keyFacts: [],
      topicsToVerify: [],
    }));

    const interview: Interview = {
      id: scheduledInterview?.id ?? `int-${Date.now()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      vacancyId: candidate.vacancyId,
      vacancyTitle: candidate.vacancyTitle,
      date: selectedDate.toISOString(),
      format: interviewFormat,
      status: 'scheduled',
      questionsCount: questions.length,
      responsiblePerson: user.name,
      shortResult: 'Ожидает проведения',
      questions,
    };

    scheduleInterview(interview);
    setShowInterviewModal(false);
    setActiveTab('interview');

    toast.success(
      scheduledInterview
        ? 'Интервью перенесено'
        : 'AI-интервью назначено'
    );
  };

  const handleStartInterview = () => {
    if (!candidateInterview) {
      return;
    }

    setInterviewAnswers(
      Object.fromEntries(
        candidateInterview.questions.map(question => [
          question.id,
          question.answer,
        ])
      )
    );

    startInterview(candidateInterview.id);
    setActiveTab('interview');
    toast.success('AI-интервью начато');
  };

  const handleFillDemoAnswers = () => {
    if (!candidateInterview) {
      return;
    }

    const demoAnswers = Object.fromEntries(
      candidateInterview.questions.map((question, index) => {
        const answers = [
          `У меня ${candidate.experience} опыта. На последнем месте работы я отвечал за задачи, близкие к требованиям вакансии «${candidate.vacancyTitle}», и регулярно взаимодействовал с командой и клиентами.`,
          `Вакансия заинтересовала меня сочетанием ответственности, возможности влиять на результат и развиваться в направлении ${candidate.currentPosition}.`,
          `Для меня важны понятные задачи, обратная связь от руководителя, профессиональная команда и согласованный формат работы. По срокам выхода готов обсудить ближайшую возможную дату.`,
          `В похожей ситуации я сначала уточняю цель и ограничения, затем предлагаю план действий, согласовываю его с участниками и фиксирую результат.`,
        ];

        return [question.id, answers[index % answers.length]];
      })
    );

    setInterviewAnswers(demoAnswers);
    toast.success('Демо-ответы заполнены');
  };

  const handleCompleteInterview = () => {
    if (!candidateInterview) {
      return;
    }

    const missingQuestion = candidateInterview.questions.find(question => {
      const answer = interviewAnswers[question.id]?.trim() ?? '';
      return answer.length < 10;
    });

    if (missingQuestion) {
      toast.error('Заполните содержательные ответы на все вопросы');
      return;
    }

    const completedAt = new Date().toISOString();
    const completedQuestions = candidateInterview.questions.map(question => {
      const answer = interviewAnswers[question.id].trim();

      return {
        ...question,
        answer,
        analysis: getAnswerAnalysis(answer),
        keyFacts: extractKeyFacts(answer),
        topicsToVerify: candidate.aiAnalysis.toVerify.slice(0, 2),
      };
    });

    const strengths = candidate.aiAnalysis.strengths.length > 0
      ? candidate.aiAnalysis.strengths
      : candidate.aiAnalysis.confirmedRequirements;

    const topicsToVerify = Array.from(
      new Set([
        ...candidate.aiAnalysis.toVerify,
        ...candidate.aiAnalysis.missingRequirements,
      ])
    );

    completeInterview({
      ...candidateInterview,
      status: 'completed',
      shortResult: 'Отчёт сформирован — требуется решение HR',
      questions: completedQuestions,
      report: {
        summary:
          `Кандидат ответил на ${completedQuestions.length} вопросов. ` +
          'Ответы подтверждают релевантный опыт и позволяют перейти к решению HR, ' +
          'однако отдельные факты необходимо проверить на следующем этапе.',
        strengths: strengths.slice(0, 5),
        risks: candidate.aiAnalysis.risks.slice(0, 5),
        topicsToVerify: topicsToVerify.slice(0, 5),
        recommendation:
          candidate.aiAnalysis.recommendation ||
          'Рекомендуется рассмотреть кандидата и уточнить отмеченные вопросы на встрече с HR.',
        completedAt,
      },
    });

    toast.success('Интервью завершено, отчёт сформирован');
  };

  const openDecisionModal = (decision: CandidateDecision) => {
    setSelectedDecision(decision);
    setDecisionComment(candidate.hrDecision?.comment ?? '');
    setShowDecisionModal(true);
  };

  const handleSubmitDecision = () => {
    const normalizedComment = decisionComment.trim();

    if (normalizedComment.length < 10) {
      toast.error('Добавьте комментарий HR длиной не менее 10 символов');
      return;
    }

    submitHRDecision(
      candidate.id,
      selectedDecision,
      normalizedComment
    );

    setShowDecisionModal(false);
    setDecisionComment('');
    toast.success(`Решение сохранено: ${hrDecisionLabels[selectedDecision]}`);
  };

  const tabs = [
    { key: 'overview', label: 'Обзор', icon: Info },
    { key: 'resume', label: 'Резюме', icon: FileText },
    { key: 'analysis', label: 'AI-анализ', icon: Bot },
    { key: 'messages', label: 'Переписка', icon: MessageCircle },
    { key: 'interview', label: 'Интервью', icon: Calendar },
    { key: 'files', label: 'Файлы', icon: FileText },
    { key: 'history', label: 'История', icon: History },
  ];

  return (
    <div className="space-y-6">
      {showInterviewModal && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setShowInterviewModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  {scheduledInterview
                    ? 'Перенести AI-интервью'
                    : 'Назначить AI-интервью'}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  {candidate.name} · {candidate.vacancyTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"
                aria-label="Закрыть"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Дата и время
                </label>

                <input
                  type="datetime-local"
                  min={toDateTimeLocalValue(new Date())}
                  value={interviewDate}
                  onChange={event => setInterviewDate(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Формат интервью
                </label>

                <select
                  value={interviewFormat}
                  onChange={event =>
                    setInterviewFormat(
                      event.target.value as InterviewFormat
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                >
                  {(
                    Object.entries(
                      interviewFormatLabels
                    ) as [InterviewFormat, string][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-[#F0F7F2] p-4">
                <p className="text-sm font-medium text-[#065F46]">
                  Recruiter AI подготовит вопросы автоматически
                </p>
                <p className="text-xs text-[#047857] mt-1">
                  Будут использованы вопросы из AI-анализа кандидата.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleScheduleInterview}
                className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669]"
              >
                {scheduledInterview ? 'Сохранить изменения' : 'Назначить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDecisionModal && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDecisionModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                  Решение работодателя
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  {candidate.name} · {candidate.vacancyTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"
                aria-label="Закрыть"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Решение
                </label>
                <select
                  value={selectedDecision}
                  onChange={event =>
                    setSelectedDecision(
                      event.target.value as CandidateDecision
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] outline-none focus:border-[#10B981]"
                >
                  {hrDecisionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#64748B] mt-2">
                  {
                    hrDecisionOptions.find(
                      option => option.value === selectedDecision
                    )?.description
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                  Комментарий HR *
                </label>
                <textarea
                  rows={4}
                  value={decisionComment}
                  onChange={event => setDecisionComment(event.target.value)}
                  placeholder="Объясните решение и зафиксируйте следующий шаг..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-y"
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  Комментарий будет сохранён в истории кандидата и ленте AI.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${
                  selectedDecision === 'reject'
                    ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                    : 'bg-[#10B981] hover:bg-[#059669]'
                }`}
              >
                Сохранить решение
              </button>
            </div>
          </div>
        </div>
      )}

      <Link href="/candidates" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]">
        <ArrowLeft className="w-4 h-4" /> Кандидаты
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center text-lg font-bold text-[#10B981]">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1E293B]">{candidate.name}</h1>
              <p className="text-sm text-[#64748B]">{candidate.currentPosition} · {candidate.experience} · {candidate.city}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sCfg.bg, color: sCfg.textColor }}>{sCfg.label}</span>
                <span className="text-xs text-[#94A3B8]">Вакансия: {candidate.vacancyTitle}</span>
                {candidate.desiredSalary && <span className="text-xs text-[#64748B]">Ожидания: {formatSalary(candidate.desiredSalary)}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openDecisionModal('recommend_hire')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] text-white text-xs font-medium hover:bg-[#059669] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Решение HR
            </button>
            <button
              type="button"
              onClick={openInterviewModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]"
            >
              <Calendar className="w-3.5 h-3.5" />
              Интервью
            </button>
            <button
              type="button"
              onClick={() => openDecisionModal('request_info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Уточнить
            </button>
            <button
              type="button"
              onClick={() => openDecisionModal('postpone')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]"
            >
              <Clock className="w-3.5 h-3.5" />
              Отложить
            </button>
            <button
              type="button"
              onClick={() => openDecisionModal('reject')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FCA5A5] text-xs text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              <XCircle className="w-3.5 h-3.5" />
              Отклонить
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? 'border-[#10B981] text-[#1E293B]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
            <h3 className="font-semibold text-[#1E293B]">Профессиональная информация</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#64748B]">Должность</span><span className="text-[#1E293B]">{candidate.currentPosition}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Опыт</span><span className="text-[#1E293B]">{candidate.experience}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Город</span><span className="text-[#1E293B]">{candidate.city}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Источник</span><span className="text-[#1E293B]">{candidate.source}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Email</span><span className="text-[#1E293B]">{candidate.email}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Телефон</span><span className="text-[#1E293B]">{candidate.phone}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
            <h3 className="font-semibold text-[#1E293B]">Краткий вывод Recruiter AI</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">{candidate.aiSummary}</p>
            <div className="pt-3 border-t border-[#EDF2F7]">
              <p className="text-sm text-[#64748B]"><span className="font-medium text-[#1E293B]">Последнее действие:</span> {candidate.lastAction}</p>
              <p className="text-xs text-[#94A3B8] mt-1">Обновлено: {formatDate(candidate.updatedAt)}</p>
            </div>
            {candidate.hrDecision && (
              <div className="pt-3 border-t border-[#EDF2F7]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <p className="text-sm font-medium text-[#1E293B]">
                    Последнее решение HR
                  </p>
                </div>
                <p className="text-sm text-[#1E293B]">
                  {candidate.hrDecision.label}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  {candidate.hrDecision.comment}
                </p>
                <p className="text-xs text-[#94A3B8] mt-2">
                  {candidate.hrDecision.decidedBy} ·{' '}
                  {formatDateTime(candidate.hrDecision.decidedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">О себе</h3>
            <p className="text-sm text-[#64748B]">{candidate.resume.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-3">Опыт работы</h3>
            <div className="space-y-4 border-l-2 border-[#E2E8F0] pl-4">
              {candidate.resume.experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />
                  <h4 className="text-sm font-medium text-[#1E293B]">{exp.position}</h4>
                  <p className="text-xs text-[#64748B]">{exp.company} · {exp.period}</p>
                  {exp.responsibilities.length > 0 && <ul className="mt-1 list-disc list-inside text-xs text-[#64748B] space-y-0.5">{exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}</ul>}
                  {exp.achievements.length > 0 && <div className="mt-1">{exp.achievements.map((a, j) => <span key={j} className="inline-block mr-2 mt-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-xs text-[#065F46]">{a}</span>)}</div>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">Образование</h3>
            {candidate.resume.education.map((edu, i) => (
              <p key={i} className="text-sm text-[#64748B]">{edu.institution} — {edu.degree}, {edu.field} ({edu.year})</p>
            ))}
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">Навыки</h3>
            <div className="flex flex-wrap gap-2">{candidate.resume.skills.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-xs text-[#475569]">{s}</span>)}</div>
          </div>
          {candidate.resume.languages.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#1E293B] mb-2">Языки</h3>
              <p className="text-sm text-[#64748B]">{candidate.resume.languages.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
          <div className="bg-[#F0F7F2] rounded-xl p-4">
            <h3 className="font-semibold text-[#1E293B] mb-2">Краткое резюме</h3>
            <p className="text-sm text-[#64748B]">{candidate.aiAnalysis.professionalSummary}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Подтверждённое соответствие</h4>
            <ul className="space-y-1">{candidate.aiAnalysis.confirmedRequirements.map((r, i) => <li key={i} className="text-sm text-[#64748B] flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />{r}</li>)}</ul>
          </div>
          {candidate.aiAnalysis.partialMatch.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#1E293B] mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-[#F59E0B]" /> Частичное соответствие</h4>
              <ul className="space-y-1">{candidate.aiAnalysis.partialMatch.map((r, i) => <li key={i} className="text-sm text-[#64748B]">• {r}</li>)}</ul>
            </div>
          )}
          {candidate.aiAnalysis.missingRequirements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#1E293B] mb-2 flex items-center gap-2"><XCircle className="w-4 h-4 text-[#EF4444]" /> Не подтверждено</h4>
              <ul className="space-y-1">{candidate.aiAnalysis.missingRequirements.map((r, i) => <li key={i} className="text-sm text-[#64748B]">• {r}</li>)}</ul>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Сильные стороны</h4>
            <div className="flex flex-wrap gap-2">{candidate.aiAnalysis.strengths.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-xs text-[#065F46]">{s}</span>)}</div>
          </div>
          {candidate.aiAnalysis.risks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#1E293B] mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> Возможные риски</h4>
              <ul className="space-y-1">{candidate.aiAnalysis.risks.map((r, i) => <li key={i} className="text-sm text-[#64748B]">• {r}</li>)}</ul>
            </div>
          )}
          {candidate.aiAnalysis.toVerify.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#1E293B] mb-2">Что нужно проверить</h4>
              <ul className="space-y-1">{candidate.aiAnalysis.toVerify.map((r, i) => <li key={i} className="text-sm text-[#64748B]">• {r}</li>)}</ul>
            </div>
          )}
          {candidate.aiAnalysis.interviewQuestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#1E293B] mb-2">Вопросы для интервью</h4>
              <ol className="list-decimal list-inside space-y-1">{candidate.aiAnalysis.interviewQuestions.map((q, i) => <li key={i} className="text-sm text-[#64748B]">{q}</li>)}</ol>
            </div>
          )}
          <div className="bg-[#F0F7F2] rounded-xl p-4">
            <h4 className="text-sm font-medium text-[#1E293B] mb-1">Рекомендация</h4>
            <p className="text-sm text-[#64748B]">{candidate.aiAnalysis.recommendation}</p>
          </div>
          <div className="bg-[#EFF6FF] rounded-xl p-4 text-xs text-[#1E40AF]">
            {candidate.aiAnalysis.humanDecisionNote}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          {candidate.messages.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">Нет сообщений</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {candidate.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'ai' ? 'bg-[#ECFDF5] text-[#1E293B]' :
                    msg.sender === 'candidate' ? 'bg-[#F1F5F9] text-[#1E293B]' :
                    msg.sender === 'system' ? 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]' :
                    'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {msg.sender === 'ai' ? '🤖 Recruiter AI' : msg.sender === 'candidate' ? '👤 Кандидат' : msg.sender === 'system' ? '⚙️ Система' : '👁️ Требуется HR'}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{formatDateTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <input type="text" placeholder="Сообщение (демо)..." disabled className="bg-transparent text-sm text-[#94A3B8] outline-none w-full cursor-not-allowed" />
              <span className="text-xs text-[#94A3B8] whitespace-nowrap px-2 py-1 rounded bg-[#E2E8F0]">Демо</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
          {!candidateInterview ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#94A3B8] mb-4">
                Интервью ещё не назначено
              </p>
              <button
                type="button"
                onClick={openInterviewModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669]"
              >
                <Calendar className="w-4 h-4" />
                Назначить интервью
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#1E293B]">AI-интервью</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {formatDateTime(candidateInterview.date)} ·{' '}
                    {interviewFormatLabels[candidateInterview.format]}
                  </p>
                </div>

                <span className="self-start px-2.5 py-1 rounded-full bg-[#ECFDF5] text-xs font-medium text-[#047857]">
                  {interviewStatusLabels[candidateInterview.status]}
                </span>
              </div>

              {candidateInterview.status === 'scheduled' && (
                <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-[#1E293B]">
                        Вопросы подготовлены
                      </h4>
                      <p className="text-sm text-[#64748B] mt-1">
                        Recruiter AI подготовил {candidateInterview.questions.length}{' '}
                        вопросов на основе вакансии и анализа резюме.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          type="button"
                          onClick={handleStartInterview}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669]"
                        >
                          <Play className="w-4 h-4" />
                          Начать интервью
                        </button>
                        <button
                          type="button"
                          onClick={openInterviewModal}
                          className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#64748B] hover:bg-[#F8FAFC]"
                        >
                          Перенести
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {candidateInterview.status === 'in_progress' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-[#F8FAFC] p-4">
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">
                        Демо-режим проведения интервью
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        Внесите ответы кандидата вручную или заполните демонстрационный сценарий.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDemoAnswers}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#D1FAE5] bg-white text-sm text-[#047857] hover:bg-[#ECFDF5]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Заполнить демо-ответы
                    </button>
                  </div>

                  {candidateInterview.questions.map((question, index) => (
                    <div key={question.id} className="border border-[#E2E8F0] rounded-xl p-4">
                      <label className="block text-sm font-medium text-[#1E293B] mb-3">
                        Вопрос {index + 1}: {question.question}
                      </label>
                      <textarea
                        rows={4}
                        value={interviewAnswers[question.id] ?? question.answer}
                        onChange={event =>
                          setInterviewAnswers(previous => ({
                            ...previous,
                            [question.id]: event.target.value,
                          }))
                        }
                        placeholder="Ответ кандидата..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#10B981] resize-y"
                      />
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCompleteInterview}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] shadow-sm"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Завершить и сформировать отчёт
                    </button>
                  </div>
                </div>
              )}

              {candidateInterview.status === 'completed' && (
                <div className="space-y-5">
                  {candidateInterview.report && (
                    <>
                      <div className="rounded-xl bg-[#F0F7F2] p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-[#10B981]" />
                          <h4 className="text-sm font-semibold text-[#1E293B]">
                            Итог Recruiter AI
                          </h4>
                        </div>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          {candidateInterview.report.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-[#D1FAE5] p-4">
                          <h4 className="text-sm font-semibold text-[#065F46] mb-3">
                            Сильные стороны
                          </h4>
                          {candidateInterview.report.strengths.length > 0 ? (
                            <ul className="space-y-2">
                              {candidateInterview.report.strengths.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-[#64748B]">
                                  <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-[#94A3B8]">Недостаточно данных</p>
                          )}
                        </div>

                        <div className="rounded-xl border border-[#FDE68A] p-4">
                          <h4 className="text-sm font-semibold text-[#92400E] mb-3">
                            Риски и ограничения
                          </h4>
                          {candidateInterview.report.risks.length > 0 ? (
                            <ul className="space-y-2">
                              {candidateInterview.report.risks.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-[#64748B]">
                                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-[#94A3B8]">Явные риски не выявлены</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
                        <h4 className="text-sm font-semibold text-[#1E40AF] mb-2">
                          Что уточнить HR
                        </h4>
                        {candidateInterview.report.topicsToVerify.length > 0 ? (
                          <ul className="space-y-1">
                            {candidateInterview.report.topicsToVerify.map((item, index) => (
                              <li key={index} className="text-sm text-[#475569]">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[#64748B]">Дополнительных вопросов нет</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] p-4">
                        <h4 className="text-sm font-semibold text-[#1E293B] mb-2">
                          Рекомендация
                        </h4>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          {candidateInterview.report.recommendation}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-3">
                          Это информационный вывод Recruiter AI. Финальное решение принимает человек.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1E293B]">
                      Ответы и анализ
                    </h4>
                    {candidateInterview.questions.map((question, index) => (
                      <div key={question.id} className="border border-[#E2E8F0] rounded-xl p-4">
                        <p className="text-sm font-medium text-[#1E293B] mb-2">
                          Вопрос {index + 1}: {question.question}
                        </p>
                        <p className="text-sm text-[#64748B] mb-3 bg-[#F8FAFC] rounded-lg p-3 whitespace-pre-wrap">
                          {question.answer}
                        </p>
                        <p className="text-xs text-[#10B981] mb-2">
                          <Bot className="w-3 h-3 inline mr-1" />
                          Анализ: {question.analysis}
                        </p>
                        {question.keyFacts.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {question.keyFacts.map((fact, factIndex) => (
                              <span key={factIndex} className="px-2 py-0.5 rounded bg-[#ECFDF5] text-xs text-[#065F46]">
                                {fact}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {candidateInterview.status === 'cancelled' && (
                <p className="text-sm text-[#94A3B8] text-center py-8">
                  Интервью отменено
                </p>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          {candidate.files.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">Нет файлов</p>
          ) : (
            <div className="space-y-2">
              {candidate.files.map(f => (
                <div key={f.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center"><FileText className="w-4 h-4 text-[#64748B]" /></div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{f.name}</p>
                      <p className="text-xs text-[#94A3B8]">{f.type} · {f.size} · {f.source}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#94A3B8]">{formatDate(f.addedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          {candidate.history.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">Нет истории</p>
          ) : (
            <div className="space-y-3 border-l-2 border-[#E2E8F0] pl-4 ml-2">
              {candidate.history.map(h => (
                <div key={h.id} className="relative py-2">
                  <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />
                  <p className="text-sm font-medium text-[#1E293B]">{h.event}</p>
                  <p className="text-xs text-[#64748B]">{h.description}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{formatDateTime(h.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}