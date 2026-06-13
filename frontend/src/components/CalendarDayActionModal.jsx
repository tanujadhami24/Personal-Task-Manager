import { useState } from 'react';

export default function CalendarDayActionModal({
  isOpen,
  date,
  onClose,
  onAddReminder,
  onSetAlarm,
  onSelectFilterDate,
  onPrefillTask
}) {
  const [activeForm, setActiveForm] = useState('menu'); // 'menu' | 'reminder' | 'alarm'
  const [title, setTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !date) return null;

  // Format readable date
  const formattedDate = (() => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  })();

  const handleReminderSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    onAddReminder(title.trim(), date);
    resetForm();
    onClose();
  };

  const handleAlarmSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!alarmTime) {
      setError('Alarm time is required');
      return;
    }
    onSetAlarm(title.trim(), alarmTime, date);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setActiveForm('menu');
    setTitle('');
    setAlarmTime('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="calendar-action-modal">
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px', borderRadius: '24px' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Calendar Day Options</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
          </div>
          <button type="button" className="action-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ margin: '20px 0 0 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Main Action Menu */}
          {activeForm === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-secondary action-menu-item"
                onClick={() => {
                  onSelectFilterDate(date);
                  onClose();
                }}
                style={{ justifyContent: 'flex-start', padding: '14px 18px', borderRadius: '14px', width: '100%', fontSize: '0.95rem' }}
              >
                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>📅</span>
                Filter tasks for this day
              </button>

              <button 
                className="btn btn-secondary action-menu-item"
                onClick={() => {
                  onPrefillTask(date);
                  onClose();
                }}
                style={{ justifyContent: 'flex-start', padding: '14px 18px', borderRadius: '14px', width: '100%', fontSize: '0.95rem' }}
              >
                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>📝</span>
                Add a standard Task
              </button>

              <button 
                className="btn btn-secondary action-menu-item"
                onClick={() => setActiveForm('reminder')}
                style={{ justifyContent: 'flex-start', padding: '14px 18px', borderRadius: '14px', width: '100%', fontSize: '0.95rem' }}
              >
                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>🔔</span>
                Add a quick Reminder
              </button>

              <button 
                className="btn btn-secondary action-menu-item"
                onClick={() => setActiveForm('alarm')}
                style={{ justifyContent: 'flex-start', padding: '14px 18px', borderRadius: '14px', width: '100%', fontSize: '0.95rem' }}
              >
                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>⏰</span>
                Set a time-based Alarm
              </button>
            </div>
          )}

          {/* Quick Reminder Form */}
          {activeForm === 'reminder' && (
            <form onSubmit={handleReminderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>🔔</span> Add Quick Reminder
              </h4>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="reminder-title" style={{ fontSize: '0.85rem' }}>Reminder Title</label>
                <input
                  id="reminder-title"
                  type="text"
                  placeholder="e.g. Call client, Buy groceries..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: error ? '1px solid var(--accent-danger)' : '1px solid var(--card-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
                {error && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{error}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ flex: 1, padding: '10px' }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '10px' }}>
                  Save Reminder
                </button>
              </div>
            </form>
          )}

          {/* Quick Alarm Form */}
          {activeForm === 'alarm' && (
            <form onSubmit={handleAlarmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>⏰</span> Set Time-based Alarm
              </h4>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="alarm-title" style={{ fontSize: '0.85rem' }}>Alarm Title</label>
                <input
                  id="alarm-title"
                  type="text"
                  placeholder="e.g. Join standup, Take medicine..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: error && !title.trim() ? '1px solid var(--accent-danger)' : '1px solid var(--card-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="alarm-time" style={{ fontSize: '0.85rem' }}>Alarm Time</label>
                <input
                  id="alarm-time"
                  type="time"
                  value={alarmTime}
                  onChange={(e) => {
                    setAlarmTime(e.target.value);
                    if (e.target.value) setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: error && !alarmTime ? '1px solid var(--accent-danger)' : '1px solid var(--card-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {error && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', display: 'block' }}>{error}</span>}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ flex: 1, padding: '10px' }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '10px' }}>
                  Save Alarm
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
