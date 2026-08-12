import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/Button';

interface DateNavigatorProps {
  currentDate: Date;
  onChange: (newDate: Date) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onChange }) => {
  const handlePrev = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    onChange(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onChange(next);
  };

  const handleToday = () => {
    onChange(new Date());
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="px-2 w-9 h-9 flex items-center justify-center" onClick={handlePrev} aria-label="Dia anterior">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="secondary" className="px-2 w-9 h-9 flex items-center justify-center" onClick={handleNext} aria-label="Dia seguinte">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button variant="secondary" size="sm" onClick={handleToday}>
          Hoje
        </Button>
      </div>
      
      <div className="flex flex-col items-center sm:items-end">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-clinic-gold" />
          <h2 className="text-xl font-serif text-clinic-dark font-medium capitalize">
            {formatDate(currentDate)}
          </h2>
        </div>
        <span className="text-sm text-gray-500 capitalize">
          {formatWeekday(currentDate)}
        </span>
      </div>
    </div>
  );
};
