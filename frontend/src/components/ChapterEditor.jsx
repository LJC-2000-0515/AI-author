import React, { useState, useEffect } from 'react';
import './ChapterEditor.css';

function ChapterEditor({ chapter, bookId, volumeId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (chapter && bookId && volumeId) {
      loadChapter();
    }
  }, [chapter, bookId, volumeId]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/volumes/${volumeId}/chapters/${chapter.filename}`);
      const data = await res.json();
      setContent(data.content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChapter = async () => {
    setSaving(true);
    try {
      await fetch(`/api/books/${bookId}/volumes/${volumeId}/chapters/${chapter.filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save chapter:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveChapter();
    }
  };

  if (!chapter) {
    return (
      <div className="editor-empty">
        <p>请从左侧选择一个章节</p>
      </div>
    );
  }

  return (
    <div className="chapter-editor">
      <div className="editor-header">
        <h3>{chapter.name}</h3>
        <div className="editor-actions">
          {lastSaved && (
            <span className="last-saved">
              已保存 {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            className="save-btn"
            onClick={saveChapter}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
      <div className="editor-content">
        {loading ? (
          <div className="editor-loading">加载中...</div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="开始写作..."
          />
        )}
      </div>
    </div>
  );
}

export default ChapterEditor;
