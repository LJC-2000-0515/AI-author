import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import BackgroundPanel from './components/BackgroundPanel';
import ChapterEditor from './components/ChapterEditor';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentVolume, setCurrentVolume] = useState(null);

  return (
    <div className="app">
      <Sidebar
        currentBook={currentBook}
        currentVolume={currentVolume}
        onSelectBook={setCurrentBook}
        onSelectVolume={setCurrentVolume}
        onSelectChapter={(chapter) => {
          setSelectedChapter(chapter);
          if (chapter) setCurrentView('edit');
        }}
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
              className={currentView === 'background' ? 'active' : ''}
              onClick={() => setCurrentView('background')}
            >
              背景
            </button>
            <button
              className={currentView === 'edit' ? 'active' : ''}
              onClick={() => setCurrentView('edit')}
            >
              编辑
            </button>
          </div>
        </header>
        {currentView === 'chat' ? (
          <ChatArea book={currentBook} />
        ) : currentView === 'background' ? (
          <BackgroundPanel book={currentBook} />
        ) : (
          <ChapterEditor
            chapter={selectedChapter}
            bookId={currentBook?.id}
            volumeId={currentVolume?.id}
          />
        )}
      </main>
    </div>
  );
}

export default App;
