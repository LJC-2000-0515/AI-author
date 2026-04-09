import dotenv from 'dotenv';

dotenv.config();

const DOUBAO_API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '';
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-pro-32k';

// 调用豆包 API
export async function callLLM(messages, model = 'doubao', res = null) {
  // 如果没有配置 API Key，返回模拟数据用于测试
  if (!DOUBAO_API_KEY) {
    const mockResponse = {
      content: '【演示模式】API Key 未配置，请联系管理员设置 DOUBAO_API_KEY 环境变量。\n\n要开始使用，请：\n1. 注册火山引擎账号：https://console.volcengine.com/\n2. 开通豆包模型服务\n3. 获取 API Key 并配置到 .env 文件'
    };

    if (res) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: mockResponse.content } }] })}\n\n`);
      res.write('data: [DONE]\n');
      return;
    }

    return {
      choices: [{
        message: {
          role: 'assistant',
          content: mockResponse.content
        }
      }]
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DOUBAO_API_KEY}`
  };

  const body = {
    model: DOUBAO_MODEL,
    messages: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    stream: res !== null
  };

  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (res) {
      // 流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                res.write(`data: ${data}\n\n`);
              } catch (e) {
                // 忽略写入错误
              }
            }
          }
        }
      }

      res.write('data: [DONE]\n');
      res.end();
      return;
    }

    return await response.json();
  } catch (error) {
    console.error('LLM call failed:', error);
    throw error;
  }
}
