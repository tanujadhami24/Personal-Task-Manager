import React from 'react';

export default function Dashboard({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="glass-panel dashboard-grid" data-testid="dashboard">
      <div className="stat-card">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Total Vibes</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{active}</div>
        <div className="stat-label">Hustling ⚡</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{completed}</div>
        <div className="stat-label">Slayed 💅</div>
      </div>
      
      <div className="progress-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Slay Rate</span>
          <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{percentage}%</span>
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
