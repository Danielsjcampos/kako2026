
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Initialize Database Tables
const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        name TEXT,
        title_number TEXT,
        category TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Pendente',
        is_anonymous BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        photo TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS supporters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        goal TEXT,
        how_to TEXT,
        eta TEXT,
        status TEXT DEFAULT 'Planejado'
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT
      );

      -- Ensure existing tables have new columns
      ALTER TABLE supporters ADD COLUMN IF NOT EXISTS title_number TEXT;
      ALTER TABLE supporters ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE participants ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      ALTER TABLE participants ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE participants ADD COLUMN IF NOT EXISTS photo TEXT;
    `);

    // Seed Admin User
    const userRes = await client.query('SELECT * FROM admin_users WHERE email = $1', ['admin@aesj.com.br']);
    if (userRes.rows.length === 0) {
      await client.query('INSERT INTO admin_users (email, password) VALUES ($1, $2)', ['admin@aesj.com.br', 'aesj2026']);
      console.log('Admin user seeded');
    }

    // Seed Participants if empty
    const partResCount = await client.query('SELECT count(*) FROM participants');
    if (partResCount.rows[0].count === '0') {
      await client.query(`
        INSERT INTO participants (name, role, bio, photo, display_order) VALUES 
        ('Kako Blanch', 'Presidente', 'Ex-presidente da AESJ (2014-2020), responsável por modernizações históricas.', '', 1),
        ('Vice Presidente', 'Vice-Presidente', 'Especialista em gestão esportiva e administrativa.', '', 2)
      `);
      console.log('Participants seeded');
    }

    console.log('Database tables initialized');
    client.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDb();

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      res.json({ success: true, user: { email: result.rows[0].email } });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users CRUD
app.get('/api/admin-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email FROM admin_users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin-users', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO admin_users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin-users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM admin_users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Proposals CRUD
app.get('/api/proposals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proposals ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/proposals', async (req, res) => {
  const { title, description, category, goal, how_to, eta, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO proposals (title, description, category, goal, how_to, eta, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, category, goal, how_to, eta, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/proposals/:id', async (req, res) => {
  const { title, description, category, goal, how_to, eta, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE proposals SET title=$1, description=$2, category=$3, goal=$4, how_to=$5, eta=$6, status=$7 WHERE id=$8 RETURNING *',
      [title, description, category, goal, how_to, eta, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/proposals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM proposals WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Participants CRUD
app.get('/api/participants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY display_order ASC, id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participants', async (req, res) => {
  const { name, role, bio, photo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO participants (name, role, bio, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, role, bio, photo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/participants/:id', async (req, res) => {
  const { name, role, bio, photo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE participants SET name=$1, role=$2, bio=$3, photo=$4 WHERE id=$5 RETURNING *',
      [name, role, bio, photo, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/participants/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM participants WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supporters
app.get('/api/supporters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM supporters ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/supporters', async (req, res) => {
  const { name, title_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO supporters (name, title_number) VALUES ($1, $2) RETURNING *',
      [name, title_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/supporters/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM supporters WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suggestions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suggestions', async (req, res) => {
  const { name, titleNumber, category, message, isAnonymous } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO suggestions (name, title_number, category, message, is_anonymous) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, titleNumber, category, message, isAnonymous || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings (General)
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [key, value]
    );
    res.status(200).send('Setting updated');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
