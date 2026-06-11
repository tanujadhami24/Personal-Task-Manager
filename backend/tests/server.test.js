const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../server');
const db = require('../db');

const TEST_DB_PATH = path.join(__dirname, '..', 'tasks-test-db.json');

describe('Tasks API Endpoints', () => {
  // Set test environment and ensure clean database before starting
  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  });

  // Clean up database file after all tests finish
  afterAll(async () => {
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (err) {
      // Ignore
    }
  });

  describe('GET /api/tasks', () => {
    it('should return an empty list when no tasks exist', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should retrieve existing tasks', async () => {
      // Setup mock data directly in DB
      const mockTasks = [
        { id: '1', title: 'Task 1', completed: false, createdAt: new Date().toISOString() }
      ];
      await db.saveTasks(mockTasks);

      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Task 1');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully with correct fields', async () => {
      const newTaskPayload = {
        title: 'Learn Jest testing',
        description: 'Practice writing integration tests for backend APIs',
        dueDate: '2026-06-30'
      };

      const res = await request(app)
        .post('/api/tasks')
        .send(newTaskPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(newTaskPayload.title);
      expect(res.body.description).toBe(newTaskPayload.description);
      expect(res.body.dueDate).toBe(newTaskPayload.dueDate);
      expect(res.body.completed).toBe(false);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body.orderIndex).toBe(0);

      // Verify task is written to DB
      const dbTasks = await db.getTasks();
      expect(dbTasks.length).toBe(1);
      expect(dbTasks[0].title).toBe(newTaskPayload.title);
    });

    it('should return 400 Bad Request if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title here' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Task title is required');
    });

    it('should return 400 Bad Request if title is empty string or whitespace', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Task title is required');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task details successfully', async () => {
      const initialTask = {
        id: 'update-test',
        title: 'Initial Title',
        description: 'Old Description',
        completed: false,
        dueDate: '2026-06-12',
        createdAt: new Date().toISOString(),
        orderIndex: 0
      };
      await db.saveTasks([initialTask]);

      const updates = {
        title: 'Updated Title',
        description: 'New Description',
        completed: true,
        dueDate: '2026-06-15'
      };

      const res = await request(app)
        .put('/api/tasks/update-test')
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updates.title);
      expect(res.body.description).toBe(updates.description);
      expect(res.body.completed).toBe(true);
      expect(res.body.dueDate).toBe(updates.dueDate);

      const dbTasks = await db.getTasks();
      expect(dbTasks[0].completed).toBe(true);
    });

    it('should return 404 if task ID does not exist', async () => {
      const res = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'New Title' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('PUT /api/tasks/reorder', () => {
    it('should successfully bulk update task order indices', async () => {
      const mockTasks = [
        { id: 'task-a', title: 'Task A', orderIndex: 0 },
        { id: 'task-b', title: 'Task B', orderIndex: 1 },
        { id: 'task-c', title: 'Task C', orderIndex: 2 }
      ];
      await db.saveTasks(mockTasks);

      const reorderPayload = {
        orderedIds: ['task-c', 'task-a', 'task-b']
      };

      const res = await request(app)
        .put('/api/tasks/reorder')
        .send(reorderPayload);

      expect(res.status).toBe(200);
      
      const dbTasks = await db.getTasks();
      const taskA = dbTasks.find(t => t.id === 'task-a');
      const taskB = dbTasks.find(t => t.id === 'task-b');
      const taskC = dbTasks.find(t => t.id === 'task-c');

      expect(taskC.orderIndex).toBe(0);
      expect(taskA.orderIndex).toBe(1);
      expect(taskB.orderIndex).toBe(2);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully and re-index remainder orderIndex values', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', orderIndex: 0 },
        { id: 'task-2', title: 'Task 2', orderIndex: 1 },
        { id: 'task-3', title: 'Task 3', orderIndex: 2 }
      ];
      await db.saveTasks(mockTasks);

      const res = await request(app).delete('/api/tasks/task-2');
      expect(res.status).toBe(200);
      expect(res.body.task.id).toBe('task-2');

      const dbTasks = await db.getTasks();
      expect(dbTasks.length).toBe(2);
      expect(dbTasks.map(t => t.id)).toEqual(['task-1', 'task-3']);
      expect(dbTasks.find(t => t.id === 'task-1').orderIndex).toBe(0);
      expect(dbTasks.find(t => t.id === 'task-3').orderIndex).toBe(1);
    });

    it('should return 404 if task ID does not exist', async () => {
      const res = await request(app).delete('/api/tasks/invalid-id');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Task not found');
    });
  });
});
