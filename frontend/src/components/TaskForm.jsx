import { useState, useEffect, useRef } from 'react';

// Helper to convert YYYY-MM-DD from database to DD-MM-YY for display
const convertDbToInputDate = (dbDate) => {
  if (!dbDate) return '';
  const parts = dbDate.split('-');
  if (parts.length !== 3) return dbDate;
  const [y, m, d] = parts;
  const shortYear = y.slice(-2); // e.g. '26' from '2026'
  return `${d}-${m}-${shortYear}`;
};

// Helper to validate that a calendar date is real and within the sane range 2000-2099
const isValidCalendarDate = (year, month, day) => {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10) - 1; // 0-indexed for JS Date
  const d = parseInt(day, 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (m < 0 || m > 11) return false;
  if (d < 1 || d > 31) return false;
  if (y < 2000 || y > 2099) return false; // Sane year range for tasks
  
  const dateObj = new Date(y, m, d);
  return dateObj.getFullYear() === y && dateObj.getMonth() === m && dateObj.getDate() === d;
};

// Helper to convert DD-MM-YY or DD-MM-YYYY to YYYY-MM-DD for database
const convertInputToDbDate = (inputVal) => {
  if (!inputVal) return null;
  const clean = inputVal.trim();
  
  // DD-MM-YYYY (e.g., 01-05-2026)
  let match = clean.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    if (isValidCalendarDate(y, m, d)) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return null;
  }
  
  // DD-MM-YY (e.g., 01-05-26)
  match = clean.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (match) {
    const [, d, m, y] = match;
    const fullYear = `20${y}`;
    if (isValidCalendarDate(fullYear, m, d)) {
      return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return null;
  }

  // DDMMYYYY (e.g. 01052026)
  match = clean.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    if (isValidCalendarDate(y, m, d)) {
      return `${y}-${m}-${d}`;
    }
    return null;
  }

  // DDMMYY (e.g. 010526)
  match = clean.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const [, d, m, y] = match;
    const fullYear = `20${y}`;
    if (isValidCalendarDate(fullYear, m, d)) {
      return `${fullYear}-${m}-${d}`;
    }
    return null;
  }

  // Fallback: JS Date parser
  try {
    const date = new Date(clean);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      if (isValidCalendarDate(y, m, d)) {
        return `${y}-${m}-${d}`;
      }
    }
  } catch {
    // Fallback parser failure, return null
  }

  return null;
};

export default function TaskForm({ onSubmit, editingTask, onCancel, presetDate }) {
  const [title, setTitle] = useState(editingTask ? (editingTask.title || '') : '');
  const [description, setDescription] = useState(editingTask ? (editingTask.description || '') : '');
  const [dueDateInput, setDueDateInput] = useState(
    editingTask 
      ? convertDbToInputDate(editingTask.dueDate) 
      : convertDbToInputDate(presetDate)
  );
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);
  const dateInputRef = useRef(null);

  // Auto-focus Title input if a preset date is supplied on mount
  useEffect(() => {
    if (presetDate && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [presetDate]);

  const handleTextChange = (e) => {
    let val = e.target.value;
    if (!val.trim()) {
      setError('');
    }
    
    // Auto-insert dashes: format digits as DD-MM-YY
    const digits = val.replace(/\D/g, '');
    let formatted;
    
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      // Allow up to 8 digits in case they write full year (DD-MM-YYYY)
      const yearPart = digits.slice(4, 8);
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${yearPart}`;
    }
    
    setDueDateInput(formatted);
  };

  const handleBlur = () => {
    const dbDate = convertInputToDbDate(dueDateInput);
    if (dbDate) {
      setDueDateInput(convertDbToInputDate(dbDate));
      setError('');
    } else if (dueDateInput) {
      setError('Invalid date. Please enter a valid calendar date in DD-MM-YY format.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const dbDate = convertInputToDbDate(dueDateInput);
    if (dueDateInput && !dbDate) {
      setError('Invalid date. Please enter a valid calendar date in DD-MM-YY format.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dbDate
    });

    // Reset if it was a create operation
    if (!editingTask) {
      setTitle('');
      setDescription('');
      setDueDateInput('');
      setError('');
    }
  };

  const formFields = (
    <>
      <div className="form-group">
        <label htmlFor="task-title">Task *</label>
        <input
          id="task-title"
          ref={titleInputRef}
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          style={error && !title.trim() ? { borderColor: 'var(--accent-danger)' } : {}}
          maxLength={100}
        />
        {error && !title.trim() && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '2px' }}>{error}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description of Task</label>
        <textarea
          id="task-desc"
          placeholder="Add details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-due-text">Due Date</label>
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          <input
            id="task-due-text"
            type="text"
            placeholder="DD-MM-YY"
            value={dueDateInput}
            onChange={handleTextChange}
            onBlur={handleBlur}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (dateInputRef.current) {
                dateInputRef.current.showPicker();
              }
            }}
            style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}
            title="Open Calendar Picker"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={convertInputToDbDate(dueDateInput) || ''}
            onChange={(e) => {
              const selectedDbDate = e.target.value; // YYYY-MM-DD
              setDueDateInput(convertDbToInputDate(selectedDbDate));
            }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              opacity: 0,
              pointerEvents: 'none',
              width: '40px',
              height: '100%'
            }}
            aria-label="Calendar date picker selection"
          />
        </div>
        {error && dueDateInput && !convertInputToDbDate(dueDateInput) && (
          <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '2px' }}>{error}</span>
        )}
      </div>
    </>
  );

  // If editing, render as a modal popup
  if (editingTask) {
    return (
      <div className="modal-overlay" onClick={onCancel} data-testid="edit-task-modal">
        <form 
          className="modal-content glass-panel task-form" 
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="form-title" style={{ margin: 0 }}>Edit Task</h3>
            <button type="button" className="action-btn" onClick={onCancel} aria-label="Cancel editing">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 0 }}>
            {formFields}
          </div>

          <div className="modal-footer" style={{ marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  // If creating, render inline card
  return (
    <form className="glass-panel task-form" onSubmit={handleSubmit} data-testid="create-task-form">
      <h3 className="form-title">Add Task</h3>
      
      {formFields}

      <button type="submit" className="btn btn-primary" style={{ marginTop: '4px', alignSelf: 'flex-start' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Task
      </button>
    </form>
  );
}
