import express from 'express';
import { callLLM } from '../services/llm.js';

const router = express.Router();

// Chat endpoint - 调用大模型
router.post('/', async (req, res) => {
  try {
    const { messages, model = 'doubao' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const response = await callLLM(messages, model);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 流式 Chat endpoint
router.post('/stream', async (req, res) => {
  try {
    const { messages, model = 'doubao' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await callLLM(messages, model, res);
  } catch (error) {
    console.error('Stream chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
