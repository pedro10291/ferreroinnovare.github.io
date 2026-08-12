import React from 'react';
import { Professional } from '../../../types/appointment';

interface ProfessionalFilterProps {
  professionals: Professional[];
  selectedProfessionalId: string;
  onChange: (id: string) => void;
}

export const ProfessionalFilter: React.FC<ProfessionalFilterProps> = ({ 
  professionals, 
  selectedProfessionalId, 
  onChange 
}) => {
  return (
    <div className="relative">
      <select
        value={selectedProfessionalId}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-clinic-gold focus:border-transparent cursor-pointer font-medium text-sm transition-all"
      >
        <option value="all">Todos os profissionais</option>
        {professionals.map((prof) => (
          <option key={prof.id} value={prof.id}>
            {prof.full_name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};
