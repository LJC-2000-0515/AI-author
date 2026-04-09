import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const dataDir = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 获取所有项目
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    const projects = files.map(file => {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const project = JSON.parse(content);
      return {
        id: file.replace('.json', ''),
        title: project.title,
        description: project.description,
        updatedAt: project.updatedAt
      };
    });

    res.json(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个项目
router.get('/:id', (req, res) => {
  try {
    const filePath = path.join(dataDir, `${req.params.id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建/保存项目
router.post('/', (req, res) => {
  try {
    const { id, title, description, content } = req.body;
    const projectId = id || `project_${Date.now()}`;
    const filePath = path.join(dataDir, `${projectId}.json`);

    const project = {
      id: projectId,
      title,
      description,
      content,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(project, null, 2));
    res.json(project);
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除项目
router.delete('/:id', (req, res) => {
  try {
    const filePath = path.join(dataDir, `${req.params.id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
