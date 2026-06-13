import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

    expect(screen.getByText('TASK WORKSPACE')).toBeInTheDocument();
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
    
    const totalCardVal = dashboard.querySelector('.stat-card:nth-child(1) .stat-value');
    expect(totalCardVal).toHaveTextContent('2');

    const activeCardVal = dashboard.querySelector('.stat-card:nth-child(2) .stat-value');
    expect(activeCardVal).toHaveTextContent('1');

    const completedCardVal = dashboard.querySelector('.stat-card:nth-child(3) .stat-value');
    expect(completedCardVal).toHaveTextContent('1');
  });

  it('renders calendar component and displays task color indicators', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Verify calendar is rendered
    const calendarView = screen.getByTestId('calendar-view');
    expect(calendarView).toBeInTheDocument();

    // Verify task day highlights in June 2026 (current month cells only)
    const activeDayCell = calendarView.querySelector('.current-month .day-active');
    expect(activeDayCell).toHaveTextContent('30');

    const completedDayCell = calendarView.querySelector('.current-month .day-completed');
    expect(completedDayCell).toHaveTextContent('10');
  });

  it('filters task list to selected calendar date on click through the action modal', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Click on day cell 30 (which has due date 2026-06-30)
    const calendarView = screen.getByTestId('calendar-view');
    const activeDayCell = calendarView.querySelector('.current-month .day-active');
    fireEvent.click(activeDayCell);

    // Verify modal is open
    expect(screen.getByTestId('calendar-action-modal')).toBeInTheDocument();

    // Click "Filter tasks for this day"
    const filterOption = screen.getByText('Filter tasks for this day');
    fireEvent.click(filterOption);

    // Verify task list is filtered (shows Buy Groceries, hides Submit Assignment)
    expect(screen.getByText('Buy Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Submit Assignment')).not.toBeInTheDocument();

    // Verify active filter header note appears
    expect(screen.getByText(/Showing tasks due on/)).toBeInTheDocument();

    // Click "Clear Date Filter" button
    const clearButton = screen.getByText('Clear Date Filter');
    fireEvent.click(clearButton);

    // Both tasks should show up again
    expect(screen.getByText('Buy Groceries')).toBeInTheDocument();
    expect(screen.getByText('Submit Assignment')).toBeInTheDocument();
  });

  it('allows adding a quick reminder from calendar action modal', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    api.createTask.mockResolvedValue({
      id: 'reminder-1',
      title: 'Call Mum',
      dueDate: '2026-06-30',
      type: 'reminder',
      completed: false,
      createdAt: '2026-06-13T12:00:00.000Z'
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const calendarView = screen.getByTestId('calendar-view');
    const activeDayCell = calendarView.querySelector('.current-month .day-active');
    fireEvent.click(activeDayCell);

    // Click "Add a quick Reminder"
    fireEvent.click(screen.getByText('Add a quick Reminder'));

    // Fill in reminder title
    const input = screen.getByLabelText('Reminder Title');
    fireEvent.change(input, { target: { value: 'Call Mum' } });

    // Submit reminder
    fireEvent.click(screen.getByText('Save Reminder'));

    // Assert API called correctly
    expect(api.createTask).toHaveBeenCalledWith({
      title: 'Call Mum',
      dueDate: '2026-06-30',
      type: 'reminder'
    });
  });

  it('allows setting a time-based alarm from calendar action modal', async () => {
    api.fetchTasks.mockResolvedValue(mockTasks);
    api.createTask.mockResolvedValue({
      id: 'alarm-1',
      title: 'Standup Meeting',
      dueDate: '2026-06-30',
      type: 'alarm',
      alarmTime: '09:00',
      completed: false,
      createdAt: '2026-06-13T12:00:00.000Z'
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const calendarView = screen.getByTestId('calendar-view');
    const activeDayCell = calendarView.querySelector('.current-month .day-active');
    fireEvent.click(activeDayCell);

    // Click "Set a time-based Alarm"
    fireEvent.click(screen.getByText('Set a time-based Alarm'));

    // Fill in title and time
    fireEvent.change(screen.getByLabelText('Alarm Title'), { target: { value: 'Standup Meeting' } });
    fireEvent.change(screen.getByLabelText('Alarm Time'), { target: { value: '09:00' } });

    // Submit alarm
    fireEvent.click(screen.getByText('Save Alarm'));

    // Assert API called correctly
    expect(api.createTask).toHaveBeenCalledWith({
      title: 'Standup Meeting',
      dueDate: '2026-06-30',
      type: 'alarm',
      alarmTime: '09:00'
    });
  });
});
