// 续写章节 Skill

export const name = 'continueWriting';
export const description = '延续现有章节内容继续写作';
export const parameters = {
  type: 'object',
  properties: {
    content: { type: 'string', description: '现有章节内容' },
    style: { type: 'string', description: '文风（流畅/华丽/简洁/热血）', default: '流畅' }
  },
  required: ['content']
};

export default async function continueWritingSkill({ content, style }) {
  const prompt = `你是专业小说创作助手，现在按照以下规则续写章节：

1. 优先仔细阅读并承接**上一章内容**，保持文风、节奏、世界观、人物状态完全一致，不OOC，不突兀。
2. 认真理解用户本次输入的写作指令（prompt），严格按照要求推进剧情。
3. 识别用户指令和前文中出现的**所有人名**，在"人物设定"中找到对应角色，严格依据其性格、身份、经历、说话风格来设计：
   - 角色的行为动作
   - 语气与对话方式
   - 情绪反应与微表情
   - 决策逻辑与立场
4. 对话要自然、符合人物身份，不书面化、不僵硬。
5. 动作描写服务于人物性格，避免千人一面。
6. 情节推进合理，有画面感，节奏紧凑，不水文，不随便引入新角色。
7. 直接输出正文，不解释、不总结、不加多余格式。
8. **字数控制在2000-2500字以内**，不要少也不要超出。

文风要求：${style || '流畅'}

现有章节内容：
${content}

请延续以上内容继续写作，直接输出续写正文。`;

  return {
    skill: 'continueWriting',
    params: { content, style },
    prompt
  };
}
