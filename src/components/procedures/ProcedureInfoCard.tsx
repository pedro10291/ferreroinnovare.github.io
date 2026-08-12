import React from 'react';

interface ProcedureInfoCardProps {
  duration?: string;
  investment?: string;
  sessions?: string;
  interval?: string;
  maintenance?: string;
  result?: string;
}

export const ProcedureInfoCard: React.FC<ProcedureInfoCardProps> = ({
  duration,
  investment,
  sessions,
  interval,
  maintenance,
  result
}) => {
  const infoItems = [
    { label: 'Duração', value: duration },
    { label: 'Investimento', value: investment },
    { label: 'Sessões', value: sessions },
    { label: 'Intervalo Recomendado', value: interval },
    { label: 'Resultado', value: result },
    { label: 'Manutenção', value: maintenance },
  ].filter(item => item.value);

  if (infoItems.length === 0) return null;

  return (
    <div className="flex flex-col border-t border-clinic-border">
      {infoItems.map((item, index) => (
        <div 
          key={item.label} 
          className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-4 border-b border-clinic-border"
        >
          <span className="text-xs tracking-widest uppercase font-semibold text-clinic-textPrimary mb-1 sm:mb-0 w-1/3">
            {item.label}
          </span>
          <span className="text-sm md:text-base text-clinic-textSecondary font-light sm:text-right w-2/3">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};
