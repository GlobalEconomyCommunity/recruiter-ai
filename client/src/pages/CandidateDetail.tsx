import { useParams, Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ArrowLeft, UserPlus, Calendar, HelpCircle, Clock, XCircle, CheckCircle2, Bot, FileText, MessageCircle, History, AlertTriangle, Info } from 'lucide-react';
import { candidateStatusConfig } from '@/lib/status-config';
import { formatDate, formatDateTime, formatSalary, getInitials } from '@/lib/formatters';
import { toast } from 'sonner';
import type { CandidateStatus } from '@/types';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const { candidates, interviews, updateCandidateStatus } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirm, setShowConfirm] = useState<{ action: string; status: CandidateStatus } | null>(null);

  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return <div className="text-center py-12 text-[#64748B]">Кандидат не найден</div>;

  const candidateInterview = interviews.find(i => i.candidateId === id);
  const sCfg = candidateStatusConfig[candidate.status];

  const handleAction = (status: CandidateStatus, label: string, dangerous?: boolean) => {
    if (dangerous) {
      setShowConfirm({ action: label, status });
    } else {
      updateCandidateStatus(candidate.id, status);
      toast.success(`Статус изменён: ${candidateStatusConfig[status].label}`);
    }
  };

  const confirmAction = () => {
    if (showConfirm) {
      updateCandidateStatus(candidate.id, showConfirm.status);
      toast.success(`Статус изменён: ${candidateStatusConfig[showConfirm.status].label}`);
      setShowConfirm(null);
    }
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
      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Подтверждение</h3>
            <p className="text-sm text-[#64748B] mb-5">Вы уверены, что хотите выполнить действие «{showConfirm.action}»?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(null)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B]">Отмена</button>
              <button onClick={confirmAction} className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-sm font-medium">Подтвердить</button>
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
            <button onClick={() => handleAction('recommended', 'Пригласить')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] text-white text-xs font-medium hover:bg-[#059669] transition-colors">
              <UserPlus className="w-3.5 h-3.5" /> Пригласить
            </button>
            <button onClick={() => handleAction('interview_scheduled', 'Назначить интервью')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]">
              <Calendar className="w-3.5 h-3.5" /> Интервью
            </button>
            <button onClick={() => handleAction('needs_clarification', 'Запросить информацию')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]">
              <HelpCircle className="w-3.5 h-3.5" /> Уточнить
            </button>
            <button onClick={() => handleAction('postponed', 'Отложить')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]">
              <Clock className="w-3.5 h-3.5" /> Отложить
            </button>
            <button onClick={() => handleAction('rejected', 'Отклонить', true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FCA5A5] text-xs text-[#DC2626] hover:bg-[#FEF2F2]">
              <XCircle className="w-3.5 h-3.5" /> Отклонить
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
            <p className="text-sm text-[#94A3B8] text-center py-8">Интервью не проводилось</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1E293B]">AI-интервью</h3>
                <span className="text-xs text-[#94A3B8]">{formatDate(candidateInterview.date)} · {candidateInterview.format}</span>
              </div>
              <p className="text-sm text-[#64748B]">Результат: <span className="font-medium text-[#1E293B]">{candidateInterview.shortResult}</span></p>
              {candidateInterview.questions.length > 0 && (
                <div className="space-y-4">
                  {candidateInterview.questions.map((q, i) => (
                    <div key={q.id} className="border border-[#E2E8F0] rounded-xl p-4">
                      <p className="text-sm font-medium text-[#1E293B] mb-2">Вопрос {i + 1}: {q.question}</p>
                      <p className="text-sm text-[#64748B] mb-2 bg-[#F8FAFC] rounded-lg p-3">{q.answer}</p>
                      <p className="text-xs text-[#10B981] mb-1"><Bot className="w-3 h-3 inline mr-1" />Анализ: {q.analysis}</p>
                      {q.keyFacts.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{q.keyFacts.map((f, j) => <span key={j} className="px-2 py-0.5 rounded bg-[#ECFDF5] text-xs text-[#065F46]">{f}</span>)}</div>}
                    </div>
                  ))}
                </div>
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
