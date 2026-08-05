import { useParams, Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ArrowLeft, Pause, Play, Edit, UserPlus, Users as UsersIcon, Bot, CheckCircle2, Circle, MapPin, Briefcase, Calendar } from 'lucide-react';
import { vacancyStatusConfig, workFormatLabels, recruitmentStageConfig, candidateStatusConfig } from '@/lib/status-config';
import { formatDate, formatSalary } from '@/lib/formatters';
import { toast } from 'sonner';

export default function VacancyDetail() {
  const { id } = useParams<{ id: string }>();
  const { vacancies, candidates, updateVacancy } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const vacancy = vacancies.find(v => v.id === id);
  if (!vacancy) return <div className="text-center py-12 text-[#64748B]">Вакансия не найдена</div>;

  const vacCandidates = candidates.filter(c => c.vacancyId === id);
  const statusCfg = vacancyStatusConfig[vacancy.status];

  const togglePause = () => {
    const newStatus = vacancy.status === 'paused' ? 'active' : 'paused';
    updateVacancy(vacancy.id, { status: newStatus });
    toast.success(newStatus === 'paused' ? 'Задача приостановлена' : 'Задача продолжена');
  };

  const tabs = [
    { key: 'overview', label: 'Обзор' },
    { key: 'candidates', label: `Кандидаты (${vacCandidates.length})` },
    { key: 'ai-profile', label: 'AI-профиль' },
    { key: 'activity', label: 'Активность' },
  ];

  const stageOrder = Object.keys(recruitmentStageConfig) as Array<keyof typeof recruitmentStageConfig>;
  const currentIdx = stageOrder.indexOf(vacancy.currentStage);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <Link href="/vacancies" className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Вакансии
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E293B]">{vacancy.title}</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusCfg.bg, color: statusCfg.textColor }}>{statusCfg.label}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#64748B]">
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vacancy.department}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vacancy.city}</span>
            <span>{workFormatLabels[vacancy.workFormat]}</span>
            <span>{formatSalary(vacancy.salaryMin, vacancy.salaryMax)}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(vacancy.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={togglePause} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            {vacancy.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {vacancy.status === 'paused' ? 'Продолжить' : 'Приостановить'}
          </button>
          <Link href="/candidates" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] text-sm text-white hover:bg-[#059669] transition-colors">
            <UsersIcon className="w-4 h-4" /> Кандидаты
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E8F0]">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#10B981] text-[#1E293B]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="font-semibold text-[#1E293B] mb-3">Описание</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{vacancy.description}</p>
              {vacancy.responsibilities.length > 0 && (
                <>
                  <h4 className="font-medium text-[#1E293B] mt-4 mb-2">Обязанности</h4>
                  <ul className="list-disc list-inside text-sm text-[#64748B] space-y-1">
                    {vacancy.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="font-semibold text-[#1E293B] mb-3">Этапы работы AI</h3>
              <div className="space-y-2">
                {stageOrder.map((stage, i) => (
                  <div key={stage} className="flex items-center gap-3 py-1.5">
                    {i < currentIdx ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> :
                     i === currentIdx ? <div className="w-5 h-5 rounded-full border-2 border-[#10B981] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /></div> :
                     <Circle className="w-5 h-5 text-[#CBD5E1]" />}
                    <span className={`text-sm ${i <= currentIdx ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>{recruitmentStageConfig[stage].label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="font-semibold text-[#1E293B] mb-3">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-[#64748B]">Всего кандидатов</span><span className="font-medium text-[#1E293B]">{vacancy.candidatesTotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#64748B]">Обработано AI</span><span className="font-medium text-[#1E293B]">{vacancy.candidatesProcessed}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#64748B]">В shortlist</span><span className="font-medium text-[#10B981]">{vacancy.candidatesShortlisted}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#64748B]">Ответственный</span><span className="font-medium text-[#1E293B]">{vacancy.responsiblePerson}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="font-semibold text-[#1E293B] mb-3">Требования</h3>
              <div className="space-y-2">
                {vacancy.requiredSkills.map((s, i) => (
                  <span key={i} className="inline-block mr-2 mb-2 px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-xs text-[#065F46] font-medium">{s}</span>
                ))}
              </div>
              {vacancy.preferredSkills.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-[#64748B] mt-3 mb-2">Желательные</h4>
                  <div className="space-y-2">
                    {vacancy.preferredSkills.map((s, i) => (
                      <span key={i} className="inline-block mr-2 mb-2 px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-xs text-[#475569] font-medium">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          {vacCandidates.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">Нет кандидатов</p>
          ) : (
            <div className="space-y-2">
              {vacCandidates.map(c => (
                <Link key={c.id} href={`/candidates/${c.id}`} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center text-xs font-semibold text-[#10B981]">
                      {c.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{c.name}</p>
                      <p className="text-xs text-[#64748B]">{c.currentPosition} · {c.experience}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: candidateStatusConfig[c.status]?.bg, color: candidateStatusConfig[c.status]?.textColor }}>
                    {candidateStatusConfig[c.status]?.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai-profile' && vacancy.aiProfile && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-5">
          <h3 className="font-semibold text-[#1E293B]">AI-профиль кандидата</h3>
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Ключевой опыт</h4>
            <div className="flex flex-wrap gap-2">{vacancy.aiProfile.keyExperience.map((e, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-xs text-[#065F46]">{e}</span>)}</div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Обязательные критерии</h4>
            <ul className="list-disc list-inside text-sm text-[#64748B] space-y-1">{vacancy.aiProfile.requiredCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Вопросы для screening</h4>
            <ol className="list-decimal list-inside text-sm text-[#64748B] space-y-1">{vacancy.aiProfile.screeningQuestions.map((q, i) => <li key={i}>{q}</li>)}</ol>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Критерии передачи HR</h4>
            <ul className="list-disc list-inside text-sm text-[#64748B] space-y-1">{vacancy.aiProfile.hrHandoffCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="text-sm text-[#64748B]">Последнее действие AI: <span className="font-medium text-[#1E293B]">{vacancy.lastAIAction}</span></p>
          <p className="text-xs text-[#94A3B8] mt-1">Обновлено: {formatDate(vacancy.updatedAt)}</p>
        </div>
      )}
    </div>
  );
}
