import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Building2, User, Users, Bot, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';
import { clearAllStoredData } from '@/lib/storage';

const sections = [
  { key: 'company', label: 'Компания', icon: Building2 },
  { key: 'profile', label: 'Профиль', icon: User },
  { key: 'team', label: 'Команда и роли', icon: Users },
  { key: 'ai', label: 'Настройки AI', icon: Bot },
  { key: 'notifications', label: 'Уведомления', icon: Bell },
  { key: 'security', label: 'Безопасность', icon: Shield },
  { key: 'data', label: 'Данные прототипа', icon: Database },
];

export default function SettingsPage() {
  const { user, company } = useApp();
  const [activeSection, setActiveSection] = useState('company');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Настройки</h1>
        <p className="text-sm text-[#64748B] mt-1">Управление параметрами приложения</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 h-fit">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeSection === s.key ? 'bg-[#ECFDF5] text-[#1E293B] font-medium' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
              >
                <Icon className={`w-4 h-4 ${activeSection === s.key ? 'text-[#10B981]' : 'text-[#94A3B8]'}`} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {activeSection === 'company' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Компания</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Название</label><input type="text" defaultValue={company.name} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Отрасль</label><input type="text" defaultValue={company.industry} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Размер</label><input type="text" defaultValue={company.size} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Город</label><input type="text" defaultValue={company.city} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
              </div>
              <button onClick={() => toast.success('Сохранено (демо)')} className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors">Сохранить</button>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Профиль</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Имя</label><input type="text" defaultValue={user.name} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Роль</label><input type="text" defaultValue={user.role} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
                <div><label className="block text-sm font-medium text-[#1E293B] mb-1.5">Email</label><input type="email" defaultValue={user.email} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm outline-none focus:border-[#10B981]" /></div>
              </div>
              <button onClick={() => toast.success('Сохранено (демо)')} className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors">Сохранить</button>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Команда и роли</h3>
              <p className="text-sm text-[#64748B]">Управление доступом команды. В демо-версии доступен один пользователь.</p>
              <div className="border border-[#E2E8F0] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center text-xs font-semibold text-[#10B981]">АП</div>
                    <div><p className="text-sm font-medium text-[#1E293B]">{user.name}</p><p className="text-xs text-[#64748B]">{user.role}</p></div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-[#ECFDF5] text-xs text-[#065F46] font-medium">Администратор</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Настройки Recruiter AI</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#EDF2F7]">
                  <div><p className="text-sm font-medium text-[#1E293B]">Автоматическая обработка откликов</p><p className="text-xs text-[#64748B]">AI автоматически обрабатывает новые отклики</p></div>
                  <div className="w-10 h-6 rounded-full bg-[#10B981] relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" /></div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#EDF2F7]">
                  <div><p className="text-sm font-medium text-[#1E293B]">Автоматический screening</p><p className="text-xs text-[#64748B]">AI проводит первичный screening без подтверждения</p></div>
                  <div className="w-10 h-6 rounded-full bg-[#10B981] relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" /></div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#EDF2F7]">
                  <div><p className="text-sm font-medium text-[#1E293B]">Отклонение кандидатов</p><p className="text-xs text-[#64748B]">Требует подтверждения HR</p></div>
                  <div className="w-10 h-6 rounded-full bg-[#E2E8F0] relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow" /></div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#EDF2F7]">
                  <div><p className="text-sm font-medium text-[#1E293B]">Приглашение на следующий этап</p><p className="text-xs text-[#64748B]">Требует подтверждения HR</p></div>
                  <div className="w-10 h-6 rounded-full bg-[#E2E8F0] relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow" /></div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-[#1E293B]">Стиль коммуникации</p><p className="text-xs text-[#64748B]">Формальный, профессиональный</p></div>
                  <select className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm outline-none">
                    <option>Формальный</option><option>Дружелюбный</option><option>Нейтральный</option>
                  </select>
                </div>
              </div>
              <div className="bg-[#EFF6FF] rounded-xl p-4 text-xs text-[#1E40AF]">
                Recruiter AI никогда не принимает окончательных решений о найме или отказе без подтверждения HR.
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Уведомления</h3>
              <div className="space-y-3">
                {['Новые кандидаты', 'Завершённые screening', 'Требуется решение HR', 'Завершённые интервью', 'Еженедельный отчёт'].map(n => (
                  <div key={n} className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#1E293B]">{n}</span>
                    <div className="w-10 h-6 rounded-full bg-[#10B981] relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Безопасность</h3>
              <p className="text-sm text-[#64748B]">В демо-версии настройки безопасности ограничены.</p>
              <div className="border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#64748B]">
                <p>Двухфакторная аутентификация: <span className="text-[#94A3B8]">Недоступно в v0.1</span></p>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E293B]">Данные прототипа</h3>
              <p className="text-sm text-[#64748B]">Управление демонстрационными данными. Все данные хранятся локально в браузере.</p>
              <button
                onClick={() => { clearAllStoredData(); toast.success('Данные сброшены. Перезагрузите страницу.'); }}
                className="px-4 py-2 rounded-xl border border-[#FCA5A5] text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                Сбросить все демо-данные
              </button>
              <p className="text-xs text-[#94A3B8]">После сброса данные вернутся к исходному состоянию при перезагрузке страницы.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

