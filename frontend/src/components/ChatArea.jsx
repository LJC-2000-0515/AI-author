import React, { useState, useRef, useEffect } from 'react';
import './ChatArea.css';

const SKILLS = [
  { id: 'none', name: '不使用技能' },
  { id: 'generateChapter', name: '生成章节' },
  { id: 'continueWriting', name: '续写章节' }
];

function ChatArea({ book }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('none');
  const [skillParams, setSkillParams] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSkillChange = async (skillId) => {
    setSelectedSkill(skillId);
    if (skillId === 'none') {
      setSkillParams({});
      return;
    }

    // 获取技能参数信息
    try {
      const res = await fetch('/api/skills');
      const skills = await res.json();
      const skill = skills.find(s => s.name === skillId);
      if (skill) {
        setSkillParams(skill.parameters || {});
      }
    } catch (error) {
      console.error('Failed to load skill:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let payload = { messages: [...messages, userMessage] };

      if (selectedSkill !== 'none') {
        // 根据 skill 类型构造参数
        let skillParams = {};
        if (selectedSkill === 'generateChapter') {
          skillParams = { outline: input, genre: '玄幻', style: '流畅' };
        } else if (selectedSkill === 'continueWriting') {
          skillParams = { content: input, style: '流畅' };
        }

        // 调用 skill 接口获取 prompt
        const skillRes = await fetch(`/api/skills/${selectedSkill}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skillParams)
        });
        const skillData = await skillRes.json();

        // 用 skill 生成的 prompt 调用 chat
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: skillData.prompt }]
          })
        });
        const data = await chatRes.json();

        const assistantMessage = {
          role: 'assistant',
          content: data.choices?.[0]?.message?.content || '暂无响应'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // 直接调用 chat
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.choices?.[0]?.message?.content || '暂无响应'
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '错误: ' + error.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-area">
      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>欢迎使用 AI Author</h2>
            <p>开始你的网文创作之旅</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <pre>{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <span className="typing">思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <div className="skill-selector">
          <select
            value={selectedSkill}
            onChange={(e) => handleSkillChange(e.target.value)}
            className="skill-dropdown"
          >
            {SKILLS.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-row">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedSkill !== 'none' ? '描述章节大纲或粘贴现有内容...' : '输入你的问题...'}
            rows={3}
          />
          <button
            className={input.trim() ? 'active' : ''}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
