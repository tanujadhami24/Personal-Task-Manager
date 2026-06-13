import { useMemo } from 'react';

export default function TaskItem({ 
  task, 
  index, 
  onToggle, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDragEnd,
  isDraggable
}) {
  
  // Calculate if the task is overdue (due date in the past and task is not completed)
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.completed) return false;
    
    // Create Date objects representing midnight of today and midnight of due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse task due date (which is in YYYY-MM-DD format from input)
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day); // Month is 0-indexed
    due.setHours(0, 0, 0, 0);

    return due < today;
  }, [task.dueDate, task.completed]);

  // Format date to a readable format (e.g. Jun 15, 2026)
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return '';
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [task.dueDate]);

  return (
    <div 
      className={`glass-panel task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      style={{ cursor: isDraggable ? 'grab' : 'default' }}
      data-testid={`task-item-${task.id}`}
    >
      {/* Drag Handle Icon - Only active if reorder mode is active */}
      {isDraggable && (
        <div className="drag-handle" title="Drag to reorder task">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
      )}

      {/* Completion Toggle Checkbox */}
      <div className="checkbox-wrapper">
        <input 
          type="checkbox" 
          className="custom-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, !task.completed)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Task Content */}
      <div className="task-content">
        <h4 className="task-card-title">{task.title}</h4>
        
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        <div className="task-meta">
          {task.type === 'reminder' && (
            <span className="meta-badge badge-reminder" data-testid={`task-reminder-badge-${task.id}`}>
              🔔 Reminder
            </span>
          )}
          {task.type === 'alarm' && (
            <span className="meta-badge badge-alarm" data-testid={`task-alarm-badge-${task.id}`}>
              ⏰ Alarm: {task.alarmTime}
            </span>
          )}
          
          {/* Due date display */}
          {task.dueDate && (
            <span className={`meta-badge ${isOverdue ? 'badge-overdue' : 'badge-date'}`} data-testid={`task-due-badge-${task.id}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {isOverdue ? `Overdue: ${formattedDueDate}` : `Due: ${formattedDueDate}`}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="task-actions">
        <button 
          className="action-btn" 
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label={`Edit task "${task.title}"`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
          </svg>
        </button>
        <button 
          className="action-btn btn-delete" 
          onClick={() => onDelete(task.id)}
          title="Delete task"
          aria-label={`Delete task "${task.title}"`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
