import React from 'react';

export default function FilterPanel({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  sortMode,
  setSortMode
}) {
  return (
    <div className="filter-bar" data-testid="filter-panel">
      {/* Search Input */}
      <div className="search-wrapper">
        <svg 
          className="search-icon" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* Status Filter Tabs */}
        <div className="filter-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={statusFilter === 'all'}
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={statusFilter === 'active'}
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            role="tab"
            aria-selected={statusFilter === 'completed'}
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
          <select
            className="sort-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px' }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="custom">Custom (Drag & Drop)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
