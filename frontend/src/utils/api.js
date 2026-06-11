const API_BASE = 'http://localhost:5000/api/tasks';

export async function fetchTasks() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(taskData) {
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
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task');
  }
  return response.json();
}
