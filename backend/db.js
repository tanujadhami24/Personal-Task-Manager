const fs = require('fs').promises;
const path = require('path');

const DB_PATH = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, 'tasks-test-db.json')
  : path.join(__dirname, 'tasks-db.json');

// Helper to ensure database file exists
async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(DB_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

// Get all tasks
async function getTasks() {
  await ensureDb();
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks DB:', error);
    return [];
  }
}

// Save all tasks
async function saveTasks(tasks) {
  await ensureDb();
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving tasks DB:', error);
    throw error;
  }
}

module.exports = {
  getTasks,
  saveTasks
};
