// 角色设定生成 Skill

export const name = 'character';
export const description = '生成网文角色设定';
export const parameters = {
  type: 'object',
  properties: {
    genre: { type: 'string', description: '小说类型（玄幻/都市/仙侠等）' },
    roleType: { type: 'string', description: '角色类型（主角/配角/反派）' }
  },
  required: ['genre']
};

export default async function characterSkill({ genre, roleType = '主角' }) {
  const prompt = `你是一个资深网文作家。请为一部${genre}小说生成一个${roleType}的角色设定。

请包含以下内容：
1. 角色姓名（要有网文风格）
2. 外貌特征
3. 性格特点
4. 背景故事
5. 能力/特长
6. 与主角的关系（如果是配角）

请以JSON格式输出，字段如下：
{
  "name": "姓名",
  "appearance": "外貌",
  "personality": "性格",
  "background": "背景",
  "abilities": "能力",
  "relationship": "关系"
}`;

  return {
    skill: 'character',
    params: { genre, roleType },
    prompt
  };
}
