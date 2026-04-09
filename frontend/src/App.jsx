import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SkillPanel from './components/SkillPanel';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' | 'skills'
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        onNewProject={() => setCurrentProject({ id: null, title: '新项目' })}
      />
      <main className="main-content">
        <header className="top-bar">
          <h1>AI Author</h1>
          <div className="view-toggle">
            <button
              className={currentView === 'chat' ? 'active' : ''}
              onClick={() => setCurrentView('chat')}
            >
              对话
            </button>
            <button
              className={currentView === 'skills' ? 'active' : ''}
              onClick={() => setCurrentView('skills')}
            >
              Skills
            </button>
          </div>
        </header>
        {currentView === 'chat' ? (
          <ChatArea project={currentProject} onSaveProject={setCurrentProject} />
        ) : (
          <SkillPanel onUseSkill={(skill) => console.log('Use skill:', skill)} />
        )}
      </main>
    </div>
  );
}

export default App;
