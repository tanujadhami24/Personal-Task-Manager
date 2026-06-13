# Personal Task Workspace

This project is a premium full-stack task management application implementing the **Personal Task Manager / Todo App** exercise. Designed to provide a highly interactive, responsive, and robust user experience, it features persistent storage, custom dark-mode glassmorphism styling, native HTML5 drag-and-drop custom ordering, due-date overdue tracking, calendar date actions, time-based beep alarms, and a comprehensive automated testing suite.

---

## 🔗 Live Demo Links

- **Deployment Link**: Not currently hosted online. Please follow the instructions below to run the full stack locally.

---

## 🛠️ Tech Stack

The following technologies were selected for their simplicity, responsiveness, and portability:

- **Frontend (React 19 & Vite)**:
  - *React* was chosen to build dynamic, state-driven interactive components (like the calendar dropdowns, real-time list filtering, and drag handles).
  - *Vite* is used as a fast, light-weight build tool and development server.
  - *Vanilla CSS* provides custom responsive layouts, mesh gradients, glassmorphic elements, and micro-animations with zero build tools or configuration complexity.
- **Backend (Node.js & Express)**:
  - *Express* provides a clean, lightweight router to handle backend REST APIs for CRUD operations and reordering.
- **Data Persistence (Local JSON File)**:
  - A local JSON file (`backend/tasks-db.json`) is used for data persistence. This ensures the app runs out-of-the-box on any machine without requiring SQLite binary build compilers (which frequently fail on Windows developer environments) or external database servers.
- **Testing (Jest, Supertest, Vitest, React Testing Library)**:
  - *Jest + Supertest* are used for API integration testing, and *Vitest + RTL* are used for fast frontend component unit tests.

---

## 🚀 How to Run Locally

Follow these exact steps to run the application locally. Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### 1. Install All Dependencies
From the root directory of the project, run:
```bash
npm install && npm run install-all
```
*This command installs the root helper orchestration tools (like `concurrently`) and recursively installs all node modules for both the `backend` and `frontend` subprojects.*

### 2. Run the Application
Start the frontend dev server and the backend API server concurrently:
```bash
npm run dev
```
- **Frontend** will be hosted on: `http://localhost:5173/`
- **Backend** will run on: `http://localhost:5000/`

### 3. Run the Automated Tests
Run all backend integration tests and frontend component tests:
```bash
npm run test
```

---

## 📖 API Documentation

The backend API server runs on port `5000` and exposes the following endpoints:

### 1. Retrieve Tasks
- **Method**: `GET`
- **Path**: `/api/tasks`
- **Request Body**: None
- **Response Shape**:
  ```json
  [
    {
      "id": "task-1",
      "title": "Buy Groceries",
      "description": "Milk and Eggs",
      "completed": false,
      "dueDate": "2026-06-30",
      "type": "task",
      "alarmTime": null,
      "createdAt": "2026-06-13T12:00:00.000Z",
      "orderIndex": 0
    }
  ]
  ```

### 2. Create Task
- **Method**: `POST`
- **Path**: `/api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Submit Assignment",
    "description": "Math assignment",
    "dueDate": "2026-06-15",
    "type": "alarm",
    "alarmTime": "15:30"
  }
  ```
- **Response Shape**:
  ```json
  {
    "id": "task-2",
    "title": "Submit Assignment",
    "description": "Math assignment",
    "completed": false,
    "dueDate": "2026-06-15",
    "type": "alarm",
    "alarmTime": "15:30",
    "createdAt": "2026-06-13T13:20:00.000Z",
    "orderIndex": 1
  }
  ```

### 3. Update Task
- **Method**: `PUT`
- **Path**: `/api/tasks/:id`
- **Request Body**:
  ```json
  {
    "title": "Submit Assignment (Updated)",
    "description": "Calculus module",
    "completed": true,
    "dueDate": "2026-06-16",
    "type": "task",
    "alarmTime": null
  }
  ```
- **Response Shape**:
  ```json
  {
    "id": "task-2",
    "title": "Submit Assignment (Updated)",
    "description": "Calculus module",
    "completed": true,
    "dueDate": "2026-06-16",
    "type": "task",
    "alarmTime": null,
    "createdAt": "2026-06-13T13:20:00.000Z",
    "orderIndex": 1
  }
  ```

### 4. Bulk Reorder Tasks
- **Method**: `PUT`
- **Path**: `/api/tasks/reorder`
- **Request Body**:
  ```json
  {
    "taskIds": ["task-2", "task-1"]
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true
  }
  ```

### 5. Delete Task
- **Method**: `DELETE`
- **Path**: `/api/tasks/:id`
- **Request Body**: None
- **Response Shape**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

---

## 📂 Project Structure

This monorepo separates backend servers and frontend assets:

```text
personal-task-manager/
├── backend/
│   ├── routes/
│   │   └── tasks.js          # REST API endpoints for tasks
│   ├── tests/
│   │   └── server.test.js    # Integration tests using Jest & Supertest
│   ├── db.js                 # Local file JSON database helper
│   ├── server.js             # Express app & server initialization
│   ├── tasks-db.json         # Persistent JSON database store
│   └── package.json          # Backend npm package manifest
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── CalendarDayActionModal.jsx  # Day-click action menu modal
│   │   │   ├── CalendarView.jsx            # Month-based planner calendar grid
│   │   │   ├── ConfirmationModal.jsx       # Modal replacing browser confirm()
│   │   │   ├── Dashboard.jsx               # Stats counters and completion bar
│   │   │   ├── FilterPanel.jsx             # Search, sort, and filter buttons
│   │   │   ├── TaskForm.jsx                # Form creating and editing tasks
│   │   │   └── TaskItem.jsx                # Individual task item card layout
│   │   ├── utils/
│   │   │   └── api.js        # API service function utilities
│   │   ├── App.jsx           # Main React component, state orchestration
│   │   ├── App.css           # App general UI overrides
│   │   ├── index.css         # Color schemes, global variables, class system
│   │   └── main.jsx          # React mount bootstrap file
│   ├── tests/
│   │   └── App.test.jsx      # Frontend Vitest suite
│   ├── index.html            # Main SPA mount template
│   └── package.json          # Frontend npm package manifest
├── package.json              # Monorepo root package script runner
└── README.md                 # Project documentation (this file)
```

---

## 🔮 Next Steps

### What was left out (Limitations)
1. **Multi-User Partitioning**: Tasks are global. There is no user signup, login sessions, or private lists.
2. **Concurrent Database Writes**: The JSON storage acts as a local single-user document. Under concurrent writes by multiple users, file locks would raise merge conflicts.
3. **Animated List Transitions**: Reordering works instantly, but cards do not slide smoothly with custom drag animations (e.g. using `framer-motion` or `dnd-kit`).

### Future Improvements
1. **JWT User Authentication**: Implement signup/login forms and isolate task lists in the database per user ID.
2. **Database Upgrade**: Swap the local JSON file database with MongoDB or SQLite for production deployments.
3. **Advanced Categorization**: Let users assign color-coded labels (e.g., `Work`, `Personal`, `Fitness`) to filter task view feeds easily.
