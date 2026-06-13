import { useState, useEffect, useRef } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancel, presetDate }) {
  const [title, setTitle] = useState(editingTask ? (editingTask.title || '') : '');
  const [description, setDescription] = useState(editingTask ? (editingTask.description || '') : '');
  const [dueDate, setDueDate] = useState(editingTask ? (editingTask.dueDate || '') : (presetDate || ''));
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);
  const dateInputRef = useRef(null);

  // Auto-focus Title input if a preset date is supplied on mount
  useEffect(() => {
    if (presetDate && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [presetDate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null
    });

    // Reset if it was a create operation
    if (!editingTask) {
      setTitle('');
      setDescription('');
      setDueDate('');
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
          style={error ? { borderColor: 'var(--accent-danger)' } : {}}
          maxLength={100}
        />
        {error && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '2px' }}>{error}</span>}
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
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
