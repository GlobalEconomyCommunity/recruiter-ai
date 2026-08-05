import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import { Calendar, MessageSquare, User, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Запланировано', color: '#3B82F6', bg: '#EFF6FF' },
  in_progress: { label: 'В процессе', color: '#10B981', bg: '#ECFDF5' },
  completed: { label: 'Завершено', color: '#10B981', bg: '#D1FAE5' },
  cancelled: { label: 'Отменено', color: '#64748B', bg: '#F1F5F9' },
};

export default function Interviews() {
  const { interviews } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">AI-интервью</h1>
        <p className="text-sm text-[#64748B] mt-1">Демонстрационные AI-интервью с кандидатами</p>
      </div>

      <div className="grid gap-4">
        {interviews.map(interview => {
          const sCfg = statusLabels[interview.status];
          return (
            <div key={interview.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <Link href={`/candidates/${interview.candidateId}`} className="text-base font-semibold text-[#1E293B] hover:text-[#10B981] transition-colors">
                      {interview.candidateName}
                    </Link>
                    <p className="text-sm text-[#64748B] flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" /> {interview.vacancyTitle}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sCfg.bg, color: sCfg.color }}>{sCfg.label}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#64748B]">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(interview.date)}</span>
                <span>Формат: {interview.format}</span>
                <span>{interview.questionsCount} вопросов</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{interview.responsiblePerson}</span>
              </div>
              {interview.shortResult && interview.status === 'completed' && (
                <p className="mt-3 text-sm text-[#10B981] bg-[#ECFDF5] rounded-lg px-3 py-2">{interview.shortResult}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
