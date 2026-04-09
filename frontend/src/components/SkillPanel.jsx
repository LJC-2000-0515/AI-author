import React, { useState, useEffect } from 'react';
import './SkillPanel.css';

const BUILT_IN_SKILLS = [
  { name: 'character', description: '生成网文角色设定', params: ['genre', 'roleType'] },
  { name: 'plotOutline', description: '生成小说剧情大纲', params: ['genre', 'theme', 'chapters'] },
  { name: 'polish', description: '润色网文内容', params: ['content', 'style'] }
];

function SkillPanel({ onUseSkill }) {
  const [skills, setSkills] = useState(BUILT_IN_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [formData, setFormData] = useState({});

  const handleUseSkill = async () => {
    if (!selectedSkill) return;

    try {
      const response = await fetch(`/api/skills/${selectedSkill.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Skill result:', data);
      alert('Skill 已执行，请在控制台查看结果');
    } catch (error) {
      console.error('Error using skill:', error);
    }
  };

  return (
    <div className="skill-panel">
      <div className="skill-list">
        <h3>可用 Skills</h3>
        {skills.map(skill => (
          <div
            key={skill.name}
            className={`skill-item ${selectedSkill?.name === skill.name ? 'active' : ''}`}
            onClick={() => setSelectedSkill(skill)}
          >
            <span className="skill-name">{skill.name}</span>
            <span className="skill-desc">{skill.description}</span>
          </div>
        ))}
      </div>
      <div className="skill-config">
        {selectedSkill ? (
          <>
            <h3>配置 {selectedSkill.name}</h3>
            {selectedSkill.params.map(param => (
              <div key={param} className="form-group">
                <label>{param}</label>
                <input
                  type="text"
                  placeholder={`输入 ${param}`}
                  onChange={e => setFormData(prev => ({ ...prev, [param]: e.target.value }))}
                />
              </div>
            ))}
            <button className="run-btn" onClick={handleUseSkill}>
              执行 Skill
            </button>
          </>
        ) : (
          <div className="no-selection">
            <p>选择一个 Skill 开始</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillPanel;
