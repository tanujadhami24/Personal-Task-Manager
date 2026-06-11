import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || '');
      setError('');
    } else {
      // Clear form for creation
      setTitle('');
      setDescription('');
      setDueDate('');
      setError('');
    }
  }, [editingTask]);

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
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
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
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          placeholder="Add details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-due">Due Date</label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
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
      <h3 className="form-title">Add New Task</h3>
      
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
