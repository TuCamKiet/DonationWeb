import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function CalendarPicker({ selectedDate, onChange }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(selectedDate || new Date());
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view when opening if a date is selected
  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentView(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

  const year = currentView.getFullYear();
  const month = currentView.getMonth();

  const handlePrevMonth = () => {
    setCurrentView(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentView(new Date(year, month + 1, 1));
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const startingDayIndex = firstDay === 0 ? 6 : firstDay - 1; // 0 is Monday, 6 is Sunday

  const daysArray = [];
  // Trống đầu tháng
  for (let i = 0; i < startingDayIndex; i++) {
    daysArray.push(null);
  }
  // Các ngày trong tháng
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  return (
    <div className="calendar-container" ref={containerRef}>
      <button 
        className={`btn btn--ghost interactive calendar-trigger ${selectedDate ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <CalendarIcon size={18} />
        {selectedDate ? (
          <span>{selectedDate.toLocaleDateString('vi-VN')}</span>
        ) : (
          <span>Lọc theo ngày</span>
        )}
        {selectedDate && (
          <span 
            className="calendar-clear" 
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            <X size={14} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="calendar-popover card"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          >
            <div className="calendar-header">
              <button className="calendar-nav interactive" onClick={handlePrevMonth} type="button">
                <ChevronLeft size={20} />
              </button>
              <div className="calendar-title">
                <strong>{MONTHS[month]}</strong> {year}
              </div>
              <button className="calendar-nav interactive" onClick={handleNextMonth} type="button">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="calendar-dow">{d}</div>
              ))}
              
              {daysArray.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="calendar-day empty" />;
                }
                const isSelected = isSameDay(selectedDate, date);
                const isToday = isSameDay(new Date(), date);

                return (
                  <button
                    key={date.getTime()}
                    className={`calendar-day interactive ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                    onClick={() => {
                      onChange(date);
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
