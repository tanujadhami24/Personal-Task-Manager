import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dashboard from './components/Dashboard';
import FilterPanel from './components/FilterPanel';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import ConfirmationModal from './components/ConfirmationModal';
import CalendarView from './components/CalendarView';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  reorderTasksOnServer 
} from './utils/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortMode, setSortMode] = useState('date-desc');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  
  // Editing & Deleting states
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  
  // Feedback Toasts
  const [toasts, setToasts] = useState([]);

  // Theme selection state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Drag and drop refs
  const dragItemIndex = useRef(null);
  const dragOverItemIndex = useRef(null);

  // Sync theme class to document body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load all tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to the task server. Please ensure the backend is running.');
      showToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toast notifier
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // CRUD handlers
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      showToast('Task added successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to add task', 'error');
    }
  };

  const handleUpdateTaskDetails = async (taskData) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, taskData);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
      showToast('Task updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleToggleCompleted = async (id, completed) => {
    try {
      const updated = await updateTask(id, { completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast(completed ? 'Task completed! 🎉' : 'Task marked active');
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDeleteTaskConfirm = (id) => {
    setDeletingTaskId(id);
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    try {
      await deleteTask(deletingTaskId);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
      setDeletingTaskId(null);
      showToast('Task deleted successfully');
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  // Drag-and-Drop handlers
  // Reordering is only allowed when filters and search query are cleared
  const isDraggable = useMemo(() => {
    return statusFilter === 'all' && !searchQuery.trim();
  }, [statusFilter, searchQuery]);

  const handleDragStart = (e, index) => {
    if (sortMode !== 'custom') {
      setSortMode('custom');
      showToast('Switched to Custom drag-and-drop order');
    }
    dragItemIndex.current = index;
    // Add dragging class for opacity styling
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItemIndex.current = index;
  };

  const handleDragEnd = async (e) => {
    e.currentTarget.classList.remove('dragging');
    
    const dragIdx = dragItemIndex.current;
    const hoverIdx = dragOverItemIndex.current;

    if (dragIdx === null || hoverIdx === null || dragIdx === hoverIdx) {
      dragItemIndex.current = null;
      dragOverItemIndex.current = null;
      return;
    }

    // Reorder visible task array subset
    const reorderedList = [...processedTasks];
    const draggedItem = reorderedList[dragIdx];
    reorderedList.splice(dragIdx, 1);
    reorderedList.splice(hoverIdx, 0, draggedItem);

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;

    // Apply the order index mapping onto the master tasks state
    const updatedTasksMaster = tasks.map((task) => {
      const indexInReordered = reorderedList.findIndex((t) => t.id === task.id);
      if (indexInReordered !== -1) {
        return { ...task, orderIndex: indexInReordered };
      }
      return task;
    });

    setTasks(updatedTasksMaster);

    // Save ordering to DB
    try {
      const orderedIds = reorderedList.map((t) => t.id);
      await reorderTasksOnServer(orderedIds);
      showToast('Custom order saved');
    } catch (err) {
      showToast('Failed to save task order', 'error');
      // Revert from backend database
      loadTasks();
    }
  };

  // Filter, search, and sort calculation
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // Calendar selected date filter
    if (selectedCalendarDate) {
      result = result.filter((t) => t.dueDate === selectedCalendarDate);
    }

    // Sorting Modes
    if (sortMode === 'date-desc') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortMode === 'date-asc') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortMode === 'custom') {
      result.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }

    return result;
  }, [tasks, searchQuery, statusFilter, sortMode, selectedCalendarDate]);

  return (
    <div className="app-container">
      <header>
        <h1 className="app-title">TASK WORKSPACE</h1>
        <p className="app-subtitle">Organize your thoughts, prioritize what matters.</p>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Split Top Layout: Dashboard Stats on Left, Calendar on Right */}
        <div className="top-split-layout">
          <div className="left-panel">
            <Dashboard tasks={tasks} />
          </div>
          <div className="right-panel">
            <CalendarView 
              tasks={tasks}
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
            />
          </div>
        </div>

        {/* Task Creator Form */}
        <TaskForm onSubmit={handleAddTask} />

        {/* Search, Status Filtering and Sorting Bar */}
        <FilterPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortMode={sortMode}
          setSortMode={setSortMode}
        />

        {/* Loading and Error states */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading tasks...
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-danger)', padding: '16px', color: 'var(--accent-danger)' }}>
            {error}
            <button className="btn btn-secondary" onClick={loadTasks} style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.85rem' }}>
              Retry Connection
            </button>
          </div>
        ) : (
          /* Task List Rendering */
          <>
            {selectedCalendarDate && (
              <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>📅 Showing tasks due on <strong>{
                  (() => {
                    const [year, month, day] = selectedCalendarDate.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  })()
                }</strong></span>
                <button className="btn-text" onClick={() => setSelectedCalendarDate(null)} style={{ padding: '4px 8px', fontSize: '0.85rem', color: 'var(--accent-danger)' }}>
                  Clear Date Filter
                </button>
              </div>
            )}
            <div className="task-list">
              {processedTasks.length === 0 ? (
              <div className="glass-panel empty-state">
                <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                  <line x1="9" y1="11" x2="15" y2="11"></line>
                  <line x1="9" y1="18" x2="11" y2="18"></line>
                </svg>
                <h3>No tasks found</h3>
                <p>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filters.' 
                    : 'Get started by creating your first task above!'}
                </p>
              </div>
            ) : (
              processedTasks.map((task, idx) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={idx}
                  onToggle={handleToggleCompleted}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTaskConfirm}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  isDraggable={isDraggable}
                />
              ))
            )}

            {/* Visual indicator warning if dragging is disabled due to active filters */}
            {sortMode === 'custom' && !isDraggable && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                💡 Drag-and-drop sorting is disabled while active filters or search queries are applied.
              </div>
            )}
          </div>
          </>
        )}
      </main>

      {/* Focused Edit Modal */}
      {editingTask && (
        <TaskForm
          editingTask={editingTask}
          onSubmit={handleUpdateTaskDetails}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!deletingTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTaskId(null)}
      />

      {/* Toasts Feedback Center */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
