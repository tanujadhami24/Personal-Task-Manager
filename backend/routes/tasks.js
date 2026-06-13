const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to generate a simple unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// GET /api/tasks - Retrieve all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await db.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, type, alarmTime } = req.body;

    // Server-side validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Validate task type if provided
    const validTypes = ['task', 'reminder', 'alarm'];
    const taskType = type || 'task';
    if (!validTypes.includes(taskType)) {
      return res.status(400).json({ error: 'Invalid task type. Must be task, reminder, or alarm.' });
    }

    // Validate alarmTime if alarm type
    if (taskType === 'alarm' && alarmTime) {
      if (!/^\d{2}:\d{2}$/.test(alarmTime)) {
        return res.status(400).json({ error: 'Alarm time must be in HH:MM format.' });
      }
    }

    const tasks = await db.getTasks();
    
    // Create new task object
    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      dueDate: dueDate || null,
      type: taskType,
      alarmTime: alarmTime || null,
      createdAt: new Date().toISOString(),
      orderIndex: tasks.length // Append at the end of custom order list
    };

    tasks.push(newTask);
    await db.saveTasks(tasks);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/reorder - Bulk update task ordering (drag and drop)
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of task IDs' });
    }

    const tasks = await db.getTasks();
    
    // Update orderIndex based on the array position
    const updatedTasks = tasks.map(task => {
      const index = orderedIds.indexOf(task.id);
      if (index !== -1) {
        return { ...task, orderIndex: index };
      }
      return task;
    });

    await db.saveTasks(updatedTasks);
    res.json({ message: 'Tasks reordered successfully', tasks: updatedTasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// PUT /api/tasks/:id - Update specific fields of a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate, orderIndex, type, alarmTime } = req.body;

    const tasks = await db.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existingTask = tasks[taskIndex];

    // Validate if title is updated
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Task title cannot be empty' });
      }
      existingTask.title = title.trim();
    }

    if (description !== undefined) {
      existingTask.description = description !== null ? description.trim() : '';
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean value' });
      }
      existingTask.completed = completed;
    }

    if (dueDate !== undefined) {
      existingTask.dueDate = dueDate || null;
    }

    if (orderIndex !== undefined) {
      if (typeof orderIndex !== 'number') {
        return res.status(400).json({ error: 'orderIndex must be a number' });
      }
      existingTask.orderIndex = orderIndex;
    }

    if (type !== undefined) {
      const validTypes = ['task', 'reminder', 'alarm'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid task type. Must be task, reminder, or alarm.' });
      }
      existingTask.type = type;
    }

    if (alarmTime !== undefined) {
      if (alarmTime && !/^\d{2}:\d{2}$/.test(alarmTime)) {
        return res.status(400).json({ error: 'Alarm time must be in HH:MM format.' });
      }
      existingTask.alarmTime = alarmTime || null;
    }

    tasks[taskIndex] = existingTask;
    await db.saveTasks(tasks);

    res.json(existingTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await db.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    // Re-index remaining tasks to maintain clean orderIndex
    const remainingTasks = tasks.map((t, idx) => ({ ...t, orderIndex: idx }));

    await db.saveTasks(remainingTasks);
    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
