import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const booksDir = path.join(__dirname, '../../book');

// 确保书籍目录存在
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// 获取所有书籍
router.get('/', (req, res) => {
  try {
    const folders = fs.readdirSync(booksDir).filter(f => {
      const stats = fs.statSync(path.join(booksDir, f));
      return stats.isDirectory();
    });

    const books = folders.map(folder => {
      const metaPath = path.join(booksDir, folder, 'meta.json');
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        return meta;
      }
      return {
        id: folder,
        title: folder,
        createdAt: fs.statSync(path.join(booksDir, folder)).birthtime
      };
    });

    res.json(books);
  } catch (error) {
    console.error('Error loading books:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个书籍信息
router.get('/:id', (req, res) => {
  try {
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const metaPath = path.join(bookPath, 'meta.json');
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      : { id: req.params.id, title: req.params.id };

    // 读取卷列表
    const volumes = fs.readdirSync(bookPath)
      .filter(f => {
        const stats = fs.statSync(path.join(bookPath, f));
        return stats.isDirectory() && f !== 'chapters';
      })
      .map(f => {
        const volumeMetaPath = path.join(bookPath, f, 'meta.json');
        if (fs.existsSync(volumeMetaPath)) {
          return JSON.parse(fs.readFileSync(volumeMetaPath, 'utf-8'));
        }
        return { id: f, name: f };
      });

    res.json({ ...meta, volumes });
  } catch (error) {
    console.error('Error loading book:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取书籍下的卷列表
router.get('/:id/volumes', (req, res) => {
  try {
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const volumes = fs.readdirSync(bookPath)
      .filter(f => {
        const stats = fs.statSync(path.join(bookPath, f));
        return stats.isDirectory();
      })
      .map(f => {
        const volumeMetaPath = path.join(bookPath, f, 'meta.json');
        if (fs.existsSync(volumeMetaPath)) {
          return JSON.parse(fs.readFileSync(volumeMetaPath, 'utf-8'));
        }
        return { id: f, name: f };
      });

    res.json(volumes);
  } catch (error) {
    console.error('Error loading volumes:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建书籍
router.post('/', (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '书名不能为空' });
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const bookPath = path.join(booksDir, id);

    fs.mkdirSync(bookPath, { recursive: true });

    const meta = {
      id,
      title: title.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(bookPath, 'meta.json'),
      JSON.stringify(meta, null, 2)
    );

    res.json(meta);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新书籍（重命名）
router.patch('/:id', (req, res) => {
  try {
    const { title } = req.body;
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '书名不能为空' });
    }

    const metaPath = path.join(bookPath, 'meta.json');
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      : {};

    meta.title = title.trim();
    meta.updatedAt = new Date().toISOString();

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    res.json(meta);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建卷
router.post('/:id/volumes', (req, res) => {
  try {
    const { name } = req.body;
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '卷名不能为空' });
    }

    const volumePath = path.join(bookPath, name.trim());
    fs.mkdirSync(volumePath, { recursive: true });

    const meta = {
      id: name.trim(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(volumePath, 'meta.json'),
      JSON.stringify(meta, null, 2)
    );

    // 更新书籍的 updatedAt
    const bookMetaPath = path.join(bookPath, 'meta.json');
    if (fs.existsSync(bookMetaPath)) {
      const bookMeta = JSON.parse(fs.readFileSync(bookMetaPath, 'utf-8'));
      bookMeta.updatedAt = new Date().toISOString();
      fs.writeFileSync(bookMetaPath, JSON.stringify(bookMeta, null, 2));
    }

    res.json(meta);
  } catch (error) {
    console.error('Error creating volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除书籍
router.delete('/:id', (req, res) => {
  try {
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    fs.rmSync(bookPath, { recursive: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除卷
router.delete('/:id/volumes/:volumeId', (req, res) => {
  try {
    const volumePath = path.join(booksDir, req.params.id, req.params.volumeId);

    if (!fs.existsSync(volumePath)) {
      return res.status(404).json({ error: 'Volume not found' });
    }

    fs.rmSync(volumePath, { recursive: true });

    // 更新书籍的 updatedAt
    const bookMetaPath = path.join(booksDir, req.params.id, 'meta.json');
    if (fs.existsSync(bookMetaPath)) {
      const bookMeta = JSON.parse(fs.readFileSync(bookMetaPath, 'utf-8'));
      bookMeta.updatedAt = new Date().toISOString();
      fs.writeFileSync(bookMetaPath, JSON.stringify(bookMeta, null, 2));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// 重命名卷
router.patch('/:id/volumes/:volumeId', (req, res) => {
  try {
    const { name } = req.body;
    const oldVolumePath = path.join(booksDir, req.params.id, req.params.volumeId);
    const newVolumePath = path.join(booksDir, req.params.id, name.trim());

    if (!fs.existsSync(oldVolumePath)) {
      return res.status(404).json({ error: 'Volume not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '卷名不能为空' });
    }

    // 重命名文件夹
    fs.renameSync(oldVolumePath, newVolumePath);

    // 更新 meta.json
    const metaPath = path.join(newVolumePath, 'meta.json');
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      : {};
    meta.id = name.trim();
    meta.name = name.trim();
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    res.json(meta);
  } catch (error) {
    console.error('Error renaming volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取卷详情（包含章节）
router.get('/:id/volumes/:volumeId', (req, res) => {
  try {
    const volumePath = path.join(booksDir, req.params.id, req.params.volumeId);

    if (!fs.existsSync(volumePath)) {
      return res.status(404).json({ error: 'Volume not found' });
    }

    const metaPath = path.join(volumePath, 'meta.json');
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      : { id: req.params.volumeId, name: req.params.volumeId };

    // 读取章节列表
    const chapters = fs.readdirSync(volumePath)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        id: f,
        name: f.replace('.md', ''),
        filename: f
      }));

    res.json({ ...meta, chapters });
  } catch (error) {
    console.error('Error loading volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建章节
router.post('/:id/volumes/:volumeId/chapters', (req, res) => {
  try {
    const { name } = req.body;
    const volumePath = path.join(booksDir, req.params.id, req.params.volumeId);

    if (!fs.existsSync(volumePath)) {
      return res.status(404).json({ error: 'Volume not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '章节名不能为空' });
    }

    const filename = `${name.trim()}.md`;
    const chapterPath = path.join(volumePath, filename);

    // 如果已存在，返回错误
    if (fs.existsSync(chapterPath)) {
      return res.status(400).json({ error: '章节已存在' });
    }

    fs.writeFileSync(chapterPath, `# ${name.trim()}\n\n`);

    res.json({ id: filename, name: name.trim(), filename });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除章节
router.delete('/:id/volumes/:volumeId/chapters/:chapterId', (req, res) => {
  try {
    const chapterPath = path.join(
      booksDir, req.params.id, req.params.volumeId, req.params.chapterId
    );

    if (!fs.existsSync(chapterPath)) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    fs.unlinkSync(chapterPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// 重命名章节
router.patch('/:id/volumes/:volumeId/chapters/:chapterId', (req, res) => {
  try {
    const { name } = req.body;
    const oldPath = path.join(
      booksDir, req.params.id, req.params.volumeId, req.params.chapterId
    );
    const newFilename = `${name.trim()}.md`;
    const newPath = path.join(booksDir, req.params.id, req.params.volumeId, newFilename);

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '章节名不能为空' });
    }

    fs.renameSync(oldPath, newPath);
    res.json({ id: newFilename, name: name.trim(), filename: newFilename });
  } catch (error) {
    console.error('Error renaming chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取章节内容
router.get('/:id/volumes/:volumeId/chapters/:chapterId', (req, res) => {
  try {
    const chapterPath = path.join(
      booksDir, req.params.id, req.params.volumeId, req.params.chapterId
    );

    if (!fs.existsSync(chapterPath)) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const content = fs.readFileSync(chapterPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// 保存章节内容
router.put('/:id/volumes/:volumeId/chapters/:chapterId', (req, res) => {
  try {
    const { content } = req.body;
    const chapterPath = path.join(
      booksDir, req.params.id, req.params.volumeId, req.params.chapterId
    );

    if (!fs.existsSync(chapterPath)) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    fs.writeFileSync(chapterPath, content);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取书籍背景文件列表
router.get('/:id/background', (req, res) => {
  try {
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const modules = ['世界观', '人物', '设定', '大纲'];
    const result = modules.map(name => {
      const filePath = path.join(bookPath, `${name}.md`);
      const exists = fs.existsSync(filePath);
      return {
        id: name,
        name,
        filename: `${name}.md`,
        exists
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error loading background:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个背景文件内容
router.get('/:id/background/:moduleId', (req, res) => {
  try {
    const filePath = path.join(booksDir, req.params.id, `${req.params.moduleId}.md`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading background:', error);
    res.status(500).json({ error: error.message });
  }
});

// 保存背景文件内容
router.put('/:id/background/:moduleId', (req, res) => {
  try {
    const { content } = req.body;
    const bookPath = path.join(booksDir, req.params.id);

    if (!fs.existsSync(bookPath)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const filePath = path.join(bookPath, `${req.params.moduleId}.md`);
    fs.writeFileSync(filePath, content);

    // 更新书籍的 updatedAt
    const metaPath = path.join(bookPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      meta.updatedAt = new Date().toISOString();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving background:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
