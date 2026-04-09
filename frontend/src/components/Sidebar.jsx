import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';

function Sidebar({ onSelectBook, onSelectVolume, onSelectChapter }) {
  const [view, setView] = useState('books'); // 'books' | 'volumes' | 'chapters'
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [volumes, setVolumes] = useState([]);
  const [currentVolume, setCurrentVolume] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('book');
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadVolumes = async (book) => {
    try {
      const res = await fetch(`/api/books/${book.id}`);
      const data = await res.json();
      setVolumes(data.volumes || []);
      setCurrentBook(data);
      setCurrentVolume(null);
      setChapters([]);
      setView('volumes');
      setMenuOpen(null);
      onSelectBook(data);
    } catch (error) {
      console.error('Failed to load volumes:', error);
    }
  };

  const loadChapters = async (volume) => {
    try {
      const res = await fetch(`/api/books/${currentBook.id}/volumes/${volume.id}`);
      const data = await res.json();
      setChapters(data.chapters || []);
      setCurrentVolume(data);
      setView('chapters');
      setMenuOpen(null);
      onSelectVolume(data);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    }
  };

  const handleBack = () => {
    if (view === 'chapters') {
      setView('volumes');
      setCurrentVolume(null);
      setChapters([]);
    } else if (view === 'volumes') {
      setView('books');
      setCurrentBook(null);
      setVolumes([]);
      onSelectBook(null);
    }
    setMenuOpen(null);
  };

  const openModal = (type) => {
    setModalType(type);
    setInputValue('');
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleSubmit = async () => {
    if (modalType !== 'delete' && modalType !== 'chapter' && !inputValue.trim()) return;

    try {
      if (modalType === 'book') {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: inputValue })
        });
        const newBook = await res.json();
        setBooks(prev => [newBook, ...prev]);
      } else if (modalType === 'volume') {
        await fetch(`/api/books/${currentBook.id}/volumes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: inputValue })
        });
        loadVolumes(currentBook);
      } else if (modalType === 'chapter') {
        await fetch(`/api/books/${currentBook.id}/volumes/${currentVolume.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: inputValue })
        });
        loadChapters(currentVolume);
      } else if (modalType === 'delete') {
        if (view === 'volumes') {
          await fetch(`/api/books/${currentBook.id}`, { method: 'DELETE' });
          handleBack();
          loadBooks();
        } else if (view === 'chapters') {
          await fetch(`/api/books/${currentBook.id}/volumes/${currentVolume.id}`, { method: 'DELETE' });
          loadVolumes(currentBook);
        }
      } else if (modalType === 'rename') {
        if (view === 'volumes') {
          await fetch(`/api/books/${currentBook.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: inputValue })
          });
          const res = await fetch(`/api/books/${currentBook.id}`);
          const updated = await res.json();
          setCurrentBook(updated);
          loadBooks();
        } else if (view === 'chapters') {
          await fetch(`/api/books/${currentBook.id}/volumes/${currentVolume.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: inputValue })
          });
          const res = await fetch(`/api/books/${currentBook.id}/volumes/${currentVolume.id}`);
          const updated = await res.json();
          setCurrentVolume(updated);
          loadVolumes(currentBook);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  const getModalTitle = () => {
    if (modalType === 'book') return '创建新书籍';
    if (modalType === 'volume') return '创建新卷';
    if (modalType === 'chapter') return '创建新章节';
    if (modalType === 'delete') return view === 'chapters' ? '确认删除卷' : '确认删除';
    if (modalType === 'rename') return view === 'chapters' ? '重命名卷' : '重命名书籍';
    return '';
  };

  const getModalPlaceholder = () => {
    if (modalType === 'book') return '请输入书名';
    if (modalType === 'volume') return '请输入卷名';
    if (modalType === 'chapter') return '请输入章节名';
    if (modalType === 'rename') return view === 'chapters' ? '请输入新卷名' : '请输入新书名';
    return '';
  };

  const getCurrentTitle = () => {
    if (view === 'books') return '书籍';
    if (view === 'volumes') return currentBook?.title;
    if (view === 'chapters') return currentVolume?.name;
    return '';
  };

  const getMenuTarget = () => {
    if (view === 'volumes') return 'book';
    if (view === 'chapters') return 'volume';
    return null;
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          {view !== 'books' && (
            <button className="back-btn" onClick={handleBack}>←</button>
          )}
          <h2 className="sidebar-title">{getCurrentTitle()}</h2>

          {getMenuTarget() && (
            <div className="more-menu" ref={menuRef}>
              <button
                className="more-btn"
                onClick={() => setMenuOpen(menuOpen ? null : getMenuTarget())}
              >
                ⋮
              </button>
              {menuOpen === getMenuTarget() && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => openModal('rename')}
                  >
                    重命名
                  </div>
                  <div
                    className="menu-item danger"
                    onClick={() => openModal('delete')}
                  >
                    删除
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="new-btn"
            onClick={() => {
              if (view === 'books') openModal('book');
              else if (view === 'volumes') openModal('volume');
              else if (view === 'chapters') openModal('chapter');
            }}
          >
            +
          </button>
        </div>

        {view === 'books' && (
          <div className="project-list">
            {books.length === 0 ? (
              <div className="empty-state">暂无书籍<br />点击"+"创建</div>
            ) : (
              books.map(book => (
                <div
                  key={book.id}
                  className="project-item"
                  onClick={() => loadVolumes(book)}
                >
                  <span className="project-title">{book.title}</span>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'volumes' && (
          <div className="project-list">
            {volumes.length === 0 ? (
              <div className="empty-state">暂无卷<br />点击"+"创建</div>
            ) : (
              volumes.map(volume => (
                <div
                  key={volume.id}
                  className="project-item"
                  onClick={() => loadChapters(volume)}
                >
                  <span className="project-title">📖 {volume.name}</span>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'chapters' && (
          <div className="project-list">
            {chapters.length === 0 ? (
              <div className="empty-state">暂无章节<br />点击"+"创建</div>
            ) : (
              chapters.map(chapter => (
                <div
                  key={chapter.id}
                  className="project-item"
                  onClick={() => onSelectChapter(chapter)}
                >
                  <span className="project-title">📄 {chapter.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </aside>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{getModalTitle()}</h3>

            {modalType === 'delete' ? (
              <div className="delete-confirm">
                <p>
                  {view === 'chapters'
                    ? `确定要删除卷「${currentVolume?.name}」吗？`
                    : `确定要删除书籍「${currentBook?.title}」吗？`}
                </p>
                <p className="warning">此操作不可恢复！</p>
              </div>
            ) : (
              <input
                type="text"
                placeholder={getModalPlaceholder()}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                  else if (e.key === 'Escape') setShowModal(false);
                }}
                autoFocus
              />
            )}

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>取消</button>
              <button
                className={`confirm-btn ${modalType === 'delete' ? 'danger' : ''}`}
                onClick={handleSubmit}
              >
                {modalType === 'delete' ? '删除' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
