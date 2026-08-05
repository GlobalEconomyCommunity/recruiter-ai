import { defaultIntegrations } from '@/data/integrations';
import { integrationStatusConfig } from '@/lib/status-config';
import { Briefcase, Users, MapPin, Mail, MessageCircle, Calendar, Database, Info } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, any> = {
  Briefcase, Users, MapPin, Mail, MessageCircle, Calendar, Database,
};

export default function Integrations() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = defaultIntegrations.find(i => i.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Интеграции</h1>
        <p className="text-sm text-[#64748B] mt-1">Подключения к внешним сервисам и платформам</p>
      </div>

      <div className="bg-[#ECFDF5] rounded-xl p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-[#10B981] shrink-0" />
        <p className="text-sm text-[#065F46]">В версии 0.1 интеграции представлены как демонстрационные карточки. Реальные подключения будут доступны в следующих версиях.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultIntegrations.map(integration => {
          const sCfg = integrationStatusConfig[integration.status];
          const Icon = iconMap[integration.icon] || Briefcase;
          return (
            <div key={integration.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F7F2] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sCfg.bg, color: sCfg.textColor }}>{sCfg.label}</span>
              </div>
              <h3 className="text-base font-semibold text-[#1E293B] mb-1">{integration.name}</h3>
              <p className="text-sm text-[#64748B] mb-3 line-clamp-2">{integration.description}</p>
              <button
                onClick={() => setSelectedId(integration.id)}
                className="text-sm text-[#10B981] hover:text-[#059669] font-medium transition-colors"
              >
                Подробнее →
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">{selected.name}</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: integrationStatusConfig[selected.status].bg, color: integrationStatusConfig[selected.status].textColor }}>
              {integrationStatusConfig[selected.status].label}
            </span>
            <p className="text-sm text-[#64748B] mt-3 mb-4">{selected.description}</p>
            <h4 className="text-sm font-medium text-[#1E293B] mb-2">Возможности:</h4>
            <ul className="list-disc list-inside text-sm text-[#64748B] space-y-1 mb-5">
              {selected.capabilities.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
            <button onClick={() => setSelectedId(null)} className="w-full py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
