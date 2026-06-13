import { useState, useMemo } from 'react';

export default function CalendarView({ tasks, selectedDate, onSelectDate }) {
  const [navDate, setNavDate] = useState(new Date());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const currentMonth = navDate.getMonth();
  const currentYear = navDate.getFullYear();

  // Helper lists for selectors
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Quick nav handlers
  const handlePrevMonth = () => {
    setNavDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectMonth = (monthIdx) => {
    setNavDate(new Date(currentYear, monthIdx, 1));
    setIsMonthDropdownOpen(false);
  };

  // Check if a task is overdue
  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Generate calendar day cells
  const cells = useMemo(() => {
    // Determine total days in month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Determine day of the week for the 1st of the month (0 = Sun, ..., 6 = Sat)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Determine total days in previous month for padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const dayCells = [];

    // 1. Previous month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Format date string YYYY-MM-DD
      const mm = String(prevMonth + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mm}-${dd}`;

      dayCells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false
      });
    }

    // 2. Current month cells
    for (let i = 1; i <= totalDays; i++) {
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      const dateStr = `${currentYear}-${mm}-${dd}`;

      dayCells.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true
      });
    }

    // 3. Next month padding cells
    const totalCellsSoFar = dayCells.length;
    const remainingCells = 42 - totalCellsSoFar; // Align to 6 rows of 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      const mm = String(nextMonth + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      const dateStr = `${nextYear}-${mm}-${dd}`;

      dayCells.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false
      });
    }

    // 4. Map task statuses to each cell
    return dayCells.map(cell => {
      // Find all tasks due on this date
      const tasksOnDay = tasks.filter(t => t.dueDate === cell.dateStr);
      
      let status = 'none';
      if (tasksOnDay.length > 0) {
        const hasOverdue = tasksOnDay.some(t => isTaskOverdue(t));
        const allCompleted = tasksOnDay.every(t => t.completed);
        
        if (hasOverdue) {
          status = 'overdue'; // Coral highlight
        } else if (allCompleted) {
          status = 'completed'; // Purple highlight
        } else {
          status = 'active'; // Blue highlight
        }
      }

      return {
        ...cell,
        status,
        hasTasks: tasksOnDay.length > 0
      };
    });
  }, [tasks, currentMonth, currentYear]);

  // Format the display text in the pill header: e.g. "December 2025"
  const formattedHeaderDate = `${monthsList[currentMonth]} ${currentYear}`;

  const handleDayClick = (dateStr) => {
    if (selectedDate === dateStr) {
      onSelectDate(null); // Clear filter if clicking the active selected day
    } else {
      onSelectDate(dateStr); // Select day to filter list
    }
  };

  return (
    <div className="glass-panel calendar-container" data-testid="calendar-view">
      {/* Calendar Header with Pill Selector and Navigation */}
      <div className="calendar-header">
        {/* Pill Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="calendar-pill-btn" 
            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            title="Choose Month"
          >
            {/* Calendar Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formattedHeaderDate}</span>
            {/* Chevron icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {/* Dropdown popup */}
          {isMonthDropdownOpen && (
            <div className="calendar-dropdown glass-panel">
              {monthsList.map((monthName, idx) => (
                <button 
                  key={monthName}
                  className={`calendar-dropdown-item ${idx === currentMonth ? 'active' : ''}`}
                  onClick={() => handleSelectMonth(idx)}
                >
                  {monthName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="calendar-nav-arrows">
          <button className="action-btn" onClick={handlePrevMonth} title="Previous Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="action-btn" onClick={handleNextMonth} title="Next Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Weekdays Row: S M T W T F S */}
      <div className="calendar-weekdays-row">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      {/* Days Grid */}
      <div className="calendar-days-grid">
        {cells.map((cell, idx) => {
          const isSelected = selectedDate === cell.dateStr;
          
          // Determine day status highlights
          let highlightClass = '';
          if (cell.status === 'overdue') highlightClass = 'day-overdue';
          else if (cell.status === 'completed') highlightClass = 'day-completed';
          else if (cell.status === 'active') highlightClass = 'day-active';

          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              className={`calendar-day-cell ${cell.isCurrentMonth ? 'current-month' : 'other-month'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(cell.dateStr)}
              title={cell.hasTasks ? `Click to see tasks due on ${cell.dateStr}` : `No tasks due`}
            >
              <span className={`day-circle ${highlightClass}`}>
                {cell.dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
