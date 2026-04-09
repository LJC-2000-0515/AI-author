// 剧情大纲生成 Skill

export const name = 'plotOutline';
export const description = '生成小说剧情大纲';
export const parameters = {
  type: 'object',
  properties: {
    genre: { type: 'string', description: '小说类型' },
    theme: { type: 'string', description: '小说主题' },
    chapters: { type: 'number', description: '预计章节数', default: 10 }
  },
  required: ['genre', 'theme']
};

export default async function plotOutlineSkill({ genre, theme, chapters = 10 }) {
  const prompt = `你是一个资深网文作家。请为一部${genre}小说生成剧情大纲。

小说主题：${theme}
预计篇幅：${chapters}章

请生成包含以下内容的大纲：
1. 开篇设定（世界观、主角初始状态）
2. 核心冲突（主要矛盾）
3. ${chapters}章的章节概要，每章包含：章节标题、核心事件、字数预计
4. 高潮设计
5. 结局安排

请以Markdown格式输出。`;

  return {
    skill: 'plotOutline',
    params: { genre, theme, chapters },
    prompt
  };
}
