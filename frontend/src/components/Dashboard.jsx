import React from 'react';

export default function Dashboard({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="glass-panel dashboard-grid" data-testid="dashboard">
      <div className="stat-card">
        <div className="stat-label">Total</div>
        <div className="stat-value">{total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{active}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Completed</div>
        <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{completed}</div>
      </div>
      
      <div className="progress-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Completion Rate</span>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </div>
  );
}
