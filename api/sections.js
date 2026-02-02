import db from './db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { restaurantId, id } = req.query;

    if (method === 'GET') {
      if (!restaurantId) return res.status(400).json({ error: 'Restaurant ID is required' });
      const sections = await db.query('SELECT * FROM sections WHERE restaurant_id = ?', [restaurantId]);
      return res.status(200).json(sections);
    }

    if (method === 'POST') {
      const { restaurant_id, name } = req.body;
      if (!restaurant_id || !name) return res.status(400).json({ error: 'Restaurant ID and Name are required' });
      const info = await db.run('INSERT INTO sections (restaurant_id, name) VALUES (?, ?)', [restaurant_id, name]);
      return res.status(201).json({ id: info.lastInsertRowid, restaurant_id, name });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID is required' });
      await db.run('PRAGMA foreign_keys = ON');
      await db.run('DELETE FROM sections WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
