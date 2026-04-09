import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const skillsDir = path.join(__dirname, '../skills');

// 获取所有可用的 Skills
router.get('/', (req, res) => {
  try {
    const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.js'));

    const skills = skillFiles.map(file => {
      const skill = require(`../skills/${file}`);
      return {
        name: skill.name,
        description: skill.description,
        parameters: skill.parameters
      };
    });

    res.json(skills);
  } catch (error) {
    console.error('Error loading skills:', error);
    res.status(500).json({ error: error.message });
  }
});

// 执行某个 Skill
router.post('/:skillName', async (req, res) => {
  try {
    const { skillName } = req.params;
    const skillFile = path.join(skillsDir, `${skillName}.js`);

    if (!fs.existsSync(skillFile)) {
      return res.status(404).json({ error: `Skill ${skillName} not found` });
    }

    const skill = await import(skillFile);
    const result = await skill.default(req.body);

    res.json(result);
  } catch (error) {
    console.error(`Error executing skill ${skillName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
