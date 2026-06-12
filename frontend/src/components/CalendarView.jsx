import React, { useState, useMemo } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarView({ tasks, selectedDate, onSelectDate }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showPicker, setShowPicker] = useState(false);

  // Helper to pad double digits
  const pad = (n) => String(n).padStart(2, '0');

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid cells (42 total)
  const cells = useMemo(() => {
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const list = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      list.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      list.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }

    // Next month padding days to round up to 42 cells (6 weeks)
    const remaining = 42 - list.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let n = 1; n <= remaining; n++) {
      list.push({
        day: n,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false
      });
    }

    return list;
  }, [currentYear, currentMonth]);

  // Map tasks to dates for faster highlights lookup
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        if (!map[task.dueDate]) {
          map[task.dueDate] = [];
        }
        map[task.dueDate].push(task);
      }
    });
    return map;
  }, [tasks]);

  // Determine styling class for a calendar cell
  const getCellStatus = (dateStr) => {
    const dayTasks = tasksByDate[dateStr];
    if (!dayTasks || dayTasks.length === 0) return null;

    // Check if any incomplete task is overdue
    const hasOverdue = dayTasks.some(task => {
      return !task.completed && task.dueDate < todayStr;
    });

    if (hasOverdue) return 'overdue';

    // Check if any incomplete task is active
    const hasActive = dayTasks.some(task => !task.completed);
    if (hasActive) return 'active';

    // If there are tasks and all of them are completed, it's completed
    return 'completed';
  };

  // Month select options
  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
    setShowPicker(false);
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
    setShowPicker(false);
  };

  return (
    <div className="glass-panel calendar-container" data-testid="calendar-view">
      {/* Calendar Header with Navigation Pill */}
      <div className="calendar-header">
        <div className="calendar-nav-pill" onClick={() => setShowPicker(!showPicker)}>
          <svg className="nav-pill-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="nav-pill-text">{MONTH_NAMES[currentMonth]} {currentYear}</span>
          <svg className={`nav-pill-chevron ${showPicker ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* Triple Dot / Navigation Controls */}
        <div className="calendar-controls">
          <button className="action-btn" onClick={handlePrevMonth} title="Previous Month" aria-label="Previous month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="action-btn" onClick={handleNextMonth} title="Next Month" aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Month/Year Dropdown Selectors */}
      {showPicker && (
        <div className="calendar-picker-dropdown glass-panel">
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={currentMonth} onChange={handleMonthChange}>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
            <select value={currentYear} onChange={handleYearChange}>
              {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Weekday headers (S M T W T F S) */}
      <div className="calendar-grid-header">
        {WEEK_DAYS.map((day, idx) => (
          <div key={idx} className="calendar-grid-header-cell">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid">
        {cells.map((cell, idx) => {
          const cellDateStr = `${cell.year}-${pad(cell.month + 1)}-${pad(cell.day)}`;
          const status = getCellStatus(cellDateStr);
          const isSelected = selectedDate === cellDateStr;
          const isToday = cellDateStr === todayStr;

          return (
            <div 
              key={idx} 
              className={`calendar-grid-cell ${cell.isCurrentMonth ? '' : 'outside-month'} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : cellDateStr)}
              data-testid={`calendar-cell-${cellDateStr}`}
            >
              <div className={`calendar-day-circle ${status || ''} ${isToday ? 'today' : ''}`}>
                {cell.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Coding Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot color-active"></span>
          <span>Active</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot color-overdue"></span>
          <span>Overdue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot color-completed"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
