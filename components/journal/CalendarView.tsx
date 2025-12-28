import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEntry } from '../../types';

interface CalendarViewProps {
  entries: JournalEntry[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ entries, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hasEntry = (year: number, month: number, day: number) => {
    return entries.some(e => {
      const d = new Date(e.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth); // 0 = Sunday
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
      const isToday = isSameDay(date, new Date());
      const hasData = hasEntry(currentMonth.getFullYear(), currentMonth.getMonth(), day);

      days.push(
        <button
          key={day}
          onClick={() => onSelectDate(isSelected ? null : date)} // Toggle selection
          className={`h-10 w-full rounded-lg flex flex-col items-center justify-center relative transition-colors ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:bg-slate-100 text-slate-700'
          } ${isToday && !isSelected ? 'font-bold text-indigo-600' : ''}`}
        >
          <span className="text-sm">{day}</span>
          {hasData && (
            <span 
              className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                isSelected ? 'bg-white' : 'bg-amber-500'
              }`} 
            />
          )}
        </button>
      );
    }

    return days;
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">
          {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
        </h3>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-slate-400 font-medium py-1">
            {day}
          </div>
        ))}
        {renderDays()}
      </div>

      {selectedDate && (
        <div className="text-center mt-2 pt-2 border-t border-slate-100">
          <button 
            onClick={() => onSelectDate(null)}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            選択を解除してすべて表示
          </button>
        </div>
      )}
    </div>
  );
};