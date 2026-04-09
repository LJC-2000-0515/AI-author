// 文笔润色 Skill

export const name = 'polish';
export const description = '润色网文内容，提升文笔';
export const parameters = {
  type: 'object',
  properties: {
    content: { type: 'string', description: '需要润色的原文' },
    style: { type: 'string', description: '润色风格（流畅/华丽/简洁/热血）', default: '流畅' }
  },
  required: ['content']
};

export default async function polishSkill({ content, style = '流畅' }) {
  const prompt = `你是一个资深网文作家，擅长各种文风。请润色以下网文内容。

润色风格：${style}

原文：
${content}

请直接输出润色后的内容，不要添加任何解释。`;

  return {
    skill: 'polish',
    params: { content, style },
    prompt
  };
}
