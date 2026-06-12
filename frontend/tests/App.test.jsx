import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import App from '../src/App';
import * as api from '../src/utils/api';

// Mock the API utilities
vi.mock('../src/utils/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  reorderTasksOnServer: vi.fn()
}));

const mockTasks = [
  {
    id: 'task-1',
    title: 'Buy Groceries',
    description: 'Milk and Eggs',
    completed: false,
    dueDate: '2026-06-30',
    createdAt: '2026-06-11T12:00:00.000Z',
    orderIndex: 0
  },
  {
    id: 'task-2',
    title: 'Submit Assignment',
    description: 'Math assignment',
    completed: true,
    dueDate: '2026-06-10',
    createdAt: '2026-06-10T12:00:00.000Z',
    orderIndex: 1
  }
];

describe('App React Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders application header title and subtitle', async () => {
    api.fetchTasks.mockResolvedValue([]);
    render(<App />);

    expect(screen.getByText('Task Workspace')).toBeInTheDocument();
    expect(screen.getByText(/Organize your thoughts/)).toBeInTheDocument();
  });

  it('displays the loading state initially', async () => {
    // Return a unresolved promise to keep loading state visible
    api.fetchTasks.mockReturnValue(new Promise(() => {}));
    render(<App />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('shows empty state when no tasks are returned', async () => {
    api.fetchTasks.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText(/Get started by creating your first task/)).toBeInTheDocument();
  });

  it('renders task list and updates the stats dashboard', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    render(<App />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Verify task titles are rendered
    expect(screen.getByText('Buy Groceries')).toBeInTheDocument();
    expect(screen.getByText('Submit Assignment')).toBeInTheDocument();

    // Verify stats in dashboard: Total = 2, Active = 1, Completed = 1
    const dashboard = screen.getByTestId('dashboard');
    expect(dashboard).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total value
    // Both Active and Completed counts are '1', so there should be two elements with text '1'
    const onesList = screen.getAllByText('1');
    expect(onesList.length).toBe(2);
  });

  it('toggles to calendar view when the calendar tab is clicked', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Toggle to calendar view
    const calendarTab = screen.getByText('Calendar View');
    fireEvent.click(calendarTab);

    // Verify calendar container is rendered
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });
});
