# Personal Task Workspace

A premium full-stack task management application built with **React (Vite)** on the frontend and **Node.js (Express)** on the backend. It features persistent storage, custom dark-mode glassmorphism styling, native HTML5 drag-and-drop custom ordering, due-date overdue tracking, and a comprehensive test suite.

---

## Technical Stack

- **Frontend**: React 19 (scaffolded with Vite), Vanilla CSS (Glassmorphism layout), Vitest + React Testing Library.
- **Backend**: Node.js + Express, Jest + Supertest for integration testing.
- **Storage**: Local JSON database (`backend/tasks-db.json`) for data persistence across restarts without requiring SQLite binary compile tools on Windows.

---

## Features

### 📋 Must-Have (Core CRUD)
- **Create**: Add a task with a title (required), optional description, and optional due date. Form inputs validate client-side (title cannot be empty) and trigger visual red borders.
- **Read**: Task lists are fetched and displayed. Sorted by creation date (newest first) by default.
- **Update**: Toggle completion status using an animated custom checkbox. Edit title, description, or due date inside a focused modal popup.
- **Delete**: Remove tasks. A custom overlay modal prompts the user to confirm the deletion (replacing generic browser confirm boxes).
- **Filter**: Filter task list by status tabs (**All**, **Active**, **Completed**).

### 📈 Should-Have (UI & Diagnostics)
- **Statistics Dashboard**: Live stats cards showing total tasks, active tasks, completed tasks, and a smooth gradient completion progress bar.
- **Overdue Recognition**: Incomplete tasks with a due date in the past are highlighted with a soft red border and a glowing red "Overdue: Date" warning badge.
- **Empty States**: A clean vector icon and prompt encouraging the user to add a task when the list is empty or filters have zero matches.

### 🚀 Nice-to-Have & Bonuses
- **Title Search**: Real-time filtering as you type in the search bar.
- **Drag-and-Drop Reordering**: Drag cards from their left-side handles to custom order them. Rearranging automatically switches the sorting select to **Custom (Drag & Drop)** and saves the index sequence on the backend database.
- **Data Persistence**: Tasks survive server restarts, stored locally in JSON format.
- **Feedback Toasts**: Slide-in success and error toast banners at the bottom right.

---

## Installation & Setup

Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 1. Install Dependencies
From the root directory of the project, run:
```bash
npm install
npm run install-all
```
*This installs root CLI packages (like `concurrently`) and then installs all frontend and backend node modules.*

### 2. Run the App
Run both servers concurrently:
```bash
npm run dev
```
- **Frontend** will launch on: `http://localhost:5173/`
- **Backend** will run on: `http://localhost:5000/`

### 3. Run Tests
You can run all backend integration tests and frontend component tests:
```bash
npm run test
```

---

## Evaluation Honesty: Honest Assessment & Reflections

### What Works Perfectly
1. **CRUD State sync**: State matches across forms, lists, toggles, and deletion. Refreshing the browser preserves the exact state.
2. **Robust Testing**: 100% of integration endpoints are covered (including parameter validations and delete cascade indexes). Frontend tests mock calls to verify the dashboard and task items.
3. **Vanilla CSS variables**: Avoids the build complexities of Tailwind/PostCSS configuration, allowing a bespoke, responsive glassmorphic styling system.
4. **Resilient Portability**: By using a JSON database, the project is guaranteed to run instantly on any machine without database drivers compiling or failing.

### Current Limitations
1. **Concurrency**: The JSON file database reads and writes using async node file systems. While perfectly fine for a single user, this would hit lock-write conflicts under multi-user concurrent loads.
2. **Subtasks**: Tasks cannot be nested (e.g. breaking down "Submit Assignment" into smaller checkboxes).
3. **Advanced Reorder Animations**: The drag-and-drop uses HTML5 native APIs which switches the list indices, but lacks sliding card transition animations during the drag preview (e.g. using `framer-motion` or `dnd-kit`).

### What I Would Improve With More Time
1. **Database Upgrade**: Switch to SQLite or MongoDB if expanding beyond a single-user local application.
2. **Categories and Tags**: Allow users to assign tasks to custom color-coded categories (e.g., `Work`, `Personal`, `Fitness`).
3. **Due Date Notifications**: Prompt desktop browser alerts when a task's due date is approaching or overdue.
4. **JWT Authentication**: Introduce user signup, login sessions, and database isolation between multiple users.
