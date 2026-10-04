import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 50mb limit for high-res photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data and upload directories exist
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Static serve for uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

const PROMPTS_FILE = path.resolve(DATA_DIR, 'prompts.json');
const AD_SETTINGS_FILE = path.resolve(DATA_DIR, 'ad_settings.json');
const AD_CAMPAIGNS_FILE = path.resolve(DATA_DIR, 'ad_campaigns.json');

// Helper to read JSON file
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON file
function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial seed prompts if none exist
let DEFAULT_SEED_PROMPTS: any[] = [];
try {
  if (fs.existsSync(PROMPTS_FILE)) {
    DEFAULT_SEED_PROMPTS = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf-8'));
  }
} catch (e) {}

// Initialize JSON files if missing
if (!fs.existsSync(PROMPTS_FILE)) {
  writeJsonFile(PROMPTS_FILE, DEFAULT_SEED_PROMPTS);
}

// API Routes

// 1. Upload Image (Base64 data URL to static file)
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid imageBase64' });
    }

    // Match data:image/png;base64,...
    const matches = imageBase64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    let ext = 'jpg';
    let dataBuffer: Buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(imageBase64, 'base64');
    }

    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, dataBuffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: 'Failed to save image', details: err.message });
  }
});

// 2. GET all prompts (Live across all clients)
app.get('/api/prompts', (req, res) => {
  const prompts = readJsonFile(PROMPTS_FILE, DEFAULT_SEED_PROMPTS);
  res.json(prompts);
});

// 3. POST new prompt (Saves to server and broadcasts)
app.post('/api/prompts', (req, res) => {
  try {
    const newPrompt = req.body;
    if (!newPrompt || !newPrompt.prompt) {
      return res.status(400).json({ error: 'Invalid prompt payload' });
    }

    const prompts = readJsonFile<any[]>(PROMPTS_FILE, DEFAULT_SEED_PROMPTS);
    const fullItem = {
      ...newPrompt,
      id: newPrompt.id || `prompt-${Date.now()}`,
      views: newPrompt.views || 1,
      copyCount: newPrompt.copyCount || 0,
      likes: newPrompt.likes || 0,
      createdAt: newPrompt.createdAt || new Date().toISOString(),
    };

    // Add to beginning
    const updated = [fullItem, ...prompts.filter((p) => p.id !== fullItem.id)];
    writeJsonFile(PROMPTS_FILE, updated);

    res.status(201).json(fullItem);
  } catch (err: any) {
    console.error('Error adding prompt:', err);
    res.status(500).json({ error: 'Failed to add prompt', details: err.message });
  }
});

// 4. PUT update prompt
app.put('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const prompts = readJsonFile<any[]>(PROMPTS_FILE, DEFAULT_SEED_PROMPTS);

    const index = prompts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    prompts[index] = { ...prompts[index], ...updateData };
    writeJsonFile(PROMPTS_FILE, prompts);

    res.json(prompts[index]);
  } catch (err: any) {
    console.error('Error updating prompt:', err);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// 5. DELETE prompt
app.delete('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const prompts = readJsonFile<any[]>(PROMPTS_FILE, DEFAULT_SEED_PROMPTS);
    const updated = prompts.filter((p) => p.id !== id);
    writeJsonFile(PROMPTS_FILE, updated);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting prompt:', err);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// 6. SEO Endpoints: robots.txt, sitemap.xml & Google verification file
app.get('/google093853cd5988765b.html', (req, res) => {
  res.type('text/html').send('google-site-verification: google093853cd5988765b.html\n');
});

app.get('/robots.txt', (req, res) => {
  const robotsPath = path.resolve(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain').sendFile(robotsPath);
  } else {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
  }
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.type('application/xml').sendFile(sitemapPath);
    } else {
      const host = `${req.protocol}://${req.get('host')}`;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/#gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
      res.type('application/xml').send(xml);
    }
  } catch (e) {
    res.status(500).send('Error generating sitemap');
  }
});

// Mount Vite in development or static dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
