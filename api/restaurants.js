import db from './db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { id } = req.query;

    if (method === 'GET') {
      const restaurants = await db.query('SELECT * FROM restaurants ORDER BY created_at DESC');
      return res.status(200).json(restaurants);
    }

    if (method === 'POST') {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const info = await db.run('INSERT INTO restaurants (name) VALUES (?)', [name]);
      return res.status(201).json({ id: info.lastInsertRowid, name });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID is required' });
      // Note: sqlite3 default foreign key enforcement might need PRAGMA foreign_keys = ON per connection
      // We didn't enable it in the db wrapper explicitly for every connection in pool (sqlite3 is single conn here).
      // Let's ensure it's on.
      await db.run('PRAGMA foreign_keys = ON');
      await db.run('DELETE FROM restaurants WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
