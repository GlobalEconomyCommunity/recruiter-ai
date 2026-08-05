import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import { Plus, Search, Filter, Briefcase, MapPin, Users as UsersIcon, Bot } from 'lucide-react';
import { useState } from 'react';
import { vacancyStatusConfig, workFormatLabels } from '@/lib/status-config';
import { formatDate, formatSalary } from '@/lib/formatters';

export default function Vacancies() {
  const { vacancies } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = vacancies.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || v.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Вакансии</h1>
          <p className="text-sm text-[#64748B] mt-1">Управление открытыми позициями</p>
        </div>
        <Link href="/vacancies/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium transition-colors shadow-sm active:scale-[0.97]">
          <Plus className="w-4 h-4" />
          Создать вакансию
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Поиск вакансий..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#1E293B] outline-none"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="paused">Приостановлены</option>
          <option value="draft">Черновики</option>
          <option value="closed">Закрыты</option>
        </select>
      </div>

      {/* Vacancy cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <Briefcase className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B]">Вакансии не найдены</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(vacancy => {
            const statusCfg = vacancyStatusConfig[vacancy.status];
            return (
              <Link key={vacancy.id} href={`/vacancies/${vacancy.id}`} className="block">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow hover:card-shadow-hover transition-all hover:border-[#A7F3D0]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#1E293B]">{vacancy.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-[#64748B]">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vacancy.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vacancy.city}</span>
                        <span>{workFormatLabels[vacancy.workFormat]}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusCfg.bg, color: statusCfg.textColor }}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-[#64748B]"><UsersIcon className="w-3.5 h-3.5" />{vacancy.candidatesTotal} кандидатов</span>
                      <span className="text-[#10B981] font-medium">{vacancy.candidatesShortlisted} в shortlist</span>
                      <span className="text-[#94A3B8]">{formatSalary(vacancy.salaryMin, vacancy.salaryMax)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Bot className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="hidden md:inline">{vacancy.lastAIAction}</span>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="mt-3">
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-full" style={{ width: `${Math.round((vacancy.candidatesProcessed / Math.max(vacancy.candidatesTotal, 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
