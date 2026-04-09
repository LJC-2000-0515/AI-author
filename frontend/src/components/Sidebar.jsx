import React from 'react';
import './Sidebar.css';

function Sidebar({ projects, currentProject, onSelectProject, onNewProject }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>项目</h2>
        <button className="new-btn" onClick={onNewProject}>+ 新建</button>
      </div>
      <div className="project-list">
        {projects.length === 0 ? (
          <div className="empty-state">暂无项目</div>
        ) : (
          projects.map(p => (
            <div
              key={p.id}
              className={`project-item ${currentProject?.id === p.id ? 'active' : ''}`}
              onClick={() => onSelectProject(p)}
            >
              <span className="project-title">{p.title}</span>
              <span className="project-date">{p.updatedAt?.slice(0, 10)}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
