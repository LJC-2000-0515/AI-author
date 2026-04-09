import dotenv from 'dotenv';

dotenv.config();

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const ZHIPU_MODEL = process.env.ZHIPU_MODEL || 'glm-5.1';

export async function callLLM(messages, model = 'zhipu', res = null) {
  if (!ZHIPU_API_KEY) {
    const mockResponse = {
      content: '【演示模式】API Key 未配置。请在 .env 文件中设置 ZHIPU_API_KEY'
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
    'Authorization': `Bearer ${ZHIPU_API_KEY}`
  };

  const body = {
    model: ZHIPU_MODEL,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    temperature: 1.0,
    stream: res !== null
  };

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (res) {
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
              } catch (e) {}
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
