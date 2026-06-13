const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/tasks`
  : 'http://localhost:5000/api/tasks';

// Check if we should run in serverless mode (e.g., when hosted on GitHub Pages)
const IS_SERVERLESS = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const STORAGE_KEY = 'personal_tasks_data';

// Helper for LocalStorage operations
function getLocalTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ==========================================
// HYBRID API SERVICE EXPORTS
// ==========================================

export async function fetchTasks() {
  if (IS_SERVERLESS) {
    return getLocalTasks();
  }

  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(taskData) {
  if (IS_SERVERLESS) {
    const tasks = getLocalTasks();
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description || '',
      completed: false,
      dueDate: taskData.dueDate || null,
      type: taskData.type || 'task',
      alarmTime: taskData.alarmTime || null,
      createdAt: new Date().toISOString(),
      orderIndex: tasks.length
    };
    tasks.push(newTask);
    saveLocalTasks(tasks);
    return newTask;
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create task');
  }
  return response.json();
}

export async function updateTask(id, updates) {
  if (IS_SERVERLESS) {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks[index] = {
      ...tasks[index],
      ...updates
    };
    saveLocalTasks(tasks);
    return tasks[index];
  }

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task');
  }
  return response.json();
}

export async function reorderTasksOnServer(orderedIds) {
  if (IS_SERVERLESS) {
    const tasks = getLocalTasks();
    const updatedTasks = tasks.map(task => {
      const newIdx = orderedIds.indexOf(task.id);
      return {
        ...task,
        orderIndex: newIdx !== -1 ? newIdx : task.orderIndex
      };
    });
    updatedTasks.sort((a, b) => a.orderIndex - b.orderIndex);
    saveLocalTasks(updatedTasks);
    return { success: true };
  }

  const response = await fetch(`${API_BASE}/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderedIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to save task order');
  }
  return response.json();
}

export async function deleteTask(id) {
  if (IS_SERVERLESS) {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(index, 1);
    tasks.forEach((task, idx) => {
      task.orderIndex = idx;
    });
    saveLocalTasks(tasks);
    return { success: true, message: 'Task deleted successfully' };
  }

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task');
  }
  return response.json();
}
