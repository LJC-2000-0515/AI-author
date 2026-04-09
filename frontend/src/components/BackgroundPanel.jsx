import React, { useState, useEffect } from 'react';
import './BackgroundPanel.css';

function BackgroundPanel({ book }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (book) {
      loadModules();
    }
  }, [book]);

  useEffect(() => {
    if (selectedModule && book) {
      loadModuleContent(selectedModule.id);
    }
  }, [selectedModule, book]);

  const loadModules = async () => {
    try {
      const res = await fetch(`/api/books/${book.id}/background`);
      const data = await res.json();
      setModules(data);
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  };

  const loadModuleContent = async (moduleId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${book.id}/background/${moduleId}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        setContent('');
      }
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to load module:', error);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const saveModule = async () => {
    setSaving(true);
    try {
      await fetch(`/api/books/${book.id}/background/${selectedModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save module:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveModule();
    }
  };

  if (!book) {
    return (
      <div className="background-empty">
        <p>请先选择一本书籍</p>
      </div>
    );
  }

  return (
    <div className="background-panel">
      <div className="background-sidebar">
        <h3>{book.title}</h3>
        <div className="module-list">
          {modules.map(module => (
            <div
              key={module.id}
              className={`module-item ${selectedModule?.id === module.id ? 'active' : ''}`}
              onClick={() => setSelectedModule(module)}
            >
              <span className="module-icon">
                {module.id === '世界观' && '🌍'}
                {module.id === '人物' && '👤'}
                {module.id === '设定' && '⚙️'}
                {module.id === '大纲' && '📋'}
              </span>
              <span className="module-name">{module.id}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="background-content">
        {selectedModule ? (
          <>
            <div className="content-header">
              <h3>{selectedModule.id}</h3>
              <div className="content-actions">
                {lastSaved && (
                  <span className="last-saved">
                    已保存 {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <button
                  className="save-btn"
                  onClick={saveModule}
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
            <div className="content-body">
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`请输入${selectedModule.id}内容...`}
                />
              )}
            </div>
          </>
        ) : (
          <div className="no-selection">
            <p>请从左侧选择一个模块</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackgroundPanel;
