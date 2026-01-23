
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://vpqfwyazxnkdillyzqyi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWZ3eWF6eG5rZGlsbHl6cXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDExNjIsImV4cCI6MjA2NDMxNzE2Mn0.IddfzEF4XXD_UYMMMZkXpN0nEpdgr8BIRX4NuaU0I1k';
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadDir = '/tmp'; // Vercel ephemeral storage

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper for table names with prefix
const T = {
  suggestions: 'KAKO_suggestions',
  participants: 'KAKO_participants',
  supporters: 'KAKO_supporters',
  admin_users: 'KAKO_admin_users',
  proposals: 'KAKO_proposals',
  settings: 'KAKO_settings'
};

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
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

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase
      .from(T.admin_users)
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (data) {
      res.json({ success: true, user: { email: data.email } });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.admin_users)
      .select('id, email')
      .order('id', { ascending: true });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin-users', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase
      .from(T.admin_users)
      .insert([{ email, password }])
      .select('id, email')
      .single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin-users/:id', async (req, res) => {
  try {
    await supabase.from(T.admin_users).delete().eq('id', req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.get('/api/proposals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.proposals)
      .select('*')
      .order('id', { ascending: true });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/proposals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.proposals)
      .insert([req.body])
      .select()
      .single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/proposals/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.proposals)
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/proposals/:id', async (req, res) => {
  try {
    await supabase.from(T.proposals).delete().eq('id', req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/participants', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.participants)
      .select('*')
      .order('display_order', { ascending: true });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participants', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.participants)
      .insert([req.body])
      .select()
      .single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/participants/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.participants)
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/participants/:id', async (req, res) => {
  try {
    await supabase.from(T.participants).delete().eq('id', req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/supporters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.supporters)
      .select('*')
      .order('created_at', { ascending: false });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/supporters', async (req, res) => {
  const { name, title_number } = req.body;
  try {
    const { data, error } = await supabase
      .from(T.supporters)
      .insert([{ name, title_number }])
      .select()
      .single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/supporters/:id', async (req, res) => {
  try {
    await supabase.from(T.supporters).delete().eq('id', req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/suggestions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.suggestions)
      .select('*')
      .order('created_at', { ascending: false });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suggestions', async (req, res) => {
  const { name, titleNumber, category, message, isAnonymous } = req.body;
  try {
    const { data, error } = await supabase
      .from(T.suggestions)
      .insert([{ 
        name, 
        title_number: titleNumber, 
        category, 
        message, 
        is_anonymous: isAnonymous || false 
      }])
      .select()
      .single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(T.settings)
      .select('*');
    const settings = {};
    if (data) {
      data.forEach(row => {
        settings[row.key] = row.value;
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    const { error } = await supabase
      .from(T.settings)
      .upsert({ key, value }, { onConflict: 'key' });
    res.status(200).send('Setting updated');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
